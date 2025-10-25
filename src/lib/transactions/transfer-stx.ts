import {
  makeUnsignedSTXTokenTransfer,
  StacksTransactionWire,
} from '@stacks/transactions';
import { signAndBroadcastTransaction } from '../signing-utils';

/**
 * Complete flow: construct, sign, and broadcast a Stacks STX transfer transaction
 */
export interface SignAndBroadcastSTXParams {
  recipientAddress: string;
  amount: bigint;
  senderAddress: string;
  publicKey: string;
  network: 'testnet' | 'mainnet';
  fee?: bigint;
  memo?: string;
  signFunction: (payload: string) => Promise<string>;
}

export async function signAndBroadcastStacksTransaction(
  params: SignAndBroadcastSTXParams
): Promise<{ txId: string; transaction: StacksTransactionWire }> {
  const {
    recipientAddress,
    amount,
    publicKey,
    network,
    fee,
    memo,
    signFunction,
  } = params;

  try {
    console.log('=== Starting Stacks STX Transfer Flow ===');
    console.log('Recipient:', recipientAddress);
    console.log('Amount:', amount.toString(), 'microSTX');
    console.log('Network:', network);
    console.log('Public Key (for transaction):', publicKey);
    console.log('Public Key length:', publicKey.length);
    console.log('Fee:', (fee || BigInt(14640)).toString());

    // 1. Construct unsigned transaction
    console.log('\nStep 1: Constructing unsigned transaction...');
    
    const transaction = await makeUnsignedSTXTokenTransfer({
      recipient: recipientAddress,
      amount,
      publicKey: publicKey,
      network: network,
      fee: fee || BigInt(14640),
      memo: memo || '',
    });

    console.log('✅ Transaction constructed successfully');

    // 2-4. Sign and broadcast using core utilities
    return await signAndBroadcastTransaction(transaction, signFunction, network);
  } catch (error) {
    console.error('Error in signAndBroadcastStacksTransaction:', error);
    throw error;
  }
}
