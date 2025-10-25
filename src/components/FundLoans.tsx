'use client';

import { useState, useEffect } from 'react';
import { WalletData } from '@/lib/wallet';
import { getLoanCount, getLoan } from '@/lib/stacks';
import { 
  fundLoanTx,
  signWithTurnkey,
  microStxToStx 
} from '@/lib/turnkey-stacks';
import { signAndBroadcastTransaction } from '@/lib/signing-utils';
import { STACKS_NETWORK } from '@/lib/config';
import { Loan } from '@/types';

interface FundLoansProps {
  wallet: WalletData;
}

export default function FundLoans({ wallet }: FundLoansProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [fundingLoanId, setFundingLoanId] = useState<number | null>(null);

  useEffect(() => {
    loadPendingLoans();
  }, []);

  const loadPendingLoans = async () => {
    try {
      setLoading(true);
      const countResult = await getLoanCount();
      console.log('Loan count result:', countResult);
      const count = countResult?.value || 0;
      
      const pendingLoans: Loan[] = [];
      for (let i = 1; i <= count; i++) {
        const loanResult = await getLoan(i);
        console.log(`Loan ${i} result:`, loanResult);
        
        if (loanResult && loanResult.value && loanResult.value.value) {
          const loanData = loanResult.value.value;
          
          const loan: Loan = {
            loanId: i,
            borrower: loanData.borrower.value,
            lender: loanData.lender.value,
            amount: parseInt(loanData.amount.value),
            collateral: parseInt(loanData.collateral.value),
            interestRate: parseInt(loanData['interest-rate'].value),
            duration: parseInt(loanData.duration.value),
            startBlock: parseInt(loanData['start-block'].value),
            status: loanData.status.value,
            loanAsset: loanData['loan-asset'] ? parseInt(loanData['loan-asset'].value) : 1,
            collateralAsset: loanData['collateral-asset'] ? parseInt(loanData['collateral-asset'].value) : 1,
          };
          
          // Only show pending loans (not funded yet)
          if (loan.status === 'pending') {
            pendingLoans.push(loan);
          }
        }
      }
      
      console.log('Loaded pending loans:', pendingLoans);
      setLoans(pendingLoans);
    } catch (err) {
      console.error('Failed to load pending loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCollateralRatio = (collateral: number, amount: number) => {
    return ((collateral / amount) * 100).toFixed(0);
  };

  const calculateInterest = (amount: number, rate: number, duration: number) => {
    // Interest = Principal * Rate * Duration / (365 * 144 * 10000)
    // Duration in blocks, ~144 blocks per day
    return Math.floor((amount * rate * duration) / 52560000);
  };

  const calculateTotalRepayment = (amount: number, rate: number, duration: number) => {
    const interest = calculateInterest(amount, rate, duration);
    const platformFee = Math.floor((amount * 100) / 10000); // 1% platform fee
    return amount + interest + platformFee;
  };

  const handleFundLoan = async (loan: Loan) => {
    const amountStx = microStxToStx(loan.amount);
    const collateralStx = microStxToStx(loan.collateral);
    const collateralRatio = calculateCollateralRatio(loan.collateral, loan.amount);
    const durationDays = Math.floor(loan.duration / 144);
    const interestRate = (loan.interestRate / 100).toFixed(1);
    const totalRepayment = calculateTotalRepayment(loan.amount, loan.interestRate, loan.duration);
    const totalRepaymentStx = microStxToStx(totalRepayment);
    const interest = calculateInterest(loan.amount, loan.interestRate, loan.duration);
    const interestStx = microStxToStx(interest);

    if (!confirm(
      `Fund this loan request?\n\n` +
      `Borrower: ${loan.borrower}\n\n` +
      `Loan Details:\n` +
      `• Amount: ${amountStx.toFixed(6)} STX\n` +
      `• Collateral: ${collateralStx.toFixed(6)} STX (${collateralRatio}%)\n` +
      `• Interest Rate: ${interestRate}% APR\n` +
      `• Duration: ${durationDays} days\n\n` +
      `Expected Returns:\n` +
      `• Interest: ${interestStx.toFixed(6)} STX\n` +
      `• Total Repayment: ${totalRepaymentStx.toFixed(6)} STX\n\n` +
      `You will transfer ${amountStx.toFixed(6)} STX to the borrower.\n` +
      `The borrower's collateral is locked in the contract.\n\n` +
      `Continue?`
    )) return;

    try {
      setFundingLoanId(loan.loanId);
      setLoading(true);
      
      if (wallet.turnkey) {
        const unsignedTx = await fundLoanTx(
          wallet.publicKey,
          wallet.address,
          loan.loanId
        );

        const signFunction = async (payload: string) => {
          return signWithTurnkey(payload, wallet.turnkey!.httpClient, wallet.publicKey);
        };

        const networkType = STACKS_NETWORK.chainId === 1 ? 'mainnet' : 'testnet';
        const result = await signAndBroadcastTransaction(unsignedTx, signFunction, networkType);
        
        console.log('Loan funded successfully:', result);
        alert(
          `Loan funded successfully!\n\n` +
          `Transaction ID: ${result.txId}\n\n` +
          `The loan is now active. The borrower has received ${amountStx.toFixed(6)} STX.\n` +
          `You will receive ${totalRepaymentStx.toFixed(6)} STX when the loan is repaid.\n\n` +
          `Wait ~30 seconds for confirmation, then check "My Loans" tab.`
        );
        
        // Reload loans after a delay
        setTimeout(loadPendingLoans, 30000);
      } else {
        throw new Error('Turnkey wallet required');
      }
    } catch (err) {
      console.error('Failed to fund loan:', err);
      alert(`Failed to fund loan: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setFundingLoanId(null);
    }
  };

  const getAssetName = (assetType: number) => {
    return assetType === 1 ? 'STX' : assetType === 2 ? 'sBTC' : 'Unknown';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Fund Loan Requests
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Browse pending loan requests and fund them to earn interest
        </p>
      </div>

      {loading && loans.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading loan requests...</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No pending loan requests</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            There are currently no loan requests waiting to be funded.
          </p>
          <button
            onClick={loadPendingLoans}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {loans.length} pending loan request{loans.length !== 1 ? 's' : ''} available
            </p>
            <button
              onClick={loadPendingLoans}
              disabled={loading}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loans.map((loan) => {
            const amountStx = microStxToStx(loan.amount);
            const collateralStx = microStxToStx(loan.collateral);
            const collateralRatio = calculateCollateralRatio(loan.collateral, loan.amount);
            const durationDays = Math.floor(loan.duration / 144);
            const interestRate = (loan.interestRate / 100).toFixed(1);
            const interest = calculateInterest(loan.amount, loan.interestRate, loan.duration);
            const interestStx = microStxToStx(interest);
            const totalRepayment = calculateTotalRepayment(loan.amount, loan.interestRate, loan.duration);
            const totalRepaymentStx = microStxToStx(totalRepayment);
            const isFunding = fundingLoanId === loan.loanId;

            return (
              <div
                key={loan.loanId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Loan Request #{loan.loanId}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Borrower: {loan.borrower.slice(0, 8)}...{loan.borrower.slice(-6)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                    Pending
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loan Amount</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {amountStx.toFixed(6)} {getAssetName(loan.loanAsset || 1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Collateral</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {collateralStx.toFixed(6)} {getAssetName(loan.collateralAsset || 1)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {collateralRatio}% ratio
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {interestRate}% APR
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {durationDays} days
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Expected Returns
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-blue-700 dark:text-blue-300">Interest Earned:</p>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">
                        {interestStx.toFixed(6)} STX
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 dark:text-blue-300">Total Repayment:</p>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">
                        {totalRepaymentStx.toFixed(6)} STX
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleFundLoan(loan)}
                  disabled={loading || isFunding}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isFunding ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Funding...
                    </span>
                  ) : (
                    `Fund Loan (${amountStx.toFixed(2)} STX)`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
