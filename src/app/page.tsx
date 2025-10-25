'use client';

import { PushUniversalWalletProvider, PushUI } from '@pushchain/ui-kit';
import UniversalPushDashboard from '@/components/UniversalPushDashboard';

export default function Home() {
  // Configure Push Universal Wallet - using exact pattern from docs
  const walletConfig = {
    network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
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
