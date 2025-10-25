'use client';

import { useState, useEffect } from 'react';
import { PushUniversalAccountButton, usePushWalletContext, usePushChainClient, PushUI } from '@pushchain/ui-kit';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, PUSHLEND_ABI } from '@/lib/push-config';
import UniversalLoanOffers from './UniversalLoanOffers';
import UniversalBorrowRequests from './UniversalBorrowRequests';
import UniversalMyLoans from './UniversalMyLoans';
import UniversalAnalytics from './UniversalAnalytics';

type Tab = 'offers' | 'borrow' | 'myloans' | 'analytics';

export default function UniversalPushDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('offers');
  const [balance, setBalance] = useState<string>('0');
  
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();

  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;
  const address = pushChainClient?.universal.account || '';

  useEffect(() => {
    if (isConnected && pushChainClient) {
      loadBalance();
      const interval = setInterval(loadBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [isConnected, pushChainClient]);

  const loadBalance = async () => {
    try {
      if (!pushChainClient || !address) return;
      // Use ethers provider to get balance
      const provider = new ethers.JsonRpcProvider('https://evm.rpc-testnet-donut-node1.push.org/');
      const bal = await provider.getBalance(address);
      setBalance(ethers.formatEther(bal));
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert('Address copied to clipboard!');
    }
  };

  // Get contract instance
  const getContract = () => {
    if (!pushChainClient) return null;
    
    // Create a custom signer that uses pushChainClient for transactions
    const customSigner = {
      getAddress: async () => address,
      signTransaction: async (tx: any) => {
        // Use pushChainClient to send transaction
        const result = await pushChainClient.universal.sendTransaction(tx);
        return result.hash;
      },
      sendTransaction: async (tx: any) => {
        const result = await pushChainClient.universal.sendTransaction(tx);
        return {
          hash: result.hash,
          wait: async () => result,
        };
      },
      signMessage: async (message: any) => {
        return await pushChainClient.universal.signMessage(message);
      },
    };
    
    return new ethers.Contract(
      CONTRACT_ADDRESSES.pushLend,
      PUSHLEND_ABI,
      customSigner as any
    );
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">PushLend</h1>
            <p className="text-gray-600">Universal P2P Lending Platform</p>
            <p className="text-sm text-purple-600 mt-2">
              Connect from any chain - Ethereum, Solana, and more!
            </p>
          </div>

          <div className="flex justify-center">
            <PushUniversalAccountButton />
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Network:</strong> Push Chain Donut Testnet
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <strong>Contract:</strong>{' '}
              <a
                href={`https://donut.push.network/address/${CONTRACT_ADDRESSES.pushLend}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {CONTRACT_ADDRESSES.pushLend}
              </a>
            </p>
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">✨ Universal Access</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-purple-800">
              <li>Connect with any wallet (MetaMask, Phantom, etc.)</li>
              <li>Use email or social login</li>
              <li>Transact from Ethereum, Solana, or other chains</li>
              <li>All interactions on Push Network</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                PushLend
              </h1>
              <p className="text-sm text-gray-600 mt-1">Universal P2P Lending Platform</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Balance</div>
                <div className="text-lg font-semibold text-gray-900">
                  {parseFloat(balance).toFixed(4)} PC
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyAddress}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  title="Copy address"
                >
                  {address.slice(0, 6)}...{address.slice(-4)}
                </button>

                <PushUniversalAccountButton />
              </div>
            </div>
          </div>

          {/* Origin Chain Info */}
          {pushChainClient?.universal.origin && (
            <div className="mt-3 p-2 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-800">
                <strong>🌐 Connected from:</strong>{' '}
                {pushChainClient.universal.origin.address} (
                {pushChainClient.universal.origin.chain})
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'offers', label: 'Loan Offers' },
              { id: 'borrow', label: 'Borrow' },
              { id: 'myloans', label: 'My Loans' },
              { id: 'analytics', label: 'Analytics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'offers' && pushChainClient && (
          <UniversalLoanOffers 
            pushChainClient={pushChainClient} 
            address={address}
            getContract={getContract}
          />
        )}
        {activeTab === 'borrow' && pushChainClient && (
          <UniversalBorrowRequests 
            pushChainClient={pushChainClient} 
            address={address}
            getContract={getContract}
          />
        )}
        {activeTab === 'myloans' && pushChainClient && (
          <UniversalMyLoans 
            pushChainClient={pushChainClient} 
            address={address}
            getContract={getContract}
          />
        )}
        {activeTab === 'analytics' && (
          <UniversalAnalytics address={address} getContract={getContract} />
        )}
      </main>
    </div>
  );
}
