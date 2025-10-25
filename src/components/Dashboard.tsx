'use client';

import { useState, useEffect } from 'react';
import { useTurnkey } from '@turnkey/react-wallet-kit';
import { microStxToStx } from '@/lib/turnkey-stacks';
import { getPublicKey, deriveStacksAddress } from '@/lib/turnkey-wallet';
import { getAssetBalance, formatAssetAmount, ASSET_STX, ASSET_SBTC } from '@/lib/sbtc';
import LoanOffers from './LoanOffers';
import BorrowRequests from './BorrowRequests';
import FundLoans from './FundLoans';
import MyLoans from './MyLoans';
import Analytics from './Analytics';

type Tab = 'offers' | 'fund' | 'borrow' | 'myloans' | 'analytics';

export default function Dashboard() {
  const { wallets, handleExportWallet, logout, user, httpClient } = useTurnkey();
  const [activeTab, setActiveTab] = useState<Tab>('offers');
  const [stxBalance, setStxBalance] = useState<number>(0);
  const [sbtcBalance, setSbtcBalance] = useState<number>(0);
  const [stacksAddress, setStacksAddress] = useState<string>('');
  const [showExportReminder, setShowExportReminder] = useState(true);

  const wallet = wallets[0];
  const walletAccount = wallet?.accounts[0];

  useEffect(() => {
    // Derive Stacks address from public key (Turnkey provides Ethereum addresses)
    if (walletAccount && walletAccount.publicKey) {
      console.log('=== Turnkey Wallet Account Debug ===');
      console.log('Full account object:', walletAccount);
      console.log('Turnkey address (Ethereum):', walletAccount.address);
      console.log('Public key:', walletAccount.publicKey);
      
      try {
        // Derive Stacks c32 address from public key
        const isMainnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet';
        const stacksAddr = deriveStacksAddress(walletAccount.publicKey, isMainnet);
        console.log('Derived Stacks address:', stacksAddr);
        console.log('=== End Debug ===');
        setStacksAddress(stacksAddr);
      } catch (error) {
        console.error('Failed to derive Stacks address:', error);
      }
    }
  }, [walletAccount]);

  useEffect(() => {
    if (stacksAddress) {
      loadBalances();
      const interval = setInterval(loadBalances, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [stacksAddress]);

  const loadBalances = async () => {
    try {
      if (!stacksAddress) return;
      
      // Load STX balance
      const stxBal = await getAssetBalance(stacksAddress, ASSET_STX);
      setStxBalance(microStxToStx(stxBal));
      
      // Load sBTC balance
      const sbtcBal = await getAssetBalance(stacksAddress, ASSET_SBTC);
      setSbtcBalance(sbtcBal);
    } catch (err) {
      console.error('Failed to load balances:', err);
    }
  };

  const copyAddress = () => {
    if (stacksAddress) {
      navigator.clipboard.writeText(stacksAddress);
      alert('Address copied to clipboard!');
    }
  };

  const handleExport = async () => {
    try {
      if (wallet) {
        console.log('Exporting wallet:', wallet.walletId);
        await handleExportWallet({ walletId: wallet.walletId });
        console.log('Wallet exported successfully');
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleLogout = () => {
    if (confirm('⚠️ Make sure you have exported your wallet!\n\nAre you sure you want to logout?')) {
      logout();
    }
  };

  if (!wallet || !walletAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Export Reminder Banner */}
      {showExportReminder && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Don't forget to backup your wallet!
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Export your wallet now to ensure you can login again in the future
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await handleExport();
                    setShowExportReminder(false);
                  }}
                  className="btn btn-primary text-sm"
                >
                  Export Now
                </button>
                <button
                  onClick={() => setShowExportReminder(false)}
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                StacksLend
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                P2P Lending Platform
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Balances</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {stxBalance.toFixed(6)} STX
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatAssetAmount(sbtcBalance, ASSET_SBTC)} sBTC
                </div>
              </div>
              
              <div className="border-l border-gray-300 dark:border-gray-600 pl-4">
                <button
                  onClick={copyAddress}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-1 block"
                  title="Click to copy"
                >
                  {stacksAddress ? `${stacksAddress.slice(0, 8)}...${stacksAddress.slice(-8)}` : 'Loading...'}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="text-xs btn btn-secondary"
                  >
                    🔑 Export Wallet
                  </button>
                  <button onClick={handleLogout} className="text-xs btn btn-danger">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('offers')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'offers'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Loan Offers
            </button>
            <button
              onClick={() => setActiveTab('fund')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'fund'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Fund Loans
            </button>
            <button
              onClick={() => setActiveTab('borrow')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'borrow'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Borrow
            </button>
            <button
              onClick={() => setActiveTab('myloans')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'myloans'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              My Loans
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Temporary: Create adapter for old wallet interface */}
        {stacksAddress && (() => {
          const publicKey = getPublicKey(walletAccount);
          const turnkeyContext = {
            httpClient,
            publicKey,
            walletId: wallet.walletId,
          };
          
          const walletAdapter = {
            address: stacksAddress,
            publicKey,
            turnkey: turnkeyContext,
          };
          
          return (
            <>
              {activeTab === 'offers' && <LoanOffers wallet={walletAdapter} />}
              {activeTab === 'fund' && <FundLoans wallet={walletAdapter} />}
              {activeTab === 'borrow' && <BorrowRequests wallet={walletAdapter} />}
              {activeTab === 'myloans' && <MyLoans wallet={walletAdapter} />}
              {activeTab === 'analytics' && <Analytics wallet={walletAdapter} />}
            </>
          );
        })()}
      </main>
    </div>
  );
}
