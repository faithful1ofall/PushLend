# Quick Functionality Guide

## All Features ✅

### 🏦 For Lenders

#### Create Offer (LoanOffers Tab)
1. Click "+ Create Offer"
2. Fill in:
   - Amount: e.g., 100 STX
   - Interest Rate: e.g., 10% per year
   - Max Duration: e.g., 30 days
   - Min Collateral: e.g., 150 STX
3. Click "Create Offer"
4. Sign with Turnkey passkey
5. Wait 30 seconds → Offer appears

#### Cancel Offer (LoanOffers Tab)
1. Find your offer in the list
2. Click "Cancel Offer"
3. Confirm
4. Sign with Turnkey passkey
5. Wait 30 seconds → Offer removed

#### Fund Loan (MyLoans Tab)
1. Switch to "Lent" filter
2. Find pending loan
3. Click "Fund Loan"
4. Confirm (STX will be transferred to borrower)
5. Sign with Turnkey passkey
6. Wait 30 seconds → Loan becomes active

### 💰 For Borrowers

#### Create Loan Request (BorrowRequests Tab)
1. Fill in:
   - Loan Amount: e.g., 50 STX
   - Collateral: e.g., 75 STX (must be ≥150% of loan)
   - Interest Rate: e.g., 10% per year
   - Duration: e.g., 30 days
2. Check collateral ratio (must be green)
3. Click "Create Loan Request"
4. Sign with Turnkey passkey
5. Wait 30 seconds → Loan appears in MyLoans

#### Repay Loan (MyLoans Tab)
1. Switch to "Borrowed" filter
2. Find active loan
3. Click "Repay Loan"
4. Confirm (principal + interest will be paid)
5. Sign with Turnkey passkey
6. Wait 30 seconds → Collateral returned

### ⚡ For Anyone

#### Liquidate Overdue Loan (MyLoans Tab)
1. Find overdue loan (any filter)
2. Click "Liquidate"
3. Confirm
4. Sign with Turnkey passkey
5. Wait 30 seconds → Receive collateral

## Quick Tips

### ✅ Do's
- Wait 30 seconds after each transaction
- Switch tabs to refresh data
- Check console (F12) for debugging
- Verify amounts before confirming
- Ensure collateral ≥ 150% for loans

### ❌ Don'ts
- Don't refresh page during transaction
- Don't create multiple transactions quickly
- Don't expect instant updates (blockchain takes time)

## Status Meanings

| Status | Description | Available Actions |
|--------|-------------|-------------------|
| **pending** | Loan created, waiting for funding | Fund (lender) |
| **active** | Loan funded, borrower has funds | Repay (borrower), Liquidate (if overdue) |
| **repaid** | Loan fully repaid | View only |
| **liquidated** | Loan liquidated due to non-payment | View only |

## Common Scenarios

### Scenario 1: Simple Loan
1. Lender creates offer: 100 STX @ 10% for 30 days
2. Borrower creates loan: 50 STX with 75 STX collateral
3. Lender funds loan → Borrower receives 50 STX
4. After 30 days, borrower repays ~55 STX (principal + interest)
5. Borrower gets 75 STX collateral back

### Scenario 2: Liquidation
1. Borrower creates loan but doesn't repay on time
2. Loan becomes overdue
3. Anyone can liquidate
4. Liquidator receives the 75 STX collateral
5. Lender loses their 50 STX (but this is handled by contract)

## Troubleshooting

### Offers/Loans Not Showing
- Wait 30 seconds after transaction
- Switch to another tab and back
- Check console for "Loaded offers:" or "Loaded loans:"
- Verify transaction succeeded on blockchain

### Transaction Failed
- Check console for error message
- Verify you have enough STX
- Ensure you're the correct user (lender/borrower)
- Check if loan/offer still exists

### Collateral Ratio Error
- Collateral must be at least 150% of loan amount
- Example: 50 STX loan needs ≥ 75 STX collateral
- Increase collateral or decrease loan amount

## All Functions Summary

| Action | Tab | User | Turnkey |
|--------|-----|------|---------|
| Create Offer | LoanOffers | Lender | ✅ |
| Cancel Offer | LoanOffers | Lender | ✅ |
| Create Loan | BorrowRequests | Borrower | ✅ |
| Fund Loan | MyLoans | Lender | ✅ |
| Repay Loan | MyLoans | Borrower | ✅ |
| Liquidate Loan | MyLoans | Anyone | ✅ |

**Everything works with Turnkey passkey authentication!** 🎉
