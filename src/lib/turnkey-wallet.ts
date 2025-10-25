import { 
  getAddressFromPublicKey,
 // TransactionVersion,
} from '@stacks/transactions';
import { hexToBytes } from '@stacks/common';

export interface TurnkeyWalletData {
  address: string;
  walletId: string;
  accountId: string;
  publicKey: string;
}

/**
 * Derives Stacks address from a public key
 * Uses the same method as the reference implementation
 * 
 * @param publicKeyHex - Public key in hex format (66 hex chars for compressed key)
 * @param isMainnet - Whether to generate mainnet (SP) or testnet (ST) address (defaults to testnet)
 * @returns Stacks address (ST... for testnet, SP... for mainnet)
 */
export function deriveStacksAddress(publicKeyHex: string, isMainnet: boolean = false): string {
  // Remove '0x' prefix if present
  const cleanHex = publicKeyHex.replace(/^0x/, '');
  
  console.log('=== Address Derivation Debug ===');
  console.log('Input public key:', publicKeyHex);
  console.log('Cleaned hex:', cleanHex);
  console.log('Length:', cleanHex.length);
  console.log('Prefix:', cleanHex.substring(0, 2));
  console.log('Is mainnet:', isMainnet);
  
  // Validate public key format (should be 66 hex chars for compressed key)
  if (cleanHex.length !== 66) {
    throw new Error(`Invalid public key length: expected 66 hex characters, got ${cleanHex.length}`);
  }
  
  // Verify it starts with 02 or 03 (compressed public key prefix)
  if (!cleanHex.startsWith('02') && !cleanHex.startsWith('03')) {
    throw new Error(`Invalid compressed public key prefix: expected 02 or 03, got ${cleanHex.substring(0, 2)}`);
  }
  
  // Use getAddressFromPublicKey directly (same as reference implementation)
  const transactionVersion = isMainnet ? "mainnet" : "testnet";
  console.log('Transaction version:', transactionVersion);

  const address = getAddressFromPublicKey(hexToBytes(cleanHex), transactionVersion);
  
 // const address = getAddressFromPublicKey(cleanHex, transactionVersion);
  console.log('Derived address:', address);
  console.log('=== End Debug ===');
  
  return address;
}

/**
 * Extracts the public key from a Turnkey wallet account
 * Turnkey provides the public key in the publicKey field
 * 
 * @param walletAccount - Turnkey wallet account object
 * @returns Public key in hex format (66 hex chars)
 */
export function getPublicKey(walletAccount: any): string {
  if (!walletAccount.publicKey) {
    throw new Error('Public key not found in wallet account');
  }
  return walletAccount.publicKey;
}

/**
 * Converts Turnkey wallet account to StacksLend wallet format with derived Stacks address
 */
export function turnkeyAccountToStacksWallet(
  walletId: string,
  accountId: string,
  publicKey: string,
  isMainnet: boolean = false
): TurnkeyWalletData {
  const stacksAddress = deriveStacksAddress(publicKey, isMainnet);
  
  return {
    address: stacksAddress,
    walletId,
    accountId,
    publicKey,
  };
}
