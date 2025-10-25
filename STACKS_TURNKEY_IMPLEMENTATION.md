# Stacks + Turnkey Implementation Guide

## Overview

This document explains how StacksLend integrates Turnkey's Embedded Wallet SDK with the Stacks blockchain, which is not natively supported by Turnkey.

---

## Challenge

**Turnkey does not natively support Stacks blockchain.** 

According to [Turnkey's wallet documentation](https://docs.turnkey.com/concepts/wallets), the supported address formats include Ethereum, Bitcoin, Solana, Cosmos, and others, but **not Stacks**.

---

## Solution

We use Turnkey's **raw signing capabilities** combined with **manual address derivation** to support Stacks:

### 1. Wallet Creation with Custom Account

Instead of using a predefined address format, we create a wallet with a custom account configuration:

```typescript
await createWallet({
  walletName: 'StacksLend Wallet',
  accounts: [
    {
      curve: 'CURVE_SECP256K1',           // Stacks uses secp256k1 (same as Bitcoin/Ethereum)
      pathFormat: 'PATH_FORMAT_BIP32',    // BIP32 hierarchical deterministic
      path: "m/44'/5757'/0'/0/0",         // Stacks BIP44 path (coin type 5757)
      addressFormat: 'ADDRESS_FORMAT_COMPRESSED', // Get compressed public key
    },
  ],
});
```

**Key Points:**
- **Curve**: `CURVE_SECP256K1` - Stacks uses the same elliptic curve as Bitcoin and Ethereum
- **Path**: `m/44'/5757'/0'/0/0` - Stacks coin type is 5757 per [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
- **Address Format**: `ADDRESS_FORMAT_COMPRESSED` - Returns the compressed public key (33 bytes)

### 2. Address Derivation

Turnkey returns a compressed public key (33 bytes, starting with 02 or 03). We manually derive the Stacks address:

```typescript
// src/lib/turnkey-wallet.ts

export function deriveStacksAddress(
  compressedPublicKeyHex: string, 
  isMainnet: boolean = false
): string {
  const cleanHex = compressedPublicKeyHex.replace(/^0x/, '');
  const publicKeyBuffer = Buffer.from(cleanHex, 'hex');
  
  // Verify compressed format (33 bytes, starts with 02 or 03)
  if (publicKeyBuffer.length !== 33 || 
      (publicKeyBuffer[0] !== 0x02 && publicKeyBuffer[0] !== 0x03)) {
    throw new Error('Invalid compressed public key');
  }
  
  // Use Stacks SDK to derive address
  const addressVersion = isMainnet 
    ? AddressVersion.MainnetSingleSig 
    : AddressVersion.TestnetSingleSig;
  
  return publicKeyToAddress(addressVersion, publicKeyBuffer);
}
```

**Result:**
- Testnet addresses start with `ST...`
- Mainnet addresses start with `SP...`

### 3. Transaction Signing

Since Stacks is not natively supported, we use **`signRawPayload`** instead of `signTransaction`:

```typescript
// src/lib/turnkey-stacks.ts

export async function signStacksTransactionWithTurnkey(
  transaction: StacksTransaction,
  signRawPayloadFunction: any,
  walletAccount: any
): Promise<StacksTransaction> {
  // 1. Get transaction hash to sign
  const txHash = transaction.signBegin();
  const messageHash = txHash.toString('hex');
  
  // 2. Sign with Turnkey using raw payload signing
  const { r, s, v } = await signRawPayloadFunction({
    walletAccount,
    payload: messageHash,
    encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
    hashFunction: 'HASH_FUNCTION_NO_OP', // Hash already computed
  });
  
  // 3. Create Stacks-compatible signature
  const signature = {
    data: Buffer.concat([
      Buffer.from(r, 'hex'),
      Buffer.from(s, 'hex'),
    ]),
    type: 0, // Recoverable ECDSA signature
  };
  
  // 4. Append signature to transaction
  transaction.appendSignature(signature);
  
  return transaction;
}
```

**Key Points:**
- **signRawPayload**: Network-agnostic, curve-based signing
- **HASH_FUNCTION_NO_OP**: Stacks SDK already hashes the transaction
- **Recoverable ECDSA**: Stacks uses recoverable signatures (type 0)

---

## Implementation Details

### File Structure

```
src/
├── lib/
│   ├── turnkey-wallet.ts      # Address derivation utilities
│   └── turnkey-stacks.ts      # Transaction building and signing
├── components/
│   ├── Dashboard.tsx          # Derives Stacks address from wallet
│   └── [other components]     # Use signRawPayload for transactions
└── app/
    └── page.tsx               # Creates wallet with custom account
```

### Usage Pattern

#### In Components:

```typescript
import { useTurnkey } from '@turnkey/react-wallet-kit';
import { buildSignAndBroadcast, stxToMicroStx } from '@/lib/turnkey-stacks';
import { getCompressedPublicKey, deriveStacksAddress } from '@/lib/turnkey-wallet';

function MyComponent() {
  const { wallets, signRawPayload } = useTurnkey();
  const walletAccount = wallets[0]?.accounts[0];
  
  // Derive Stacks address
  const compressedPubKey = getCompressedPublicKey(walletAccount);
  const stacksAddress = deriveStacksAddress(compressedPubKey, false);
  
  // Sign and broadcast transaction
  const handleCreateOffer = async () => {
    const txId = await buildSignAndBroadcast(
      stacksAddress,
      'create-offer',
      [
        uintCV(stxToMicroStx(50)),      // amount
        uintCV(1000),                    // interest rate (10%)
        uintCV(4320),                    // max duration (30 days)
        uintCV(15000),                   // min collateral (150%)
      ],
      signRawPayload,
      walletAccount
    );
    
    console.log('Transaction ID:', txId);
  };
}
```

---

## Stacks-Specific Details

### BIP44 Derivation Path

Stacks uses coin type **5757** in the BIP44 path:

```
m / purpose' / coin_type' / account' / change / address_index

m / 44' / 5757' / 0' / 0 / 0
```

- **Purpose**: 44 (BIP44)
- **Coin Type**: 5757 (Stacks)
- **Account**: 0 (first account)
- **Change**: 0 (external chain)
- **Address Index**: 0 (first address)

### Address Format

Stacks addresses use **c32check encoding** (similar to Bitcoin's base58check):

- **Testnet**: Starts with `ST` (version byte 26)
- **Mainnet**: Starts with `SP` (version byte 22)

Example testnet address: `ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG`

### Signature Format

Stacks uses **recoverable ECDSA signatures**:

- **r**: 32 bytes (signature component)
- **s**: 32 bytes (signature component)
- **v**: Recovery ID (not used in Stacks, but returned by Turnkey)
- **Type**: 0 (indicates recoverable ECDSA)

---

## Differences from Native Support

### What We Lose

❌ **Transaction Parsing**: Turnkey can't parse Stacks transactions for policy enforcement  
❌ **Native Transaction Type**: Can't use `TRANSACTION_TYPE_STACKS`  
❌ **Automatic Address Generation**: Must manually derive addresses  

### What We Keep

✅ **Secure Key Storage**: Keys still in Turnkey's secure enclaves  
✅ **Hardware-Backed Security**: Same security guarantees  
✅ **Multiple Auth Methods**: Email OTP, passkeys, OAuth  
✅ **Wallet Export/Import**: Full backup and recovery  
✅ **Audit Logs**: All signing operations logged  

---

## Testing

### 1. Verify Address Derivation

```typescript
// Expected format for testnet
const address = deriveStacksAddress(compressedPubKey, false);
console.assert(address.startsWith('ST'), 'Testnet address should start with ST');
console.assert(address.length === 41, 'Address should be 41 characters');
```

### 2. Test Transaction Signing

```typescript
// Create a simple transaction
const tx = await createOfferTx(stacksAddress, 1000000, 1000, 4320, 15000);

// Sign with Turnkey
const signedTx = await signStacksTransactionWithTurnkey(
  tx,
  signRawPayload,
  walletAccount
);

// Verify signature exists
console.assert(signedTx.auth.spendingCondition.signature, 'Transaction should be signed');
```

### 3. Broadcast and Verify

```typescript
const result = await broadcastTransaction(signedTx, NETWORK);
console.log('Transaction ID:', result.txid);

// Check on explorer
// https://explorer.hiro.so/txid/{txid}?chain=testnet
```

---

## Troubleshooting

### Issue: "Invalid compressed public key"

**Cause**: Turnkey returned uncompressed or incorrect format  
**Solution**: Verify account was created with `ADDRESS_FORMAT_COMPRESSED`

### Issue: "Transaction signature invalid"

**Cause**: Signature format mismatch  
**Solution**: Ensure using `type: 0` for recoverable ECDSA

### Issue: "Address doesn't match expected format"

**Cause**: Wrong network or derivation  
**Solution**: Check `isMainnet` parameter matches `NEXT_PUBLIC_STACKS_NETWORK`

### Issue: "signRawPayload not found"

**Cause**: Using wrong Turnkey hook function  
**Solution**: Import `signRawPayload` from `useTurnkey()`, not `signTransaction`

---

## Future Improvements

### If Turnkey Adds Native Stacks Support

When/if Turnkey adds native Stacks support:

1. **Update wallet creation**:
   ```typescript
   accounts: ['ADDRESS_FORMAT_STACKS']
   ```

2. **Use native signing**:
   ```typescript
   await signTransaction({
     walletAccount,
     unsignedTransaction: txHex,
     transactionType: 'TRANSACTION_TYPE_STACKS',
   });
   ```

3. **Remove manual derivation**:
   - Delete `deriveStacksAddress` function
   - Use `walletAccount.address` directly

### Potential Enhancements

- **Multi-signature support**: Use Turnkey policies for multi-sig
- **Batch transactions**: Sign multiple transactions at once
- **Custom policies**: Implement spending limits via Turnkey policies
- **Hardware wallet integration**: Connect Ledger/Trezor via Turnkey

---

## References

### Turnkey Documentation
- [Wallets Concept](https://docs.turnkey.com/concepts/wallets)
- [Sign Raw Payload](https://docs.turnkey.com/api-reference/activities/sign-raw-payload)
- [React SDK - Signing](https://docs.turnkey.com/sdks/react/signing)

### Stacks Documentation
- [Stacks Transactions](https://docs.stacks.co/docs/write-smart-contracts/transactions)
- [Address Format](https://docs.stacks.co/docs/write-smart-contracts/principals)
- [Signing Transactions](https://docs.stacks.co/docs/write-smart-contracts/signing-transactions)

### Standards
- [BIP44 Specification](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [SLIP-0044 Coin Types](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
- [secp256k1 Curve](https://en.bitcoin.it/wiki/Secp256k1)

---

## Summary

This implementation demonstrates how to integrate Turnkey's secure wallet infrastructure with blockchains that aren't natively supported. By using:

1. **Custom account configuration** with proper BIP44 paths
2. **Manual address derivation** from compressed public keys
3. **Raw payload signing** for transaction signatures

We achieve full Stacks blockchain support while maintaining Turnkey's security guarantees and user experience.

The approach is generalizable to other unsupported chains that use secp256k1 or ed25519 curves.
