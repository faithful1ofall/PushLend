'use client';

import { useState } from 'react';
import { PushUniversalAccountButton, usePushWalletContext } from '@pushchain/ui-kit';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const router = useRouter();
  const { handleUserLogOutEvent } = usePushWalletContext();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const isTabletOrMobile = typeof window !== 'undefined' && window.innerWidth <= 1014;

  const handleLogout = () => {
    if (handleUserLogOutEvent) {
      handleUserLogOutEvent();
    }
    router.push('/');
  };

  const tabs = [
    { id: 'offers', label: 'Loan Offers', icon: '💰' },
    { id: 'borrow', label: 'Borrow', icon: '📝' },
    { id: 'myloans', label: 'My Loans', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="flex gap-8 h-screen text-lg font-sans">
      {/* Sidebar */}
      {!isTabletOrMobile && sidebarVisible && (
        <div
          className="w-80 p-10 h-full flex flex-col gap-12"
          style={{
            background: "linear-gradient(to bottom, #1a1a2e 80%, #9333ea 100%)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                PL
              </div>
              <h3 className="text-white text-xl font-bold">PushLend</h3>
            </div>
            <button
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className="p-2 rounded-lg hover:bg-purple-600/20 transition-colors text-white"
              title="Hide Sidebar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
                <line x1="14" y1="8" x2="19" y2="8"/>
                <line x1="14" y1="12" x2="19" y2="12"/>
                <line x1="14" y1="16" x2="19" y2="16"/>
              </svg>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-3 px-4 rounded-lg flex items-center transition-all ease-in-out gap-3 w-full text-white ${
                  activeTab === tab.id
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-transparent hover:bg-purple-600/50"
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <p>{tab.label}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="p-3 rounded-lg flex items-center gap-3 w-full justify-center cursor-pointer hover:bg-purple-600 transition-all text-white"
          >
            <span className="text-2xl">🚪</span>
            <p>Log out</p>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto h-full flex flex-col gap-10 px-7 lg:px-20 py-10">
        <div className="flex items-center justify-between w-full">
          {/* Show PushLend logo with toggle when sidebar is hidden */}
          {!isTabletOrMobile && !sidebarVisible && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="p-2 rounded-lg hover:bg-purple-600/20 transition-colors"
                title="Show Sidebar"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  PL
                </div>
                <h3 className="text-xl font-bold">PushLend</h3>
              </div>
            </div>
          )}

          {/* Right Side - Account Button */}
          <div className="ml-auto flex items-center gap-4">
            <div className="max-w-[200px]">
              <PushUniversalAccountButton />
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          {children}
        </div>

        {/* Bottom Navigation for Mobile */}
        {isTabletOrMobile && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[80%] bg-purple-600/30 backdrop-blur-md z-50 flex items-center justify-evenly px-10 py-4 rounded-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`text-2xl p-2 rounded-lg ${
                  activeTab === tab.id
                    ? "bg-purple-600"
                    : "bg-transparent hover:bg-purple-600/50"
                } transition-all ease-in-out`}
              >
                {tab.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
