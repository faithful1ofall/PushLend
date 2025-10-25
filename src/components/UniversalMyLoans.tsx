'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { LoanStatus } from '@/lib/push-config';

interface UniversalMyLoansProps {
  pushChainClient: any;
  address: string;
  getContract: () => ethers.Contract | null;
}

export default function UniversalMyLoans({ pushChainClient, address, getContract }: UniversalMyLoansProps) {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLoans();
  }, [address]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const contract = getContract();
      if (!contract) return;

      const counter = await contract.loanCounter();
      const loadedLoans = [];

      for (let i = 1; i <= Number(counter); i++) {
        try {
          const loan = await contract.getLoan(i);
          // Show loans where user is borrower or lender
          if (
            loan.borrower.toLowerCase() === address.toLowerCase() ||
            loan.lender.toLowerCase() === address.toLowerCase()
          ) {
            let totalRepayment = '0';
            if (loan.status === LoanStatus.Active) {
              const amount = await contract.calculateTotalRepayment(i);
              totalRepayment = ethers.formatEther(amount);
            }
            loadedLoans.push({ id: i, ...loan, totalRepayment });
          }
        } catch (err) {
          console.error(`Error loading loan ${i}:`, err);
        }
      }

      setLoans(loadedLoans);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepayLoan = async (loanId: number, amount: string) => {
    if (!confirm(`Repay ${amount} PC?`)) return;

    try {
      setLoading(true);
      const contract = getContract();
      if (!contract) return;

      const amountWei = ethers.parseEther(amount);
      const tx = await contract.repayLoan(loanId, { value: amountWei });
      await tx.wait();
      
      alert('Loan repaid successfully!');
      await loadLoans();
    } catch (error: any) {
      console.error('Error repaying loan:', error);
      alert('Failed to repay loan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLiquidateLoan = async (loanId: number) => {
    if (!confirm('Liquidate this loan?')) return;

    try {
      setLoading(true);
      const contract = getContract();
      if (!contract) return;

      const tx = await contract.liquidateLoan(loanId);
      await tx.wait();
      
      alert('Loan liquidated successfully!');
      await loadLoans();
    } catch (error: any) {
      console.error('Error liquidating loan:', error);
      alert('Failed to liquidate loan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFundLoan = async (loanId: number, amount: bigint) => {
    if (!confirm(`Fund ${ethers.formatEther(amount)} PC?`)) return;

    try {
      setLoading(true);
      const contract = getContract();
      if (!contract) return;

      const tx = await contract.fundLoan(loanId, { value: amount });
      await tx.wait();
      
      alert('Loan funded successfully!');
      await loadLoans();
    } catch (error: any) {
      console.error('Error funding loan:', error);
      alert('Failed to fund loan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: number) => {
    const labels = ['Pending', 'Active', 'Repaid', 'Defaulted', 'Liquidated'];
    const colors = ['bg-yellow-100 text-yellow-800', 'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-red-100 text-red-800', 'bg-gray-100 text-gray-800'];
    return <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Loans</h2>

      {loading && loans.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500">No loans found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {loans.map((loan) => {
            const isBorrower = loan.borrower.toLowerCase() === address.toLowerCase();
            const isLender = loan.lender.toLowerCase() === address.toLowerCase();

            return (
              <div key={loan.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl font-bold text-gray-900">
                        Loan #{loan.id}
                      </span>
                      {getStatusLabel(loan.status)}
                      {isBorrower && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">Borrower</span>}
                      {isLender && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Lender</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Principal</p>
                    <p className="font-semibold">{ethers.formatEther(loan.principalAmount)} PC</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Collateral</p>
                    <p className="font-semibold">{ethers.formatEther(loan.collateralAmount)} PC</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Interest Rate</p>
                    <p className="font-semibold">{Number(loan.interestRate) / 100}% per year</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold">{Number(loan.duration) / (24 * 60 * 60)} days</p>
                  </div>
                </div>

                {loan.status === LoanStatus.Active && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Total Repayment:</strong> {loan.totalRepayment} PC
                    </p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {loan.status === LoanStatus.Pending && isLender && (
                    <button
                      onClick={() => handleFundLoan(loan.id, loan.principalAmount)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Fund Loan
                    </button>
                  )}

                  {loan.status === LoanStatus.Active && isBorrower && (
                    <button
                      onClick={() => handleRepayLoan(loan.id, loan.totalRepayment)}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      Repay Loan
                    </button>
                  )}

                  {loan.status === LoanStatus.Active && isLender && (
                    <button
                      onClick={() => handleLiquidateLoan(loan.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Liquidate
                    </button>
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
