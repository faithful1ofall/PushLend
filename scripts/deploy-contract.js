const {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
} = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const fs = require('fs');
const path = require('path');

// Configuration
const NETWORK = new StacksTestnet();
const CONTRACT_NAME = 'stackslend-simple';

// Read the contract file
const contractPath = path.join(__dirname, '../contracts/stackslend-simple.clar');
const contractCode = fs.readFileSync(contractPath, 'utf8');

// Get private key from environment or use the provided seed phrase derived key
// For the provided seed phrase, we'll use a derived private key
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || 
  'bbfcad5b5243bc6e3cd7955215f493eb21a0df6f390cddbcbfd3d0037dd4f71d01'; // Derived from seed

async function deployContract() {
  console.log('🚀 Deploying StacksLend contract to testnet...\n');
  console.log('Contract Name:', CONTRACT_NAME);
  console.log('Network:', NETWORK.coreApiUrl);
  console.log('Contract Size:', contractCode.length, 'bytes\n');

  try {
    // Get account nonce
    const address = 'STJ9PXFC7SDXAVT0GF3BDKE2GSP496NAE0J74W9X'; // Address from seed
    const accountUrl = `${NETWORK.coreApiUrl}/v2/accounts/${address}?proof=0`;
    
    console.log('Fetching account info...');
    const accountResponse = await fetch(accountUrl);
    const accountData = await accountResponse.json();
    const nonce = accountData.nonce;
    
    console.log('Account Address:', address);
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
      senderKey: PRIVATE_KEY,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      nonce: BigInt(nonce),
      fee: BigInt(500000), // 0.5 STX fee
    };

    const transaction = await makeContractDeploy(txOptions);
    
    console.log('Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction(transaction, NETWORK);
    
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
