# Smart Contract Deployment Guide

This guide explains how to deploy the StacksLend smart contract to Stacks testnet.

## Prerequisites

- Stacks wallet with testnet STX
- Contract code from `contracts/stackslend.clar`

---

## Method 1: Hiro Explorer (Recommended for Beginners)

### Step 1: Get Testnet STX

1. Go to [Stacks Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
2. Enter your wallet address
3. Request testnet STX (~10 STX should be enough)

### Step 2: Deploy Contract

1. Go to [Hiro Sandbox Deploy](https://explorer.hiro.so/sandbox/deploy?chain=testnet)
2. Connect your Stacks wallet (Leather, Xverse, etc.)
3. Copy the entire content of `contracts/stackslend.clar`
4. Paste it into the "Contract code" field
5. Set contract name: `stackslend`
6. Click "Deploy contract"
7. Confirm the transaction in your wallet
8. Wait ~30 seconds for confirmation

### Step 3: Get Contract Address

1. After deployment, you'll see a transaction ID
2. Click on it to view transaction details
3. Copy the contract address (format: `ST...ADDRESS.stackslend`)
4. Update `.env.local`:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_ADDRESS_HERE
   NEXT_PUBLIC_CONTRACT_NAME=stackslend
   ```

---

## Method 2: Clarinet CLI (Advanced)

### Step 1: Install Clarinet

**macOS:**
```bash
brew install clarinet
```

**Linux:**
```bash
curl -L https://github.com/hirosystems/clarinet/releases/download/v1.8.0/clarinet-linux-x64.tar.gz | tar xz
sudo mv clarinet /usr/local/bin/
```

**Windows:**
Download from [Clarinet Releases](https://github.com/hirosystems/clarinet/releases)

### Step 2: Initialize Project

```bash
cd stackslend
clarinet integrate
```

This creates:
- `Clarinet.toml` - Project configuration
- `settings/Devnet.toml` - Network settings

### Step 3: Configure Contract

Edit `Clarinet.toml`:

```toml
[project]
name = "stackslend"
authors = []
description = "P2P Lending Platform"
telemetry = false

[contracts.stackslend]
path = "contracts/stackslend.clar"
clarity_version = 2
epoch = 2.4
```

### Step 4: Test Locally

```bash
# Check syntax
clarinet check

# Run tests (if you have test files)
clarinet test

# Start local devnet
clarinet devnet start
```

### Step 5: Generate Deployment Plan

```bash
clarinet deployments generate --testnet
```

This creates `deployments/default.testnet-plan.yaml`

### Step 6: Configure Wallet

Edit `settings/Testnet.toml`:

```toml
[network]
name = "testnet"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "your twelve word seed phrase here"
```

⚠️ **Never commit this file with real credentials!**

### Step 7: Deploy to Testnet

```bash
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

### Step 8: Verify Deployment

```bash
# Check deployment status
clarinet deployments status

# View contract on explorer
open "https://explorer.hiro.so/txid/YOUR_CONTRACT_ADDRESS.stackslend?chain=testnet"
```

---

## Method 3: Using Stacks CLI

### Step 1: Install Stacks CLI

```bash
npm install -g @stacks/cli
```

### Step 2: Deploy Contract

```bash
stx deploy_contract \
  contracts/stackslend.clar \
  stackslend \
  1000000 \
  0 \
  YOUR_PRIVATE_KEY \
  --testnet
```

Parameters:
- Contract file path
- Contract name
- Fee (in microSTX)
- Nonce (usually 0 for first deployment)
- Private key
- Network flag

---

## Post-Deployment Steps

### 1. Update Environment Variables

Edit `.env.local`:

```env
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_CONTRACT_NAME=stackslend
```

### 2. Verify Contract

Visit the explorer:
```
https://explorer.hiro.so/txid/YOUR_ADDRESS.stackslend?chain=testnet
```

Check:
- ✅ Contract is deployed
- ✅ Functions are visible
- ✅ No errors in deployment

### 3. Test Contract Functions

Use the explorer's "Call function" feature to test:

**Read-only functions:**
- `get-loan-count` - Should return `u0`
- `get-offer-count` - Should return `u0`

**Public functions:**
- Try creating a test offer
- Verify it appears in the contract state

### 4. Update Frontend

Restart your development server:
```bash
npm run dev
```

The app should now connect to your deployed contract!

---

## Troubleshooting

### Error: "Insufficient funds"

**Solution:** Get more testnet STX from the faucet

### Error: "Contract already exists"

**Solution:** Use a different contract name or deploy from a different address

### Error: "Invalid contract"

**Solution:** Check syntax with `clarinet check`

### Error: "Transaction failed"

**Solution:** 
1. Check transaction details in explorer
2. Verify you have enough STX for fees
3. Ensure nonce is correct

### Contract not showing in explorer

**Solution:**
1. Wait 1-2 minutes for indexing
2. Refresh the page
3. Check transaction status

---

## Contract Upgrade Strategy

Since Clarity contracts are immutable, to "upgrade":

1. Deploy new version with different name (e.g., `stackslend-v2`)
2. Update `.env.local` with new contract name
3. Migrate data if needed (manual process)
4. Update frontend to use new contract

---

## Mainnet Deployment

⚠️ **Only deploy to mainnet after thorough testing!**

### Differences from Testnet

1. Use real STX (costs money)
2. Change network in `.env.local`:
   ```
   NEXT_PUBLIC_STACKS_NETWORK=mainnet
   NEXT_PUBLIC_STACKS_API_URL=https://api.mainnet.hiro.so
   ```
3. Use mainnet wallet addresses
4. Higher deployment fees
5. Irreversible (contracts are immutable)

### Mainnet Checklist

- [ ] Thoroughly tested on testnet
- [ ] Security audit completed
- [ ] All edge cases handled
- [ ] Emergency pause mechanism (if needed)
- [ ] Documentation complete
- [ ] Frontend tested with mainnet
- [ ] Backup plan for issues

---

## Cost Estimates

### Testnet
- Deployment: ~0.5-1 STX (free from faucet)
- Transactions: ~0.001-0.01 STX each

### Mainnet
- Deployment: ~5-10 STX (~$5-10 USD)
- Transactions: ~0.001-0.01 STX each

Costs vary based on:
- Contract size
- Network congestion
- Transaction complexity

---

## Useful Resources

- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [Stacks Explorer](https://explorer.hiro.so)
- [Stacks Discord](https://discord.gg/stacks)

---

## Support

If you encounter issues:

1. Check [Stacks Status](https://status.stacks.co)
2. Search [Stacks Forum](https://forum.stacks.org)
3. Ask in [Stacks Discord](https://discord.gg/stacks)
4. Open an issue on GitHub

---

**Happy Deploying! 🚀**
