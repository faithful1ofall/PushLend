'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import UniversalLoanOffers from '@/components/UniversalLoanOffers';
import UniversalBorrowRequests from '@/components/UniversalBorrowRequests';
import UniversalMyLoans from '@/components/UniversalMyLoans';
import UniversalAnalytics from '@/components/UniversalAnalytics';

type Tab = 'offers' | 'borrow' | 'myloans' | 'analytics';

export default function DashboardPage() {
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
