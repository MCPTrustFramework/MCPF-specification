# MPension Fund Core Specification
## DID/VC Infrastructure, StatusList, and Trust Model

**Version:** 1.1  
**Status:** Draft  
**Last Updated:** January 2026

---

## 1. Overview

MPension Fund Core defines the foundational trust infrastructure for agentic AI systems, providing:
- Decentralized identity for agents, tools, and organizations
- Verifiable credentials for capabilities and permissions
- Real-time revocation mechanism
- Trust model and governance framework

---

## 2. Decentralized Identifiers (DIDs)

### 2.1 DID Methods

MPension Fund supports the following DID methods:

#### **did:web (Primary)**
```
Format: did:web:domain.com:path:to:resource
Example: did:web:example.gov:agent:fraud-detector
Resolution: HTTPS GET https://domain.com/path/to/resource/did.json
```

**Advantages:**
- No blockchain required
- Leverages existing DNS/TLS infrastructure
- Government-friendly (full control)
- Compatible with existing PKI

**DID Document Structure:**
```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1"
  ],
  "id": "did:web:example.gov:agent:fraud-detector",
  "controller": "did:web:example.gov",
  "verificationMethod": [
    {
      "id": "did:web:example.gov:agent:fraud-detector#key-1",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:web:example.gov:agent:fraud-detector",
      "publicKeyMultibase": "z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH"
    }
  ],
  "authentication": ["did:web:example.gov:agent:fraud-detector#key-1"],
  "assertionMethod": ["did:web:example.gov:agent:fraud-detector#key-1"],
  "service": [
    {
      "id": "did:web:example.gov:agent:fraud-detector#agent-endpoint",
      "type": "AgentService",
      "serviceEndpoint": "https://example.gov/agents/fraud-detector"
    }
  ]
}
```

#### **did:key (Optional)**
```
Format: did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH
Use: Ephemeral, self-contained DIDs
Resolution: Derive public key from identifier
```

**Use cases:**
- Temporary agents
- Development/testing
- Peer-to-peer communication

### 2.2 DID Categories in MCPF

```
Trust Anchor DIDs
├─ National: did:web:example.gov
├─ International: did:web:veritrust.vc
└─ Enterprise: did:web:company.com

Agent DIDs
├─ Orchestrator: did:web:company.com:agent:orchestrator
├─ Specialist: did:web:company.com:agent:fraud-detector
└─ Interface: did:web:company.com:agent:customer-service

MCP Server DIDs
├─ Government: did:web:example.gov:mcp:weather-api
├─ Enterprise: did:web:bank.com:mcp:risk-db
└─ Public: did:web:openweather.org:mcp:api
```

---

## 3. Verifiable Credentials (VCs)

### 3.1 Credential Types

#### **Agent Credential**
Issued to agents, defines their role and permissions.

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://mcpf.dev/schemas/v1"
  ],
  "type": ["VerifiableCredential", "AgentCredential"],
  "issuer": "did:web:example.gov",
  "issuanceDate": "2025-12-30T00:00:00Z",
  "expirationDate": "2026-12-30T00:00:00Z",
  "credentialSubject": {
    "id": "did:web:bank.com:agent:fraud-detector",
    "name": "Fraud Detection Specialist",
    "role": "specialist",
    "capabilities": ["transaction-analysis", "risk-scoring"],
    "delegationScope": ["read:transactions", "write:risk-flags"],
    "organization": "Example Bank Singapore"
  },
  "credentialStatus": {
    "id": "https://example.gov/status/agents/1#42",
    "type": "StatusList2021Entry",
    "statusPurpose": "revocation",
    "statusListIndex": "42",
    "statusListCredential": "https://example.gov/status/agents/1"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-12-30T00:00:00Z",
    "verificationMethod": "did:web:example.gov#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z58DAdFfa9SkqZMVP..."
  }
}
```

#### **MCP Server Credential**
Issued to MCP servers, defines their capabilities and scope.

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://mcpf.dev/schemas/v1"
  ],
  "type": ["VerifiableCredential", "MCPServerCredential"],
  "issuer": "did:web:example.gov",
  "issuanceDate": "2025-01-15T00:00:00Z",
  "credentialSubject": {
    "id": "did:web:weather.example.gov:mcp:api",
    "name": "National Weather API",
    "operator": "National Weather Service",
    "capabilities": ["getCurrentWeather", "getForecast"],
    "scope": "read",
    "dataClassification": "public",
    "endpoint": "https://weather.example.gov/mcp"
  },
  "credentialStatus": {
    "id": "https://example.gov/status/mcp/1#42",
    "type": "StatusList2021Entry",
    "statusPurpose": "revocation",
    "statusListIndex": "42",
    "statusListCredential": "https://example.gov/status/mcp/1"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-01-15T00:00:00Z",
    "verificationMethod": "did:web:example.gov#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z3sG8AdFfa9Skq..."
  }
}
```

### 3.2 Credential Verification Process

```
Step 1: Verify Credential Structure
├─ Check @context validity
├─ Verify credential type
└─ Validate required fields

Step 2: Verify Issuer
├─ Resolve issuer DID
├─ Retrieve public key
└─ Confirm issuer is trusted

Step 3: Verify Signature
├─ Extract proof value
├─ Reconstruct signed payload
├─ Verify signature against public key
└─ Check signature timestamp

Step 4: Check Expiration
├─ Verify issuanceDate <= now
├─ Verify expirationDate > now
└─ Reject if expired

Step 5: Check Revocation Status
├─ Resolve statusListCredential
├─ Extract statusListIndex
├─ Check bit value (0=valid, 1=revoked)
└─ Reject if revoked

Step 6: Verify Subject
├─ Confirm credentialSubject.id matches expected DID
└─ Validate subject claims
```

---

## 4. StatusList2021 Revocation

### 4.1 Overview

StatusList2021 provides efficient, privacy-preserving credential revocation:
- **Efficiency:** Single bitstring for 131,072 credentials
- **Privacy:** Checking revocation doesn't reveal which credential
- **Speed:** <5ms to check status
- **Scalability:** 16KB for 131K credentials

### 4.2 Status List Credential

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/vc/status-list/2021/v1"
  ],
  "id": "https://example.gov/status/agents/1",
  "type": ["VerifiableCredential", "StatusList2021Credential"],
  "issuer": "did:web:example.gov",
  "issuanceDate": "2025-01-01T00:00:00Z",
  "credentialSubject": {
    "id": "https://example.gov/status/agents/1#list",
    "type": "StatusList2021",
    "statusPurpose": "revocation",
    "encodedList": "H4sIAAAAAAAAA-3BMQEAAAjAoMWi..."
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-01-01T00:00:00Z",
    "verificationMethod": "did:web:example.gov#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z4sG8AdFfa9SkqZ..."
  }
}
```

### 4.3 Checking Revocation Status

**Algorithm:**
```python
def check_revocation(credential):
    # Extract status info
    status = credential['credentialStatus']
    list_url = status['statusListCredential']
    index = int(status['statusListIndex'])
    
    # Fetch status list
    status_list = fetch(list_url)
    
    # Decode compressed bitstring
    compressed = status_list['credentialSubject']['encodedList']
    bitstring = base64.decode(compressed)
    bitstring = gzip.decompress(bitstring)
    
    # Check bit at index
    byte_pos = index // 8
    bit_pos = index % 8
    bit_value = (bitstring[byte_pos] >> bit_pos) & 1
    
    # 0 = valid, 1 = revoked
    return bit_value == 0
```

### 4.4 Revocation Performance

**Metrics (Measured):**
- Status list fetch: ~3ms (cached)
- Decompression: ~1ms
- Bit lookup: <1ms
- **Total: ~5ms**

**Scalability:**
- 131,072 credentials per list
- ~16KB compressed size
- Can create multiple lists
- Lists can be CDN-cached

---

## 5. Trust Model

### 5.1 Trust Hierarchy

```
┌─────────────────────────────────────────┐
│        Trust Anchor (Level 0)           │
│     did:web:example.gov (Government)         │
│     did:web:veritrust.vc (International)│
└────────────────┬────────────────────────┘
                 │ Issues credentials to
                 ↓
┌─────────────────────────────────────────┐
│    Organization DIDs (Level 1)          │
│  did:web:bank.com (Example Bank)            │
│  did:web:hospital.sg (SGH)              │
└────────────────┬────────────────────────┘
                 │ Issues credentials to
                 ↓
┌─────────────────────────────────────────┐
│    Agent/Server DIDs (Level 2)          │
│  did:web:bank.com:agent:fraud-detector  │
│  did:web:bank.com:mcp:risk-db           │
└─────────────────────────────────────────┘
```

### 5.2 Trust Anchor Responsibilities

**Government Trust Anchor (did:web:example.gov):**
- Issues credentials to National entities
- Operates national registries
- Maintains status lists
- Enforces governance policies
- Conducts audits and compliance checks

**International Trust Anchor (did:web:veritrust.vc):**
- Issues credentials to international entities
- Provides cross-border trust
- Federation with other trust anchors
- Global MCP server verification

### 5.3 Trust Evaluation Algorithm

```python
def evaluate_trust(credential, trusted_anchors):
    """
    Evaluate if credential should be trusted
    """
    # Step 1: Verify credential structure and signature
    if not verify_credential(credential):
        return False
    
    # Step 2: Check if issuer is in trusted anchor list
    issuer = credential['issuer']
    if issuer in trusted_anchors:
        # Direct trust
        return check_not_revoked(credential)
    
    # Step 3: Check if issuer has credential from trusted anchor
    issuer_credential = get_issuer_credential(issuer)
    if issuer_credential:
        if issuer_credential['issuer'] in trusted_anchors:
            # Transitive trust
            return (check_not_revoked(issuer_credential) and 
                    check_not_revoked(credential))
    
    # Step 4: Federation check (if enabled)
    if federation_enabled():
        for anchor in trusted_anchors:
            if check_federation(anchor, issuer):
                return check_not_revoked(credential)
    
    return False
```

### 5.4 Trust Policies

**Issuer Policy:**
```json
{
  "policyId": "gov-sg-issuer-policy-v1",
  "version": "1.0",
  "issuer": "did:web:example.gov",
  "allowedCredentialTypes": [
    "AgentCredential",
    "MCPServerCredential",
    "OrganizationCredential"
  ],
  "requirementsForIssuance": {
    "organizationVerification": true,
    "securityAudit": true,
    "complianceCheck": ["PDPA", "CSA-Guidelines"]
  },
  "credentialLifetime": {
    "default": "P1Y",
    "maximum": "P2Y"
  },
  "revocationPolicy": {
    "immediate": ["security-breach", "malicious-activity"],
    "notice-period": ["policy-violation", "expired-audit"]
  }
}
```

**Verifier Policy:**
```json
{
  "policyId": "bank-verifier-policy-v1",
  "version": "1.0",
  "verifier": "did:web:bank.com",
  "trustedIssuers": [
    "did:web:example.gov",
    "did:web:mas.example.gov",
    "did:web:veritrust.vc"
  ],
  "requiredCredentialTypes": {
    "agents": ["AgentCredential"],
    "mcpServers": ["MCPServerCredential"]
  },
  "verification": {
    "checkRevocation": true,
    "requireNonExpired": true,
    "minimumKeyStrength": 256
  },
  "failureHandling": {
    "onRevoked": "reject",
    "onExpired": "reject",
    "onUnknownIssuer": "manual-review"
  }
}
```

---

## 6. Cryptographic Standards

### 6.1 Supported Algorithms

**Digital Signatures:**
- **Ed25519** (Recommended)
  - Key size: 256 bits
  - Signature size: 512 bits
  - Fast, secure, widely supported
  
- **ECDSA (P-256)** (Alternative)
  - For existing PKI compatibility
  - NIST P-256 curve

**Key Derivation:**
- HKDF-SHA256 for key derivation
- BIP32/BIP44 for hierarchical keys (optional)

### 6.2 Key Management

**Key Lifecycle:**
```
Generation → Storage → Usage → Rotation → Revocation
     ↓          ↓        ↓         ↓          ↓
  Secure    Encrypted  Audit   New Keys   StatusList
   RNG        HSM     Logging   Issued     Updated
```

**Storage Options:**
- Hardware Security Module (HSM) - Production
- Key Management Service (KMS) - Cloud
- Encrypted file system - Development

**Key Rotation:**
- Agents: Every 90 days
- MCP Servers: Every 180 days
- Trust Anchors: Every 365 days
- Emergency rotation: Immediate on compromise

---

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

## 7. Security Considerations

### 7.1 Threat Model

**Threats Addressed:**
1. **Impersonation:** DIDs prevent agent/server impersonation
2. **Credential Forgery:** Cryptographic signatures prevent forgery
3. **Compromised Credentials:** StatusList enables instant revocation
4. **Man-in-the-Middle:** TLS + DID verification prevents MITM
5. **Replay Attacks:** Timestamps + nonces prevent replay

**Threats Not Addressed:**
1. **Endpoint Compromise:** If private key stolen, can impersonate until revoked
2. **Trust Anchor Compromise:** If trust anchor compromised, entire chain affected
3. **Social Engineering:** Cannot prevent human trust decisions

### 7.2 Security Best Practices

**For Trust Anchors:**
- Use HSM for private keys
- Multi-signature for credential issuance
- Regular security audits
- Incident response plan
- Key ceremony for setup

**For Organizations:**
- Separate keys for agents vs servers
- Regular credential renewal
- Monitor for suspicious activity
- Implement least-privilege
- Audit trail for all operations

**For Implementers:**
- Always verify signatures
- Check revocation status
- Validate expiration
- Use constant-time comparisons
- Implement rate limiting

---

## 8. Implementation Requirements

### 8.1 Minimum Requirements

**DID Resolver:**
- Support did:web resolution
- Cache DID documents (with TTL)
- Handle resolution errors gracefully

**VC Verifier:**
- Verify credential signatures
- Check revocation status
- Validate expiration dates
- Support StatusList2021

**Key Management:**
- Secure key storage
- Key rotation capability
- Audit logging

### 8.2 Recommended Features

- Support for did:key (ephemeral DIDs)
- Credential caching (with TTL)
- Batch verification
- Performance monitoring
- Federation support

---

## 9. Governance and Policies

### 9.1 Trust Anchor Governance

**Requirements for Trust Anchor:**
1. Legal entity with jurisdiction
2. Published governance framework
3. Security certification (e.g., ISO 27001)
4. Incident response capability
5. Transparent operations

**Governance Model:**
```
Board of Directors
      ↓
Technical Committee
      ↓
Security Team
      ↓
Operations Team
```

### 9.2 Credential Lifecycle

**Registration:**
1. Entity submits application
2. Verification of identity
3. Security assessment
4. Credential issuance
5. Publication to registry

**Renewal:**
1. Periodic re-verification
2. Security re-assessment
3. Credential re-issuance
4. Status list update

**Revocation:**
1. Incident detection
2. Investigation
3. Revocation decision
4. Status list update (immediate)
5. Notification to stakeholders

---

## 10. Compliance and Standards

### 10.1 Standards Compliance

**W3C:**
- DID Core v1.0
- VC Data Model v1.1
- StatusList2021

**IETF:**
- OAuth 2.0 (RFC 6749)
- JWT (RFC 7519)
- JWK (RFC 7517)

**Regulatory:**
- National PDPA (data protection)
- Financial Regulator Technology Risk Management Guidelines
- CSA Cybersecurity Code of Practice

### 10.2 Audit Requirements

**Annual Audit:**
- Security controls review
- Cryptographic implementation
- Key management practices
- Incident response readiness

**Continuous Monitoring:**
- Revocation patterns
- Verification failures
- Performance metrics
- Security alerts

---

## References

- W3C DID Core: https://www.w3.org/TR/did-core/
- W3C VC Data Model: https://www.w3.org/TR/vc-data-model/
- StatusList2021: https://w3c-ccg.github.io/vc-status-list-2021/
- Ed25519: RFC 8032
- MPension Fund Specification: https://github.com/MCPTrustFramework/MCPF-specification

---

**END OF MPension Fund CORE SPECIFICATION**
