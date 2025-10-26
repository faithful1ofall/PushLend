'use client';

import { PushUniversalWalletProvider, PushUI } from '@pushchain/ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient with better caching for wallet state
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 2,
      },
    },
  }));
  

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
    // Enable session persistence
    session: {
      enabled: true,
      duration: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
   /* transak: {
      enabled: true,
    },*/
  };

  const appMetadata = {
    logoUrl: 'https://cdn.dorahacks.io/static/files/19a1f2e43ea54c5fcc9a7cf46bd809e0.png@128h.webp',
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
        {children}
      </PushUniversalWalletProvider>
    </QueryClientProvider>
  );
}
