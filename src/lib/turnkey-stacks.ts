import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  StacksTransactionWire,
  createMessageSignature,
  makeUnsignedContractCall,
  createStacksPublicKey,
  serializeCV,
  ClarityValue,
} from '@stacks/transactions';
import { 
  STACKS_NETWORK, 
  CONTRACT_ADDRESS, 
  CONTRACT_NAME, 
  STACKS_API_URL,
  DEFAULT_TX_FEE 
} from './config';
import {
  formatSignatureToVRS,
  generatePreSignSigHash,
  signAndBroadcastTransaction,
  type TurnkeySignature,
} from './signing-utils';

export async function getAccountNonce(address: string): Promise<number> {
  const response = await fetch(
    `${STACKS_API_URL}/v2/accounts/${address}?proof=0`
  );
  const data = await response.json();
  return data.nonce;
}

export async function getAccountBalance(address: string): Promise<number> {
  const response = await fetch(
    `${STACKS_API_URL}/extended/v1/address/${address}/balances`
  );
  const data = await response.json();
  return parseInt(data.stx.balance);
}

// Re-export from signing-utils for backward compatibility
export { generatePreSignSigHash } from './signing-utils';

/**
 * Signs the presign-sigHash using Turnkey's signRawPayload
 * 
 * @param preSignSigHash - The presign hash to sign
 * @param httpClient - Turnkey HTTP client with signRawPayload method
 * @param publicKey - The public key to sign with
 * @returns VRS concatenated signature in hex format (130 chars)
 */
export async function signWithTurnkey(
  preSignSigHash: string,
  httpClient: any,
  publicKey: string
): Promise<string> {
  try {
    console.log('=== Turnkey Signing ===');
    console.log('Signing with public key:', publicKey);
    console.log('Payload to sign:', preSignSigHash);

    const payload = preSignSigHash.startsWith('0x') ? preSignSigHash : `0x${preSignSigHash}`;
    
    // Sign using Turnkey's signRawPayload
    const signature = await httpClient.signRawPayload({
      signWith: publicKey,
      payload,
      encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
      hashFunction: 'HASH_FUNCTION_NO_OP',
    });

    console.log('Signature received from Turnkey:');
    console.log(' v:', signature.v);
    console.log(' r:', signature.r);
    console.log(' s:', signature.s);

    // Format signature to VRS (130 chars) - Turnkey provides correct V
    const vrsSignature = formatSignatureToVRS(signature as TurnkeySignature);
    console.log('Returning VRS signature (length:', vrsSignature.length, ')');
    console.log('======================');
    
    return vrsSignature;
  } catch (error) {
    console.error('Turnkey signing error:', error);
    throw new Error(`Failed to sign with Turnkey: ${error}`);
  }
}

/**
 * Creates an unsigned Stacks transaction for Turnkey signing
 * @param publicKey - Compressed public key in hex format (33 bytes)
 * @param address - Stacks address
 * @param functionName - Smart contract function name
 * @param functionArgs - Function arguments as Clarity values
 */
export async function createUnsignedTransaction(
  publicKey: string,
  address: string,
  functionName: string,
  functionArgs: ClarityValue[]
): Promise<StacksTransactionWire> {
  const nonce = await getAccountNonce(address);
  
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs,
    publicKey: publicKey, // Compressed public key from Turnkey
    network: STACKS_NETWORK,
    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,
    nonce: BigInt(nonce),
    fee: DEFAULT_TX_FEE,
    numSignatures: 1,
  };

  // Create unsigned transaction
  const transaction = await makeUnsignedContractCall(txOptions);
  return transaction;
}

/**
 * Signs a Stacks transaction using Turnkey's signRawPayload
 * Implements the complete SIP-005 signing flow
 * 
 * @param transaction - The unsigned Stacks transaction
 * @param httpClient - Turnkey HTTP client with signRawPayload method
 * @param publicKey - The public key to sign with
 * @returns Signed transaction ready for broadcast
 */
export async function signStacksTransactionWithTurnkey(
  transaction: StacksTransactionWire,
  httpClient: any,
  publicKey: string
): Promise<StacksTransactionWire> {
  try {
    console.log('=== Signing Stacks Transaction ===');
    
    // Step 1: Generate presign-sigHash
    const preSignSigHash = generatePreSignSigHash(transaction);
    console.log('Generated presign-sigHash:', preSignSigHash);
    
    // Step 2: Sign with Turnkey
    const nextSig = await signWithTurnkey(preSignSigHash, httpClient, publicKey);
    console.log('Generated signature:', nextSig);
    
    // Step 3: Attach signature to transaction
    if ('signature' in transaction.auth.spendingCondition) {
      transaction.auth.spendingCondition.signature = createMessageSignature(nextSig);
    } else {
      throw new Error('Multi-sig spending conditions are not yet supported');
    }
    
    console.log('✅ Transaction signed successfully');
    return transaction;
  } catch (error) {
    console.error('Transaction signing failed:', error);
    throw new Error(`Failed to sign transaction: ${error}`);
  }
}

/**
 * Broadcasts a signed transaction to the Stacks network
 */
export async function broadcastSignedTransaction(signedTxHex: string): Promise<any> {
  const txBuffer = Buffer.from(signedTxHex, 'hex');
  const response = await fetch(`${STACKS_NETWORK.client.baseUrl}/v2/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: txBuffer,
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Transaction broadcast failed: ${error}`);
  }
  
  return response.json();
}

/**
 * Complete flow: Build, sign, and broadcast a Stacks contract call transaction
 * @param publicKey - Compressed public key from Turnkey (66 hex chars)
 * @param address - Stacks address of the sender
 * @param functionName - Smart contract function name
 * @param functionArgs - Function arguments as Clarity values
 * @param httpClient - Turnkey HTTP client with signRawPayload method
 * @returns Transaction ID
 */
export async function buildSignAndBroadcast(
  publicKey: string,
  address: string,
  functionName: string,
  functionArgs: ClarityValue[],
  httpClient: any
): Promise<string> {
  // Build unsigned transaction
  const unsignedTx = await createUnsignedTransaction(publicKey, address, functionName, functionArgs);
  
  // Create sign function that uses Turnkey
  const signFunction = async (payload: string) => {
    return signWithTurnkey(payload, httpClient, publicKey);
  };
  
  // Sign and broadcast using the generic utility
  const { txId } = await signAndBroadcastTransaction(
    unsignedTx,
    signFunction,
    STACKS_NETWORK.chainId === 1 ? 'mainnet' : 'testnet'
  );
  
  return txId;
}

// Helper functions for contract calls
export async function createOfferTx(
  publicKey: string,
  address: string,
  amount: number,
  interestRate: number,
  maxDuration: number,
  minCollateral: number,
  loanAsset: number = 1, // Default to STX (u1)
  collateralAsset: number = 1 // Default to STX (u1)
) {
  return createUnsignedTransaction(publicKey, address, 'create-offer', [
    uintCV(amount),
    uintCV(interestRate),
    uintCV(maxDuration),
    uintCV(minCollateral),
    uintCV(loanAsset),
    uintCV(collateralAsset),
  ]);
}

export async function createLoanTx(
  publicKey: string,
  address: string,
  amount: number,
  collateral: number,
  interestRate: number,
  duration: number,
  loanAsset: number = 1, // Default to STX (u1)
  collateralAsset: number = 1 // Default to STX (u1)
) {
  return createUnsignedTransaction(publicKey, address, 'create-loan', [
    uintCV(amount),
    uintCV(collateral),
    uintCV(interestRate),
    uintCV(duration),
    uintCV(loanAsset),
    uintCV(collateralAsset),
  ]);
}

export async function acceptOfferTx(
  publicKey: string,
  address: string,
  offerId: number,
  collateral: number,
  duration: number
) {
  return createUnsignedTransaction(publicKey, address, 'accept-offer', [
    uintCV(offerId),
    uintCV(collateral),
    uintCV(duration),
  ]);
}

export async function repayLoanTx(publicKey: string, address: string, loanId: number) {
  return createUnsignedTransaction(publicKey, address, 'repay-loan', [
    uintCV(loanId),
  ]);
}

export async function fundLoanTx(publicKey: string, address: string, loanId: number) {
  return createUnsignedTransaction(publicKey, address, 'fund-loan', [
    uintCV(loanId),
  ]);
}

export async function liquidateLoanTx(publicKey: string, address: string, loanId: number) {
  return createUnsignedTransaction(publicKey, address, 'liquidate-loan', [
    uintCV(loanId),
  ]);
}

export async function cancelOfferTx(publicKey: string, address: string, offerId: number) {
  return createUnsignedTransaction(publicKey, address, 'cancel-offer', [
    uintCV(offerId),
  ]);
}

export function microStxToStx(microStx: number): number {
  return microStx / 1000000;
}

export function stxToMicroStx(stx: number): number {
  return Math.floor(stx * 1000000);
}
