'use client';

import { usePushWalletContext, PushUI } from '@pushchain/ui-kit';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { connectionStatus, handleConnectToPushWallet } = usePushWalletContext();
  const router = useRouter();

  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  const handleConnect = () => {
    if (handleConnectToPushWallet) {
      handleConnectToPushWallet();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-purple-600 font-bold text-2xl shadow-2xl">
              PL
            </div>
            <h1 className="text-6xl font-bold text-white">PushLend</h1>
          </div>
          <p className="text-2xl text-purple-200">
            Universal P2P Lending Platform
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold text-white mb-2">Universal Access</h3>
            <p className="text-purple-200">Connect from any blockchain without bridging</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-white mb-2">Peer-to-Peer</h3>
            <p className="text-purple-200">Direct lending without intermediaries</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-white mb-2">Secure</h3>
            <p className="text-purple-200">Smart contract-based collateral management</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 space-y-4">
          <div className="flex justify-center">
            <button
              onClick={handleConnect}
              className="px-8 py-4 bg-white text-purple-900 rounded-xl font-bold text-lg hover:bg-purple-100 transition-all shadow-2xl hover:scale-105"
            >
              Connect Wallet
            </button>
          </div>
          <p className="text-purple-300 text-sm">
            Connect with email, social login, or your existing wallet
          </p>
        </div>

        {/* Info */}
        <div className="mt-16 bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="text-lg font-semibold text-purple-300 mb-2">For Lenders</h4>
              <ul className="space-y-2 text-purple-200">
                <li>• Create loan offers with your terms</li>
                <li>• Earn interest on your capital</li>
                <li>• Collateral-backed security</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-purple-300 mb-2">For Borrowers</h4>
              <ul className="space-y-2 text-purple-200">
                <li>• Request loans with collateral</li>
                <li>• Flexible repayment terms</li>
                <li>• Build your credit score</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
