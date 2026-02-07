# MCPF Agent Name Service (ANS) Specification
## Human-Readable Agent Discovery and Resolution

**Version:** 1.1  
**Status:** Draft  
**Last Updated:** February 2026

---

## 1. Overview

The MCPF Agent Name Service (ANS) provides human-readable names for AI agents, similar to DNS for websites. ANS enables:
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

---

## 3. Name Resolution

### 3.1 Resolution API

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
    "capabilities": ["transaction-analysis", "risk-scoring", "anomaly-detection"],
    "protocols": ["A2A", "MCP"],
    "version": "2.1.0",
    "endpoint": "https://dbs.example.gov/agents/fraud-detector"
  },
  "certificate": {
    "subject": "CN=fraud-detector.finance.dbs.example.gov.agent",
    "issuer": "CN=ANS CA, O=National Government",
    "validFrom": "2025-01-01T00:00:00Z",
    "validTo": "2026-01-01T00:00:00Z"
  },
  "status": "active"
}
```

---

## 4. Agent Card

### 4.1 Agent Card Schema

The Agent Card contains metadata about the agent's capabilities, protocols, delegation rules, SLA, and security posture. See `schemas/ans-name.json` for the formal JSON Schema.

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

---

## 6. Security

### 6.1 Name Hijacking Prevention

Protection mechanisms include zone authority verification, DID ownership proof via challenge-response, certificate binding, and DNSSEC-style zone record signing.

### 6.2 Certificate Management

ANS uses a hierarchical CA model with offline root CA and online intermediate CA for issuing agent certificates.

---

## 7. Caching and Performance

**Resolution Performance:**
- Cold cache: <50ms
- Warm cache: <10ms
- 99th percentile: <100ms
- SLA: 99.99% uptime

---

## 8. Integration Examples

### 8.1 Python SDK

```python
from mcpf import ANSClient

ans = ANSClient("https://ans.example.gov")
agent = ans.resolve("fraud-detector.finance.dbs.example.gov.agent")
print(f"DID: {agent.did}")
print(f"Capabilities: {agent.capabilities}")
```

### 8.2 TypeScript SDK

```typescript
import { ANSClient } from '@mcpf/ans';

const ans = new ANSClient('https://ans.example.gov');
const agent = await ans.resolve('fraud-detector.finance.dbs.example.gov.agent');
```

---

## References

- DNS (RFC 1034/1035): https://www.ietf.org/rfc/rfc1034.txt
- MCPF Core: specs/MCPF-core.md
- W3C DID: https://www.w3.org/TR/did-core/

---

**END OF MCPF ANS SPECIFICATION**
