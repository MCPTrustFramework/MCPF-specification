### 6.3 Mandatory Challenge Endpoint

**CRITICAL REQUIREMENT:** All MCPF-compliant entities MUST implement a challenge-response endpoint to prove private key ownership.

**Problem Statement:**  
The W3C DID:Web specification does not mandate proof of private key ownership. Without this requirement, anyone can publish a DID document claiming a public key they don't control, making DID:Web no stronger than self-signed certificates.

**Solution:**  
MCPF requires all entities to implement a standardized challenge-response endpoint that proves cryptographic control of the private key corresponding to the public key in their DID document.

#### 6.3.1 Challenge Endpoint Specification

**Endpoint:** `POST /.well-known/mcp/challenge`

**Request:**
```json
{
  "challenge": "base64-encoded-random-bytes",
  "nonce": "optional-client-nonce",
  "timestamp": "2026-01-31T19:00:00Z"
}
```

**Response:**
```json
{
  "challenge": "base64-encoded-random-bytes",
  "signature": "base64-encoded-ed25519-signature",
  "publicKey": "z6Mkj...",
  "verificationMethod": "did:web:llm.kis.gov.lv#key-1",
  "algorithm": "Ed25519",
  "signedAt": "2026-01-31T19:00:00Z"
}
```

**Requirements:**
- Server MUST sign the exact challenge bytes received
- Signature MUST be verifiable using public key from DID document
- Response MUST be returned within 5 seconds
- Endpoint MUST be rate-limited (max 100 requests/hour per IP)
- Endpoint MUST support CORS for cross-origin verification

#### 6.3.2 Verification Algorithm

```python
def verify_challenge_response(did, challenge, response):
    """
    Verify that an entity controls the private key for their DID
    """
    # Step 1: Resolve DID document
    did_doc = resolve_did(did)
    
    # Step 2: Extract public key
    verification_method = response['verificationMethod']
    public_key = extract_public_key(did_doc, verification_method)
    
    # Step 3: Verify public key matches
    if public_key != response['publicKey']:
        raise KeyMismatch("Public key in response doesn't match DID document")
    
    # Step 4: Verify signature
    signature = base64.decode(response['signature'])
    challenge_bytes = base64.decode(challenge)
    
    if not ed25519.verify(signature, challenge_bytes, public_key):
        raise InvalidSignature("Signature verification failed")
    
    # Step 5: Check timestamp freshness (optional)
    signed_at = parse_datetime(response['signedAt'])
    if datetime.utcnow() - signed_at > timedelta(minutes=5):
        raise StaleResponse("Response timestamp too old")
    
    return True  # Challenge verified ✓
```

#### 6.3.3 MCPF Compliance Levels

MCPF defines three levels of compliance based on verification completeness:

**Level 1: Basic DID:Web (NOT MCPF-COMPLIANT)**
- ✅ DID document at `/.well-known/did.json`
- ❌ No challenge endpoint
- ❌ No signed manifest
- ❌ No trust registry entry

**Trust Level:** DNS/TLS only (WEAK)  
**Status:** Not recommended for production

**Level 2: MCPF Self-Verified**
- ✅ DID document at `/.well-known/did.json`
- ✅ Challenge endpoint at `/.well-known/mcp/challenge`
- ✅ Signed manifest
- ❌ No trust registry entry

**Trust Level:** Cryptographic proof of key ownership (MEDIUM)  
**Status:** Acceptable for development/testing

**Level 3: MCPF Registry-Verified (FULL COMPLIANCE)**
- ✅ DID document at `/.well-known/did.json`
- ✅ Challenge endpoint at `/.well-known/mcp/challenge`
- ✅ Signed manifest
- ✅ Trust registry entry with verified credential

**Trust Level:** Organizational + cryptographic verification (STRONG)  
**Status:** Required for production

#### 6.3.4 Integration with Trust Model

The challenge endpoint integrates with the existing trust model:

```
Trust Verification Flow (Level 3):
─────────────────────────────────────
1. Fetch DID document (DNS/TLS trust)
2. Challenge private key ownership (cryptographic proof)
3. Verify credential from trust anchor (organizational trust)
4. Check revocation status (real-time trust)

Result: Multi-layer trust verification
```

#### 6.3.5 Security Considerations

**Challenge Generation:**
- Use cryptographically secure random bytes (minimum 32 bytes)
- Include timestamp to prevent replay attacks
- Optionally include nonce for additional replay protection

**Rate Limiting:**
- Prevent abuse through brute force attempts
- Implement exponential backoff on failures
- Log all verification attempts for audit

**Key Rotation:**
- During key rotation, support both old and new keys temporarily
- Challenge endpoint should indicate which key was used
- Update period: 30 days overlap during rotation

**Attack Prevention:**
- Prevent challenge replay: track nonces or use short time windows
- Prevent key oracle attacks: constant-time comparison
- Prevent DoS: rate limit + CAPTCHA for repeated failures

#### 6.3.6 Comparison to PKI

| PKI Component | MCPF Equivalent |
|---------------|-----------------|
| Certificate Signing Request (CSR) | DID document + challenge response |
| Domain Validation (ACME) | Challenge-response endpoint |
| Certificate Authority (CA) | Trust Registry |
| Extended Validation | Organizational verification |
| Certificate | Verifiable Credential |
| OCSP / CRL | StatusList2021 |
| Root CA trust store | Trust registry API |

**Key Difference:** MCPF provides decentralized verification without requiring a central CA, while maintaining comparable security guarantees through cryptographic proof of key ownership.

---
