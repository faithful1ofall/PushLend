'use client';

import { PushUniversalWalletProvider, PushUI } from '@pushchain/ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from '@/components/LandingPage';

const queryClient = new QueryClient();

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
    transak: {
      enabled: true,
    },
  };

  const appMetadata = {
    logoUrl: '/logo.svg',
    title: 'PushLend',
    description: 'Universal P2P Lending Platform on Push Network - Connect from any blockchain',
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PushUniversalWalletProvider 
        config={walletConfig} 
        app={appMetadata}
        themeMode={PushUI.CONSTANTS.THEME.DARK}
      >
        <LandingPage />
      </PushUniversalWalletProvider>
    </QueryClientProvider>
  );
}
