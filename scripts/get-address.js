const {
  createStacksPrivateKey,
  getPublicKey,
  publicKeyToAddress,
  AddressVersion,
} = require('@stacks/transactions');

const PRIVATE_KEY = 'bbfcad5b5243bc6e3cd7955215f493eb21a0df6f390cddbcbfd3d0037dd4f71d01';

try {
  const privateKey = createStacksPrivateKey(PRIVATE_KEY);
  const publicKey = getPublicKey(privateKey);
  const address = publicKeyToAddress(AddressVersion.TestnetSingleSig, publicKey);
  
  console.log('Private Key:', PRIVATE_KEY);
  console.log('Address:', address);
  console.log('\nGet testnet STX from:');
  console.log(`https://explorer.hiro.so/sandbox/faucet?chain=testnet`);
  console.log('\nPaste this address:', address);
} catch (error) {
  console.error('Error:', error.message);
}
