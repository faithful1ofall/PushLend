'use client';

import { useState, useEffect } from 'react';
import { getCreditScore } from '@/lib/push-client';

interface PushAnalyticsProps {
  address: string;
}

export default function PushAnalytics({ address }: PushAnalyticsProps) {
  const [creditScore, setCreditScore] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCreditScore();
  }, [address]);

  const loadCreditScore = async () => {
    try {
      setLoading(true);
      const score = await getCreditScore(address);
      setCreditScore(score);
    } catch (error) {
      console.error('Error loading credit score:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Credit Score</h3>
          <p className="text-3xl font-bold text-purple-600">
            {creditScore ? Number(creditScore.score) : 500}
          </p>
          <p className="text-xs text-gray-500 mt-1">Out of 1000</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Borrowed</h3>
          <p className="text-3xl font-bold text-blue-600">
            {creditScore ? (Number(creditScore.totalBorrowed) / 1e18).toFixed(4) : '0'} PC
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Repaid</h3>
          <p className="text-3xl font-bold text-green-600">
            {creditScore ? (Number(creditScore.totalRepaid) / 1e18).toFixed(4) : '0'} PC
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Loans Completed</h3>
          <p className="text-3xl font-bold text-green-600">
            {creditScore ? Number(creditScore.loansCompleted) : 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Loans Defaulted</h3>
          <p className="text-3xl font-bold text-red-600">
            {creditScore ? Number(creditScore.loansDefaulted) : 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Repayment Rate</h3>
          <p className="text-3xl font-bold text-purple-600">
            {creditScore && Number(creditScore.totalBorrowed) > 0
              ? ((Number(creditScore.totalRepaid) / Number(creditScore.totalBorrowed)) * 100).toFixed(1)
              : '0'}%
          </p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How Credit Score Works:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
          <li>Starting score: 500</li>
          <li>Increases with successful loan repayments</li>
          <li>Decreases with defaults and liquidations</li>
          <li>Higher score = better borrowing terms</li>
        </ul>
      </div>
    </div>
  );
}
