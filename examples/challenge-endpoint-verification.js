#!/usr/bin/env node
/**
 * MCPF Challenge-Response Verification
 * Reference implementation for verifying private key ownership
 * 
 * Usage:
 *   node challenge-endpoint-verification.js did:web:llm.kis.gov.lv
 * 
 * Dependencies:
 *   npm install @noble/ed25519 multiformats
 */

const crypto = require('crypto');

async function main() {
  const did = process.argv[2];
  if (!did) {
    console.error('Usage: node challenge-endpoint-verification.js <did>');
    process.exit(1);
  }
  try {
    await verifyDIDKeyOwnership(did);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

async function verifyDIDKeyOwnership(did) {
  console.log('=== MCPF Challenge-Response Verification ===');
  console.log(`DID: ${did}\n`);
  
  try {
    const { ed25519 } = await import('@noble/ed25519');
    const { base58btc } = await import('multiformats/bases/base58');
    
    console.log('1. Fetching DID document...');
    const didUrl = didToUrl(did);
    const didDoc = await fetch(didUrl).then(r => {
      if (!r.ok) throw new Error(`Failed to fetch DID: ${r.status}`);
      return r.json();
    });
    const publicKeyMultibase = didDoc.verificationMethod[0].publicKeyMultibase;
    console.log(`   ✓ DID document retrieved\n`);
    
    console.log('2. Generating challenge...');
    const challenge = crypto.randomBytes(32).toString('base64');
    const nonce = crypto.randomBytes(16).toString('hex');
    
    console.log('3. Sending challenge to server...');
    const challengeUrl = `${didUrl.replace('/did.json', '')}/.well-known/mcp/challenge`;
    const response = await fetch(challengeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge, nonce, timestamp: new Date().toISOString() })
    });
    if (!response.ok) throw new Error(`Challenge endpoint returned ${response.status}`);
    const result = await response.json();
    console.log(`   ✓ Server responded\n`);
    
    console.log('4. Verifying public key matches...');
    if (publicKeyMultibase !== result.publicKey) throw new Error('Public key mismatch!');
    console.log(`   ✓ Public keys match\n`);
    
    console.log('5. Verifying signature...');
    const publicKeyBytes = base58btc.decode('z' + publicKeyMultibase.slice(1));
    const actualPublicKey = publicKeyBytes.slice(-32);
    const signature = Buffer.from(result.signature, 'base64');
    const challengeBytes = Buffer.from(challenge, 'base64');
    const isValid = await ed25519.verify(signature, challengeBytes, actualPublicKey);
    if (!isValid) throw new Error('Signature verification failed!');
    console.log(`   ✓ Signature is VALID\n`);
    
    console.log('=== VERIFICATION COMPLETE ===');
    console.log(`✓ Server controls private key for ${did}`);
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Verification failed:', error.message);
    process.exit(1);
  }
}

function didToUrl(did) {
  const parts = did.replace('did:web:', '').split(':');
  const domain = parts[0];
  const path = parts.slice(1).join('/');
  return `https://${domain}${path ? '/' + path : ''}/.well-known/did.json`;
}

main();
