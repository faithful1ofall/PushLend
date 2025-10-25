import { usePushWalletContext, usePushChainClient, PushUI } from '@pushchain/ui-kit';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, PUSH_NETWORK_CONFIG, PUSHLEND_ABI } from '@/lib/push-config';

export function useLendingContract() {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient, isInitialized } = usePushChainClient();

  const getProvider = () => {
    return new ethers.JsonRpcProvider(PUSH_NETWORK_CONFIG.rpcUrl);
  };

  const getContract = async () => {
    const provider = getProvider();
    return new ethers.Contract(
      CONTRACT_ADDRESSES.pushLend,
      PUSHLEND_ABI,
      provider
    );
  };

  const getContractWithSigner = async () => {
    if (!pushChainClient || !isInitialized) {
      throw new Error('Wallet not connected');
    }

    const provider = getProvider();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.pushLend,
      PUSHLEND_ABI,
      provider
    );

    return contract;
  };

  const sendTransaction = async (txData: any) => {
    if (!pushChainClient || !isInitialized) {
      throw new Error('Wallet not connected');
    }

    return await pushChainClient.universal.sendTransaction(txData);
  };

  return {
    getProvider,
    getContract,
    getContractWithSigner,
    sendTransaction,
    pushChainClient,
    isInitialized,
    isConnected: connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED,
    userAddress: pushChainClient?.universal?.account || null
  };
}
