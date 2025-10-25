const crypto = require('crypto');

// The provided Leather wallet seed phrase
const SEED_PHRASE = 'release major muffin crucial tank giant air venture labor below congress cabbage typical vacuum add bubble young exist poet void wonder reform toward husband';

// Derive a private key from the seed phrase
// Note: This is a simplified derivation for demo purposes
// In production, use proper BIP39/BIP44 derivation
function derivePrivateKey(seedPhrase) {
  const hash = crypto.createHash('sha256').update(seedPhrase).digest('hex');
  return hash + '01'; // Add compressed key suffix
}

const privateKey = derivePrivateKey(SEED_PHRASE);

console.log('Seed Phrase:', SEED_PHRASE);
console.log('\nDerived Private Key:', privateKey);
console.log('\nUse this in your deployment:');
console.log(`export DEPLOYER_PRIVATE_KEY=${privateKey}`);
