# StacksLend Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Modern browser with WebAuthn support (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 🔐 Authentication & Wallet Setup

### First Time Users (Sign Up)

1. **Click "Sign In / Sign Up"**
   - Opens Turnkey passkey authentication

2. **Create Your Passkey**
   - Browser will prompt you to create a passkey
   - Use your device's biometric (fingerprint, face ID) or PIN
   - Passkey is stored securely on your device

3. **Automatic Wallet Creation**
   - After authentication, a Stacks wallet is created automatically
   - You'll see "Creating Your Wallet" loading screen
   - Takes 2-3 seconds

4. **Dashboard Access**
   - Automatically redirected to dashboard
   - Your Stacks address and balances are displayed

### Returning Users (Login)

1. **Click "Sign In / Sign Up"**
   - Same button for returning users

2. **Authenticate with Passkey**
   - Browser recognizes your existing passkey
   - Use biometric or PIN to authenticate

3. **Instant Access**
   - Dashboard loads immediately
   - Your wallet and balances are restored

## 📱 Using the Dashboard

### View Your Wallet

- **Stacks Address**: Displayed at the top (ST... format for testnet)
- **STX Balance**: Your Stacks token balance
- **sBTC Balance**: Your sBTC balance
- **Copy Address**: Click to copy your address to clipboard

### Create a Loan Offer

1. Navigate to "Loan Offers" tab
2. Click "Create Offer"
3. Fill in:
   - Amount to lend
   - Interest rate (%)
   - Maximum duration (days)
   - Minimum collateral ratio (%)
   - Loan asset (STX or sBTC)
   - Collateral asset (STX or sBTC)
4. Click "Create Offer"
5. Confirm transaction with Turnkey

### Accept a Loan Offer

1. Browse available offers in "Loan Offers" tab
2. Click "Accept" on desired offer
3. Provide collateral amount
4. Choose loan duration
5. Confirm transaction

### Manage Your Loans

1. Navigate to "My Loans" tab
2. View active loans (as borrower or lender)
3. Repay loans when due
4. Track loan status and interest

## 🔑 Key Features

### Secure Embedded Wallet
- **No Seed Phrases**: Passkey-based authentication
- **Client-Side Keys**: Private keys never leave your device
- **Turnkey Security**: Enterprise-grade key management

### Stacks Integration
- **Native STX Support**: Transfer and lend STX tokens
- **sBTC Support**: Use Bitcoin on Stacks
- **Smart Contracts**: Interact with lending contracts

### Transaction Signing
- **Proper VRS Signatures**: Correct signature format for Stacks
- **Pre-sign Hash**: SIP-005 compliant signing
- **Error Handling**: Clear error messages for failed transactions

## 🛠️ Development

### Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main page with auth flow
│   └── providers.tsx         # Turnkey provider setup
├── components/
│   ├── WalletSetup.tsx       # Authentication UI
│   ├── Dashboard.tsx         # Main dashboard
│   ├── LoanOffers.tsx        # Loan offers management
│   ├── BorrowRequests.tsx    # Borrow requests
│   └── MyLoans.tsx           # User's loans
├── lib/
│   ├── signing-utils.ts      # Transaction signing utilities
│   ├── turnkey-wallet.ts     # Wallet address derivation
│   ├── turnkey-stacks.ts     # Stacks transaction helpers
│   └── transactions/
│       └── transfer-stx.ts   # STX transfer implementation
```

### Key Files

- **`signing-utils.ts`**: Core signing logic with VRS formatting
- **`turnkey-wallet.ts`**: Address derivation from public keys
- **`page.tsx`**: Automatic wallet creation logic
- **`WalletSetup.tsx`**: Simplified authentication UI

## 🔍 Troubleshooting

### Authentication Issues

**Problem**: Passkey creation fails
- **Solution**: Ensure browser supports WebAuthn
- **Check**: Browser settings allow passkeys

**Problem**: Can't authenticate
- **Solution**: Clear browser data and try again
- **Check**: Passkey is registered for this domain

### Wallet Issues

**Problem**: Wallet not created after login
- **Solution**: Check browser console for errors
- **Refresh**: Page to trigger wallet creation again

**Problem**: Wrong address format
- **Solution**: Ensure using testnet (ST prefix)
- **Check**: Public key is 66 hex characters

### Transaction Issues

**Problem**: Transaction fails to broadcast
- **Solution**: Check STX balance for fees
- **Verify**: Network connection to Stacks API

**Problem**: Signature invalid
- **Solution**: Ensure using correct public key format
- **Check**: VRS signature is 130 hex characters

## 📚 Additional Resources

- [Turnkey Documentation](https://docs.turnkey.com)
- [Stacks Documentation](https://docs.stacks.co)
- [SIP-005 Transaction Signing](https://github.com/stacksgov/sips/blob/main/sips/sip-005/sip-005-blocks-and-transactions.md)
- [Reference Implementation](https://github.com/kai-builder/sbtc-cool-turnkey-stacks-demo)

## 🆘 Support

For issues or questions:
1. Check browser console for error messages
2. Review `AUTHENTICATION_FLOW.md` for flow details
3. Check `STACKS_TURNKEY_IMPLEMENTATION.md` for technical details

## 🎯 Next Steps

After getting started:
1. ✅ Export your wallet for backup
2. ✅ Get testnet STX from faucet
3. ✅ Create your first loan offer
4. ✅ Explore the analytics dashboard

---

**Note**: This is a testnet application. No real funds are at risk.
