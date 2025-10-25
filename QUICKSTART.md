# StacksLend - Quick Start Guide

Get started with StacksLend in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Create Wallet

**Option A: Use Provided Seed Phrase (Recommended for Testing)**

1. Click "Import Seed" tab
2. Paste this seed phrase:
   ```
   release major muffin crucial tank giant air venture labor below congress cabbage typical vacuum add bubble young exist poet void wonder reform toward husband
   ```
3. Click "Import from Seed"

**Option B: Create New Wallet**

1. Click "Create Demo Wallet"
2. **IMPORTANT:** Copy and save the private key shown
3. You can export it anytime with "🔑 Export Key" button

### 4. Get Testnet STX

1. Copy your wallet address (click to copy)
2. Visit [Stacks Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
3. Paste your address and request STX
4. Wait ~30 seconds for confirmation

---

## 📝 Quick Test Scenarios

### Scenario 1: Create a Loan Offer (As Lender)

1. Go to **"Loan Offers"** tab
2. Click **"+ Create Offer"**
3. Fill in:
   - Amount: `50` STX
   - Interest Rate: `10` % per year
   - Max Duration: `30` days
   - Min Collateral Ratio: `150` %
4. Click **"Create Offer"**
5. Wait ~30 seconds, then refresh

### Scenario 2: Request a Loan (As Borrower)

1. Go to **"Borrow"** tab
2. Fill in:
   - Loan Amount: `50` STX
   - Collateral: `75` STX (150% ratio)
   - Interest Rate: `12` % per year
   - Duration: `30` days
3. Click **"Create Loan Request"**
4. Your collateral is locked immediately
5. Wait for a lender to fund it

### Scenario 3: Accept an Offer (As Borrower)

1. Go to **"Loan Offers"** tab
2. Find an offer you like
3. Click **"Accept Offer"**
4. Enter collateral amount (minimum shown)
5. Enter duration (maximum shown)
6. Confirm transaction

### Scenario 4: Repay a Loan

1. Go to **"My Loans"** tab
2. Find your active loan
3. Click **"Repay Loan"**
4. Confirm transaction
5. Your collateral is returned!

---

## 🎯 Key Features to Try

### Credit Score System
- Go to **"Analytics"** tab
- View your credit score (starts at 500)
- Complete loans to increase score
- Defaulting decreases score

### Loan Management
- Filter loans by "Borrowed" or "Lent"
- View loan details and status
- Track interest earned/paid

### Liquidation
- If collateral ratio drops below 120%
- Lenders can liquidate the loan
- Collateral goes to lender

---

## ⚠️ Important Notes

### Before You Start

- ✅ This is a **testnet demo** - use only testnet STX
- ✅ Private keys stored in **browser localStorage**
- ✅ Always **backup your private key**
- ✅ Transactions take **~30 seconds** to confirm
- ✅ **Refresh page** after transactions

### Smart Contract

The contract needs to be deployed before use:

1. Go to [Hiro Sandbox](https://explorer.hiro.so/sandbox/deploy?chain=testnet)
2. Copy code from `contracts/stackslend.clar`
3. Deploy with name `stackslend`
4. Update `.env.local` with your contract address

See `DEPLOY_CONTRACT.md` for detailed instructions.

---

## 🔧 Troubleshooting

### "Failed to create offer/loan"
- Check you have enough STX for transaction + fees
- Wait for previous transaction to confirm
- Refresh page and try again

### "Insufficient collateral"
- Minimum collateral ratio is 150%
- For 50 STX loan, need at least 75 STX collateral

### "Transaction not confirming"
- Wait at least 30 seconds
- Check [Stacks Explorer](https://explorer.hiro.so/?chain=testnet)
- Refresh the page

### Wallet not loading
- Check browser console for errors
- Clear localStorage and create new wallet
- Make sure you saved your private key!

---

## 📚 Learn More

- **Full Documentation:** See `README.md`
- **Contract Deployment:** See `DEPLOY_CONTRACT.md`
- **Stacks Docs:** [docs.stacks.co](https://docs.stacks.co)
- **Clarity Language:** [clarity-lang.org](https://clarity-lang.org)

---

## 🎓 Understanding the Platform

### How Lending Works

```
Lender → Creates Offer → Borrower Accepts → Loan Active
                                          ↓
                                    Borrower Repays
                                          ↓
                              Collateral Returned
```

### Interest Calculation

```
Interest = Principal × Rate × Duration / 365 days

Example:
- Loan: 100 STX
- Rate: 10% per year
- Duration: 30 days
- Interest: 100 × 0.10 × 30/365 = 0.82 STX
```

### Collateral Ratio

```
Ratio = (Collateral / Loan Amount) × 100%

Example:
- Loan: 100 STX
- Collateral: 150 STX
- Ratio: 150%

If ratio drops below 120%, loan can be liquidated!
```

---

## 🚀 Next Steps

1. ✅ Create wallet and get testnet STX
2. ✅ Try creating a loan offer
3. ✅ Try requesting a loan
4. ✅ Repay a loan to build credit score
5. ✅ Check analytics dashboard
6. ✅ Deploy your own contract
7. ✅ Customize the platform

---

## 💡 Tips

- **Start small:** Test with 1-10 STX first
- **Save keys:** Always backup your private key
- **Be patient:** Transactions take ~30 seconds
- **Check balance:** Make sure you have enough STX for fees
- **Use analytics:** Track your lending/borrowing activity

---

## 🤝 Need Help?

- Check the [README.md](README.md) for detailed docs
- Visit [Stacks Discord](https://discord.gg/stacks)
- Open an issue on GitHub

---

**Happy Lending! 💰**
