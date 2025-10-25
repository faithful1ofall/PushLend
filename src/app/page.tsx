'use client';

import { PushUniversalWalletProvider, PushUI } from '@pushchain/ui-kit';
import LandingPage from '@/components/LandingPage';

export default function Home() {
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

  const appMetadata = {
    logoUrl: 'https://via.placeholder.com/150?text=PL',
    title: 'PushLend',
    description: 'Universal P2P Lending Platform on Push Network - Connect from any blockchain',
  };

  return (
    <PushUniversalWalletProvider 
      config={walletConfig} 
      app={appMetadata}
      themeMode={PushUI.CONSTANTS.THEME.DARK}
    >
      <LandingPage />
    </PushUniversalWalletProvider>
  );
}
