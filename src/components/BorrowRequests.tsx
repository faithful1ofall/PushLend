'use client';

import { useState } from 'react';
import { WalletData } from '@/lib/wallet';
import { createLoan } from '@/lib/stacks';
import { 
  microStxToStx, 
  stxToMicroStx, 
  createLoanTx,
  signWithTurnkey 
} from '@/lib/turnkey-stacks';
import { signAndBroadcastTransaction } from '@/lib/signing-utils';
import { STACKS_NETWORK } from '@/lib/config';

interface BorrowRequestsProps {
  wallet: WalletData;
}

export default function BorrowRequests({ wallet }: BorrowRequestsProps) {
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');

  const calculateCollateralRatio = () => {
    if (!amount || !collateralAmount) return 0;
    return (parseFloat(collateralAmount) / parseFloat(amount)) * 100;
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !collateralAmount || !interestRate || !duration) return;

    const ratio = calculateCollateralRatio();
    if (ratio < 150) {
      alert('Collateral ratio must be at least 150%');
      return;
    }

    try {
      setLoading(true);
      const amountInMicroStx = stxToMicroStx(parseFloat(amount));
      const collateralInMicroStx = stxToMicroStx(parseFloat(collateralAmount));
      const rate = parseInt(interestRate) * 100; // Convert to basis points
      const durationBlocks = parseInt(duration) * 144; // Convert days to blocks

      // Use Turnkey signing if available
      if (wallet.turnkey) {
        const unsignedTx = await createLoanTx(
          wallet.publicKey,
          wallet.address,
          amountInMicroStx,
          collateralInMicroStx,
          rate,
          durationBlocks,
          1, // loan-asset: STX (u1)
          1  // collateral-asset: STX (u1)
        );

        const signFunction = async (payload: string) => {
          return signWithTurnkey(payload, wallet.turnkey!.httpClient, wallet.publicKey);
        };

        const networkType = STACKS_NETWORK.chainId === 1 ? 'mainnet' : 'testnet';
        await signAndBroadcastTransaction(unsignedTx, signFunction, networkType);
      } else if (wallet.privateKey) {
        await createLoan(
          wallet.privateKey,
          amountInMicroStx,
          collateralInMicroStx,
          rate,
          durationBlocks,
          1, // loan-asset: STX (u1)
          1  // collateral-asset: STX (u1)
        );
      } else {
        throw new Error('No signing method available');
      }

      alert('Loan request created! Wait ~30 seconds for confirmation.\n\nYour collateral is now locked. A lender can fund your request.');
      setAmount('');
      setCollateralAmount('');
      setInterestRate('');
      setDuration('');
    } catch (err) {
      console.error('Failed to create loan request:', err);
      alert(`Failed to create loan request: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Request a Loan
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create a loan request with collateral and wait for a lender to fund it
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create Request Form */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Create Loan Request</h3>
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div>
              <label className="label">Loan Amount (STX)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                placeholder="e.g., 50"
                required
              />
            </div>

            <div>
              <label className="label">Collateral Amount (STX)</label>
              <input
                type="number"
                step="0.01"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                className="input"
                placeholder="e.g., 75"
                required
              />
              {amount && collateralAmount && (
                <p className={`text-xs mt-1 ${
                  calculateCollateralRatio() >= 150 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  Collateral Ratio: {calculateCollateralRatio().toFixed(1)}% 
                  {calculateCollateralRatio() < 150 && ' (minimum 150% required)'}
                </p>
              )}
            </div>

            <div>
              <label className="label">Interest Rate (% per year)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="input"
                placeholder="e.g., 12"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher rates may attract lenders faster
              </p>
            </div>

            <div>
              <label className="label">Loan Duration (days)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="input"
                placeholder="e.g., 30"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              disabled={loading || calculateCollateralRatio() < 150}
            >
              {loading ? 'Creating...' : 'Create Loan Request'}
            </button>
          </form>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <div className="card bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How Borrowing Works
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
              <li>Provide collateral (minimum 150% of loan amount)</li>
              <li>Set your desired interest rate and duration</li>
              <li>Wait for a lender to fund your request</li>
              <li>Receive the loan amount in your wallet</li>
              <li>Repay before the due date to get your collateral back</li>
            </ol>
          </div>

          <div className="card bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              ⚠️ Important Notes
            </h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
              <li>• Your collateral is locked immediately when you create a request</li>
              <li>• If you don't repay on time, your collateral can be liquidated</li>
              <li>• Platform fee: 1% of loan amount</li>
              <li>• Interest is calculated based on the full duration</li>
            </ul>
          </div>

          <div className="card">
            <h4 className="font-semibold mb-3">Example Calculation</h4>
            {amount && interestRate && duration ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Loan Amount:</span>
                  <span className="font-medium">{parseFloat(amount).toFixed(2)} STX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Interest ({interestRate}% for {duration} days):</span>
                  <span className="font-medium">
                    {(parseFloat(amount) * parseFloat(interestRate) / 100 * parseInt(duration) / 365).toFixed(6)} STX
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee (1%):</span>
                  <span className="font-medium">{(parseFloat(amount) * 0.01).toFixed(6)} STX</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold">
                  <span>Total Repayment:</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    {(
                      parseFloat(amount) + 
                      (parseFloat(amount) * parseFloat(interestRate) / 100 * parseInt(duration) / 365) +
                      (parseFloat(amount) * 0.01)
                    ).toFixed(6)} STX
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fill in the form to see repayment calculation
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
