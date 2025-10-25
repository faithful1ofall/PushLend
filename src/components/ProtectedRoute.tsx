'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePushWalletContext, PushUI } from '@pushchain/ui-kit';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { connectionStatus } = usePushWalletContext();
  const router = useRouter();

  // Track connection status in localStorage for persistence
  useEffect(() => {
    if (connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED) {
      localStorage.setItem('wasConnected', 'true');
    } else if (connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.NOT_CONNECTED) {
      localStorage.removeItem('wasConnected');
    }
  }, [connectionStatus]);

  // Check if user was ever connected
  const wasConnected = typeof window !== 'undefined' && localStorage.getItem('wasConnected') === 'true';
  const isCurrentlyConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;

  // Redirect if user was never connected AND is not currently connected
  useEffect(() => {
    if (!wasConnected && !isCurrentlyConnected) {
      router.push('/');
    }
  }, [wasConnected, isCurrentlyConnected, router]);

  if (!wasConnected && !isCurrentlyConnected) {
    return null;
  }

  return <>{children}</>;
}
