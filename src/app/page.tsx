'use client';

import { PushUniversalWalletProvider, PushUI } from '@pushchain/ui-kit';
import UniversalPushDashboard from '@/components/UniversalPushDashboard';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Log when component mounts
    console.log('🚀 PushLend Universal App initialized');
  }, []);

  // Configure Push Universal Wallet
  const walletConfig = {
    network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
    login: {
      email: true,
      google: true,
      wallet: {
        enabled: true,
      },
      appPreview: true,
    },
    modal: {
      loginLayout: PushUI.CONSTANTS.LOGIN.LAYOUT.SPLIT,
      connectedLayout: PushUI.CONSTANTS.CONNECTED.LAYOUT.HOVER,
      appPreview: true,
    },
  };

  // App metadata
  const appMetadata = {
    logoUrl: 'https://via.placeholder.com/150?text=PushLend',
    title: 'PushLend',
    description: 'Universal P2P Lending Platform on Push Network',
  };

  return (
    <PushUniversalWalletProvider 
      config={walletConfig} 
      app={appMetadata}
    >
      <UniversalPushDashboard />
    </PushUniversalWalletProvider>
  );
}
