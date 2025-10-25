'use client';

import { useState, useEffect } from 'react';
import { WalletData } from '@/lib/wallet';
import { getUserStats, getLoanCount, getLoan, microStxToStx } from '@/lib/stacks';
import { UserStats, Loan, LoanStatus } from '@/types';

interface AnalyticsProps {
  wallet: WalletData;
}

export default function Analytics({ wallet }: AnalyticsProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    totalLent: 0,
    activeLoans: 0,
    completedLoans: 0,
    totalInterestEarned: 0,
    totalInterestPaid: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [wallet.address]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load user stats
      const statsResult = await getUserStats(wallet.address);
      console.log('User stats result:', statsResult);
      if (statsResult && statsResult.value) {
        setUserStats({
          totalBorrowed: parseInt(statsResult.value['total-borrowed'].value),
          totalRepaid: parseInt(statsResult.value['total-repaid'].value),
          loansCompleted: parseInt(statsResult.value['loans-completed'].value),
          creditScore: parseInt(statsResult.value['credit-score'].value),
        });
      }

      // Load loan statistics
      const countResult = await getLoanCount();
      const count = countResult.value || 0;
      
      let totalBorrowed = 0;
      let totalLent = 0;
      let activeLoans = 0;
      let completedLoans = 0;
      let totalInterestEarned = 0;
      let totalInterestPaid = 0;

      for (let i = 1; i <= count; i++) {
        const loanResult = await getLoan(i);
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
          };

          if (loan.borrower === wallet.address) {
            totalBorrowed += loan.amount;
            if (loan.status === 'active') activeLoans++;
            if (loan.status === 'repaid') {
              completedLoans++;
            }
          }

          if (loan.lender === wallet.address) {
            totalLent += loan.amount;
            if (loan.status === 'active') activeLoans++;
            if (loan.status === 'repaid') {
              completedLoans++;
            }
          }
        }
      }

      setStats({
        totalBorrowed,
        totalLent,
        activeLoans,
        completedLoans,
        totalInterestEarned,
        totalInterestPaid,
      });
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600 dark:text-green-400';
    if (score >= 600) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCreditScoreLabel = (score: number) => {
    if (score >= 800) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 600) return 'Fair';
    if (score >= 500) return 'Poor';
    return 'Very Poor';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics & Credit Score
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your lending and borrowing activity
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Credit Score Card */}
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 border-primary-200 dark:border-primary-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Credit Score
                </h3>
                <div className={`text-5xl font-bold ${getCreditScoreColor(userStats?.creditScore || 500)}`}>
                  {userStats?.creditScore || 500}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getCreditScoreLabel(userStats?.creditScore || 500)}
                </div>
              </div>
              <div className="text-right space-y-2">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Loans Completed</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {userStats?.loansCompleted || 0}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Total Borrowed</div>
                  <div className="font-medium">
                    {microStxToStx(userStats?.totalBorrowed || 0).toFixed(2)} STX
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Total Repaid</div>
                  <div className="font-medium">
                    {microStxToStx(userStats?.totalRepaid || 0).toFixed(2)} STX
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="card">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Borrowed</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {microStxToStx(stats.totalBorrowed).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">STX</div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Lent</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {microStxToStx(stats.totalLent).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">STX</div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Loans</div>
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {stats.activeLoans}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Loans</div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed Loans</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.completedLoans}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Loans</div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Interest Earned</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {microStxToStx(stats.totalInterestEarned).toFixed(6)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">STX</div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Interest Paid</div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {microStxToStx(stats.totalInterestPaid).toFixed(6)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">STX</div>
            </div>
          </div>

          {/* Credit Score Info */}
          <div className="card bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              How Credit Score Works
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p>
                Your credit score is calculated based on your on-chain lending history:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Repaying loans on time increases your score</li>
                <li>Defaulting on loans decreases your score significantly</li>
                <li>Higher scores may help you get better loan terms</li>
                <li>Score range: 0-1000 (500 is the starting score)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
