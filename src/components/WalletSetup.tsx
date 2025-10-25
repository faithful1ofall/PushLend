'use client';

import { useState } from 'react';
import { useTurnkey, ClientState } from '@turnkey/react-wallet-kit';

// Stacks wallet configuration for Turnkey
const STACKS_ACCOUNT_PARAMS = {
  curve: 'CURVE_SECP256K1' as const,
  pathFormat: 'PATH_FORMAT_BIP32' as const,
  path: "m/44'/5757'/0'/0/0",
  addressFormat: 'ADDRESS_FORMAT_COMPRESSED' as const,
};

export default function WalletSetup() {
  const { handleLogin, clientState } = useTurnkey();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (clientState === ClientState.Loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleAuth = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      console.log('🔐 Starting Turnkey authentication...');
      console.log('📋 Environment check:', {
        orgId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID ? '✅ Set' : '❌ Missing',
        authProxyId: process.env.NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID ? '✅ Set' : '❌ Missing',
      });
      
      await handleLogin();
      console.log('✅ Authentication successful!');
      // Wallet creation will be handled in page.tsx after authentication
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to authenticate';
      console.error('❌ Authentication failed:', err);
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if environment variables are set
  const hasOrgId = !!process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID;
  const hasAuthProxyId = !!process.env.NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID;
  const isConfigured = hasOrgId && hasAuthProxyId;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            StacksLend
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            P2P Lending Platform on Stacks
          </p>
        </div>

        {/* Configuration Warning */}
        {!isConfigured && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Configuration Required
            </h3>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
              Turnkey environment variables are not set:
            </p>
            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 ml-4">
              <li>{hasOrgId ? '✅' : '❌'} NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID</li>
              <li>{hasAuthProxyId ? '✅' : '❌'} NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID</li>
            </ul>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
              See <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">ENVIRONMENT_SETUP.md</code> for setup instructions.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Sign in with your passkey to access your secure embedded wallet. 
            If you're new, a wallet will be created automatically.
          </p>
          
          <button 
            onClick={handleAuth} 
            disabled={isProcessing || !isConfigured}
            className="btn btn-primary w-full py-3 text-lg"
            title={!isConfigured ? 'Please configure environment variables first' : ''}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Authenticating...
              </span>
            ) : (
              'Sign In / Sign Up'
            )}
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🔐 Secured by Turnkey passkey authentication
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            🔒 Secure embedded wallets with Turnkey
            <br />
            Testnet only - No real funds at risk
          </p>
        </div>
      </div>
    </div>
  );
}
