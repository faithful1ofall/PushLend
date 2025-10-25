# StacksLend - Deployment Information

## ✅ Contract Successfully Deployed to Testnet!

**Deployment Date:** October 10, 2025
**Network:** Stacks Testnet
**Status:** ✅ Deployed and Pending Confirmation

---

## 📋 Deployment Details

### Contract Information
- **Contract Name:** `stackslend`
- **Contract Address:** `STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X.stackslend`
- **Deployer Address:** `STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X`
- **Transaction ID:** `a15d3401f213b819c2b374efcf8496253170498badbea281fb5125d13ca25bdd`

### Network Details
- **Network:** Stacks Testnet
- **API URL:** https://api.testnet.hiro.so
- **Deployment Fee:** 0.5 STX (500,000 microSTX)
- **Contract Size:** 13,282 bytes

---

## 🔗 Explorer Links

### View Contract
[https://explorer.hiro.so/txid/STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X.stackslend?chain=testnet](https://explorer.hiro.so/txid/STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X.stackslend?chain=testnet)

### View Transaction
[https://explorer.hiro.so/txid/a15d3401f213b819c2b374efcf8496253170498badbea281fb5125d13ca25bdd?chain=testnet](https://explorer.hiro.so/txid/a15d3401f213b819c2b374efcf8496253170498badbea281fb5125d13ca25bdd?chain=testnet)

### View Deployer Account
[https://explorer.hiro.so/address/STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X?chain=testnet](https://explorer.hiro.so/address/STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X?chain=testnet)

---

## ⚙️ Environment Configuration

The `.env.local` file has been updated with the deployed contract address:

```env
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so
NEXT_PUBLIC_CONTRACT_ADDRESS=STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X
NEXT_PUBLIC_CONTRACT_NAME=stackslend
```

---

## 🚀 Next Steps

### 1. Wait for Confirmation (~30-60 seconds)
The transaction is currently being processed by the Stacks blockchain. You can monitor its status at:
[https://explorer.hiro.so/txid/a15d3401f213b819c2b374efcf8496253170498badbea281fb5125d13ca25bdd?chain=testnet](https://explorer.hiro.so/txid/a15d3401f213b819c2b374efcf8496253170498badbea281fb5125d13ca25bdd?chain=testnet)

### 2. Restart the Application
Once confirmed, restart your development server to use the deployed contract:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Test the Contract
After confirmation, you can test the contract functions:

**Read-Only Functions:**
- `get-loan-count` - Should return `u0` initially
- `get-offer-count` - Should return `u0` initially
- `get-credit-score` - Check any address

**Public Functions:**
- Create a loan offer
- Create a loan request
- Accept an offer
- Repay a loan

### 4. Get Testnet STX for Testing
If you need more testnet STX for testing:
[https://explorer.hiro.so/sandbox/faucet?chain=testnet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)

---

## 📊 Contract Functions

### Public Functions (11)
1. `create-offer` - Create a loan offer
2. `accept-offer` - Accept an offer with collateral
3. `create-loan-request` - Create a loan request
4. `fund-loan` - Fund a pending loan
5. `repay-loan` - Repay an active loan
6. `liquidate-loan` - Liquidate defaulted loan
7. `cancel-offer` - Cancel your offer
8. `set-platform-fee` - Admin only
9. `set-min-collateral-ratio` - Admin only
10. `set-liquidation-threshold` - Admin only

### Read-Only Functions (8)
1. `get-loan` - Get loan details
2. `get-offer` - Get offer details
3. `get-credit-score` - Get user credit score
4. `get-loan-count` - Total loans
5. `get-offer-count` - Total offers
6. `calculate-interest` - Calculate interest
7. `calculate-total-repayment` - Total repayment
8. `is-loan-liquidatable` - Check liquidation status

---

## 🧪 Testing the Deployment

### Using the Web Interface

1. **Open the Application**
   - Go to your preview URL
   - Import wallet with the seed phrase
   - The app will automatically connect to the deployed contract

2. **Create a Test Offer**
   ```
   Amount: 10 STX
   Interest Rate: 10% APR
   Max Duration: 30 days
   Min Collateral: 150%
   ```

3. **Monitor on Explorer**
   - Watch transactions in real-time
   - Verify contract state changes
   - Check loan/offer counts

### Using Stacks CLI

```bash
# Check contract exists
curl "https://api.testnet.hiro.so/v2/contracts/interface/STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X/stackslend"

# Call read-only function
curl -X POST "https://api.testnet.hiro.so/v2/contracts/call-read/STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X/stackslend/get-loan-count" \
  -H "Content-Type: application/json" \
  -d '{"sender":"STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X","arguments":[]}'
```

---

## 🔐 Security Notes

### Deployer Account
- **Address:** `STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X`
- **Private Key:** Derived from provided seed phrase
- **Balance:** ~499.5 STX (after deployment fee)

⚠️ **Important:**
- This is a testnet deployment for testing only
- Never use testnet keys on mainnet
- Keep your private keys secure
- The deployer address is the contract owner

### Contract Ownership
The deployer address (`STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X`) has admin privileges:
- Can set platform fee
- Can adjust collateral ratios
- Can modify liquidation threshold

---

## 📈 Monitoring

### Check Transaction Status
```bash
curl "https://api.testnet.hiro.so/extended/v1/tx/a15d3401f213b819c2b374efcf8496253170498badbea281fb5125d13ca25bdd"
```

### Check Contract State
```bash
curl "https://api.testnet.hiro.so/v2/contracts/interface/STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X/stackslend"
```

### Check Account Balance
```bash
curl "https://api.testnet.hiro.so/extended/v1/address/STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X/balances"
```

---

## 🐛 Troubleshooting

### Contract Not Found
- **Issue:** Contract interface returns "not found"
- **Solution:** Wait 30-60 seconds for confirmation, then check again

### Transaction Failed
- **Issue:** Transaction shows as failed in explorer
- **Solution:** Check error message, verify contract syntax, redeploy if needed

### Functions Not Working
- **Issue:** Contract calls fail
- **Solution:** Ensure transaction is confirmed, check function arguments

### Balance Issues
- **Issue:** Insufficient balance for transactions
- **Solution:** Get more testnet STX from faucet

---

## 📝 Deployment Scripts

### Deploy Contract
```bash
node scripts/deploy-contract.js
```

### Get Address from Private Key
```bash
node scripts/get-address.js
```

### Derive Key from Seed Phrase
```bash
node scripts/derive-key.js
```

---

## 🎯 Success Criteria

- ✅ Contract deployed to testnet
- ✅ Transaction broadcast successful
- ✅ Environment variables updated
- ✅ Deployment info saved
- ⏳ Waiting for confirmation
- ⏳ Contract interface available
- ⏳ Functions callable

---

## 📞 Support

### If You Encounter Issues

1. **Check Transaction Status**
   - Visit the explorer link above
   - Look for "success" or "failed" status
   - Read any error messages

2. **Verify Contract**
   - Wait at least 60 seconds
   - Check contract interface endpoint
   - Try calling read-only functions

3. **Get Help**
   - Check Stacks Discord: https://discord.gg/stacks
   - Review Stacks docs: https://docs.stacks.co
   - Open GitHub issue

---

## 🎉 Deployment Summary

**Status:** ✅ Successfully Deployed

The StacksLend smart contract has been successfully deployed to Stacks testnet! 

**What's Next:**
1. Wait for transaction confirmation (~30-60 seconds)
2. Restart your application
3. Test all contract functions
4. Create your first loan offer
5. Start lending and borrowing!

**Contract Address:**
```
STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X.stackslend
```

**Explorer:**
[View Contract on Explorer](https://explorer.hiro.so/txid/STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X.stackslend?chain=testnet)

---

**Deployed with ❤️ for the Stacks ecosystem**

**Deployment Time:** 2025-10-10T20:13:00.537Z
**Network:** Testnet
**Version:** 1.0.0
