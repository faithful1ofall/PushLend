import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  fetchCallReadOnlyFunction,
  ClarityValue,
  noneCV,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

const NETWORK = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' 
  ? STACKS_MAINNET 
  : STACKS_TESTNET;

// sBTC token contract (testnet - update with actual deployed contract)
const SBTC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const SBTC_CONTRACT_NAME = process.env.NEXT_PUBLIC_SBTC_CONTRACT_NAME || 'sbtc-token';

// Asset type constants (must match contract)
export const ASSET_STX = 1;
export const ASSET_SBTC = 2;

export function getAssetName(assetType: number): string {
  switch (assetType) {
    case ASSET_STX:
      return 'STX';
    case ASSET_SBTC:
      return 'sBTC';
    default:
      return 'Unknown';
  }
}

export function getAssetDecimals(assetType: number): number {
  switch (assetType) {
    case ASSET_STX:
      return 6; // microSTX
    case ASSET_SBTC:
      return 8; // satoshis
    default:
      return 6;
  }
}

export function formatAssetAmount(amount: number, assetType: number): string {
  const decimals = getAssetDecimals(assetType);
  const divisor = Math.pow(10, decimals);
  return (amount / divisor).toFixed(decimals);
}

export function parseAssetAmount(amount: string, assetType: number): number {
  const decimals = getAssetDecimals(assetType);
  const multiplier = Math.pow(10, decimals);
  return Math.floor(parseFloat(amount) * multiplier);
}

// Get sBTC balance for an address
export async function getSbtcBalance(address: string): Promise<number> {
  try {
    // Validate address format (must be c32 format starting with S for testnet or SP for mainnet)
    if (!address.startsWith('S')) {
      console.error('Invalid Stacks address format:', address);
      console.error('Address must be in c32 format (starting with S for testnet or SP for mainnet)');
      return 0;
    }

    const result = await fetchCallReadOnlyFunction({
      contractAddress: SBTC_CONTRACT_ADDRESS,
      contractName: SBTC_CONTRACT_NAME,
      functionName: 'get-balance',
      functionArgs: [principalCV(address)],
      network: NETWORK,
      senderAddress: address,
    });

    // Parse the result - should be (ok uint) or (err ...)
    const resultValue = result as any;
    if (resultValue.type === 'ok') {
      return parseInt(resultValue.value.value);
    }
    return 0;
  } catch (error) {
    console.error('Failed to get sBTC balance:', error);
    return 0;
  }
}

// Get STX balance (from existing stacks.ts)
export async function getStxBalance(address: string): Promise<number> {
  try {
    // Validate address format
    if (!address.startsWith('S')) {
      console.error('Invalid Stacks address format:', address);
      console.error('Address must be in c32 format (starting with S for testnet or SP for mainnet)');
      return 0;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STACKS_API_URL}/extended/v1/address/${address}/balances`
    );
    const data = await response.json();
    return parseInt(data.stx.balance);
  } catch (error) {
    console.error('Failed to get STX balance:', error);
    return 0;
  }
}

// Get balance for any asset type
export async function getAssetBalance(address: string, assetType: number): Promise<number> {
  if (assetType === ASSET_STX) {
    return getStxBalance(address);
  } else if (assetType === ASSET_SBTC) {
    return getSbtcBalance(address);
  }
  return 0;
}

// Transfer sBTC tokens (for testing/faucet purposes)
export async function transferSbtc(
  privateKey: string,
  amount: number,
  recipient: string
): Promise<string> {
  const txOptions = {
    contractAddress: SBTC_CONTRACT_ADDRESS,
    contractName: SBTC_CONTRACT_NAME,
    functionName: 'transfer',
    functionArgs: [
      uintCV(amount),
      principalCV(recipient),
      noneCV(), // memo
    ],
    senderKey: privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction({ transaction, network: NETWORK });
  
  if ('error' in broadcastResponse) {
    throw new Error(broadcastResponse.error);
  }
  
  return broadcastResponse.txid;
}

// Helper to check if sBTC contract is deployed
export async function isSbtcDeployed(): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STACKS_API_URL}/v2/contracts/interface/${SBTC_CONTRACT_ADDRESS}/${SBTC_CONTRACT_NAME}`
    );
    return response.ok;
  } catch (error) {
    console.error('Failed to check sBTC deployment:', error);
    return false;
  }
}

// Get sBTC contract info
export function getSbtcContractInfo() {
  return {
    address: SBTC_CONTRACT_ADDRESS,
    name: SBTC_CONTRACT_NAME,
    fullId: `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}`,
  };
}
