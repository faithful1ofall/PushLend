'use client';

import { useState, useEffect } from 'react';
import { WalletData } from '@/lib/wallet';
import { getLoanCount, getLoan, repayLoan, liquidateLoan, fundLoan, microStxToStx, sendSTX, calculateTotalRepayment } from '@/lib/stacks';
import { 
  fundLoanTx, 
  repayLoanTx, 
  liquidateLoanTx,
  signWithTurnkey 
} from '@/lib/turnkey-stacks';
import { signAndBroadcastTransaction } from '@/lib/signing-utils';
import { STACKS_NETWORK } from '@/lib/config';
import { Loan, LoanStatus, LoanStatusLabels } from '@/types';

interface MyLoansProps {
  wallet: WalletData;
}

export default function MyLoans({ wallet }: MyLoansProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'borrowed' | 'lent'>('all');

  useEffect(() => {
    loadLoans();
  }, [wallet.address]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const countResult = await getLoanCount();
      console.log('Loan count result:', countResult);
      const count = countResult?.value || 0;
      
      const loadedLoans: Loan[] = [];
      for (let i = 1; i <= count; i++) {
        const loanResult = await getLoan(i);
        console.log(`Loan ${i} result:`, loanResult);
        
        // cvToJSON returns nested structure: {value: {value: {field: {value: ...}}}}
        if (loanResult && loanResult.value && loanResult.value.value) {
          const loanData = loanResult.value.value;
          console.log(`Loan ${i} data:`, loanData);
          
          // Each field is also wrapped: {type: 'uint', value: '123'}
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
          
          // Filter loans related to current user
          if (loan.borrower === wallet.address || loan.lender === wallet.address) {
            loadedLoans.push(loan);
          }
        }
      }
      
      console.log('Loaded loans:', loadedLoans);
      setLoans(loadedLoans);
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepayLoan = async (loan: Loan) => {
    const totalRepayment = calculateTotalRepayment(loan.amount, loan.interestRate, loan.duration);
    const totalStx = microStxToStx(totalRepayment);
    
    if (!confirm(
      `Repay this loan?\n\n` +
      `Total repayment: ${totalStx.toFixed(6)} STX\n` +
      `(Principal + Interest)\n\n` +
      `Note: The contract will transfer STX from your wallet to the lender and return your collateral.\n\n` +
      `Continue?`
    )) return;

    try {
      setLoading(true);
      
      // Use Turnkey signing if available
      if (wallet.turnkey) {
        const unsignedTx = await repayLoanTx(
          wallet.publicKey,
          wallet.address,
          loan.loanId
        );

        const signFunction = async (payload: string) => {
          return signWithTurnkey(payload, wallet.turnkey!.httpClient, wallet.publicKey);
        };

        const networkType = STACKS_NETWORK.chainId === 1 ? 'mainnet' : 'testnet';
        await signAndBroadcastTransaction(unsignedTx, signFunction, networkType);
      } else if (wallet.privateKey) {
        await repayLoan(wallet.privateKey, loan.loanId);
      } else {
        throw new Error('No signing method available');
      }
      
      alert('Loan repaid! Wait ~30 seconds for confirmation.');
      setTimeout(loadLoans, 30000);
    } catch (err) {
      console.error('Failed to repay loan:', err);
      alert(`Failed to repay loan: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLiquidateLoan = async (loanId: number) => {
    if (!confirm(
      'Liquidate this loan?\n\n' +
      'This action can only be performed if the loan is overdue.\n' +
      'You will receive the collateral.\n\n' +
      'Continue?'
    )) return;

    try {
      setLoading(true);
      
      // Use Turnkey signing if available
      if (wallet.turnkey) {
        const unsignedTx = await liquidateLoanTx(
          wallet.publicKey,
          wallet.address,
          loanId
        );

        const signFunction = async (payload: string) => {
          return signWithTurnkey(payload, wallet.turnkey!.httpClient, wallet.publicKey);
        };

        const networkType = STACKS_NETWORK.chainId === 1 ? 'mainnet' : 'testnet';
        await signAndBroadcastTransaction(unsignedTx, signFunction, networkType);
      } else if (wallet.privateKey) {
        await liquidateLoan(wallet.privateKey, loanId);
      } else {
        throw new Error('No signing method available');
      }
      
      alert('Loan liquidated! Wait ~30 seconds for confirmation.');
      setTimeout(loadLoans, 30000);
    } catch (err) {
      console.error('Failed to liquidate loan:', err);
      alert(`Failed to liquidate loan: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFundLoan = async (loan: Loan) => {
    const amountStx = microStxToStx(loan.amount);
    
    if (!confirm(
      `Fund this loan?\n\n` +
      `Amount: ${amountStx.toFixed(6)} STX\n` +
      `Borrower: ${loan.borrower}\n\n` +
      `Note: The contract will transfer STX from your wallet to the borrower.\n\n` +
      `Continue?`
    )) return;

    try {
      setLoading(true);
      
      // Use Turnkey signing if available
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
        await signAndBroadcastTransaction(unsignedTx, signFunction, networkType);
      } else if (wallet.privateKey) {
        await fundLoan(wallet.privateKey, loan.loanId);
      } else {
        throw new Error('No signing method available');
      }
      
      alert('Loan funded! Wait ~30 seconds for confirmation.');
      setTimeout(loadLoans, 30000);
    } catch (err) {
      console.error('Failed to fund loan:', err);
      alert('Failed to fund loan. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'badge-warning',
      'active': 'badge-info',
      'repaid': 'badge-success',
      'liquidated': 'badge-danger',
    };

    return (
      <span className={`badge ${colors[status] || 'badge-info'}`}>
        {LoanStatusLabels[status] || status}
      </span>
    );
  };

  const filteredLoans = loans.filter(loan => {
    if (filter === 'borrowed') return loan.borrower === wallet.address;
    if (filter === 'lent') return loan.lender === wallet.address;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Loans
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your active and past loans (as borrower or lender)
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('borrowed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'borrowed'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Borrowed
          </button>
          <button
            onClick={() => setFilter('lent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'lent'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Lent
          </button>
        </div>
      </div>

      {loading && loans.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading loans...</p>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No loans found. {filter === 'borrowed' ? 'Request a loan' : filter === 'lent' ? 'Create an offer' : 'Get started'} to see loans here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => {
            const isBorrower = loan.borrower === wallet.address;
            const isLender = loan.lender === wallet.address;
            const isPending = loan.status === 'pending';
            const isActive = loan.status === 'active';
            const isBothRoles = isBorrower && isLender && !isPending; // Both roles only if funded

            return (
              <div key={loan.loanId} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Loan #{loan.loanId}
                      </h3>
                      {getStatusBadge(loan.status)}
                      {isBothRoles ? (
                        <span className="badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Self-Funded
                        </span>
                      ) : (
                        <>
                          {isBorrower && (
                            <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              Borrower
                            </span>
                          )}
                          {isLender && (
                            <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Lender
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {microStxToStx(loan.amount).toFixed(2)} STX
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Collateral</div>
                    <div className="font-medium">{microStxToStx(loan.collateral).toFixed(2)} STX</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Interest Rate</div>
                    <div className="font-medium">{(loan.interestRate / 100).toFixed(1)}% APR</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                    <div className="font-medium">{Math.floor(loan.duration / 144)} days</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Collateral Ratio</div>
                    <div className="font-medium">
                      {((loan.collateral / loan.amount) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 text-sm mb-4">
                  <div className="flex-1">
                    <div className="text-gray-600 dark:text-gray-400">Borrower</div>
                    <div className="font-mono text-xs">
                      {loan.borrower.slice(0, 10)}...{loan.borrower.slice(-8)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-600 dark:text-gray-400">Lender</div>
                    <div className="font-mono text-xs">
                      {loan.lender.slice(0, 10)}...{loan.lender.slice(-8)}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {/* Pending: Anyone except the borrower can fund */}
                  {isPending && !isBorrower && (
                    <button
                      onClick={() => handleFundLoan(loan)}
                      className="btn btn-primary flex-1"
                      disabled={loading}
                    >
                      Fund Loan
                    </button>
                  )}
                  
                  {/* Active: Borrower can repay */}
                  {isActive && isBorrower && (
                    <button
                      onClick={() => handleRepayLoan(loan)}
                      className="btn btn-primary flex-1"
                      disabled={loading}
                    >
                      Repay Loan
                    </button>
                  )}
                  
                  {/* Active: Anyone can liquidate if overdue (contract enforces this) */}
                  {isActive && (
                    <button
                      onClick={() => handleLiquidateLoan(loan.loanId)}
                      className="btn btn-danger flex-1"
                      disabled={loading}
                      title="Only works if loan is overdue"
                    >
                      Liquidate
                    </button>
                  )}
                  
                  {/* Pending: Show info if user is the borrower */}
                  {isPending && isBorrower && (
                    <div className="flex-1 text-sm text-gray-600 dark:text-gray-400 italic p-2">
                      Waiting for a lender to fund this loan...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
