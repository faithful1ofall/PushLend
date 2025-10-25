# StacksLend MVP Testing Guide

## 🎉 Deployment Success!

The **stackslend-multi-asset** smart contract has been successfully deployed to Stacks testnet!

### Contract Details
- **Contract Address**: `ST3RKRK9J45KQJNY4023WAMMW0AB7DEPRVPG5BDVT.stackslend-multi-asset`
- **Network**: Testnet
- **Transaction ID**: `a3261a9c82b4c56f3a6b64f7e167e18cc6bbe74689c8d730a999a6476538e50d`
- **Explorer**: [View Contract](https://explorer.hiro.so/txid/ST3RKRK9J45KQJNY4023WAMMW0AB7DEPRVPG5BDVT.stackslend-multi-asset?chain=testnet)

---

## 🚀 Quick Start

### 1. Access the Application

The application is running at:
**[https://3000--0199dc93-0c40-7bda-b6fe-f3b2d56af718.eu-central-1-01.gitpod.dev](https://3000--0199dc93-0c40-7bda-b6fe-f3b2d56af718.eu-central-1-01.gitpod.dev)**

### 2. Setup Turnkey Wallet

1. Click "Sign in with Turnkey" on the homepage
2. Complete the authentication flow
3. A Stacks wallet will be automatically created for you
4. Your Stacks address will be displayed in the dashboard

### 3. Get Testnet STX

1. Copy your Stacks address from the dashboard
2. Visit the [Stacks Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
3. Paste your address and request testnet STX
4. Wait ~30 seconds for the STX to arrive
5. Refresh the dashboard to see your balance

---

## 📋 Complete MVP Features

### ✅ Implemented Features

#### 1. **Wallet Management**
- ✅ Turnkey authentication integration
- ✅ Automatic Stacks wallet creation
- ✅ Address derivation from public key
- ✅ Real-time STX balance display
- ✅ Wallet export functionality

#### 2. **Loan Offers (Lender Side)**
- ✅ Create loan offers with:
  - Amount (in STX)
  - Interest rate (APR %)
  - Maximum duration (in days)
  - Minimum collateral requirement (in STX)
  - Asset type tracking (STX/sBTC ready)
- ✅ View all active offers
- ✅ Cancel your own offers
- ✅ Real-time offer list updates

#### 2.5. **Fund Loans (NEW - Lender Side)**
- ✅ Browse pending loan requests
- ✅ View detailed loan information:
  - Loan amount and collateral
  - Interest rate and duration
  - Collateral ratio
  - Borrower address
- ✅ See expected returns:
  - Interest earned
  - Total repayment amount
- ✅ One-click loan funding
- ✅ Real-time status updates
- ✅ Auto-refresh capability

#### 3. **Borrow Requests (Borrower Side)**
- ✅ Create loan requests with:
  - Loan amount (in STX)
  - Collateral amount (in STX)
  - Interest rate willing to pay
  - Loan duration (in days)
  - Asset type tracking
- ✅ Automatic collateral ratio calculation
- ✅ 150% minimum collateral enforcement
- ✅ Collateral locked in contract

#### 4. **My Loans Dashboard**
- ✅ View all your loans (borrowed and lent)
- ✅ Filter by: All / Borrowed / Lent
- ✅ Loan status tracking:
  - Pending (awaiting funding)
  - Active (funded and running)
  - Repaid (successfully completed)
  - Liquidated (defaulted)
- ✅ Repay loans (with interest calculation)
- ✅ Fund pending loan requests
- ✅ Liquidate defaulted loans

#### 5. **Analytics Dashboard**
- ✅ Total loans created
- ✅ Total value locked (TVL)
- ✅ Active loans count
- ✅ Average interest rate
- ✅ User credit score display
- ✅ Loan statistics visualization

#### 6. **Smart Contract Integration**
- ✅ Multi-asset support (STX + sBTC ready)
- ✅ Credit scoring system
- ✅ Interest calculation
- ✅ Collateral management
- ✅ Liquidation mechanism
- ✅ Platform fee collection (1%)

---

## 🧪 Testing Workflow

### Scenario 1: Create and Accept a Loan Offer

**As a Lender:**
1. Go to "Loan Offers" tab
2. Click "Create New Offer"
3. Fill in the form:
   - Amount: 10 STX
   - Interest Rate: 10% APR
   - Max Duration: 30 days
   - Min Collateral: 15 STX (150%)
4. Click "Create Offer"
5. Wait ~30 seconds for confirmation
6. Your offer appears in the list

**As a Borrower (use a different wallet):**
1. Go to "Loan Offers" tab
2. Find the offer you want
3. Click "View Details"
4. Note the requirements
5. Go to "Borrow" tab
6. Create a matching loan request
7. Wait for the lender to fund it

### Scenario 2: Create and Fund a Loan Request

**As a Borrower:**
1. Go to "Borrow" tab
2. Fill in the form:
   - Amount: 5 STX
   - Collateral: 7.5 STX (150%)
   - Interest Rate: 12% APR
   - Duration: 14 days
3. Click "Create Request"
4. Your collateral is locked
5. Wait for a lender to fund

**As a Lender (use a different wallet):**
1. Go to **"Fund Loans"** tab (NEW!)
2. Browse pending loan requests
3. Review loan details and expected returns
4. Click "Fund Loan (5.00 STX)"
5. Confirm the transaction
6. Loan becomes active
7. Check "My Loans" → "Lent" to track it

### Scenario 3: Repay a Loan

**As a Borrower:**
1. Go to "My Loans" tab
2. Filter by "Borrowed"
3. Find an active loan
4. Click "Repay Loan"
5. Review total repayment amount
6. Confirm transaction
7. Your collateral is returned
8. Loan status changes to "Repaid"

### Scenario 4: Liquidate a Defaulted Loan

**As a Lender:**
1. Go to "My Loans" tab
2. Filter by "Lent"
3. Find an active loan past due date
4. Click "Liquidate"
5. Confirm transaction
6. Receive the collateral
7. Loan status changes to "Liquidated"

---

## 🔍 Contract Functions Reference

### Public Functions

1. **create-offer** (lender)
   - Parameters: amount, interest-rate, max-duration, min-collateral, loan-asset, collateral-asset
   - Creates a new loan offer

2. **create-loan** (borrower)
   - Parameters: amount, collateral, interest-rate, duration, loan-asset, collateral-asset
   - Creates a loan request and locks collateral

3. **fund-loan** (lender)
   - Parameters: loan-id
   - Funds a pending loan request

4. **repay-loan** (borrower)
   - Parameters: loan-id
   - Repays an active loan with interest

5. **liquidate-loan** (lender)
   - Parameters: loan-id
   - Liquidates a defaulted loan

6. **cancel-offer** (lender)
   - Parameters: offer-id
   - Cancels an active offer

7. **update-offer** (lender)
   - Parameters: offer-id, new-rate
   - Updates the interest rate of an offer

### Read-Only Functions

1. **get-loan** - Get loan details by ID
2. **get-offer** - Get offer details by ID
3. **get-loan-count** - Total number of loans
4. **get-offer-count** - Total number of offers
5. **get-user-stats** - User credit score and statistics

---

## 🎯 Key Features to Test

### ✅ Transaction Signing
- All transactions use Turnkey for secure signing
- No private keys stored in browser
- SIP-005 compliant signing flow

### ✅ Data Parsing
- Correct parsing of Clarity values
- Proper display of amounts (microSTX to STX)
- Interest rate conversion (basis points to %)
- Duration conversion (blocks to days)

### ✅ Error Handling
- Insufficient balance checks
- Minimum collateral validation
- Transaction failure alerts
- Network error handling

### ✅ Real-time Updates
- Balance updates every 10 seconds
- Manual refresh for loans/offers
- Transaction confirmation waiting

---

## 🐛 Known Limitations

1. **Manual Refresh**: After creating offers/loans, you need to wait ~30 seconds and manually refresh
2. **Single Asset**: Currently only STX is supported (sBTC support is ready but not activated)
3. **No Accept Offer UI**: Borrowers must create matching loan requests instead of directly accepting offers
4. **No Notifications**: No real-time notifications for loan events

---

## 📊 Testing Checklist

### Basic Functionality
- [ ] Wallet creation and authentication
- [ ] Balance display
- [ ] Create loan offer
- [ ] View loan offers
- [ ] Cancel loan offer
- [ ] Browse pending loan requests (Fund Loans tab)
- [ ] Fund a loan request
- [ ] Create loan request
- [ ] View my loans
- [ ] Repay a loan
- [ ] View analytics

### Edge Cases
- [ ] Try creating offer with 0 amount
- [ ] Try creating loan with insufficient collateral (<150%)
- [ ] Try repaying someone else's loan
- [ ] Try canceling someone else's offer
- [ ] Try liquidating a loan that's not past due

### Performance
- [ ] Load time for offers list
- [ ] Load time for loans list
- [ ] Transaction confirmation time
- [ ] Balance update frequency

---

## 🔗 Useful Links

- **Application**: [https://3000--0199dc93-0c40-7bda-b6fe-f3b2d56af718.eu-central-1-01.gitpod.dev](https://3000--0199dc93-0c40-7bda-b6fe-f3b2d56af718.eu-central-1-01.gitpod.dev)
- **Contract Explorer**: [View on Explorer](https://explorer.hiro.so/txid/ST3RKRK9J45KQJNY4023WAMMW0AB7DEPRVPG5BDVT.stackslend-multi-asset?chain=testnet)
- **Testnet Faucet**: [Get STX](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
- **Stacks API**: [https://api.testnet.hiro.so](https://api.testnet.hiro.so)

---

## 🎓 Next Steps for Production

1. **Add Accept Offer Feature**: Allow borrowers to directly accept offers
2. **Implement sBTC Support**: Enable multi-asset lending
3. **Add Notifications**: Real-time updates for loan events
4. **Improve UX**: Auto-refresh after transactions
5. **Add Search/Filter**: Better loan/offer discovery
6. **Mobile Optimization**: Responsive design improvements
7. **Security Audit**: Professional smart contract audit
8. **Mainnet Deployment**: Deploy to Stacks mainnet

---

## 💡 Tips for Testing

1. **Use Multiple Wallets**: Test lender and borrower flows separately
2. **Check Explorer**: Verify transactions on the blockchain explorer
3. **Wait for Confirmations**: Testnet can be slow, wait ~30 seconds
4. **Monitor Console**: Check browser console for detailed logs
5. **Test Edge Cases**: Try invalid inputs to test validation

---

## 🆘 Troubleshooting

### Transaction Fails
- Check you have enough STX for fees
- Verify collateral ratio is >= 150%
- Wait for previous transaction to confirm

### Balance Not Updating
- Wait 10 seconds for auto-refresh
- Manually refresh the page
- Check transaction on explorer

### Wallet Issues
- Clear browser cache
- Re-authenticate with Turnkey
- Export and re-import wallet

---

**Happy Testing! 🚀**

For issues or questions, check the browser console for detailed error messages.
