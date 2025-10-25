'use client';

import { useState } from 'react';
import { useTurnkey } from '@turnkey/react-wallet-kit';

// Stacks wallet configuration for Turnkey
const STACKS_ACCOUNT_PARAMS = {
  curve: 'CURVE_SECP256K1' as const,
  pathFormat: 'PATH_FORMAT_BIP32' as const,
  path: "m/44'/5757'/0'/0/0",
  addressFormat: 'ADDRESS_FORMAT_COMPRESSED' as const,
};

interface WalletSelectionProps {
  onWalletCreated: () => void;
}

export default function WalletSelection({ onWalletCreated }: WalletSelectionProps) {
  const { createWallet, handleImportWallet } = useTurnkey();
  const [mode, setMode] = useState<'select' | 'create' | 'import'>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateWallet = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('🔄 Creating new Stacks wallet...');
      const walletId = await createWallet({
        walletName: `StacksLend Wallet ${Date.now()}`,
        accounts: [STACKS_ACCOUNT_PARAMS],
      });
      console.log('✅ Wallet created successfully:', walletId);
      onWalletCreated();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create wallet';
      console.error('❌ Wallet creation failed:', err);
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('🔄 Opening wallet import modal...');
      
      // Turnkey's handleImportWallet opens a modal for importing from an encrypted bundle
      // This is their secure way of importing wallets (not raw seed phrases)
      const walletId = await handleImportWallet({
        walletName: `StacksLend Imported Wallet ${Date.now()}`,
        defaultWalletAccounts: [STACKS_ACCOUNT_PARAMS],
        successPageDuration: 2000,
      });
      
      console.log('✅ Wallet imported successfully:', walletId);
      onWalletCreated();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to import wallet';
      console.error('❌ Wallet import failed:', err);
      setError(errorMsg);
      setMode('select'); // Go back to selection on error
    } finally {
      setIsProcessing(false);
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              Wallet Setup
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose how you want to set up your wallet
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">🆕</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    Create New Wallet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate a new secure wallet with a recovery seed phrase
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={handleImport}
              disabled={isProcessing}
              className="w-full p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">📥</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    Import Existing Wallet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Restore your wallet from an encrypted backup bundle
                  </p>
                </div>
              </div>
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              🔒 Your wallet is secured by Turnkey passkey authentication
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="card max-w-md w-full">
          <button
            onClick={() => setMode('select')}
            className="mb-4 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"
          >
            ← Back
          </button>

          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🆕</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Wallet
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A new secure wallet will be created for you. Make sure to export and backup your seed phrase after creation.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ℹ️ After creating your wallet, you'll be able to export your seed phrase for backup purposes.
              </p>
            </div>

            <button
              onClick={handleCreateWallet}
              disabled={isProcessing}
              className="btn btn-primary w-full py-3 text-lg"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Wallet...
                </span>
              ) : (
                'Create Wallet'
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
