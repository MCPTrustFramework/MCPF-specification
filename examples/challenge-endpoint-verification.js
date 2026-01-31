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

// Async wrapper for main execution
async function main() {
  const did = process.argv[2];

  if (!did) {
    console.error('Usage: node challenge-endpoint-verification.js <did>');
    console.error('Example: node challenge-endpoint-verification.js did:web:llm.kis.gov.lv');
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
    // Dynamic imports for ESM modules
    const { ed25519 } = await import('@noble/ed25519');
    const { base58btc } = await import('multiformats/bases/base58');
    
    // Step 1: Fetch DID document
    console.log('1. Fetching DID document...');
    const didUrl = didToUrl(did);
    const didDoc = await fetch(didUrl).then(r => {
      if (!r.ok) throw new Error(`Failed to fetch DID: ${r.status}`);
      return r.json();
    });
    const publicKeyMultibase = didDoc.verificationMethod[0].publicKeyMultibase;
    console.log(`   ✓ DID document retrieved`);
    console.log(`   Public key: ${publicKeyMultibase}\n`);
    
    // Step 2: Generate challenge
    console.log('2. Generating challenge...');
    const challenge = crypto.randomBytes(32).toString('base64');
    const nonce = crypto.randomBytes(16).toString('hex');
    console.log(`   Challenge: ${challenge.substring(0, 40)}...`);
    console.log(`   Nonce: ${nonce}\n`);
    
    // Step 3: Send challenge to endpoint
    console.log('3. Sending challenge to server...');
    const challengeUrl = `${didUrl.replace('/did.json', '')}/.well-known/mcp/challenge`;
    
    const response = await fetch(challengeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challenge,
        nonce,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error(`Challenge endpoint returned ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`   ✓ Server responded`);
    console.log(`   Signature: ${result.signature.substring(0, 40)}...\n`);
    
    // Step 4: Verify public key matches
    console.log('4. Verifying public key matches...');
    if (publicKeyMultibase !== result.publicKey) {
      throw new Error('Public key mismatch!');
    }
    console.log(`   ✓ Public keys match\n`);
    
    // Step 5: Verify signature
    console.log('5. Verifying signature...');
    
    // Decode multibase public key
    const publicKeyBytes = base58btc.decode('z' + publicKeyMultibase.slice(1));
    const actualPublicKey = publicKeyBytes.slice(-32);
    
    // Decode signature and challenge
    const signature = Buffer.from(result.signature, 'base64');
    const challengeBytes = Buffer.from(challenge, 'base64');
    
    // Verify signature
    const isValid = await ed25519.verify(signature, challengeBytes, actualPublicKey);
    
    if (!isValid) {
      throw new Error('Signature verification failed!');
    }
    console.log(`   ✓ Signature is VALID\n`);
    
    // Step 6: Check timestamp
    console.log('6. Checking timestamp freshness...');
    const signedAt = new Date(result.signedAt);
    const now = new Date();
    const ageSeconds = (now - signedAt) / 1000;
    
    if (ageSeconds > 300) { // 5 minutes
      console.log(`   ⚠ Warning: Response is ${ageSeconds}s old (> 5 min)`);
    } else {
      console.log(`   ✓ Timestamp fresh (${ageSeconds.toFixed(1)}s old)\n`);
    }
    
    // Final result
    console.log('=== VERIFICATION COMPLETE ===');
    console.log(`✓ Server controls private key for ${did}`);
    console.log(`✓ MCPF Compliance Level: Self-Verified (Level 2)`);
    console.log('\nTo achieve Level 3 (Full Compliance):');
    console.log('- Submit to trust registry for organizational verification');
    console.log('- Obtain signed credential from trust anchor\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n✗ Verification failed:', error.message);
    console.error('\nPossible issues:');
    console.error('- Challenge endpoint not implemented');
    console.error('- Incorrect signature');
    console.error('- Network connectivity issues');
    console.error('- Rate limiting');
    console.error('\nIf dependencies missing, run:');
    console.error('  npm install @noble/ed25519 multiformats\n');
    process.exit(1);
  }
}

function didToUrl(did) {
  // Convert did:web:domain:path to https://domain/path/.well-known/did.json
  const parts = did.replace('did:web:', '').split(':');
  const domain = parts[0];
  const path = parts.slice(1).join('/');
  return `https://${domain}${path ? '/' + path : ''}/.well-known/did.json`;
}

// Run main
main();
