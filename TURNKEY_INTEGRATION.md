# Turnkey Integration Guide

## Overview

StacksLend now integrates with **Turnkey's Embedded Wallet SDK** (`@turnkey/react-wallet-kit`) to provide secure, non-custodial wallet management. This replaces the previous custom wallet implementation with enterprise-grade security.

## What Changed

### Before (Custom Wallet)
- Private keys stored in browser localStorage
- Manual key generation and management
- Security warnings about key storage
- Seed phrase import functionality

### After (Turnkey Integration)
- **Secure embedded wallets** managed by Turnkey
- **Multiple authentication methods**: Email OTP, Passkeys, OAuth (Google, Apple, Facebook, X, Discord)
- **No private keys in localStorage** - keys secured in Turnkey's infrastructure
- **Export/Import via secure iframe** - encrypted wallet backup
- **Industry-leading security** with hardware-backed key storage

---

## Setup Instructions

### 1. Create Turnkey Organization

1. Go to [Turnkey Dashboard](https://app.turnkey.com/dashboard/auth/initial)
2. Create a new organization
3. Navigate to **Wallet Kit** section
4. Enable **Auth Proxy**

### 2. Configure Authentication Methods

In the Turnkey Dashboard:

1. **Enable Email OTP** (recommended for testing)
2. **Enable Passkeys** (recommended for production)
3. **Optional**: Configure OAuth providers:
   - Google
   - Apple
   - Facebook
   - X (Twitter)
   - Discord

### 3. Get Configuration IDs

From the Turnkey Dashboard, copy:
- **Organization ID** (from dashboard home)
- **Auth Proxy Config ID** (from Wallet Kit section)

### 4. Configure Environment Variables

Create or update `.env.local`:

```bash
# Stacks Network Configuration
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so
NEXT_PUBLIC_CONTRACT_ADDRESS=STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X
NEXT_PUBLIC_CONTRACT_NAME=stackslend-simple

# Turnkey Configuration
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=your_organization_id_here
NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=your_auth_proxy_config_id_here
```

### 5. Install Dependencies

```bash
npm install
```

The `@turnkey/react-wallet-kit` package is already included in `package.json`.

### 6. Run the Application

```bash
npm run dev
```

---

## Architecture

### Key Components

#### 1. **TurnkeyProvider** (`src/app/providers.tsx`)
- Wraps the entire application
- Provides Turnkey context to all components
- Handles authentication state
- Manages error callbacks

#### 2. **WalletSetup** (`src/components/WalletSetup.tsx`)
- Simplified authentication UI
- Single "Login / Sign Up" button
- Triggers Turnkey's authentication modal
- Supports all configured auth methods

#### 3. **Dashboard** (`src/components/Dashboard.tsx`)
- Uses `useTurnkey()` hook for wallet access
- Displays Stacks address derived from Turnkey wallet
- Provides wallet export functionality
- Manages logout

#### 4. **Turnkey Utilities** (`src/lib/turnkey-*.ts`)
- `turnkey-wallet.ts`: Address derivation helpers
- `turnkey-stacks.ts`: Transaction building and signing

---

## How It Works

### Authentication Flow

```
1. User clicks "Login / Sign Up"
   ↓
2. Turnkey modal appears with auth options
   ↓
3. User authenticates (email OTP, passkey, or OAuth)
   ↓
4. Turnkey creates sub-organization for user
   ↓
5. App auto-creates wallet with Stacks-compatible account
   ↓
6. User can now interact with smart contracts
```

### Transaction Signing Flow

```
1. User initiates transaction (e.g., create loan offer)
   ↓
2. App builds unsigned Stacks transaction
   ↓
3. Transaction sent to Turnkey for signing
   ↓
4. Turnkey signs with user's secure key
   ↓
5. Signed transaction broadcast to Stacks network
   ↓
6. Transaction confirmed on blockchain
```

---

## Key Features

### 🔒 Security
- **No private keys in browser** - keys never leave Turnkey's secure infrastructure
- **Hardware-backed security** - keys stored in secure enclaves
- **Encrypted backups** - wallet export via secure iframe
- **Passkey support** - biometric authentication

### 🎯 User Experience
- **One-click authentication** - no manual key management
- **Multiple auth methods** - email, passkeys, social login
- **Seamless wallet creation** - automatic on first login
- **Easy wallet export** - secure backup and recovery

### 🛠️ Developer Experience
- **Simple integration** - minimal code changes
- **React hooks** - `useTurnkey()` provides all functionality
- **TypeScript support** - full type safety
- **Comprehensive docs** - [Turnkey documentation](https://docs.turnkey.com/sdks/react)

---

## API Reference

### `useTurnkey()` Hook

```typescript
const {
  // Authentication
  authState,           // Current auth state (Loading, Authenticated, etc.)
  user,               // Current user info
  handleLogin,        // Trigger login modal
  logout,             // Log out user
  
  // Wallets
  wallets,            // Array of user's wallets
  createWallet,       // Create new wallet
  refreshWallets,     // Refresh wallet list
  
  // Import/Export
  handleImportWallet, // Import wallet via iframe
  handleExportWallet, // Export wallet via iframe
  
  // Signing
  signMessage,        // Sign arbitrary message
  signTransaction,    // Sign transaction
} = useTurnkey();
```

### Wallet Structure

```typescript
interface Wallet {
  walletId: string;
  walletName: string;
  accounts: WalletAccount[];
  source: WalletSource; // 'Embedded' or 'Connected'
}

interface WalletAccount {
  accountId: string;
  address: string;      // Ethereum-style address
  curve: string;        // 'CURVE_SECP256K1'
  pathFormat: string;
  path: string;
}
```

---

## Migration Notes

### Component Updates

#### Before:
```typescript
// Old custom wallet
const wallet = generateWallet();
saveWalletToStorage(wallet);
```

#### After:
```typescript
// Turnkey embedded wallet
const { createWallet } = useTurnkey();
await createWallet({
  walletName: 'StacksLend Wallet',
  accounts: ['ADDRESS_FORMAT_ETHEREUM'],
});
```

### Transaction Signing

#### Before:
```typescript
// Old: Direct private key usage
await createOffer(privateKey, amount, rate, duration, collateral);
```

#### After:
```typescript
// New: Turnkey signing
const { signTransaction, wallets } = useTurnkey();
const tx = await createOfferTx(address, amount, rate, duration, collateral);
const signed = await signTransaction({
  walletAccount: wallets[0].accounts[0],
  unsignedTransaction: tx.serialize().toString('hex'),
  transactionType: 'TRANSACTION_TYPE_STACKS',
});
```

---

## Stacks Address Derivation

⚠️ **Important**: Turnkey wallets use secp256k1 curve (same as Ethereum), which is compatible with Stacks. However, address formats differ:

- **Turnkey provides**: Ethereum-style addresses (0x...)
- **Stacks requires**: Stacks-style addresses (ST... or SP...)

The app includes utilities in `src/lib/turnkey-wallet.ts` to derive Stacks addresses from Turnkey's public keys.

```typescript
import { deriveStacksAddress } from '@/lib/turnkey-wallet';

const stacksAddress = deriveStacksAddress(publicKeyHex, false); // false = testnet
```

---

## Testing

### 1. Test Authentication

```bash
npm run dev
```

1. Click "Login / Sign Up"
2. Choose authentication method (email recommended for testing)
3. Complete authentication flow
4. Verify wallet is created automatically

### 2. Test Wallet Export

1. After authentication, click "🔑 Export Wallet"
2. Turnkey modal appears with export options
3. Choose export method (encrypted bundle recommended)
4. Save the exported wallet securely

### 3. Test Transaction Signing

1. Navigate to "Loan Offers" tab
2. Click "+ Create Offer"
3. Fill in loan details
4. Click "Create Offer"
5. Turnkey signs transaction
6. Transaction broadcast to Stacks testnet

---

## Troubleshooting

### Issue: "Organization ID not found"
**Solution**: Ensure `.env.local` has correct `NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID`

### Issue: "Auth Proxy Config ID invalid"
**Solution**: Verify `NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID` from Turnkey Dashboard

### Issue: "Wallet not created after login"
**Solution**: Check browser console for errors. Ensure Turnkey organization has wallet creation enabled.

### Issue: "Transaction signing fails"
**Solution**: Verify Stacks address derivation is correct. Check that wallet account has proper curve (secp256k1).

### Issue: Tailwind CSS conflicts
**Solution**: If using Tailwind v3, see [Turnkey troubleshooting](https://docs.turnkey.com/sdks/react/troubleshooting#6-%40layer-utilities-is-used-but-no-matching-%40tailwind-utilities-directive-is-present-tailwind-v3-error)

---

## Resources

- **Turnkey Documentation**: [https://docs.turnkey.com/sdks/react](https://docs.turnkey.com/sdks/react)
- **Turnkey Dashboard**: [https://app.turnkey.com/dashboard](https://app.turnkey.com/dashboard)
- **Turnkey Demo**: [https://wallets.turnkey.com/](https://wallets.turnkey.com/)
- **Stacks Documentation**: [https://docs.stacks.co](https://docs.stacks.co)
- **GitHub Issues**: Report issues on the StacksLend repository

---

## Security Best Practices

1. **Never commit `.env.local`** - keep credentials secret
2. **Use passkeys in production** - more secure than email OTP
3. **Enable MFA** - add extra security layer in Turnkey Dashboard
4. **Regular backups** - encourage users to export wallets
5. **Monitor transactions** - implement transaction monitoring
6. **Rate limiting** - protect against abuse
7. **Audit logs** - review Turnkey audit logs regularly

---

## Next Steps

### For Development
1. ✅ Complete Turnkey setup
2. ✅ Test authentication flows
3. ⏳ Update child components (LoanOffers, BorrowRequests, MyLoans, Analytics)
4. ⏳ Implement proper Stacks address derivation
5. ⏳ Add transaction signing to all contract interactions
6. ⏳ Test end-to-end loan flows
7. ⏳ Update documentation

### For Production
1. Configure production OAuth credentials
2. Enable mainnet support
3. Implement proper error handling
4. Add transaction status monitoring
5. Set up analytics and monitoring
6. Conduct security audit
7. Deploy to production

---

## Support

For Turnkey-specific issues:
- [Turnkey Slack](https://join.slack.com/t/clubturnkey/shared_invite/zt-3aemp2g38-zIh4V~3vNpbX5PsSmkKxcQ)
- [Turnkey Support](https://www.turnkey.com/contact-us)

For StacksLend issues:
- GitHub Issues
- Project documentation
