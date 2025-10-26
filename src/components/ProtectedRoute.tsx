'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePushWalletContext, PushUI } from '@pushchain/ui-kit';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [reconnectAttempted, setReconnectAttempted] = useState(false);
  const { connectionStatus, handleConnectToPushWallet } = usePushWalletContext();
  
  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Track connection status in localStorage for persistence
  useEffect(() => {
    if (!isClient) return;
    
    if (connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED) {
      localStorage.setItem('wasConnected', 'true');
      localStorage.setItem('lastConnectedTime', Date.now().toString());
    } else if (connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.NOT_CONNECTED) {
      // Don't remove wasConnected immediately - allow for reconnection
    }
  }, [connectionStatus, isClient]);

  // Auto-reconnect if user was previously connected
  useEffect(() => {
    if (!isClient || reconnectAttempted) return;
    
    const wasConnected = localStorage.getItem('wasConnected') === 'true';
    const lastConnectedTime = localStorage.getItem('lastConnectedTime');
    const isCurrentlyConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;
    const isConnecting = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTING;
    
    // Auto-reconnect if was connected within last 7 days
    if (wasConnected && !isCurrentlyConnected && !isConnecting && lastConnectedTime) {
      const daysSinceLastConnection = (Date.now() - parseInt(lastConnectedTime)) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastConnection < 7 && handleConnectToPushWallet) {
        setReconnectAttempted(true);
        handleConnectToPushWallet();
      }
    }
  }, [isClient, connectionStatus, handleConnectToPushWallet, reconnectAttempted]);

  // Check if user was ever connected
  const wasConnected = isClient && localStorage.getItem('wasConnected') === 'true';
  const isCurrentlyConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;
  const isConnecting = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTING;

  // Redirect if user was never connected AND is not currently connected
  useEffect(() => {
    if (!isClient) return;
    
    // Give time for auto-reconnect attempt
    const timer = setTimeout(() => {
      if (!wasConnected && !isCurrentlyConnected && !isConnecting) {
        router.push('/');
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [wasConnected, isCurrentlyConnected, isConnecting, router, isClient]);

  // Show loading state while checking
  if (!isClient || isConnecting || (!isCurrentlyConnected && reconnectAttempted && wasConnected)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl mb-2">
            {isConnecting ? 'Connecting...' : 'Loading...'}
          </p>
          {reconnectAttempted && wasConnected && (
            <button
              onClick={() => {
                if (handleConnectToPushWallet) {
                  handleConnectToPushWallet();
                }
              }}
              className="mt-4 px-6 py-2 bg-white text-purple-900 rounded-lg font-semibold hover:bg-purple-100 transition-colors"
            >
              Reconnect Wallet
            </button>
          )}
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
