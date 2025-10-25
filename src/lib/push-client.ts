import { ethers } from 'ethers';
import { PUSH_NETWORK_CONFIG, CONTRACT_ADDRESSES, PUSHLEND_ABI } from './push-config';

// Get provider
export function getProvider() {
  return new ethers.JsonRpcProvider(PUSH_NETWORK_CONFIG.rpcUrl);
}

// Get signer from private key (for testing)
export function getSigner(privateKey?: string) {
  const provider = getProvider();
  if (privateKey) {
    return new ethers.Wallet(privateKey, provider);
  }
  throw new Error('Private key required');
}

// Get contract instance
export function getPushLendContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.pushLend,
    PUSHLEND_ABI,
    signerOrProvider
  );
}

// Format PC (18 decimals)
export function formatPC(value: bigint | string): string {
  return ethers.formatEther(value);
}

// Parse PC to wei
export function parsePC(value: string): bigint {
  return ethers.parseEther(value);
}

// Get balance
export async function getBalance(address: string): Promise<string> {
  const provider = getProvider();
  const balance = await provider.getBalance(address);
  return formatPC(balance);
}

// Loan operations
export async function createOffer(
  signer: ethers.Signer,
  amount: string,
  interestRate: number,
  maxDuration: number,
  minCollateralRatio: number
) {
  const contract = getPushLendContract(signer);
  const amountWei = parsePC(amount);
  const tx = await contract.createOffer(
    amountWei,
    interestRate,
    maxDuration,
    minCollateralRatio
  );
  return await tx.wait();
}

export async function acceptOffer(
  signer: ethers.Signer,
  offerId: number,
  duration: number,
  collateralAmount: string
) {
  const contract = getPushLendContract(signer);
  const collateralWei = parsePC(collateralAmount);
  const tx = await contract.acceptOffer(offerId, duration, {
    value: collateralWei,
  });
  return await tx.wait();
}

export async function createLoanRequest(
  signer: ethers.Signer,
  amount: string,
  interestRate: number,
  duration: number,
  collateralAmount: string
) {
  const contract = getPushLendContract(signer);
  const amountWei = parsePC(amount);
  const collateralWei = parsePC(collateralAmount);
  const tx = await contract.createLoanRequest(amountWei, interestRate, duration, {
    value: collateralWei,
  });
  return await tx.wait();
}

export async function fundLoan(signer: ethers.Signer, loanId: number, amount: string) {
  const contract = getPushLendContract(signer);
  const amountWei = parsePC(amount);
  const tx = await contract.fundLoan(loanId, { value: amountWei });
  return await tx.wait();
}

export async function repayLoan(signer: ethers.Signer, loanId: number, amount: string) {
  const contract = getPushLendContract(signer);
  const amountWei = parsePC(amount);
  const tx = await contract.repayLoan(loanId, { value: amountWei });
  return await tx.wait();
}

export async function liquidateLoan(signer: ethers.Signer, loanId: number) {
  const contract = getPushLendContract(signer);
  const tx = await contract.liquidateLoan(loanId);
  return await tx.wait();
}

export async function cancelOffer(signer: ethers.Signer, offerId: number) {
  const contract = getPushLendContract(signer);
  const tx = await contract.cancelOffer(offerId);
  return await tx.wait();
}

// Read functions
export async function getLoan(loanId: number) {
  const provider = getProvider();
  const contract = getPushLendContract(provider);
  return await contract.getLoan(loanId);
}

export async function getOffer(offerId: number) {
  const provider = getProvider();
  const contract = getPushLendContract(provider);
  return await contract.getOffer(offerId);
}

export async function getCreditScore(address: string) {
  const provider = getProvider();
  const contract = getPushLendContract(provider);
  return await contract.getCreditScore(address);
}

export async function calculateTotalRepayment(loanId: number) {
  const provider = getProvider();
  const contract = getPushLendContract(provider);
  const amount = await contract.calculateTotalRepayment(loanId);
  return formatPC(amount);
}

export async function isLoanLiquidatable(loanId: number) {
  const provider = getProvider();
  const contract = getPushLendContract(provider);
  return await contract.isLoanLiquidatable(loanId);
}

export async function getLoanCounter() {
  const provider = getProvider();
  const contract = getPushLendContract(provider);
  return await contract.loanCounter();
}

export async function getOfferCounter() {
  const provider = getProvider();
  const contract = getPushLendContract(provider);
  return await contract.offerCounter();
}

export async function getPlatformFeeRate() {
  const provider = getProvider();
  const contract = getPushLendContract(provider);
  return await contract.platformFeeRate();
}

export async function getMinCollateralRatio() {
  const provider = getProvider();
  const contract = getPushLendContract(provider);
  return await contract.minCollateralRatio();
}

export async function getLiquidationThreshold() {
  const provider = getProvider();
  const contract = getPushLendContract(provider);
  return await contract.liquidationThreshold();
}
