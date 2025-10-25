import {
  makeContractCall,
  makeUnsignedContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  fetchCallReadOnlyFunction,
  ClarityValue,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { ASSET_STX, ASSET_SBTC } from './sbtc';
import { signAndBroadcastTransaction } from './signing-utils';
import type { TurnkeyContext } from './wallet';

const NETWORK = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' 
  ? STACKS_MAINNET 
  : STACKS_TESTNET;

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'stackslend-multi-asset';

export async function getAccountNonce(address: string): Promise<number> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_STACKS_API_URL}/v2/accounts/${address}?proof=0`
  );
  const data = await response.json();
  return data.nonce;
}

async function getAddressFromPrivateKey(privateKey: string): Promise<string> {
  const { privateKeyToAddress } = await import('@stacks/transactions');
  const isMainnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet';
  return privateKeyToAddress(privateKey, isMainnet ? 'mainnet' : 'testnet');
}

// Create a loan offer with asset selection (Turnkey version)
export async function createOfferMultiAssetWithTurnkey(
  address: string,
  turnkey: TurnkeyContext,
  amount: number,
  interestRate: number,
  maxDuration: number,
  minCollateralRatio: number,
  loanAsset: number, // ASSET_STX or ASSET_SBTC
  collateralAsset: number // ASSET_STX or ASSET_SBTC
) {
  const nonce = await getAccountNonce(address);
  
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-offer',
    functionArgs: [
      uintCV(amount),
      uintCV(interestRate),
      uintCV(maxDuration),
      uintCV(minCollateralRatio),
      uintCV(loanAsset),
      uintCV(collateralAsset),
    ],
    publicKey: turnkey.publicKey,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    nonce: BigInt(nonce),
    fee: BigInt(10000),
  };

  const transaction = await makeUnsignedContractCall(txOptions);
  
  // Sign with Turnkey
  const signFunction = async (payload: string) => {
    const { signWithTurnkey } = await import('./turnkey-stacks');
    return signWithTurnkey(payload, turnkey.httpClient, turnkey.publicKey);
  };
  
  const networkType = NETWORK.chainId === 1 ? 'mainnet' : 'testnet';
  const { txId } = await signAndBroadcastTransaction(transaction, signFunction, networkType);
  
  return { txid: txId };
}

// Create a loan offer with asset selection (Legacy version with private key)
export async function createOfferMultiAsset(
  privateKey: string,
  amount: number,
  interestRate: number,
  maxDuration: number,
  minCollateralRatio: number,
  loanAsset: number, // ASSET_STX or ASSET_SBTC
  collateralAsset: number // ASSET_STX or ASSET_SBTC
) {
  const address = await getAddressFromPrivateKey(privateKey);
  const nonce = await getAccountNonce(address);
  
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-offer',
    functionArgs: [
      uintCV(amount),
      uintCV(interestRate),
      uintCV(maxDuration),
      uintCV(minCollateralRatio),
      uintCV(loanAsset),
      uintCV(collateralAsset),
    ],
    senderKey: privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    nonce: BigInt(nonce),
    fee: BigInt(10000),
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network: NETWORK });
  return result;
}

// Accept a loan offer (Turnkey version)
export async function acceptOfferMultiAssetWithTurnkey(
  address: string,
  turnkey: TurnkeyContext,
  offerId: number,
  collateralAmount: number,
  duration: number
) {
  const nonce = await getAccountNonce(address);
  
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'accept-offer',
    functionArgs: [
      uintCV(offerId),
      uintCV(collateralAmount),
      uintCV(duration),
    ],
    publicKey: turnkey.publicKey,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    nonce: BigInt(nonce),
    fee: BigInt(10000),
  };

  const transaction = await makeUnsignedContractCall(txOptions);
  
  const signFunction = async (payload: string) => {
    const { signWithTurnkey } = await import('./turnkey-stacks');
    return signWithTurnkey(payload, turnkey.httpClient, turnkey.publicKey);
  };
  
  const networkType = NETWORK.chainId === 1 ? 'mainnet' : 'testnet';
  const { txId } = await signAndBroadcastTransaction(transaction, signFunction, networkType);
  
  return { txid: txId };
}

// Accept a loan offer (Legacy version)
export async function acceptOfferMultiAsset(
  privateKey: string,
  offerId: number,
  collateralAmount: number,
  duration: number
) {
  const address = await getAddressFromPrivateKey(privateKey);
  const nonce = await getAccountNonce(address);
  
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'accept-offer',
    functionArgs: [
      uintCV(offerId),
      uintCV(collateralAmount),
      uintCV(duration),
    ],
    senderKey: privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    nonce: BigInt(nonce),
    fee: BigInt(10000),
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network: NETWORK });
  return result;
}

// Create a loan request with asset selection
export async function createLoanRequestMultiAsset(
  privateKey: string,
  amount: number,
  collateralAmount: number,
  interestRate: number,
  duration: number,
  loanAsset: number,
  collateralAsset: number
) {
  const address = await getAddressFromPrivateKey(privateKey);
  const nonce = await getAccountNonce(address);
  
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-loan-request',
    functionArgs: [
      uintCV(amount),
      uintCV(collateralAmount),
      uintCV(interestRate),
      uintCV(duration),
      uintCV(loanAsset),
      uintCV(collateralAsset),
    ],
    senderKey: privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    nonce: BigInt(nonce),
    fee: BigInt(10000),
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network: NETWORK });
  return result;
}

// Fund a loan request
export async function fundLoanMultiAsset(
  privateKey: string,
  loanId: number
) {
  const address = await getAddressFromPrivateKey(privateKey);
  const nonce = await getAccountNonce(address);
  
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'fund-loan',
    functionArgs: [uintCV(loanId)],
    senderKey: privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    nonce: BigInt(nonce),
    fee: BigInt(10000),
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network: NETWORK });
  return result;
}

// Repay a loan
export async function repayLoanMultiAsset(
  privateKey: string,
  loanId: number
) {
  const address = await getAddressFromPrivateKey(privateKey);
  const nonce = await getAccountNonce(address);
  
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'repay-loan',
    functionArgs: [uintCV(loanId)],
    senderKey: privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    nonce: BigInt(nonce),
    fee: BigInt(10000),
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network: NETWORK });
  return result;
}

// Liquidate a loan
export async function liquidateLoanMultiAsset(
  privateKey: string,
  loanId: number
) {
  const address = await getAddressFromPrivateKey(privateKey);
  const nonce = await getAccountNonce(address);
  
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'liquidate-loan',
    functionArgs: [uintCV(loanId)],
    senderKey: privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    nonce: BigInt(nonce),
    fee: BigInt(10000),
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network: NETWORK });
  return result;
}

// Cancel an offer
export async function cancelOfferMultiAsset(
  privateKey: string,
  offerId: number
) {
  const address = await getAddressFromPrivateKey(privateKey);
  const nonce = await getAccountNonce(address);
  
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'cancel-offer',
    functionArgs: [uintCV(offerId)],
    senderKey: privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    nonce: BigInt(nonce),
    fee: BigInt(10000),
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction({ transaction, network: NETWORK });
  return result;
}

// Read-only functions

export async function getOfferMultiAsset(offerId: number): Promise<any> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-offer',
    functionArgs: [uintCV(offerId)],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  
  return result;
}

export async function getLoanMultiAsset(loanId: number): Promise<any> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-loan',
    functionArgs: [uintCV(loanId)],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  
  return result;
}

export async function getOfferCountMultiAsset(): Promise<any> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-offer-count',
    functionArgs: [],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  
  return result;
}

export async function getLoanCountMultiAsset(): Promise<any> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-loan-count',
    functionArgs: [],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  
  return result;
}

export async function getUserStatsMultiAsset(address: string): Promise<any> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-user-stats',
    functionArgs: [principalCV(address)],
    network: NETWORK,
    senderAddress: address,
  });
  
  return result;
}

// Alias for backward compatibility
export const getCreditScoreMultiAsset = getUserStatsMultiAsset;
