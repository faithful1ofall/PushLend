'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { createLoanRequest } from '@/lib/push-client';

interface PushBorrowRequestsProps {
  signer: ethers.Signer;
  address: string;
}

export default function PushBorrowRequests({ signer, address }: PushBorrowRequestsProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [collateral, setCollateral] = useState('');
  const [interestRate, setInterestRate] = useState('12');
  const [duration, setDuration] = useState('30');

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !collateral || !interestRate || !duration) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const durationSeconds = parseInt(duration) * 24 * 60 * 60;
      await createLoanRequest(signer, amount, parseInt(interestRate) * 100, durationSeconds, collateral);
      alert('Loan request created successfully!');
      setAmount('');
      setCollateral('');
    } catch (error: any) {
      console.error('Error creating loan request:', error);
      alert('Failed to create loan request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Create Loan Request</h2>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loan Amount (PC)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="e.g., 1.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collateral Amount (PC) - Min 150% of loan
            </label>
            <input
              type="number"
              step="0.01"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="e.g., 1.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (% per year)
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="e.g., 12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (days)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="e.g., 30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Loan Request'}
          </button>
        </form>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>You lock collateral (minimum 150% of loan amount)</li>
          <li>A lender funds your request</li>
          <li>You receive the loan amount</li>
          <li>Repay the loan to get your collateral back</li>
        </ol>
      </div>
    </div>
  );
}
