# sBTC Integration Guide

StacksLend now supports **multi-asset lending** with both **STX** and **sBTC** tokens. This allows users to:
- Lend STX and accept sBTC as collateral
- Lend sBTC and accept STX as collateral
- Mix and match assets for maximum flexibility

## Overview

### What is sBTC?

sBTC is a decentralized, 1:1 Bitcoin-backed asset on the Stacks blockchain. It enables Bitcoin holders to participate in DeFi applications on Stacks while maintaining Bitcoin's security guarantees.

### Multi-Asset Architecture

The platform uses a **multi-asset smart contract** (`stackslend-multi-asset.clar`) that:
- Supports both native STX transfers and SIP-010 token transfers (sBTC)
- Tracks loan and collateral assets separately
- Maintains the same collateral ratios and liquidation logic
- Calculates interest based on the loan asset

## Smart Contract

### Contract: `stackslend-multi-asset.clar`

**Key Features:**
- Asset type constants: `asset-stx` (1) and `asset-sbtc` (2)
- Configurable sBTC token contract address
- Unified transfer functions for both asset types
- All existing lending features (offers, requests, repayment, liquidation)

**New Data Fields:**
```clarity
{
  loan-asset: uint,        ;; 1=STX, 2=sBTC
  collateral-asset: uint   ;; 1=STX, 2=sBTC
}
```

**Key Functions:**

#### Create Offer (Multi-Asset)
```clarity
(create-offer 
  (amount uint) 
  (interest-rate uint) 
  (max-duration uint) 
  (min-collateral-ratio uint)
  (loan-asset uint)
  (collateral-asset uint))
```

#### Create Loan Request (Multi-Asset)
```clarity
(create-loan-request 
  (amount uint) 
  (collateral-amount uint) 
  (interest-rate uint) 
  (duration uint)
  (loan-asset uint)
  (collateral-asset uint))
```

### sBTC Token Contract

The contract references an sBTC SIP-010 token contract:
- **Testnet:** `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token`
- **Mainnet:** Update via `set-sbtc-token` admin function

## Frontend Integration

### Asset Selection

Users can now select assets when creating offers or loan requests:

**Loan Offers:**
- Choose **Loan Asset** (STX or sBTC) - what you're lending
- Choose **Collateral Asset** (STX or sBTC) - what you accept as collateral

**Borrow Requests:**
- Choose **Loan Asset** (STX or sBTC) - what you want to borrow
- Choose **Collateral Asset** (STX or sBTC) - what you provide as collateral

### Balance Display

The Dashboard now shows both balances:
```
Balances
1000.000000 STX
0.50000000 sBTC
```

### Asset Formatting

Different assets have different decimal places:
- **STX:** 6 decimals (microSTX)
- **sBTC:** 8 decimals (satoshis)

The UI automatically handles conversions using helper functions from `src/lib/sbtc.ts`.

## Usage Examples

### Example 1: Lend STX, Accept sBTC Collateral

**As Lender:**
1. Go to "Loan Offers" tab
2. Click "+ Create Offer"
3. Select:
   - Loan Asset: **STX**
   - Collateral Asset: **sBTC**
   - Amount: 100 STX
   - Interest Rate: 10% APR
   - Max Duration: 30 days
   - Min Collateral Ratio: 150%
4. Create offer

**As Borrower:**
1. Go to "Borrow" tab
2. Select:
   - Loan Asset: **STX**
   - Collateral Asset: **sBTC**
   - Loan Amount: 100 STX
   - Collateral: 0.0015 sBTC (worth ~150 STX at $100k BTC)
   - Interest Rate: 10% APR
   - Duration: 30 days
3. Create request (collateral locked immediately)

### Example 2: Lend sBTC, Accept STX Collateral

**As Lender:**
1. Create offer with:
   - Loan Asset: **sBTC**
   - Collateral Asset: **STX**
   - Amount: 0.001 sBTC
   - Min Collateral Ratio: 150%

**As Borrower:**
1. Create request with:
   - Loan Asset: **sBTC**
   - Collateral Asset: **STX**
   - Loan Amount: 0.001 sBTC
   - Collateral: 150 STX (worth ~$150 at $1 STX)

### Example 3: Same Asset (STX/STX or sBTC/sBTC)

You can also use the same asset for both loan and collateral:
- Loan Asset: **STX**, Collateral Asset: **STX**
- Loan Asset: **sBTC**, Collateral Asset: **sBTC**

This is useful for:
- Liquidity without selling
- Tax-efficient borrowing
- Leveraged positions

## Technical Implementation

### File Structure

```
src/
├── lib/
│   ├── sbtc.ts                    # sBTC helper functions
│   ├── stacks-multi-asset.ts      # Multi-asset contract calls
│   └── turnkey-stacks.ts          # Turnkey integration
├── components/
│   ├── Dashboard.tsx              # Shows both balances
│   ├── LoanOffers.tsx             # Asset selection for offers
│   ├── BorrowRequests.tsx         # Asset selection for requests
│   └── MyLoans.tsx                # Handles multi-asset loans
└── types/
    └── index.ts                   # Updated with asset fields

contracts/
└── stackslend-multi-asset.clar    # Multi-asset smart contract
```

### Key Functions

**`src/lib/sbtc.ts`:**
```typescript
// Asset constants
export const ASSET_STX = 1;
export const ASSET_SBTC = 2;

// Get asset name
getAssetName(assetType: number): string

// Format amounts with correct decimals
formatAssetAmount(amount: number, assetType: number): string
parseAssetAmount(amount: string, assetType: number): number

// Get balances
getAssetBalance(address: string, assetType: number): Promise<number>
getSbtcBalance(address: string): Promise<number>
getStxBalance(address: string): Promise<number>
```

**`src/lib/stacks-multi-asset.ts`:**
```typescript
// Create offer with asset selection
createOfferMultiAsset(
  privateKey: string,
  amount: number,
  interestRate: number,
  maxDuration: number,
  minCollateralRatio: number,
  loanAsset: number,
  collateralAsset: number
)

// Create loan request with asset selection
createLoanRequestMultiAsset(
  privateKey: string,
  amount: number,
  collateralAmount: number,
  interestRate: number,
  duration: number,
  loanAsset: number,
  collateralAsset: number
)
```

## Deployment

### 1. Deploy sBTC Token (Testnet)

If using a custom sBTC token for testing:

```bash
# Deploy SIP-010 token contract
clarinet deployments apply -p deployments/sbtc-token.testnet-plan.yaml
```

### 2. Deploy Multi-Asset Contract

```bash
# Deploy the multi-asset lending contract
clarinet deployments apply -p deployments/stackslend-multi-asset.testnet-plan.yaml
```

### 3. Configure Environment

Update `.env.local`:
```bash
# sBTC Token Contract
NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_SBTC_CONTRACT_NAME=sbtc-token

# Multi-Asset Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=your-deployed-contract-address
```

### 4. Update Contract Reference

If needed, update the sBTC token address in the deployed contract:
```clarity
(contract-call? .stackslend-multi-asset set-sbtc-token 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token)
```

## Testing

### Get Test sBTC

For testnet testing, you'll need test sBTC:

1. **Option 1: Faucet** (if available)
   - Visit sBTC testnet faucet
   - Request test sBTC to your Stacks address

2. **Option 2: Mint Function** (if contract supports it)
   ```clarity
   (contract-call? .sbtc-token mint u100000000 tx-sender)
   ```

3. **Option 3: Bridge** (testnet bridge)
   - Use sBTC testnet bridge
   - Bridge test BTC to test sBTC

### Test Scenarios

**Scenario 1: STX Loan with sBTC Collateral**
1. Get test STX from faucet
2. Get test sBTC
3. Create offer: 100 STX loan, sBTC collateral
4. Create request: 100 STX, 0.0015 sBTC collateral
5. Verify collateral locked
6. Repay loan
7. Verify collateral returned

**Scenario 2: sBTC Loan with STX Collateral**
1. Create offer: 0.001 sBTC loan, STX collateral
2. Create request: 0.001 sBTC, 150 STX collateral
3. Fund and repay

**Scenario 3: Cross-Asset Liquidation**
1. Create under-collateralized loan
2. Wait for collateral ratio to drop below 120%
3. Liquidate loan
4. Verify collateral transferred to lender

## Security Considerations

### Collateral Ratios

The same collateral ratio rules apply:
- **Minimum:** 150% at loan creation
- **Liquidation:** 120% threshold

⚠️ **Important:** Collateral ratios are calculated in the same asset units. For cross-asset loans (e.g., STX loan with sBTC collateral), you must account for exchange rates manually when setting collateral amounts.

### Price Oracles

**Current Implementation:**
- No automatic price feeds
- Users manually calculate collateral based on market prices
- Suitable for testnet and trusted parties

**Production Recommendations:**
- Integrate Stacks price oracles (e.g., Redstone, Pyth)
- Implement dynamic collateral ratio adjustments
- Add price feed validation

### Token Approvals

For sBTC transfers, the contract uses SIP-010 `transfer` function:
```clarity
(contract-call? .sbtc-token transfer amount sender recipient none)
```

Users must have sufficient sBTC balance. No separate approval needed (unlike ERC-20).

## Limitations

1. **No Automatic Price Conversion**
   - Users must manually calculate cross-asset collateral amounts
   - Example: If lending 100 STX and accepting sBTC collateral, user must know current STX/BTC rate

2. **Fixed Collateral Ratios**
   - Collateral ratio set at loan creation
   - No dynamic adjustments based on price movements

3. **Manual Liquidation**
   - Liquidations must be triggered manually
   - No automatic liquidation bots (yet)

4. **Testnet Only**
   - sBTC is still in development
   - Use testnet for all testing

## Future Enhancements

- [ ] Price oracle integration for automatic collateral valuation
- [ ] Dynamic collateral ratio monitoring
- [ ] Automated liquidation system
- [ ] Support for additional SIP-010 tokens
- [ ] Flash loan protection
- [ ] Governance token for protocol parameters

## Resources

- [sBTC Documentation](https://docs.stacks.co/sbtc)
- [SIP-010 Token Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
- [Stacks Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
- [sBTC Bridge (Testnet)](https://bridge.sbtc.tech)

## Support

For issues or questions:
- Open an issue on GitHub
- Check [Stacks Discord](https://discord.gg/stacks) #sbtc channel
- Review [sBTC Developer Docs](https://docs.stacks.co/sbtc)

---

**Built with ❤️ for the Stacks and Bitcoin ecosystems**
