# MCPF Core Specification
## DID/VC Infrastructure, StatusList, and Trust Model

**Version:** 1.2  
**Status:** Draft  
**Last Updated:** February 2026

---

## 1. Overview

MCPF Core defines the foundational trust infrastructure for agentic AI systems, providing:
- Decentralized identity for agents, tools, and organizations
- Verifiable credentials for capabilities and permissions
- Real-time revocation mechanism
- Trust model and governance framework
- Tool-based identity discovery for AI clients

---

## 2. Decentralized Identifiers (DIDs)

### 2.1 DID Methods

MCPF supports the following DID methods:

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
    "organization": "Example Bank"
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
Issued to MCP servers, defines their capabilities and scope. See `schemas/mcp-server-credential.json`.

### 3.2 Credential Verification Process

```
Step 1: Verify Credential Structure
Step 2: Verify Issuer (resolve DID, retrieve public key)
Step 3: Verify Signature
Step 4: Check Expiration
Step 5: Check Revocation Status (StatusList2021)
Step 6: Verify Subject claims
```

---

## 4. StatusList2021 Revocation

### 4.1 Overview

StatusList2021 provides efficient, privacy-preserving credential revocation:
- **Efficiency:** Single bitstring for 131,072 credentials
- **Privacy:** Checking revocation doesn't reveal which credential
- **Speed:** <5ms to check status
- **Scalability:** 16KB for 131K credentials

### 4.2 Checking Revocation Status

```python
def check_revocation(credential):
    status = credential['credentialStatus']
    list_url = status['statusListCredential']
    index = int(status['statusListIndex'])
    
    status_list = fetch(list_url)
    compressed = status_list['credentialSubject']['encodedList']
    bitstring = gzip.decompress(base64.decode(compressed))
    
    byte_pos = index // 8
    bit_pos = index % 8
    bit_value = (bitstring[byte_pos] >> bit_pos) & 1
    
    return bit_value == 0  # 0 = valid, 1 = revoked
```

---

## 5. Trust Model

### 5.1 Trust Hierarchy

```
┌─────────────────────────────────────────┐
│        Trust Anchor (Level 0)           │
│  did:web:example.gov (Government)       │
│  did:web:veritrust.vc (International)   │
└────────────────┬────────────────────────┘
                 │ Issues credentials to
                 ↓
┌─────────────────────────────────────────┐
│    Organization DIDs (Level 1)          │
│  did:web:bank.com                       │
│  did:web:hospital.sg                    │
└────────────────┬────────────────────────┘
                 │ Issues credentials to
                 ↓
┌─────────────────────────────────────────┐
│    Agent/Server DIDs (Level 2)          │
│  did:web:bank.com:agent:fraud-detector  │
│  did:web:bank.com:mcp:risk-db           │
└─────────────────────────────────────────┘
```

### 5.2 Trust Evaluation Algorithm

```python
def evaluate_trust(credential, trusted_anchors):
    if not verify_credential(credential):
        return False
    
    issuer = credential['issuer']
    if issuer in trusted_anchors:
        return check_not_revoked(credential)
    
    issuer_credential = get_issuer_credential(issuer)
    if issuer_credential and issuer_credential['issuer'] in trusted_anchors:
        return (check_not_revoked(issuer_credential) and 
                check_not_revoked(credential))
    
    return False
```

---

## 6. Cryptographic Standards

### 6.1 Supported Algorithms

**Digital Signatures:**
- **Ed25519** (Recommended) — 256-bit key, 512-bit signature
- **ECDSA (P-256)** (Alternative) — For existing PKI compatibility

### 6.2 Key Management

```
Generation → Storage → Usage → Rotation → Revocation
     ↓          ↓        ↓         ↓          ↓
  Secure    Encrypted  Audit   New Keys   StatusList
   RNG        HSM     Logging   Issued     Updated
```

**Key Rotation Intervals:**
- Agents: Every 90 days
- MCP Servers: Every 180 days
- Trust Anchors: Every 365 days

### 6.3 Mandatory Challenge Endpoint

**CRITICAL REQUIREMENT:** All MCPF-compliant entities MUST implement a challenge-response endpoint to prove private key ownership.

**Endpoint:** `POST /.well-known/mcp/challenge`

See [MCPF-core-section-6.3.md](MCPF-core-section-6.3.md) for full specification and `schemas/challenge-endpoint.json` for the JSON Schema.

### 6.4 MCPF Compliance Levels

MCPF defines four levels of compliance. The `identify` MCP tool is **REQUIRED at all levels** (Level 0+) to enable AI client trust discovery. See [MCPF-tool-identity.md](MCPF-tool-identity.md) for the full tool-based identity discovery specification.

**Level 0: Self-Attestation (Entry Level)**
- ✅ `identify` tool exposing server identity and MCPF metadata
- ❌ No DID document required
- ❌ No challenge endpoint
- ❌ No trust registry entry

**Trust Level:** Self-reported only (MINIMAL)  
**Status:** Acceptable for experimentation and development  
**AI Client Trust:** AI agents can read self-attested identity via `identify` tool

**Level 1: DID + Tool Discovery**
- ✅ `identify` tool with verification URLs (bridging to `.well-known`)
- ✅ DID document at `/.well-known/did.json`
- ✅ `.well-known/mcp/manifest.json` signed manifest
- ❌ No challenge endpoint
- ❌ No trust registry entry

**Trust Level:** DNS/TLS + tool-discoverable identity (LOW)  
**Status:** Acceptable for internal/development use  
**AI Client Trust:** AI agents verify DID existence via URLs returned by `identify`

**Level 2: MCPF Self-Verified**
- ✅ `identify` tool with full verification URLs
- ✅ DID document at `/.well-known/did.json`
- ✅ Challenge endpoint at `/.well-known/mcp/challenge`
- ✅ Signed manifest
- ❌ No trust registry entry

**Trust Level:** Cryptographic proof of key ownership (MEDIUM)  
**Status:** Acceptable for staging/pre-production  
**AI Client Trust:** AI agents verify key ownership via challenge endpoint URL from `identify`

**Level 3: MCPF Registry-Verified (FULL COMPLIANCE)**
- ✅ `identify` tool with credential URL and full verification URLs
- ✅ DID document at `/.well-known/did.json`
- ✅ Challenge endpoint at `/.well-known/mcp/challenge`
- ✅ Signed manifest
- ✅ Trust registry entry with verified credential

**Trust Level:** Organizational + cryptographic verification (STRONG)  
**Status:** Required for production  
**AI Client Trust:** AI agents verify credential from trust anchor via URL from `identify`

### 6.5 Dual-Path Discovery

All MCPF-compliant MCP servers MUST support both discovery paths:

1. **Tool-based discovery** (`identify` tool) — for AI agents interacting via MCP protocol
2. **HTTP-based discovery** (`.well-known` endpoints) — for crawlers, registries, and verification services

Both paths MUST return consistent information. The `identify` tool response bridges to `.well-known` URLs. See [MCPF-tool-identity.md](MCPF-tool-identity.md) for normative requirements and `schemas/identify-tool-response.json` for the response schema.

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
1. Endpoint Compromise (if private key stolen, can impersonate until revoked)
2. Trust Anchor Compromise (entire chain affected)
3. Social Engineering (cannot prevent human trust decisions)

### 7.2 Security Best Practices

- Use HSM for trust anchor private keys
- Multi-signature for credential issuance
- Regular security audits
- Always verify signatures and check revocation status
- Use constant-time comparisons
- Implement rate limiting on all verification endpoints

---

## 8. Implementation Requirements

### 8.1 Minimum Requirements

- DID Resolver supporting did:web
- VC Verifier with signature and revocation checking
- Secure key storage with rotation capability
- `identify` tool implementation (see MCPF-tool-identity.md)

### 8.2 Recommended Features

- Support for did:key (ephemeral DIDs)
- Credential caching (with TTL)
- Batch verification
- Performance monitoring
- Federation support

---

## 9. Governance and Policies

Trust Anchor governance requires legal entity with jurisdiction, published governance framework, security certification, incident response capability, and transparent operations.

Credential lifecycle: Registration → Verification → Issuance → Renewal → Revocation.

---

## 10. Compliance and Standards

### 10.1 Standards Compliance

**W3C:** DID Core v1.0, VC Data Model v1.1, StatusList2021  
**IETF:** OAuth 2.0 (RFC 6749), JWT (RFC 7519), JWK (RFC 7517), Ed25519 (RFC 8032)  
**Protocol:** MCP (Model Context Protocol), Google A2A Protocol

---

## References

- W3C DID Core: https://www.w3.org/TR/did-core/
- W3C VC Data Model: https://www.w3.org/TR/vc-data-model/
- StatusList2021: https://w3c-ccg.github.io/vc-status-list-2021/
- MCPF Tool-Based Identity: specs/MCPF-tool-identity.md
- MCPF Specification: https://github.com/MCPTrustFramework/MCPF-specification

---

**END OF MCPF CORE SPECIFICATION**
