/**
 * StacksLend Configuration
 * Centralized configuration for network, contracts, and Turnkey settings
 */

import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import type { StacksNetwork } from '@stacks/network';

// Network Configuration
export const IS_MAINNET = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet';
export const IS_TESTNET = !IS_MAINNET;

export const STACKS_NETWORK: StacksNetwork = IS_MAINNET 
  ? STACKS_MAINNET 
  : STACKS_TESTNET;

export const STACKS_API_URL = process.env.NEXT_PUBLIC_STACKS_API_URL || 'https://api.testnet.hiro.so';

// Contract Configuration
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'stackslend-simple';

// Turnkey Configuration
export const TURNKEY_ORGANIZATION_ID = process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID || '';
export const TURNKEY_AUTH_PROXY_CONFIG_ID = process.env.NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID || '';

// Stacks BIP44 Derivation Path
// m/44'/5757'/0'/0/0 is the standard Stacks derivation path
export const STACKS_DERIVATION_PATH = "m/44'/5757'/0'/0/0";

// Transaction Configuration
export const DEFAULT_TX_FEE = BigInt(10000); // 0.01 STX in microSTX
export const DEFAULT_TX_TIMEOUT = 30000; // 30 seconds

// Testnet Faucet
export const TESTNET_FAUCET_URL = 'https://explorer.hiro.so/sandbox/faucet?chain=testnet';

// Explorer URLs
export const EXPLORER_TX_URL = IS_MAINNET
  ? 'https://explorer.hiro.so/txid'
  : 'https://explorer.hiro.so/txid?chain=testnet';

export const EXPLORER_ADDRESS_URL = IS_MAINNET
  ? 'https://explorer.hiro.so/address'
  : 'https://explorer.hiro.so/address?chain=testnet';

// Validation
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!CONTRACT_ADDRESS) {
    errors.push('NEXT_PUBLIC_CONTRACT_ADDRESS is not set');
  }

  if (!TURNKEY_ORGANIZATION_ID) {
    errors.push('NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID is not set');
  }

  if (!TURNKEY_AUTH_PROXY_CONFIG_ID) {
    errors.push('NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID is not set');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Log configuration on startup (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('StacksLend Configuration:', {
    network: IS_MAINNET ? 'mainnet' : 'testnet',
    apiUrl: STACKS_API_URL,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
  });

  const validation = validateConfig();
  if (!validation.valid) {
    console.warn('⚠️ Configuration warnings:', validation.errors);
  }
}
