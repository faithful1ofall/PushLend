# StacksLend Authentication Flow

## Overview

The authentication system has been updated to provide a seamless user experience with automatic wallet creation after successful authentication.

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Visits App                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   WalletSetup Page   │
                  │                      │
                  │  [Sign In / Sign Up] │
                  └──────────┬───────────┘
                             │ User clicks button
                             ▼
                  ┌──────────────────────┐
                  │  handleLogin() from  │
                  │   Turnkey SDK        │
                  └──────────┬───────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │   New User       │      │  Returning User  │
    │                  │      │                  │
    │ Create Passkey   │      │ Use Passkey      │
    └────────┬─────────┘      └────────┬─────────┘
             │                         │
             └────────────┬────────────┘
                          │ Authentication Success
                          ▼
              ┌───────────────────────┐
              │   page.tsx useEffect  │
              │   Checks for wallet   │
              └───────────┬───────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  No Wallet       │    │  Wallet Exists   │
    │                  │    │                  │
    │  Auto-create     │    │  Load Dashboard  │
    │  Stacks Wallet   │    │                  │
    └────────┬─────────┘    └────────┬─────────┘
             │                       │
             │ Wallet Created        │
             └───────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │      Dashboard       │
              │                      │
              │  - View Balance      │
              │  - Create Offers     │
              │  - Manage Loans      │
              └──────────────────────┘
```

## User Flow

### 1. Initial Landing (WalletSetup Component)

When users first visit the application, they see a single "Sign In / Sign Up" button that handles both new and returning users.

**What happens:**
- User clicks "Sign In / Sign Up"
- Turnkey's `handleLogin()` is triggered
- For new users: Turnkey creates a passkey and authenticates
- For returning users: Turnkey authenticates with existing passkey

### 2. Automatic Wallet Creation (page.tsx)

After successful authentication, the system automatically checks if the user has a wallet:

**If no wallet exists:**
- System automatically creates a Stacks-compatible wallet
- Shows "Creating Your Wallet" loading screen
- Wallet is created with proper Stacks parameters:
  - Curve: `CURVE_SECP256K1`
  - Path Format: `PATH_FORMAT_BIP32`
  - Derivation Path: `m/44'/5757'/0'/0/0`
  - Address Format: `ADDRESS_FORMAT_COMPRESSED`

**If wallet exists:**
- User is immediately taken to the Dashboard

### 3. Dashboard Access

Once authenticated and wallet is created/loaded, user can:
- View their Stacks address and balances
- Create loan offers
- Accept loan offers
- Manage their loans
- Export wallet for backup

## Technical Implementation

### WalletSetup.tsx

```typescript
const handleAuth = async () => {
  setIsProcessing(true);
  setError(null);
  try {
    console.log('Authenticating with Turnkey...');
    await handleLogin();
    console.log('✅ Authentication successful!');
    // Wallet creation handled in page.tsx
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to authenticate';
    console.error('Authentication failed:', err);
    setError(errorMsg);
  } finally {
    setIsProcessing(false);
  }
};
```

### page.tsx

```typescript
useEffect(() => {
  const autoCreateWallet = async () => {
    if (
      authState === AuthState.Authenticated &&
      wallets.length === 0 &&
      !isCreatingWallet &&
      clientState !== ClientState.Loading
    ) {
      setIsCreatingWallet(true);
      try {
        console.log('🔄 Auto-creating Stacks wallet...');
        const walletId = await createWallet({
          walletName: `StacksLend Wallet ${Date.now()}`,
          accounts: [STACKS_ACCOUNT_PARAMS],
        });
        console.log('✅ Wallet created:', walletId);
      } catch (err) {
        console.error('❌ Wallet creation failed:', err);
        setWalletCreationError(err.message);
      } finally {
        setIsCreatingWallet(false);
      }
    }
  };

  autoCreateWallet();
}, [authState, wallets.length, isCreatingWallet, clientState, createWallet]);
```

## Benefits

1. **Simplified UX**: Single button for both signup and login
2. **Automatic Setup**: No manual wallet creation step required
3. **Seamless Experience**: Users go from landing page to dashboard in seconds
4. **Proper Error Handling**: Clear error messages if something goes wrong
5. **Loading States**: Visual feedback during authentication and wallet creation

## Security

- **Passkey Authentication**: Uses WebAuthn for secure, passwordless authentication
- **Client-Side Keys**: Private keys never leave the user's device
- **Turnkey Security**: Industry-leading key management infrastructure
- **Stacks Compatibility**: Proper derivation paths and key formats for Stacks blockchain

## User Experience States

1. **Not Authenticated**: Shows WalletSetup with "Sign In / Sign Up" button
2. **Authenticating**: Button shows loading spinner
3. **Creating Wallet**: Full-screen loading with "Creating Your Wallet" message
4. **Ready**: Dashboard with full functionality

## Error Handling

- Authentication errors are displayed in WalletSetup
- Wallet creation errors are displayed in the loading screen
- Users can retry by refreshing the page
- All errors are logged to console for debugging

## Testing the Flow

1. Visit the application
2. Click "Sign In / Sign Up"
3. Complete passkey authentication (browser will prompt)
4. Wait for automatic wallet creation
5. Dashboard loads with your new Stacks wallet

For returning users:
1. Visit the application
2. Click "Sign In / Sign Up"
3. Authenticate with existing passkey
4. Dashboard loads immediately (wallet already exists)
