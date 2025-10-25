# StacksLend Quick Start with Turnkey

Get started with StacksLend and Turnkey embedded wallets in 10 minutes!

## 🚀 Quick Setup

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd stackslend
npm install
```

### Step 2: Create Turnkey Organization

1. Go to [Turnkey Dashboard](https://app.turnkey.com/dashboard/auth/initial)
2. Sign up for a free account
3. Create a new organization
4. Navigate to **Wallet Kit** section in the sidebar

### Step 3: Enable Auth Proxy

1. In the Wallet Kit section, toggle **Auth Proxy** to ON
2. Configure authentication methods:
   - ✅ Enable **Email OTP** (recommended for testing)
   - ✅ Enable **Passkeys** (recommended for production)
   - Optional: Configure OAuth providers (Google, Apple, etc.)
3. Click **Save Settings**

### Step 4: Get Your Configuration IDs

1. **Organization ID**: Copy from the dashboard home page (top right)
2. **Auth Proxy Config ID**: Copy from the Wallet Kit section

### Step 5: Configure Environment

Create `.env.local` in the project root:

```bash
# Stacks Network
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so
NEXT_PUBLIC_CONTRACT_ADDRESS=STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X
NEXT_PUBLIC_CONTRACT_NAME=stackslend-simple

# Turnkey Configuration
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=paste_your_org_id_here
NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=paste_your_config_id_here
```

### Step 6: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎯 First Time User Flow

### 1. Login / Sign Up

1. Click **"Login / Sign Up"** button
2. Turnkey modal appears with authentication options
3. Choose **Email OTP** for testing:
   - Enter your email address
   - Check your email for the OTP code
   - Enter the code
4. Wallet is automatically created!

### 2. Get Testnet STX

1. Copy your wallet address (click the address to copy)
2. Visit [Stacks Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
3. Paste your address
4. Request testnet STX (~100 STX recommended)
5. Wait ~30 seconds for confirmation
6. Refresh the page to see your balance

### 3. Create Your First Loan Offer (As Lender)

1. Go to **"Loan Offers"** tab
2. Click **"+ Create Offer"**
3. Fill in the form:
   - **Amount**: 50 STX
   - **Interest Rate**: 10% per year
   - **Max Duration**: 30 days
   - **Min Collateral Ratio**: 150%
4. Click **"Create Offer"**
5. Turnkey signs the transaction
6. Wait ~30 seconds for blockchain confirmation

### 4. Create a Loan Request (As Borrower)

1. Go to **"Borrow"** tab
2. Fill in the form:
   - **Loan Amount**: 50 STX
   - **Collateral**: 75 STX (150% ratio)
   - **Interest Rate**: 12% per year
   - **Duration**: 30 days
3. Click **"Create Loan Request"**
4. Your collateral is locked immediately
5. Wait for a lender to fund your request

### 5. View Your Loans

1. Go to **"My Loans"** tab
2. See all your active and past loans
3. Repay loans or liquidate under-collateralized loans

### 6. Check Your Credit Score

1. Go to **"Analytics"** tab
2. View your credit score (0-1000)
3. See lending/borrowing statistics
4. Track interest earned/paid

---

## 🔐 Security Features

### Turnkey Advantages

✅ **No Private Keys in Browser**
- Keys never leave Turnkey's secure infrastructure
- No localStorage vulnerabilities

✅ **Hardware-Backed Security**
- Keys stored in secure enclaves (HSMs)
- Industry-leading encryption

✅ **Multiple Authentication Methods**
- Email OTP for convenience
- Passkeys for biometric security
- OAuth for social login

✅ **Secure Wallet Export**
- Encrypted backup via iframe
- No plaintext private keys

✅ **Audit Logs**
- All actions logged in Turnkey Dashboard
- Monitor suspicious activity

---

## 🛠️ Advanced Features

### Export Your Wallet

1. Click **"🔑 Export Wallet"** in the header
2. Turnkey modal appears
3. Choose export format:
   - **Encrypted Bundle** (recommended)
   - **Mnemonic Phrase**
   - **Private Key** (use with caution)
4. Save the export securely

### Import a Wallet

1. Click **"Login / Sign Up"**
2. After authentication, use Turnkey's import feature
3. Upload encrypted bundle or enter mnemonic
4. Wallet is restored with full history

### Multiple Wallets

1. Create additional wallets in Turnkey Dashboard
2. Switch between wallets in the app
3. Each wallet has independent balance and history

---

## 📊 Testing Scenarios

### Scenario 1: Simple Loan Flow

**As Lender:**
1. Create offer: 100 STX, 10% APR, 30 days, 150% collateral
2. Wait for borrower to accept

**As Borrower:**
1. Accept offer with 150 STX collateral
2. Receive 100 STX loan
3. Repay loan before due date
4. Get collateral back

**Result:** Lender earns interest, borrower's credit score increases

### Scenario 2: Loan Request Flow

**As Borrower:**
1. Create request: 50 STX loan, 75 STX collateral, 12% APR, 30 days
2. Collateral locked immediately

**As Lender:**
1. Browse loan requests
2. Fund the request
3. Wait for repayment or liquidate if needed

**Result:** Successful loan completion or liquidation

### Scenario 3: Liquidation

**Setup:**
1. Create loan with minimum collateral (150%)
2. Simulate collateral value drop below 120%

**As Lender:**
1. Go to "My Loans" tab
2. Find under-collateralized loan
3. Click "Liquidate"
4. Receive collateral

**Result:** Lender protected from loss, borrower's credit score decreases

---

## 🐛 Troubleshooting

### "Organization ID not found"
- Check `.env.local` has correct `NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID`
- Ensure no extra spaces or quotes

### "Auth Proxy Config ID invalid"
- Verify `NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID` from Turnkey Dashboard
- Make sure Auth Proxy is enabled

### "Wallet not created after login"
- Check browser console for errors
- Ensure Turnkey organization has wallet creation enabled
- Try refreshing the page

### "Transaction signing fails"
- Verify you have sufficient STX balance
- Check that wallet is properly connected
- Wait for previous transaction to confirm

### "Balance not updating"
- Wait ~30 seconds for blockchain confirmation
- Click refresh or reload the page
- Check Stacks Explorer for transaction status

---

## 📚 Next Steps

1. **Read Full Documentation**: [README.md](./README.md)
2. **Turnkey Integration Guide**: [TURNKEY_INTEGRATION.md](./TURNKEY_INTEGRATION.md)
3. **Smart Contract Details**: [contracts/stackslend.clar](./contracts/stackslend.clar)
4. **Stacks Documentation**: [docs.stacks.co](https://docs.stacks.co)
5. **Turnkey Documentation**: [docs.turnkey.com](https://docs.turnkey.com/sdks/react)

---

## 🆘 Support

### Turnkey Issues
- [Turnkey Slack](https://join.slack.com/t/clubturnkey/shared_invite/zt-3aemp2g38-zIh4V~3vNpbX5PsSmkKxcQ)
- [Turnkey Support](https://www.turnkey.com/contact-us)
- [Turnkey Docs](https://docs.turnkey.com)

### StacksLend Issues
- GitHub Issues
- [Stacks Discord](https://discord.gg/stacks)
- Project Documentation

---

## ✨ What's Next?

### For Users
- Test all loan flows
- Experiment with different parameters
- Check your credit score
- Export your wallet for backup

### For Developers
- Explore the codebase
- Customize UI components
- Add new features
- Deploy your own instance

---

**Happy Lending! 🚀**
