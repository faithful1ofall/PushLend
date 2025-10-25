# Turnkey API Usage - Implementation Reference

## Overview

This document shows exactly how we use Turnkey's API for the Sign Up / Login / Export flow.

---

## 🔑 Turnkey Hooks Used

### From `useTurnkey()`

```typescript
import { useTurnkey } from '@turnkey/react-wallet-kit';

const {
  // Authentication
  handleLogin,          // Trigger auth modal
  authState,           // AuthState.Authenticated | AuthState.Unauthenticated
  clientState,         // ClientState.Loading | ClientState.Ready | ClientState.Error
  
  // Wallet Management
  createWallet,        // Create new embedded wallet
  wallets,             // Array of user's wallets
  
  // Import/Export
  handleImportWallet,  // Show import modal
  handleExportWallet,  // Show export modal
  
  // Session
  logout,              // Logout user
  user,                // Current user info
} = useTurnkey();
```

---

## 📝 Implementation Details

### 1. Sign Up Flow

**File:** `src/components/WalletSetup.tsx`

```typescript
const { handleLogin, createWallet } = useTurnkey();

const handleSignUp = async () => {
  try {
    // Step 1: Authenticate user
    await handleLogin();
    // Turnkey modal appears with auth options
    // User completes authentication
    
    // Step 2: Create wallet with Stacks account
    const walletId = await createWallet({
      walletName: 'StacksLend Wallet',
      accounts: [
        {
          curve: 'CURVE_SECP256K1',              // Stacks uses secp256k1
          pathFormat: 'PATH_FORMAT_BIP32',       // BIP32 HD derivation
          path: "m/44'/5757'/0'/0/0",            // Stacks BIP44 path
          addressFormat: 'ADDRESS_FORMAT_COMPRESSED', // Get compressed pubkey
        },
      ],
    });
    
    console.log('Wallet created:', walletId);
    // User is now authenticated with a wallet
    
  } catch (error) {
    console.error('Sign up failed:', error);
  }
};
```

**What Happens:**
1. `handleLogin()` shows Turnkey auth modal
2. User authenticates (email OTP, passkey, or OAuth)
3. `createWallet()` creates embedded wallet in Turnkey
4. Wallet has one Stacks account with compressed public key
5. Dashboard loads with wallet info

---

### 2. Login Flow

**File:** `src/components/WalletSetup.tsx`

```typescript
const { handleLogin, handleImportWallet } = useTurnkey();

const handleLoginWithImport = async () => {
  try {
    // Step 1: Authenticate user
    await handleLogin();
    // Turnkey modal appears
    // User completes authentication
    
    // Step 2: Import wallet
    await handleImportWallet();
    // Turnkey import modal appears
    // User uploads backup or enters mnemonic
    // Wallet is imported
    
    console.log('Wallet imported successfully');
    // User is now authenticated with imported wallet
    
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

**What Happens:**
1. `handleLogin()` authenticates user
2. `handleImportWallet()` shows import modal
3. User provides wallet backup
4. Turnkey imports wallet
5. Dashboard loads with restored wallet

---

### 3. Export Flow

**File:** `src/components/Dashboard.tsx`

```typescript
const { handleExportWallet, wallets } = useTurnkey();

const handleExport = async () => {
  try {
    const wallet = wallets[0]; // Get first wallet
    
    await handleExportWallet({
      walletId: wallet.walletId,
    });
    // Turnkey export modal appears
    // User chooses format and saves backup
    
    console.log('Wallet exported successfully');
    
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

**What Happens:**
1. Get wallet ID from `wallets` array
2. `handleExportWallet()` shows export modal
3. User chooses format (encrypted bundle, mnemonic, private key)
4. User saves backup file
5. Backup can be used for future login

---

### 4. Wallet Access

**File:** `src/components/Dashboard.tsx`

```typescript
const { wallets } = useTurnkey();

// Get first wallet
const wallet = wallets[0];

// Wallet structure
interface Wallet {
  walletId: string;        // Unique wallet ID
  walletName: string;      // "StacksLend Wallet"
  accounts: WalletAccount[]; // Array of accounts
  source: WalletSource;    // 'Embedded' or 'Connected'
}

// Get first account
const walletAccount = wallet?.accounts[0];

// Account structure
interface WalletAccount {
  accountId: string;       // Unique account ID
  address: string;         // For COMPRESSED format: compressed pubkey (33 bytes)
  curve: string;           // 'CURVE_SECP256K1'
  pathFormat: string;      // 'PATH_FORMAT_BIP32'
  path: string;            // "m/44'/5757'/0'/0/0"
  addressFormat: string;   // 'ADDRESS_FORMAT_COMPRESSED'
}
```

**Deriving Stacks Address:**

```typescript
import { deriveStacksAddress, getCompressedPublicKey } from '@/lib/turnkey-wallet';

// Get compressed public key from account
const compressedPubKey = getCompressedPublicKey(walletAccount);
// Returns: "02a1b2c3..." (33 bytes hex)

// Derive Stacks address
const stacksAddress = deriveStacksAddress(compressedPubKey, false);
// Returns: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
```

---

### 5. Authentication State

**File:** `src/app/page.tsx`

```typescript
const { authState, clientState, wallets } = useTurnkey();

// Check if loading
if (clientState === ClientState.Loading) {
  return <LoadingSpinner />;
}

// Check if authenticated
if (authState !== AuthState.Authenticated) {
  return <WalletSetup />; // Show sign up/login
}

// Check if has wallet
if (wallets.length === 0) {
  return <WalletSetup />; // Show sign up/login
}

// User is authenticated with wallet
return <Dashboard />;
```

**States:**

```typescript
// ClientState
enum ClientState {
  Loading = "loading",
  Ready = "ready",
  Error = "error"
}

// AuthState
enum AuthState {
  Unauthenticated = "unauthenticated",
  Authenticated = "authenticated"
}
```

---

### 6. Logout

**File:** `src/components/Dashboard.tsx`

```typescript
const { logout } = useTurnkey();

const handleLogout = () => {
  if (confirm('⚠️ Make sure you have exported your wallet!\n\nAre you sure you want to logout?')) {
    logout();
    // User is logged out
    // Returns to WalletSetup screen
  }
};
```

---

## 🔄 Complete Flow Diagram

```typescript
// SIGN UP
┌─────────────────────────────────────────────────────────┐
│ User clicks "Sign Up"                                    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ await handleLogin()                                      │
│ → Turnkey auth modal appears                            │
│ → User authenticates (email/passkey/OAuth)              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ await createWallet({ accounts: [...] })                 │
│ → Turnkey creates embedded wallet                       │
│ → Stacks account with compressed pubkey                 │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Dashboard loads                                          │
│ → wallets[0] available                                  │
│ → Derive Stacks address from pubkey                     │
│ → Show export reminder banner                           │
└─────────────────────────────────────────────────────────┘

// LOGIN
┌─────────────────────────────────────────────────────────┐
│ User clicks "Login"                                      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ await handleLogin()                                      │
│ → Turnkey auth modal appears                            │
│ → User authenticates                                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ await handleImportWallet()                               │
│ → Turnkey import modal appears                          │
│ → User uploads backup or enters mnemonic                │
│ → Wallet imported                                        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ Dashboard loads                                          │
│ → wallets[0] available (imported wallet)                │
│ → Same Stacks address restored                          │
└─────────────────────────────────────────────────────────┘

// EXPORT
┌─────────────────────────────────────────────────────────┐
│ User clicks "Export Wallet"                              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ await handleExportWallet({ walletId })                   │
│ → Turnkey export modal appears                          │
│ → User chooses format                                    │
│ → User saves backup                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Sign Up
```
User Input → handleLogin() → Turnkey Auth
                                ↓
                         Authentication
                                ↓
createWallet() → Turnkey API → Embedded Wallet Created
                                ↓
                         wallets[0] populated
                                ↓
                    Derive Stacks Address
                                ↓
                         Display Dashboard
```

### Login
```
User Input → handleLogin() → Turnkey Auth
                                ↓
                         Authentication
                                ↓
handleImportWallet() → Turnkey Import Modal
                                ↓
                    User Provides Backup
                                ↓
                    Wallet Imported
                                ↓
                    wallets[0] populated
                                ↓
                    Derive Stacks Address
                                ↓
                    Display Dashboard
```

### Export
```
User Click → handleExportWallet({ walletId })
                                ↓
                    Turnkey Export Modal
                                ↓
                    User Chooses Format
                                ↓
                    Backup File Saved
```

---

## 🔍 Key Points

### 1. Authentication First
- Always call `handleLogin()` before `createWallet()` or `handleImportWallet()`
- User must be authenticated to create or import wallets

### 2. Wallet Creation
- Use `createWallet()` with custom account config for Stacks
- Specify `ADDRESS_FORMAT_COMPRESSED` to get raw public key
- Manually derive Stacks address from compressed public key

### 3. Import/Export
- `handleImportWallet()` and `handleExportWallet()` show Turnkey modals
- No need to handle file upload/download manually
- Turnkey handles encryption and security

### 4. Wallet Access
- `wallets` array contains all user's wallets
- For single-wallet apps, use `wallets[0]`
- Check `wallets.length > 0` before accessing

### 5. State Management
- Check `clientState` for loading
- Check `authState` for authentication
- Check `wallets.length` for wallet existence

---

## ✅ Implementation Checklist

- [x] Import `useTurnkey` hook
- [x] Call `handleLogin()` for authentication
- [x] Call `createWallet()` for sign up
- [x] Call `handleImportWallet()` for login
- [x] Call `handleExportWallet()` for backup
- [x] Access `wallets` array for wallet info
- [x] Check `authState` and `clientState`
- [x] Derive Stacks address from compressed pubkey
- [x] Show export reminder to users
- [x] Confirm before logout

---

## 📚 References

- **Turnkey Docs:** https://docs.turnkey.com/sdks/react
- **useTurnkey Hook:** https://docs.turnkey.com/sdks/react/using-embedded-wallets
- **Signing:** https://docs.turnkey.com/sdks/react/signing
- **Import/Export:** https://docs.turnkey.com/embedded-wallets/code-examples

---

**Status:** ✅ Implemented and Working  
**Last Updated:** 2025-10-10
