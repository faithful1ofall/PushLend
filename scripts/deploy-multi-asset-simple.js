const {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  getAddressFromPrivateKey,
} = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');
const { mnemonicToSeed } = require('@scure/bip39');
const { HDKey } = require('@scure/bip32');
const fs = require('fs');
const path = require('path');

// Configuration
const NETWORK = STACKS_TESTNET;
const CONTRACT_NAME = 'stackslend-multi-asset';

// Seed phrase from Leather wallet
const SEED_PHRASE = 'mirror obscure response hat track cloud timber conduct video cute business regular';

// Read the contract file
const contractPath = path.join(__dirname, '../contracts/stackslend-multi-asset.clar');
const contractCode = fs.readFileSync(contractPath, 'utf8');

// Derive private key from seed phrase using BIP39/BIP44
async function derivePrivateKeyFromSeed(seedPhrase) {
  // Convert seed phrase to seed
  const seed = await mnemonicToSeed(seedPhrase);
  
  // Create HD key from seed
  const hdKey = HDKey.fromMasterSeed(seed);
  
  // Stacks derivation path: m/44'/5757'/0'/0/0
  // 5757' is the Stacks coin type
  const child = hdKey.derive("m/44'/5757'/0'/0/0");
  
  // Get private key as hex string with compressed suffix
  const privateKeyHex = Buffer.from(child.privateKey).toString('hex') + '01';
  
  return privateKeyHex;
}

async function deployContract() {
  const networkUrl = NETWORK.client?.baseUrl || 'https://api.testnet.hiro.so';
  
  console.log('🚀 Deploying StacksLend Multi-Asset contract to testnet...\n');
  console.log('Contract Name:', CONTRACT_NAME);
  console.log('Network:', networkUrl);
  console.log('Contract Size:', contractCode.length, 'bytes\n');

  try {
    // Derive private key from seed phrase
    console.log('Deriving private key from seed phrase...');
    const privateKeyHex = await derivePrivateKeyFromSeed(SEED_PHRASE);
    
    // Get address from private key
    const address = getAddressFromPrivateKey(privateKeyHex, 'testnet');
    
    console.log('Deployer Address:', address);
    
    // Get account nonce
    const accountUrl = `${networkUrl}/v2/accounts/${address}?proof=0`;
    
    console.log('Fetching account info...');
    const accountResponse = await fetch(accountUrl);
    const accountData = await accountResponse.json();
    const nonce = accountData.nonce;
    
    console.log('Account Nonce:', nonce);
    console.log('Account Balance:', accountData.balance, 'microSTX\n');

    // Check if we have enough balance
    const balance = parseInt(accountData.balance);
    if (balance < 1000000) { // Less than 1 STX
      console.error('❌ Insufficient balance!');
      console.error('Please get testnet STX from: https://explorer.hiro.so/sandbox/faucet?chain=testnet');
      console.error('Your address:', address);
      process.exit(1);
    }

    // Create deployment transaction
    console.log('Creating deployment transaction...');
    const txOptions = {
      contractName: CONTRACT_NAME,
      codeBody: contractCode,
      senderKey: privateKeyHex,
      network: NETWORK,
      anchorMode: AnchorMode.OnChainOnly,
      postConditionMode: PostConditionMode.Allow,
      nonce: BigInt(nonce),
      fee: BigInt(500000), // 0.5 STX fee
    };

    const transaction = await makeContractDeploy(txOptions);
    
    console.log('Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction({
      transaction: transaction,
      network: NETWORK
    });
    
    if (broadcastResponse.error) {
      console.error('❌ Deployment failed!');
      console.error('Error:', broadcastResponse.error);
      console.error('Reason:', broadcastResponse.reason);
      process.exit(1);
    }

    console.log('\n✅ Contract deployed successfully!\n');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log('Contract Address:', `${address}.${CONTRACT_NAME}`);
    console.log('\n📍 View on Explorer:');
    console.log(`https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
    console.log(`https://explorer.hiro.so/txid/${address}.${CONTRACT_NAME}?chain=testnet`);
    
    console.log('\n⏳ Waiting for confirmation (~30 seconds)...');
    console.log('Once confirmed, update your .env.local with:');
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
    console.log(`NEXT_PUBLIC_CONTRACT_NAME=${CONTRACT_NAME}`);

    // Save deployment info
    const deploymentInfo = {
      contractName: CONTRACT_NAME,
      contractAddress: `${address}.${CONTRACT_NAME}`,
      deployerAddress: address,
      transactionId: broadcastResponse.txid,
      network: 'testnet',
      timestamp: new Date().toISOString(),
      explorerUrl: `https://explorer.hiro.so/txid/${address}.${CONTRACT_NAME}?chain=testnet`,
    };

    fs.writeFileSync(
      path.join(__dirname, '../deployment-info.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('\n💾 Deployment info saved to deployment-info.json');

  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    if (error.response) {
      console.error('Response:', await error.response.text());
    }
    process.exit(1);
  }
}

// Run deployment
deployContract();
