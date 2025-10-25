'use client';

import { useState, useEffect } from 'react';
import { WalletData } from '@/lib/wallet';
import { 
  createOfferTx,
  cancelOfferTx,
  signWithTurnkey,
  getAccountNonce,
} from '@/lib/turnkey-stacks';
import { signAndBroadcastTransaction } from '@/lib/signing-utils';
import { getOffer, getOfferCount, cancelOffer } from '@/lib/stacks';
import { microStxToStx, stxToMicroStx } from '@/lib/turnkey-stacks';
import { LoanOffer } from '@/types';
import { STACKS_NETWORK } from '@/lib/config';

interface LoanOffersProps {
  wallet: WalletData;
}

export default function LoanOffers({ wallet }: LoanOffersProps) {
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [minCollateral, setMinCollateral] = useState('150'); // 150% as percentage

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const countResult = await getOfferCount();
      console.log('Offer count result:', countResult);
      const count = countResult?.value || 0;
      
      const loadedOffers: LoanOffer[] = [];
      for (let i = 1; i <= count; i++) {
        const offerResult = await getOffer(i);
        console.log(`Offer ${i} result:`, offerResult);
        
        // cvToJSON returns nested structure: {value: {value: {field: {value: ...}}}}
        if (offerResult && offerResult.value && offerResult.value.value) {
          const offerData = offerResult.value.value;
          console.log(`Offer ${i} data:`, offerData);
          
          // Each field is also wrapped: {type: 'uint', value: '123'}
          loadedOffers.push({
            offerId: i,
            lender: offerData.lender.value,
            amount: parseInt(offerData.amount.value),
            interestRate: parseInt(offerData['interest-rate'].value),
            maxDuration: parseInt(offerData['max-duration'].value),
            minCollateral: parseInt(offerData['min-collateral'].value),
            active: offerData.active.value,
            loanAsset: offerData['loan-asset'] ? parseInt(offerData['loan-asset'].value) : 1,
            collateralAsset: offerData['collateral-asset'] ? parseInt(offerData['collateral-asset'].value) : 1,
          });
        }
      }
      
      console.log('Loaded offers:', loadedOffers);
      setOffers(loadedOffers.filter(o => o.active));
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !interestRate || !maxDuration || !minCollateral) return;

    try {
      setLoading(true);
      const amountInMicroStx = stxToMicroStx(parseFloat(amount));
      const rate = parseInt(interestRate) * 100; // Convert to basis points
      const duration = parseInt(maxDuration) * 144; // Convert days to blocks
      const minColl = stxToMicroStx(parseFloat(minCollateral));

      // Use Turnkey signing if available
      if (wallet.turnkey) {
        const unsignedTx = await createOfferTx(
          wallet.publicKey,
          wallet.address,
          amountInMicroStx,
          rate,
          duration,
          minColl,
          1, // loan-asset: STX (u1)
          1  // collateral-asset: STX (u1)
        );

        const signFunction = async (payload: string) => {
          return signWithTurnkey(payload, wallet.turnkey!.httpClient, wallet.publicKey);
        };

        const networkType = STACKS_NETWORK.chainId === 1 ? 'mainnet' : 'testnet';
        await signAndBroadcastTransaction(unsignedTx, signFunction, networkType);
      } else {
        throw new Error('Turnkey wallet required');
      }

      alert('Offer created! Wait ~30 seconds for confirmation.');
      setShowCreateForm(false);
      setAmount('');
      setInterestRate('');
      setMaxDuration('');
      setMinCollateral('150');
      setTimeout(loadOffers, 30000);
    } catch (err) {
      console.error('Failed to create offer:', err);
      alert(`Failed to create offer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOffer = (offer: LoanOffer) => {
    alert(
      `Offer Details:\n\n` +
      `Amount: ${microStxToStx(offer.amount).toFixed(2)} STX\n` +
      `Interest Rate: ${(offer.interestRate / 100).toFixed(1)}% APR\n` +
      `Max Duration: ${Math.floor(offer.maxDuration / 144)} days\n` +
      `Min Collateral: ${microStxToStx(offer.minCollateral).toFixed(2)} STX\n` +
      `Lender: ${offer.lender}\n\n` +
      `To accept this offer, go to the "Borrow" tab.`
    );
  };

  const handleCancelOffer = async (offerId: number) => {
    if (!confirm('Are you sure you want to cancel this offer?')) return;

    try {
      setLoading(true);
      
      // Use Turnkey signing if available
      if (wallet.turnkey) {
        const unsignedTx = await cancelOfferTx(
          wallet.publicKey,
          wallet.address,
          offerId
        );

        const signFunction = async (payload: string) => {
          return signWithTurnkey(payload, wallet.turnkey!.httpClient, wallet.publicKey);
        };

        const networkType = STACKS_NETWORK.chainId === 1 ? 'mainnet' : 'testnet';
        await signAndBroadcastTransaction(unsignedTx, signFunction, networkType);
      } else if (wallet.privateKey) {
        await cancelOffer(wallet.privateKey, offerId);
      } else {
        throw new Error('No signing method available');
      }
      
      alert('Offer cancelled! Wait ~30 seconds for confirmation.');
      setTimeout(loadOffers, 30000);
    } catch (err) {
      console.error('Failed to cancel offer:', err);
      alert('Failed to cancel offer. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Available Loan Offers
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and accept lending offers from other users
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
          disabled={loading}
        >
          {showCreateForm ? 'Cancel' : '+ Create Offer'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Create Loan Offer</h3>
          <form onSubmit={handleCreateOffer} className="space-y-4">
            <div>
              <label className="label">Amount (STX)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                placeholder="e.g., 100"
                required
              />
            </div>
            <div>
              <label className="label">Interest Rate (% per year)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="input"
                placeholder="e.g., 10"
                required
              />
            </div>
            <div>
              <label className="label">Maximum Duration (days)</label>
              <input
                type="number"
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
                className="input"
                placeholder="e.g., 30"
                required
              />
            </div>
            <div>
              <label className="label">Minimum Collateral (STX)</label>
              <input
                type="number"
                step="0.01"
                value={minCollateral}
                onChange={(e) => setMinCollateral(e.target.value)}
                className="input"
                placeholder="e.g., 150"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum collateral required in STX
              </p>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Offer'}
            </button>
          </form>
        </div>
      )}

      {loading && offers.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No active offers available. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => {
            return (
              <div key={offer.offerId} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {microStxToStx(offer.amount).toFixed(2)} STX
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Offer #{offer.offerId}
                    </div>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Interest Rate:</span>
                    <span className="font-medium">{(offer.interestRate / 100).toFixed(1)}% APR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Max Duration:</span>
                    <span className="font-medium">{Math.floor(offer.maxDuration / 144)} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Min Collateral:</span>
                    <span className="font-medium">{microStxToStx(offer.minCollateral).toFixed(2)} STX</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Lender:</span>
                    <span className="font-mono text-xs">
                      {offer.lender.slice(0, 6)}...{offer.lender.slice(-4)}
                    </span>
                  </div>
                </div>

                {offer.lender === wallet.address ? (
                  <button
                    onClick={() => handleCancelOffer(offer.offerId)}
                    className="btn btn-danger w-full"
                    disabled={loading}
                  >
                    Cancel Offer
                  </button>
                ) : (
                  <button
                    onClick={() => handleViewOffer(offer)}
                    className="btn btn-primary w-full"
                    disabled={loading}
                  >
                    View Details
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
