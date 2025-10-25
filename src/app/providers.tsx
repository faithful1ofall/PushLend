"use client";

import {
  TurnkeyProvider,
  TurnkeyProviderConfig,
} from "@turnkey/react-wallet-kit";

const turnkeyConfig: TurnkeyProviderConfig = {
  organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  authProxyConfigId: process.env.NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID!,
};

// Debug: Log configuration on mount
if (typeof window !== 'undefined') {
  console.log('🔧 Turnkey Configuration:', {
    organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID ? '✅ Set' : '❌ Missing',
    authProxyConfigId: process.env.NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID ? '✅ Set' : '❌ Missing',
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TurnkeyProvider
      config={turnkeyConfig}
      callbacks={{
        onError: (error) => {
          console.error("❌ Turnkey error:", error);
        },
        onAuthenticationSuccess: ({ session }) => {
          console.log("✅ User authenticated:", session);
        },
      }}
    >
      {children}
    </TurnkeyProvider>
  );
}
