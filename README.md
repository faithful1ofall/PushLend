# PushLend - Universal P2P Lending Platform

A fully decentralized peer-to-peer lending platform built on Push Network with automated collateral management, interest calculations, credit scoring, and liquidation mechanisms.

**Live Contract:** [0x368831E75187948d722e3648C02C8D50d668a46c](https://donut.push.network/address/0x368831E75187948d722e3648C02C8D50d668a46c)

## 🌐 Universal App Features

✅ **True Universal Access** - Connect from ANY blockchain (Ethereum, Solana, etc.)  
✅ **Push UI Kit Integration** - Seamless cross-chain wallet connection  
✅ **Multiple Login Methods** - Email, Google, or any Web3 wallet  
✅ **One Contract, All Chains** - Deploy once, accessible from everywhere  
✅ **Smart Contract Lending** - Fully automated P2P lending with on-chain collateral  
✅ **Collateral Management** - Minimum 150% collateral ratio with automatic liquidation  
✅ **Interest Calculations** - Automated interest accrual based on loan duration  
✅ **Credit Scoring** - On-chain credit history tracking for borrowers  
✅ **Loan Offers** - Lenders create offers, borrowers accept with collateral  
✅ **Loan Requests** - Borrowers create requests, lenders fund them  
✅ **Liquidation System** - Automatic liquidation when collateral falls below threshold  
✅ **Analytics Dashboard** - Track lending/borrowing activity and credit score  
✅ **Real Blockchain** - All transactions on Push Network testnet

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- **No wallet required!** - Use email/social login or connect any Web3 wallet
- Testnet PC tokens from [Push Network Faucet](https://faucet.push.org)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Universal Access

PushLend is a **truly universal app** powered by Push Network:

- 🌍 **Connect from any chain** - Ethereum, Solana, or any other blockchain
- 📧 **Email/Social login** - No wallet needed, use email or Google
- 🔗 **One contract** - All users interact with the same Push Network contract
- ⚡ **Instant transactions** - Fast and cheap on Push Network testnet

**How it works:**
1. Connect with your preferred method (wallet, email, or social)
2. Your account is automatically created on Push Network
3. All lending/borrowing happens on Push Network
4. Works seamlessly regardless of your origin chain!

## Network Configuration

- **Network Name:** Push Chain Donut Testnet
- **RPC URL:** https://evm.rpc-testnet-donut-node1.push.org/
- **Chain ID:** 42101
- **Currency Symbol:** PC
- **Block Explorer:** https://donut.push.network
- **Contract Address:** 0x368831E75187948d722e3648C02C8D50d668a46c

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Universal Wallet:** @pushchain/ui-kit (Push UI Kit)
- **Blockchain SDK:** @pushchain/core
- **Smart Contracts:** Solidity 0.8.20
- **Network:** Push Chain Testnet (Donut)
- **Deployment:** Hardhat

## Why Universal?

Traditional dApps are limited to a single blockchain. PushLend breaks this barrier:

- **Traditional dApp:** Deploy on Ethereum → Only Ethereum users can access
- **PushLend (Universal):** Deploy on Push Network → Users from ANY chain can access!

This is possible because:
1. Push Network acts as a universal settlement layer
2. Push UI Kit handles cross-chain authentication
3. Users' origin chain wallets can interact with Push Network contracts
4. All transactions are settled on Push Network

## License

MIT
