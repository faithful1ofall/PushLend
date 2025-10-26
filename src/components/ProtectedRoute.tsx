'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePushWalletContext, PushUI } from '@pushchain/ui-kit';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { connectionStatus } = usePushWalletContext();
  
  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Track connection status in localStorage for persistence
  useEffect(() => {
    if (!isClient) return;
    
    if (connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED) {
      localStorage.setItem('wasConnected', 'true');
    } else if (connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.NOT_CONNECTED) {
      localStorage.removeItem('wasConnected');
    }
  }, [connectionStatus, isClient]);

  // Check if user was ever connected
  const wasConnected = isClient && localStorage.getItem('wasConnected') === 'true';
  const isCurrentlyConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;
  const isConnecting = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTING;

  // Redirect if user was never connected AND is not currently connected
  useEffect(() => {
    if (!isClient) return;
    
    if (!wasConnected && !isCurrentlyConnected && !isConnecting) {
      router.push('/');
    }
  }, [wasConnected, isCurrentlyConnected, isConnecting, router, isClient]);

  // Show loading state while checking
  if (!isClient || isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not connected
  if (!wasConnected && !isCurrentlyConnected) {
    return null;
  }

  return <>{children}</>;
}
