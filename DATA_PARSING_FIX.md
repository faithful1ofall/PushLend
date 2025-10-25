# Data Parsing Fix - cvToJSON Nested Structure

## Issue
Offers and loans were not displaying because the data parsing was incorrect. The `cvToJSON` function returns a deeply nested structure that wasn't being handled properly.

## Root Cause

### Expected Structure (What We Thought)
```typescript
{
  type: 'some',
  value: {
    lender: 'ST1234...',
    amount: '1000000',
    ...
  }
}
```

### Actual Structure (What cvToJSON Returns)
```typescript
{
  type: '(optional (tuple ...))',
  value: {
    type: '(tuple ...)',
    value: {
      active: { type: 'bool', value: true },
      amount: { type: 'uint', value: '23000000' },
      'interest-rate': { type: 'uint', value: '2300' },
      lender: { type: 'principal', value: 'ST2QXWF8H3VY60E5BWQ13FASYTK29BS9PTAHJR4WT' },
      'max-duration': { type: 'uint', value: '3168' },
      'min-collateral': { type: 'uint', value: '150000000' }
    }
  }
}
```

## The Fix

### Before (WRONG)
```typescript
if (offerResult && offerResult.type === 'some' && offerResult.value) {
  const offerData = offerResult.value;
  loadedOffers.push({
    offerId: i,
    lender: offerData.lender,  // ❌ Wrong - this is an object
    amount: parseInt(offerData.amount),  // ❌ Wrong - this is an object
    ...
  });
}
```

### After (CORRECT)
```typescript
if (offerResult && offerResult.value && offerResult.value.value) {
  const offerData = offerResult.value.value;  // ✅ Access nested value
  loadedOffers.push({
    offerId: i,
    lender: offerData.lender.value,  // ✅ Access .value property
    amount: parseInt(offerData.amount.value),  // ✅ Access .value property
    ...
  });
}
```

## Changes Made

### 1. LoanOffers Component (`src/components/LoanOffers.tsx`)

**Fixed Data Access:**
```typescript
// Access nested structure
const offerData = offerResult.value.value;

// Access each field's value
lender: offerData.lender.value,
amount: parseInt(offerData.amount.value),
interestRate: parseInt(offerData['interest-rate'].value),
maxDuration: parseInt(offerData['max-duration'].value),
minCollateral: parseInt(offerData['min-collateral'].value),
active: offerData.active.value,
```

### 2. MyLoans Component (`src/components/MyLoans.tsx`)

**Fixed Data Access:**
```typescript
// Access nested structure
const loanData = loanResult.value.value;

// Access each field's value
borrower: loanData.borrower.value,
lender: loanData.lender.value,
amount: parseInt(loanData.amount.value),
collateral: parseInt(loanData.collateral.value),
interestRate: parseInt(loanData['interest-rate'].value),
duration: parseInt(loanData.duration.value),
startBlock: parseInt(loanData['start-block'].value),
status: loanData.status.value,
```

### 3. Analytics Component (`src/components/Analytics.tsx`)

**Fixed User Stats:**
```typescript
totalBorrowed: parseInt(statsResult.value['total-borrowed'].value),
totalRepaid: parseInt(statsResult.value['total-repaid'].value),
loansCompleted: parseInt(statsResult.value['loans-completed'].value),
creditScore: parseInt(statsResult.value['credit-score'].value),
```

**Fixed Loan Data:**
```typescript
const loanData = loanResult.value.value;
// ... same as MyLoans
```

### 4. BorrowRequests Component (`src/components/BorrowRequests.tsx`)

**Added Turnkey Support:**
```typescript
// Use Turnkey signing if available
if (wallet.turnkey) {
  const unsignedTx = await createLoanTx(
    wallet.publicKey,
    wallet.address,
    amountInMicroStx,
    collateralInMicroStx,
    rate,
    durationBlocks
  );

  const signFunction = async (payload: string) => {
    return signWithTurnkey(payload, wallet.turnkey!.httpClient, wallet.publicKey);
  };

  const networkType = STACKS_NETWORK.chainId === 1 ? 'mainnet' : 'testnet';
  await signAndBroadcastTransaction(unsignedTx, signFunction, networkType);
}
```

## Data Structure Reference

### Optional Values (from map-get?)
```typescript
interface OptionalResponse<T> {
  type: string;  // e.g., '(optional (tuple ...))'
  value: {
    type: string;  // e.g., '(tuple ...)'
    value: T;  // The actual data
  }
}
```

### Field Values
```typescript
interface FieldValue<T> {
  type: string;  // e.g., 'uint', 'bool', 'principal'
  value: T;  // The actual value
}
```

### Complete Offer Structure
```typescript
{
  type: '(optional (tuple ...))',
  value: {
    type: '(tuple ...)',
    value: {
      active: { type: 'bool', value: boolean },
      amount: { type: 'uint', value: string },
      'interest-rate': { type: 'uint', value: string },
      lender: { type: 'principal', value: string },
      'max-duration': { type: 'uint', value: string },
      'min-collateral': { type: 'uint', value: string }
    }
  }
}
```

## Testing

### Console Output
All components now log the data structure:
```javascript
console.log('Offer count result:', countResult);
console.log(`Offer ${i} result:`, offerResult);
console.log(`Offer ${i} data:`, offerData);
console.log('Loaded offers:', loadedOffers);
```

### Expected Behavior
1. **Create Offer**: Transaction succeeds, offer ID returned
2. **Wait 30 seconds**: Blockchain confirmation
3. **Reload Offers**: Switch tabs or refresh
4. **See Offer**: Offer appears in list with correct data
5. **Create Loan**: Borrower can create loan request
6. **See Loan**: Loan appears in MyLoans tab

## Debugging Tips

### Check Console Logs
1. Open browser console (F12)
2. Look for "Offer X result:" logs
3. Verify structure matches expected format
4. Check "Loaded offers:" to see parsed data

### Common Issues

**Issue**: Offers still not showing
- Check if `offerResult.value.value` exists
- Verify each field has `.value` property
- Check if `active` is true

**Issue**: "Cannot read property 'value' of undefined"
- Data structure might be different
- Check console logs for actual structure
- Verify contract is returning data

**Issue**: Amounts showing as NaN
- Check if parsing `parseInt(field.value)` correctly
- Verify field.value is a string number
- Check for null/undefined values

## Summary

✅ **Fixed**: All data parsing to handle nested cvToJSON structure
✅ **Fixed**: Offers now display correctly after creation
✅ **Fixed**: Loans display correctly in MyLoans
✅ **Fixed**: Analytics parses user stats correctly
✅ **Added**: Turnkey support for create-loan function
✅ **Added**: Console logging for debugging

The application now correctly parses all data from the blockchain and displays offers and loans properly!
