# MPension Fund Agent Name Service (ANS) Specification
## Human-Readable Agent Discovery and Resolution

**Version:** 1.1  
**Status:** Draft  
**Last Updated:** January 2026

---

## 1. Overview

The MPension Fund Agent Name Service (ANS) provides human-readable names for AI agents, similar to DNS for websites. ANS enables:
- Human-friendly agent discovery (`fraud-detector.finance.bank.agent`)
- Cryptographic binding to DIDs
- Agent metadata (capabilities, protocols, endpoints)
- Hierarchical namespace delegation
- Certificate-based trust

**Design Principles:**
- **User-friendly:** Memorable names instead of cryptographic identifiers
- **Secure:** Cryptographically bound to DIDs
- **Hierarchical:** Delegated zone management (like DNS)
- **Flexible:** Support for multiple agent types and protocols

---

## 2. Name Format

### 2.1 ANS Name Structure

```
Format: {agent-name}.{sub-domain}.{domain}.{tld}.agent

Examples:
├─ fraud-detector.finance.dbs.example.gov.agent
├─ customer-service.support.bank.com.agent
├─ diagnostic-assistant.cardiology.hospital.sg.agent
└─ orchestrator.operations.company.com.agent

Components:
├─ agent-name: Specific agent identifier (fraud-detector)
├─ sub-domain: Department/division (finance)
├─ domain: Organization (dbs.example.gov)
└─ .agent: ANS suffix (required)
```

### 2.2 Naming Rules

**Valid Characters:**
- Lowercase letters: a-z
- Numbers: 0-9
- Hyphens: - (not at start/end)
- Dots: . (separators only)

**Constraints:**
- Minimum length: 3 characters per label
- Maximum length: 63 characters per label
- Total name: Max 253 characters
- Must end with `.agent`

**Examples:**
```
Valid:
✓ fraud-detector.finance.bank.agent
✓ api-v2.services.company.agent
✓ agent-007.security.example.gov.agent

Invalid:
✗ FraudDetector.finance.bank.agent  (uppercase)
✗ fraud_detector.finance.bank.agent (underscore)
✗ -fraud.finance.bank.agent         (starts with hyphen)
✗ fraud-detector.finance.bank       (missing .agent)
```

---

## 3. Name Resolution

### 3.1 Resolution Flow

```
User Query: fraud-detector.finance.dbs.example.gov.agent
                           ↓
              ANS Resolution Service
                           ↓
          ┌────────────────┴────────────────┐
          │                                 │
    Lookup Name                      Verify Zone
          │                                 │
          ↓                                 ↓
   Database Query                    Check Authority
          │                                 │
          ↓                                 ↓
   Found: ANS Record                 Zone: Authorized
          │                                 │
          └────────────────┬────────────────┘
                           ↓
                    Return Result:
                    ├─ DID
                    ├─ Agent Card
                    ├─ Certificate
                    └─ Status
```

### 3.2 Resolution API

**Request:**
```http
GET /resolve/fraud-detector.finance.dbs.example.gov.agent
Host: ans.example.gov
Accept: application/json
```

**Response:**
```json
{
  "ansName": "fraud-detector.finance.dbs.example.gov.agent",
  "did": "did:web:dbs.example.gov:agent:fraud-detector",
  "resolvedAt": "2025-12-30T10:00:00Z",
  "ttl": 3600,
  "agentCard": {
    "name": "Fraud Detection Specialist",
    "description": "AI agent specialized in transaction fraud detection",
    "capabilities": [
      "transaction-analysis",
      "risk-scoring",
      "anomaly-detection"
    ],
    "protocols": ["A2A", "MCP"],
    "version": "2.1.0",
    "endpoint": "https://dbs.example.gov/agents/fraud-detector",
    "documentation": "https://dbs.example.gov/agents/fraud-detector/docs"
  },
  "certificate": {
    "subject": "CN=fraud-detector.finance.dbs.example.gov.agent",
    "issuer": "CN=ANS CA, O=National Government",
    "validFrom": "2025-01-01T00:00:00Z",
    "validTo": "2026-01-01T00:00:00Z",
    "serialNumber": "1A:2B:3C:4D:5E:6F",
    "fingerprint": "SHA256:A1B2C3..."
  },
  "status": "active",
  "registeredAt": "2025-01-15T00:00:00Z",
  "lastUpdated": "2025-12-01T00:00:00Z"
}
```

**Error Response:**
```json
{
  "error": "name-not-found",
  "message": "ANS name not registered",
  "ansName": "unknown-agent.finance.dbs.example.gov.agent",
  "suggestions": [
    "fraud-detector.finance.dbs.example.gov.agent",
    "risk-analyzer.finance.dbs.example.gov.agent"
  ]
}
```

---

## 4. Agent Card

### 4.1 Agent Card Schema

```json
{
  "$schema": "https://mcpf.dev/schemas/agent-card-v1.json",
  "name": "Fraud Detection Specialist",
  "description": "AI agent specialized in real-time transaction fraud detection and risk assessment",
  "version": "2.1.0",
  "agent": {
    "type": "specialist",
    "role": "fraud-detection",
    "model": "claude-sonnet-4",
    "provider": "anthropic"
  },
  "capabilities": [
    {
      "id": "transaction-analysis",
      "name": "Transaction Analysis",
      "description": "Analyze transaction patterns for fraud indicators",
      "inputs": ["transaction-data", "user-profile"],
      "outputs": ["risk-score", "fraud-indicators"]
    },
    {
      "id": "risk-scoring",
      "name": "Risk Scoring",
      "description": "Calculate risk score for transactions",
      "inputs": ["transaction-data"],
      "outputs": ["risk-score", "confidence-level"]
    },
    {
      "id": "anomaly-detection",
      "name": "Anomaly Detection",
      "description": "Detect unusual patterns in transaction behavior",
      "inputs": ["transaction-history"],
      "outputs": ["anomalies", "severity"]
    }
  ],
  "protocols": {
    "a2a": {
      "version": "1.0",
      "endpoint": "https://dbs.example.gov/agents/fraud-detector/a2a",
      "authentication": "did-auth"
    },
    "mcp": {
      "version": "1.0",
      "endpoint": "https://dbs.example.gov/agents/fraud-detector/mcp",
      "capabilities": ["invoke-tool", "query-data"]
    }
  },
  "delegation": {
    "canDelegateTo": [
      "risk-analyzer.finance.dbs.example.gov.agent",
      "compliance-checker.finance.dbs.example.gov.agent"
    ],
    "canReceiveFrom": [
      "orchestrator.operations.dbs.example.gov.agent"
    ]
  },
  "metadata": {
    "organization": "Example Bank Singapore",
    "department": "Financial Crimes Prevention",
    "contact": "ai-team@dbs.example.gov",
    "documentation": "https://dbs.example.gov/agents/fraud-detector/docs",
    "support": "https://dbs.example.gov/agents/fraud-detector/support"
  },
  "sla": {
    "availability": "99.9%",
    "responseTime": "500ms",
    "throughput": "1000 requests/minute"
  },
  "compliance": ["PDPA", "MAS-TRM", "PCI-DSS"],
  "security": {
    "encryption": "TLS 1.3",
    "authentication": ["DID-Auth", "OAuth2"],
    "dataClassification": "confidential"
  }
}
```

### 4.2 Agent Types

```
Agent Types:
├─ orchestrator: Coordinates multiple agents
├─ specialist: Domain-specific expertise
├─ interface: User-facing interaction
├─ data-processor: Data transformation/analysis
├─ monitor: Observability and alerting
└─ integration: External system connectivity
```

---

## 5. Zone Management

### 5.1 Hierarchical Zones

```
Root Zone: .agent
    ↓
Top-Level Zones: .example.gov.agent, .com.agent, .org.agent
    ↓
Organization Zones: dbs.example.gov.agent, bank.com.agent
    ↓
Department Zones: finance.dbs.example.gov.agent
    ↓
Agent Names: fraud-detector.finance.dbs.example.gov.agent
```

### 5.2 Zone Delegation

**Zone Record:**
```json
{
  "zoneName": "finance.dbs.example.gov.agent",
  "parentZone": "dbs.example.gov.agent",
  "administrator": {
    "did": "did:web:dbs.example.gov:finance",
    "name": "Example Bank Finance Department",
    "contact": "finance-admin@dbs.example.gov"
  },
  "delegation": {
    "delegatedAt": "2025-01-01T00:00:00Z",
    "delegatedBy": "did:web:dbs.example.gov",
    "certificate": {
      "serialNumber": "2B:3C:4D:5E:6F:7A",
      "validFrom": "2025-01-01T00:00:00Z",
      "validTo": "2026-01-01T00:00:00Z"
    }
  },
  "nameservers": [
    "ns1.finance.dbs.example.gov",
    "ns2.finance.dbs.example.gov"
  ],
  "status": "active"
}
```

**Delegation Process:**
```
1. Parent Zone Owner
   └─ Creates delegation record
   └─ Issues certificate
   └─ Publishes to nameservers

2. Child Zone Owner
   └─ Receives certificate
   └─ Configures nameservers
   └─ Begins managing sub-zone

3. Resolution
   └─ Query traverses hierarchy
   └─ Verifies delegation chain
   └─ Returns authoritative result
```

### 5.3 Zone Management API

**Create Zone:**
```http
POST /api/v1/zones
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "zoneName": "finance.dbs.example.gov.agent",
  "parentZone": "dbs.example.gov.agent",
  "administratorDid": "did:web:dbs.example.gov:finance",
  "contact": "finance-admin@dbs.example.gov",
  "nameservers": [
    "ns1.finance.dbs.example.gov",
    "ns2.finance.dbs.example.gov"
  ]
}
```

**List Zones:**
```http
GET /api/v1/zones?parentZone=dbs.example.gov.agent

Response:
{
  "zones": [
    {
      "zoneName": "finance.dbs.example.gov.agent",
      "status": "active",
      "agentCount": 15,
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "zoneName": "operations.dbs.example.gov.agent",
      "status": "active",
      "agentCount": 8,
      "createdAt": "2025-01-05T00:00:00Z"
    }
  ]
}
```

---

## 6. Name Registration

### 6.1 Registration Process

**Step 1: Check Availability**
```http
GET /api/v1/check-availability/fraud-detector.finance.dbs.example.gov.agent

Response:
{
  "available": true,
  "ansName": "fraud-detector.finance.dbs.example.gov.agent"
}
```

**Step 2: Register Name**
```http
POST /api/v1/register
Authorization: Bearer {zone-admin-token}
Content-Type: application/json

{
  "ansName": "fraud-detector.finance.dbs.example.gov.agent",
  "did": "did:web:dbs.example.gov:agent:fraud-detector",
  "agentCard": {
    "name": "Fraud Detection Specialist",
    "capabilities": ["transaction-analysis", "risk-scoring"],
    "protocols": ["A2A"],
    "endpoint": "https://dbs.example.gov/agents/fraud-detector"
  },
  "ttl": 3600,
  "contact": "ai-team@dbs.example.gov"
}
```

**Step 3: Verification**
```
ANS Service:
├─ Verify zone authority (caller owns zone)
├─ Verify DID ownership (caller controls DID)
├─ Validate agent card schema
├─ Issue certificate
└─ Publish to nameservers

Certificate:
├─ Subject: CN=fraud-detector.finance.dbs.example.gov.agent
├─ Issuer: CN=ANS CA
├─ Valid: 365 days
└─ Signed by: ANS root key
```

**Step 4: Confirmation**
```json
{
  "status": "registered",
  "ansName": "fraud-detector.finance.dbs.example.gov.agent",
  "did": "did:web:dbs.example.gov:agent:fraud-detector",
  "certificate": {
    "serialNumber": "1A:2B:3C:4D:5E:6F",
    "validFrom": "2025-12-30T00:00:00Z",
    "validTo": "2026-12-30T00:00:00Z",
    "fingerprint": "SHA256:A1B2C3..."
  },
  "registeredAt": "2025-12-30T10:00:00Z",
  "nameservers": [
    "ns1.finance.dbs.example.gov",
    "ns2.finance.dbs.example.gov"
  ]
}
```

### 6.2 Registration Requirements

**Technical Requirements:**
- Valid DID (resolvable)
- Agent card (valid JSON schema)
- Zone authority (certificate or token)
- TLS endpoint (HTTPS required)

**Policy Requirements:**
- Name uniqueness (within zone)
- Agent verification (operator confirmed)
- Security compliance
- Contact information

---

## 7. Security

### 7.1 Name Hijacking Prevention

**Protection Mechanisms:**
```
1. Zone Authority
   └─ Only zone admin can register names
   └─ Verified via certificate or DID-Auth

2. DID Ownership
   └─ Registrant must prove DID control
   └─ Challenge-response protocol

3. Certificate Binding
   └─ ANS name bound to certificate
   └─ Certificate signed by ANS CA

4. DNSSEC-style Signing
   └─ Zone records signed
   └─ Chain of trust to root
```

**DID Ownership Verification:**
```
1. Registrant requests name registration
2. ANS generates challenge:
   {
     "challenge": "random-nonce-abc123",
     "timestamp": "2025-12-30T10:00:00Z"
   }
3. Registrant signs challenge with DID private key
4. ANS verifies signature with DID public key
5. If valid, registration proceeds
```

### 7.2 Certificate Management

**Certificate Issuance:**
```
ANS Certificate Authority (CA):
├─ Root CA (offline, air-gapped)
│   └─ Issues Intermediate CA certificate
│
└─ Intermediate CA (online)
    └─ Issues agent certificates
    └─ Publishes CRL (Certificate Revocation List)
```

**Certificate Validation:**
```python
def validate_ans_certificate(cert):
    # Check signature
    if not verify_signature(cert, ans_ca_public_key):
        return False
    
    # Check validity period
    now = datetime.utcnow()
    if now < cert.valid_from or now > cert.valid_to:
        return False
    
    # Check revocation (CRL or OCSP)
    if check_revocation(cert):
        return False
    
    # Check subject matches ANS name
    if cert.subject != expected_ans_name:
        return False
    
    return True
```

---

## 8. Caching and Performance

### 8.1 Caching Strategy

**Cache Levels:**
```
1. Client Cache (Agent SDK)
   └─ TTL: As specified in response (default 3600s)
   └─ Invalidation: On error or explicit refresh

2. Edge Cache (CDN)
   └─ TTL: 60 seconds (short for security)
   └─ Invalidation: On update or revocation

3. DNS Cache (Optional)
   └─ TXT records for basic info
   └─ CNAME for redirection
```

**Cache Headers:**
```http
Response:
HTTP/1.1 200 OK
Cache-Control: public, max-age=3600
ETag: "abc123xyz"
Last-Modified: Tue, 30 Dec 2025 10:00:00 GMT

{
  "ansName": "fraud-detector.finance.dbs.example.gov.agent",
  "ttl": 3600,
  ...
}
```

### 8.2 Performance Targets

**Resolution Performance:**
- Cold cache: <50ms
- Warm cache: <10ms
- 99th percentile: <100ms

**Availability:**
- SLA: 99.99% uptime
- Geographic distribution: Multi-region
- Failover: Automatic

---

## 9. Well-Known Discovery

### 9.1 ANS Discovery Endpoint

```http
GET /.well-known/ans-registry.json

Response:
{
  "ansEndpoint": "https://ans.example.gov/api/v1",
  "version": "1.0",
  "zones": [
    {
      "zoneName": "example.gov.agent",
      "nameservers": [
        "ns1.ans.example.gov",
        "ns2.ans.example.gov"
      ],
      "administrator": "did:web:example.gov",
      "contact": "ans-admin@tech.example.gov"
    }
  ],
  "certificate": {
    "rootCA": "https://ans.example.gov/ca/root.crt",
    "intermediateCA": "https://ans.example.gov/ca/intermediate.crt",
    "crl": "https://ans.example.gov/ca/crl.pem"
  },
  "documentation": "https://docs.ans.example.gov",
  "support": "support@ans.example.gov"
}
```

---

## 10. Integration Examples

### 10.1 Python SDK

```python
from mcpf import ANSClient

# Initialize client
ans = ANSClient("https://ans.example.gov")

# Resolve agent name
agent = ans.resolve("fraud-detector.finance.dbs.example.gov.agent")

print(f"DID: {agent.did}")
print(f"Endpoint: {agent.endpoint}")
print(f"Capabilities: {agent.capabilities}")

# Register new agent
ans.register(
    name="new-agent.finance.dbs.example.gov.agent",
    did="did:web:dbs.example.gov:agent:new-agent",
    agent_card={
        "name": "New Agent",
        "capabilities": ["analysis"],
        "endpoint": "https://dbs.example.gov/agents/new-agent"
    }
)
```

### 10.2 TypeScript SDK

```typescript
import { ANSClient } from '@mcpf/ans';

const ans = new ANSClient('https://ans.example.gov');

// Resolve agent
const agent = await ans.resolve(
  'fraud-detector.finance.dbs.example.gov.agent'
);

console.log(`DID: ${agent.did}`);
console.log(`Capabilities: ${agent.capabilities.join(', ')}`);

// Batch resolution
const agents = await ans.resolveMany([
  'fraud-detector.finance.dbs.example.gov.agent',
  'risk-analyzer.finance.dbs.example.gov.agent'
]);
```

---

## References

- DNS (RFC 1034/1035): https://www.ietf.org/rfc/rfc1034.txt
- MPension Fund Core: https://github.com/MCPTrustFramework/MCPF-specification/blob/main/MCPF-core.md
- W3C DID: https://www.w3.org/TR/did-core/
- X.509 Certificates: https://www.ietf.org/rfc/rfc5280.txt

---

**END OF MPension Fund ANS SPECIFICATION**
