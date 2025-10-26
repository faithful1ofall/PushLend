'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useLendingContract } from '@/hooks/useLendingContract';

export default function UniversalLoanOffers() {
  const { getContract, sendTransaction, userAddress, isConnected } = useLendingContract();
  const address = userAddress || '';
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('10');
  const [maxDuration, setMaxDuration] = useState('30');
  const [minCollateralRatio, setMinCollateralRatio] = useState('15000');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const counter = await contract.offerCounter();
      //const totalOffers = counter.toNumber(); // safer conversion for small numbers
      
      const loadedOffers = [];

      for (let i = 1; i <= Number(counter); i++) {
  try {
    const offer = await contract.getOffer(i);

    // Skip empty / invalid offers
  /*  if (
      !offer ||
      !offer.active ||
      offer.amount == null ||
      offer.interestRate == null ||
      offer.maxDuration == null ||
      offer.minCollateralRatio == null
    ) continue;*/

    loadedOffers.push({
      id: i,
      amount: offer.amount,
      interestRate: offer.interestRate,
      maxDuration: offer.maxDuration,
      minCollateralRatio: offer.minCollateralRatio,
      lender: offer.lender,
      active: offer.active,
    });
  } catch (err) {
    console.error(`Error loading offer ${i}:`, err);
  }
      }

     /* for (let i = 1; i <= totalOffers; i++) {
        try {
          const offer = await contract.getOffer(i);
          if (offer.active) {
            loadedOffers.push({ id: i, ...offer });
          }
        } catch (err) {
          console.error(`Error loading offer ${i}:`, err);
        }
      }*/

      setOffers(loadedOffers);
    } catch (error) {
      alert(`Error loading offers: ${error}`);
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !interestRate || !maxDuration || !minCollateralRatio) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const amountWei = ethers.parseEther(amount);
      const durationSeconds = parseInt(maxDuration) * 24 * 60 * 60;
      
      const data = contract.interface.encodeFunctionData('createOffer', [
        amountWei,
        parseInt(interestRate) * 100,
        durationSeconds,
        parseInt(minCollateralRatio)
      ]);

      const tx = await sendTransaction({
        to: contract.target,
        data: data,
        value: '0'
      });
      alert('Offer created successfully!');
      setShowCreateForm(false);
      setAmount('');
      await loadOffers();
    } catch (error: any) {
      console.error('Error creating offer:', error);
      alert('Failed to create offer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: number, offerAmount: bigint, minCollateral: bigint) => {
    const duration = prompt('Enter loan duration in days:');
    if (!duration) return;

    const minCollateralAmount = (offerAmount * minCollateral) / BigInt(10000);
    const collateral = prompt(`Enter collateral amount in PC (minimum ${ethers.formatEther(minCollateralAmount)} PC):`);
    if (!collateral) return;

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const durationSeconds = parseInt(duration) * 24 * 60 * 60;
      const collateralWei = ethers.parseEther(collateral);
      
      const data = contract.interface.encodeFunctionData('acceptOffer', [offerId, durationSeconds]);

      const tx = await sendTransaction({
        to: contract.target,
        data: data,
        value: collateralWei.toString()
      });
      
      alert('Offer accepted successfully!');
      await loadOffers();
    } catch (error: any) {
      console.error('Error accepting offer:', error);
      alert('Failed to accept offer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOffer = async (offerId: number) => {
    if (!confirm('Are you sure you want to cancel this offer?')) return;

    try {
      setLoading(true);
      const contract = await getContract();
      if (!contract) return;

      const data = contract.interface.encodeFunctionData('cancelOffer', [offerId]);

      const tx = await sendTransaction({
        to: contract.target,
        data: data,
        value: '0'
      });
      
      alert('Offer cancelled successfully!');
      await loadOffers();
    } catch (error: any) {
      console.error('Error cancelling offer:', error);
      alert('Failed to cancel offer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Loan Offers</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {showCreateForm ? 'Cancel' : '+ Create Offer'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Create Loan Offer</h3>
          <form onSubmit={handleCreateOffer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (PC)
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
                Interest Rate (% per year)
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="e.g., 10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Duration (days)
              </label>
              <input
                type="number"
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="e.g., 30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Collateral Ratio (basis points, 15000 = 150%)
              </label>
              <input
                type="number"
                value={minCollateralRatio}
                onChange={(e) => setMinCollateralRatio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="e.g., 15000"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Offer'}
            </button>
          </form>
        </div>
      )}

      {loading && offers.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500">No active offers available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {ethers.formatEther(offer.amount)} PC
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      Active
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Interest Rate: {Number(offer.interestRate) / 100}% per year</p>
                    <p>Max Duration: {Number(offer.maxDuration) / (24 * 60 * 60)} days</p>
                    <p>Min Collateral: {Number(offer.minCollateralRatio) / 100}%</p>
                    <p className="text-xs">Lender: {offer.lender}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {offer.lender.toLowerCase() === address.toLowerCase() ? (
                    <button
                      onClick={() => handleCancelOffer(offer.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAcceptOffer(offer.id, offer.amount, offer.minCollateralRatio)}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
