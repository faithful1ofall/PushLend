'use client';

import { useState } from 'react';
import { PushUniversalWalletProvider, PushUI } from '@pushchain/ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import UniversalLoanOffers from '@/components/UniversalLoanOffers';
import UniversalBorrowRequests from '@/components/UniversalBorrowRequests';
import UniversalMyLoans from '@/components/UniversalMyLoans';
import UniversalAnalytics from '@/components/UniversalAnalytics';

const queryClient = new QueryClient();

type Tab = 'offers' | 'borrow' | 'myloans' | 'analytics';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>('offers');

  const renderContent = () => {
    switch (activeTab) {
      case 'offers':
        return <UniversalLoanOffers />;
      case 'borrow':
        return <UniversalBorrowRequests />;
      case 'myloans':
        return <UniversalMyLoans />;
      case 'analytics':
        return <UniversalAnalytics />;
      default:
        return <UniversalLoanOffers />;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)}>
        {renderContent()}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function DashboardPage() {
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
        <DashboardContent />
      </PushUniversalWalletProvider>
    </QueryClientProvider>
  );
}
