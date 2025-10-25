import { 
  randomPrivateKey,
  privateKeyToPublic,
  privateKeyToAddress,
  publicKeyToHex,
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

export interface TurnkeyContext {
  httpClient: any;
  publicKey: string;
  walletId: string;
}

export interface WalletData {
  address: string;
  privateKey?: string; // Optional for backward compatibility
  publicKey: string;
  turnkey?: TurnkeyContext; // Turnkey signing context
}

export function generateWallet(): WalletData {
  const privateKeyHex = randomPrivateKey();
  return restoreWallet(privateKeyHex);
}

export function restoreWallet(privateKeyHex: string): WalletData {
  const publicKey = privateKeyToPublic(privateKeyHex);
  const publicKeyHexStr = publicKeyToHex(publicKey);
  
  // Use testnet address version
  const isMainnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet';
  const address = privateKeyToAddress(privateKeyHex, isMainnet ? 'mainnet' : 'testnet');
  
  return {
    address,
    privateKey: privateKeyHex,
    publicKey: publicKeyHexStr,
  };
}

export function saveWalletToStorage(wallet: WalletData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('stackslend_wallet', JSON.stringify(wallet));
  }
}

export function loadWalletFromStorage(): WalletData | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('stackslend_wallet');
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return null;
}

export function clearWalletFromStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('stackslend_wallet');
  }
}

// Import wallet from seed phrase (using the provided Leather wallet seed)
export function importFromSeedPhrase(seedPhrase: string): WalletData {
  // For demo purposes, we'll derive a key from the seed phrase
  // In production, use proper BIP39/BIP44 derivation
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(seedPhrase).digest();
  const privateKey = hash.toString('hex');
  
  return restoreWallet(privateKey);
}
