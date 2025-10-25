'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { PUSH_NETWORK_CONFIG, CONTRACT_ADDRESSES } from '@/lib/push-config';
import { getBalance } from '@/lib/push-client';
import PushLoanOffers from './PushLoanOffers';
import PushBorrowRequests from './PushBorrowRequests';
import PushMyLoans from './PushMyLoans';
import PushAnalytics from './PushAnalytics';

type Tab = 'offers' | 'borrow' | 'myloans' | 'analytics';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function PushDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('offers');
  const [balance, setBalance] = useState<string>('0');
  const [address, setAddress] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (address) {
      loadBalance();
      const interval = setInterval(loadBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [address]);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask or another Web3 wallet!');
      return;
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create provider and signer
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();

      // Check if we're on the right network
      const network = await browserProvider.getNetwork();
      if (Number(network.chainId) !== PUSH_NETWORK_CONFIG.chainId) {
        await switchNetwork();
      }

      setProvider(browserProvider);
      setSigner(signer);
      setAddress(address);
      setIsConnected(true);

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${PUSH_NETWORK_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${PUSH_NETWORK_CONFIG.chainId.toString(16)}`,
                chainName: PUSH_NETWORK_CONFIG.chainName,
                nativeCurrency: PUSH_NETWORK_CONFIG.nativeCurrency,
                rpcUrls: [PUSH_NETWORK_CONFIG.rpcUrl],
                blockExplorerUrls: [PUSH_NETWORK_CONFIG.explorerUrl],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress('');
    setIsConnected(false);
    setBalance('0');
  };

  const loadBalance = async () => {
    try {
      if (!address) return;
      const bal = await getBalance(address);
      setBalance(bal);
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">PushLend</h1>
            <p className="text-gray-600">P2P Lending on Push Network</p>
          </div>

          <button
            onClick={connectWallet}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Connect Wallet
          </button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Network:</strong> {PUSH_NETWORK_CONFIG.chainName}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <strong>Contract:</strong>{' '}
              <a
                href={`${PUSH_NETWORK_CONFIG.explorerUrl}/address/${CONTRACT_ADDRESSES.pushLend}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {CONTRACT_ADDRESSES.pushLend}
              </a>
            </p>
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
              <p className="text-sm text-gray-600 mt-1">P2P Lending on Push Network</p>
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

                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium text-red-700 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
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
        {activeTab === 'offers' && signer && <PushLoanOffers signer={signer} address={address} />}
        {activeTab === 'borrow' && signer && <PushBorrowRequests signer={signer} address={address} />}
        {activeTab === 'myloans' && signer && <PushMyLoans signer={signer} address={address} />}
        {activeTab === 'analytics' && <PushAnalytics address={address} />}
      </main>
    </div>
  );
}
