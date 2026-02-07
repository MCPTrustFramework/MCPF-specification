### 6.3 Mandatory Challenge Endpoint

**CRITICAL REQUIREMENT:** All MCPF-compliant entities MUST implement a challenge-response endpoint to prove private key ownership.

**Problem Statement:**
The W3C DID:Web specification does not mandate proof of private key ownership. Without this requirement, anyone can publish a DID document claiming a public key they don't control.

**Solution:**
MCPF requires all entities to implement a standardized challenge-response endpoint at `POST /.well-known/mcp/challenge`.

#### 6.3.1 Challenge Endpoint Specification

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

See `schemas/challenge-endpoint.json` for the formal JSON Schema.

---
