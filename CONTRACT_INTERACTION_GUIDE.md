# Contract Interaction Guide - stackslend-simple

## Quick Reference

### Contract Details
- **Name**: `stackslend-simple`
- **Address**: `STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X`
- **Network**: Testnet
- **Explorer**: https://explorer.hiro.so/txid/STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X.stackslend-simple?chain=testnet

## User Flows

### Flow 1: Lender Creates Offer → Borrower Creates Loan → Lender Funds

1. **Lender**: Create offer
   ```clarity
   (contract-call? .stackslend-simple create-offer 
     u100000000  ;; 100 STX in microSTX
     u1000       ;; 10% APR (basis points)
     u4320       ;; 30 days in blocks (144 blocks/day)
     u150000000) ;; 150 STX minimum collateral
   ```

2. **Borrower**: Create loan request
   ```clarity
   (contract-call? .stackslend-simple create-loan
     u50000000   ;; 50 STX loan amount
     u75000000   ;; 75 STX collateral (150% ratio)
     u1000       ;; 10% APR
     u4320)      ;; 30 days
   ```

3. **Lender**: Fund the loan
   ```clarity
   (contract-call? .stackslend-simple fund-loan u1)
   ```

4. **Borrower**: Repay the loan
   ```clarity
   (contract-call? .stackslend-simple repay-loan u1)
   ```

### Flow 2: Direct Offer Acceptance (Not in Simple Contract)

⚠️ **Note**: The simple contract does NOT have an `accept-offer` function. Borrowers must create loan requests instead.

## Function Parameters

### create-offer
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| amount | uint | Loan amount in microSTX | u100000000 (100 STX) |
| interest-rate | uint | Annual rate in basis points | u1000 (10%) |
| max-duration | uint | Maximum loan duration in blocks | u4320 (30 days) |
| min-collateral | uint | Minimum collateral in microSTX | u150000000 (150 STX) |

### create-loan
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| amount | uint | Loan amount in microSTX | u50000000 (50 STX) |
| collateral | uint | Collateral amount in microSTX | u75000000 (75 STX) |
| interest-rate | uint | Annual rate in basis points | u1000 (10%) |
| duration | uint | Loan duration in blocks | u4320 (30 days) |

### Other Functions
| Function | Parameters | Description |
|----------|------------|-------------|
| fund-loan | (id uint) | Lender funds a pending loan |
| repay-loan | (id uint) | Borrower repays an active loan |
| liquidate-loan | (id uint) | Anyone can liquidate an overdue loan |
| cancel-offer | (id uint) | Lender cancels their offer |
| update-offer | (id uint) (new-rate uint) | Lender updates offer interest rate |

## Read-Only Functions

### get-offer
```clarity
(contract-call? .stackslend-simple get-offer u1)
```
Returns: `(optional {lender, amount, interest-rate, max-duration, min-collateral, active})`

### get-loan
```clarity
(contract-call? .stackslend-simple get-loan u1)
```
Returns: `(optional {borrower, lender, amount, collateral, interest-rate, duration, start-block, status})`

### get-offer-count
```clarity
(contract-call? .stackslend-simple get-offer-count)
```
Returns: `uint` - Total number of offers created

### get-loan-count
```clarity
(contract-call? .stackslend-simple get-loan-count)
```
Returns: `uint` - Total number of loans created

### get-user-stats
```clarity
(contract-call? .stackslend-simple get-user-stats 'ST1234...)
```
Returns: `{total-borrowed, total-repaid, loans-completed, credit-score}`

## Conversion Helpers

### STX to MicroSTX
```typescript
// 1 STX = 1,000,000 microSTX
const microStx = stx * 1_000_000;

// Example: 100 STX
const amount = 100 * 1_000_000; // 100000000 microSTX
```

### Interest Rate to Basis Points
```typescript
// 1% = 100 basis points
const basisPoints = percentage * 100;

// Example: 10% APR
const rate = 10 * 100; // 1000 basis points
```

### Days to Blocks
```typescript
// 1 day ≈ 144 blocks (10 minute block time)
const blocks = days * 144;

// Example: 30 days
const duration = 30 * 144; // 4320 blocks
```

## Loan Status Values

| Status | Description |
|--------|-------------|
| "pending" | Loan created, waiting for lender to fund |
| "active" | Loan funded, borrower has received funds |
| "repaid" | Loan fully repaid by borrower |
| "liquidated" | Loan liquidated due to non-payment |

## Error Codes

| Error | Code | Description |
|-------|------|-------------|
| err-invalid | u100 | Invalid parameters (e.g., amount = 0) |
| err-not-found | u101 | Offer or loan not found |
| err-unauthorized | u102 | Caller not authorized for this action |
| err-already-funded | u103 | Loan already funded |
| err-not-active | u104 | Loan not in active state |
| err-insufficient-collateral | u105 | Collateral below minimum (150%) |

## UI Component Mapping

| Component | Contract Function | User Role |
|-----------|------------------|-----------|
| LoanOffers | create-offer | Lender |
| LoanOffers | cancel-offer | Lender |
| BorrowRequests | create-loan | Borrower |
| MyLoans | fund-loan | Lender |
| MyLoans | repay-loan | Borrower |
| MyLoans | liquidate-loan | Anyone |

## Testing Examples

### Create a Test Offer
```typescript
// In LoanOffers component
Amount: 100 STX
Interest Rate: 10% per year
Max Duration: 30 days
Min Collateral: 150 STX

// Converts to:
amount: 100000000 microSTX
rate: 1000 basis points
duration: 4320 blocks
minCollateral: 150000000 microSTX
```

### Create a Test Loan Request
```typescript
// In BorrowRequests component
Loan Amount: 50 STX
Collateral: 75 STX (150% ratio)
Interest Rate: 10% per year
Duration: 30 days

// Converts to:
amount: 50000000 microSTX
collateral: 75000000 microSTX
rate: 1000 basis points
duration: 4320 blocks
```

## Debugging Tips

1. **Check Console Logs**: All components now log data structures
2. **Verify Conversions**: Ensure STX amounts are converted to microSTX
3. **Check Transaction Status**: Use Stacks Explorer to verify transactions
4. **Wait for Confirmation**: Transactions take ~30 seconds to confirm
5. **Refresh Data**: Reload offers/loans after transaction confirms

## Common Issues

### Issue: Offers don't appear after creation
**Solution**: 
- Check console for data structure
- Verify `cvToJSON` returns `{type: 'some', value: {...}}`
- Wait 30 seconds for blockchain confirmation
- Manually refresh by switching tabs

### Issue: "BadFunctionArgument" error
**Solution**:
- Verify you're sending 4 arguments (not 6)
- Check argument order matches contract
- Ensure all values are positive integers

### Issue: "Insufficient collateral" error
**Solution**:
- Collateral must be ≥ 150% of loan amount
- Example: 50 STX loan requires ≥ 75 STX collateral
