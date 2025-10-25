import {
  makeContractCall,
  makeSTXTokenTransfer,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  boolCV,
  cvToJSON,
  fetchCallReadOnlyFunction,
  ClarityValue,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

const NETWORK = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' 
  ? STACKS_MAINNET 
  : STACKS_TESTNET;

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'stackslend-simple';

export async function getAccountNonce(address: string): Promise<number> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_STACKS_API_URL}/v2/accounts/${address}?proof=0`
  );
  const data = await response.json();
  return data.nonce;
}

export async function getAccountBalance(address: string): Promise<number> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_STACKS_API_URL}/extended/v1/address/${address}/balances`
  );
  const data = await response.json();
  return parseInt(data.stx.balance);
}

// Contract call functions

export async function createOffer(
  privateKey: string,
  amount: number,
  interestRate: number,
  maxDuration: number,
  minCollateral: number,
  loanAsset: number = 1, // Default to STX (u1)
  collateralAsset: number = 1 // Default to STX (u1)
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
      uintCV(minCollateral),
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

async function getAddressFromPrivateKey(privateKey: string): Promise<string> {
  const { privateKeyToAddress } = await import('@stacks/transactions');
  const isMainnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet';
  return privateKeyToAddress(privateKey, isMainnet ? 'mainnet' : 'testnet');
}

export async function createLoan(
  privateKey: string,
  amount: number,
  collateral: number,
  interestRate: number,
  duration: number,
  loanAsset: number = 1, // Default to STX (u1)
  collateralAsset: number = 1 // Default to STX (u1)
) {
  const address = await getAddressFromPrivateKey(privateKey);
  const nonce = await getAccountNonce(address);
  
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-loan',
    functionArgs: [
      uintCV(amount),
      uintCV(collateral),
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

export async function fundLoan(privateKey: string, loanId: number) {
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

export async function repayLoan(privateKey: string, loanId: number) {
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

export async function liquidateLoan(privateKey: string, loanId: number) {
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

export async function cancelOffer(privateKey: string, offerId: number) {
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

// Direct STX transfer function
export async function sendSTX(
  privateKey: string,
  recipient: string,
  amount: number,
  memo?: string
) {
  const address = await getAddressFromPrivateKey(privateKey);
  const nonce = await getAccountNonce(address);
  
  const txOptions = {
    recipient,
    amount: BigInt(amount),
    senderKey: privateKey,
    network: NETWORK,
    memo: memo || '',
    nonce: BigInt(nonce),
    fee: BigInt(10000),
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeSTXTokenTransfer(txOptions);
  const result = await broadcastTransaction({ transaction, network: NETWORK });
  return result;
}

// Read-only functions

export async function getLoan(loanId: number) {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-loan',
    functionArgs: [uintCV(loanId)],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  
  return cvToJSON(result);
}

export async function getOffer(offerId: number) {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-offer',
    functionArgs: [uintCV(offerId)],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  
  return cvToJSON(result);
}

export async function getUserStats(address: string) {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-user-stats',
    functionArgs: [principalCV(address)],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  
  return cvToJSON(result);
}

export async function getLoanCount() {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-loan-count',
    functionArgs: [],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  
  return cvToJSON(result);
}

export async function getOfferCount() {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-offer-count',
    functionArgs: [],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  
  return cvToJSON(result);
}

// Helper to calculate interest (client-side)
export function calculateInterest(amount: number, rate: number, durationBlocks: number): number {
  // Interest = amount * rate * duration / (365 * 144 * 10000)
  return Math.floor((amount * rate * durationBlocks) / 52560000);
}

// Helper to calculate total repayment (client-side)
export function calculateTotalRepayment(amount: number, rate: number, durationBlocks: number): number {
  const interest = calculateInterest(amount, rate, durationBlocks);
  return amount + interest;
}

export function microStxToStx(microStx: number): number {
  return microStx / 1000000;
}

export function stxToMicroStx(stx: number): number {
  return Math.floor(stx * 1000000);
}
