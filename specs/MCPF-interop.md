# MPension Fund Component Interoperability Specification
## How the Four Components Work Together

**Version:** 1.1  
**Status:** Draft  
**Last Updated:** January 2026

---

## 1. Overview

MPension Fund consists of four integrated components that work together to provide complete trust infrastructure for agentic AI:

1. **DID/VC Infrastructure** - Cryptographic identity foundation
2. **ANS (Agent Name Service)** - Human-readable discovery
3. **MCP Trust Registry** - Tool/server governance
4. **A2A Trust Registry** - Agent relationship control

This document describes how these components integrate and interact.

---

## 2. Component Integration Map

```
┌──────────────────────────────────────────────────────────────┐
│                  MPension Fund INTEGRATION ARCHITECTURE               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          DID/VC INFRASTRUCTURE (Foundation)            │ │
│  │  • Issues DIDs for all entities                        │ │
│  │  • Issues VCs for agents and servers                   │ │
│  │  • Manages StatusList2021 for revocation               │ │
│  │  • Trust anchor for signature verification             │ │
│  └───────┬──────────────────────┬───────────────────┬──────┘ │
│          │                      │                   │        │
│       Uses DIDs              Uses DIDs          Uses DIDs    │
│       Issues VCs             Verifies VCs       Verifies VCs │
│          │                      │                   │        │
│  ┌───────▼──────┐    ┌──────────▼────────┐  ┌─────▼──────┐ │
│  │     ANS      │    │  MCP Registry     │  │ A2A Registry│ │
│  │              │    │                   │  │             │ │
│  │ • Resolves   │───▶│ • Verifies tools  │  │ • Authorizes│ │
│  │   names to   │    │ • Issues tool VCs │  │   delegation│ │
│  │   DIDs       │    │ • Checks status   │  │ • Enforces  │ │
│  │              │◀───│                   │  │   policies  │ │
│  │ • Returns    │    │ Agents query ANS  │  │             │ │
│  │   agent      │    │ to find tools     │  │             │ │
│  │   cards      │    │                   │  │             │ │
│  └──────────────┘    └───────────────────┘  └─────────────┘ │
│          │                      │                   │        │
│          └──────────────────────┴───────────────────┘        │
│                           │                                  │
│                    Used by Agents                            │
│                           │                                  │
│                  ┌────────▼──────────┐                       │
│                  │   AI Agent        │                       │
│                  │  (Consumer)       │                       │
│                  └───────────────────┘                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Integration Scenarios

### 3.1 Agent Registration (Full Stack)

```
Step 1: DID Issuance
──────────────────────────────────────
Operator → Request DID → DID/VC Infrastructure
DID/VC Infrastructure → Generate key pair
DID/VC Infrastructure → Create DID document
DID/VC Infrastructure → Publish DID document
Result: did:web:bank.com:agent:fraud-detector

Step 2: ANS Registration
──────────────────────────────────────
Operator → Register name → ANS
ANS → Verify DID (resolve from Step 1)
ANS → Issue ANS certificate
ANS → Create agent card
Result: fraud-detector.finance.bank.agent

Step 3: A2A Registration
──────────────────────────────────────
Operator → Register agent → A2A Registry
A2A Registry → Request VC → DID/VC Infrastructure
DID/VC Infrastructure → Issue agent VC
A2A Registry → Store credential
Result: Agent can participate in delegations

Step 4: Verification (Integration Point)
──────────────────────────────────────
Another Agent → Query ANS (find agent)
ANS → Return DID + agent card
Agent → Query A2A Registry (verify relationship)
A2A Registry → Return agent VC
Agent → Verify VC signature (via DID/VC)
Agent → Check revocation (StatusList)
Result: Agent verified and authorized
```

### 3.2 MCP Server Usage (Full Stack)

```
Step 1: Server Registration
──────────────────────────────────────
Server Operator → Register → MCP Registry
MCP Registry → Request VC → DID/VC Infrastructure
DID/VC Infrastructure → Issue server VC
MCP Registry → Store credential
Result: Server registered with DID

Step 2: Agent Discovery
──────────────────────────────────────
Agent → Search by capability → MCP Registry
MCP Registry → Return matching servers
Result: List of server DIDs

Step 3: Verification
──────────────────────────────────────
Agent → Get server credential → MCP Registry
MCP Registry → Return server VC
Agent → Verify VC signature (via DID/VC)
Agent → Check revocation (StatusList)
Result: Server verified

Step 4: Invocation
──────────────────────────────────────
Agent → Invoke MCP server → Server endpoint
Server → Verify agent DID (optional)
Server → Execute tool
Server → Return result
Result: Tool executed with audit trail
```

### 3.3 Agent Delegation (Full Stack)

```
Step 1: Discovery via ANS
──────────────────────────────────────
Orchestrator → Resolve name → ANS
ANS → Return specialist DID + agent card
Result: Found specialist agent

Step 2: Relationship Check via A2A
──────────────────────────────────────
Orchestrator → Check delegation auth → A2A Registry
A2A Registry → Return relationship credential
Orchestrator → Verify VC (via DID/VC)
Orchestrator → Check revocation (StatusList)
Result: Delegation authorized

Step 3: Delegation with Proof
──────────────────────────────────────
Orchestrator → Create delegation record
Orchestrator → Sign with private key (DID-based)
Orchestrator → Send to specialist
Specialist → Verify signature (via DID/VC)
Result: Delegation proven and verified

Step 4: Tool Access by Specialist
──────────────────────────────────────
Specialist → Need tool → Query MCP Registry
MCP Registry → Return tool credential
Specialist → Verify tool (via DID/VC)
Specialist → Invoke tool
Result: Complete workflow with trust
```

---

## 4. Data Flow Patterns

### 4.1 DID Resolution Flow

```
Request: Resolve DID
─────────────────────────────
Input: did:web:bank.com:agent:fraud-detector

DID/VC Infrastructure:
1. Parse DID method (did:web)
2. Extract domain and path
3. Construct URL: https://bank.com/.well-known/did.json
4. Fetch DID document
5. Validate structure
6. Return document

Output:
{
  "id": "did:web:bank.com:agent:fraud-detector",
  "verificationMethod": [...],
  "service": [...]
}

Used By:
- ANS (during name registration)
- MCP Registry (during server registration)
- A2A Registry (during relationship creation)
- Any component (for signature verification)
```

### 4.2 Credential Verification Flow

```
Request: Verify Credential
─────────────────────────────
Input: Verifiable Credential JSON

Step 1: Signature Verification
├─ Extract issuer DID
├─ Resolve DID → DID/VC Infrastructure
├─ Get public key
├─ Verify signature
└─ Result: Valid/Invalid

Step 2: Revocation Check
├─ Extract credentialStatus
├─ Fetch StatusList → DID/VC Infrastructure
├─ Check bit at index
└─ Result: Active/Revoked

Step 3: Expiration Check
├─ Parse issuanceDate
├─ Parse expirationDate
├─ Compare with current time
└─ Result: Valid/Expired

Output:
{
  "valid": true,
  "checks": {
    "signatureValid": true,
    "notRevoked": true,
    "notExpired": true
  }
}

Used By:
- ANS (verifying operator credentials)
- MCP Registry (verifying server credentials)
- A2A Registry (verifying agent credentials)
- Agents (verifying any credential)
```

### 4.3 Cross-Component Query Flow

```
Agent Workflow: "Find and verify fraud detection agent"
─────────────────────────────────────────────────────────

Step 1: Query ANS
Request: GET /resolve/fraud-detector.finance.bank.agent
Response: {
  "did": "did:web:bank.com:agent:fraud-detector",
  "agentCard": {...}
}

Step 2: Query A2A Registry
Request: GET /agents/did:web:bank.com:agent:fraud-detector
Response: {
  "credential": {...},
  "relationships": [...]
}

Step 3: Verify with DID/VC Infrastructure
Request: Resolve DID + Verify VC + Check StatusList
Response: {
  "did_document": {...},
  "credential_valid": true,
  "status": "active"
}

Result: Agent verified through all three layers
```

---

## 5. Security Integration

### 5.1 Trust Chain Verification

```
Complete Trust Chain:
──────────────────────────────────────
Root of Trust: DID/VC Infrastructure
    ├─ Issues DIDs for trust anchors
    ├─ Issues VCs for entities
    └─ Maintains StatusLists
           │
           ├─── ANS
           │     ├─ Names bound to DIDs
           │     ├─ Agent cards signed
           │     └─ Trust inherited from DID/VC
           │
           ├─── MCP Registry
           │     ├─ Servers have DIDs
           │     ├─ Server VCs from trust anchor
           │     └─ Revocation via StatusList
           │
           └─── A2A Registry
                 ├─ Agents have DIDs
                 ├─ Relationship VCs from trust anchor
                 └─ Delegation proofs via signatures

Verification at Each Layer:
1. DID/VC: Cryptographic foundation
2. ANS: Name-to-DID binding
3. MCP/A2A: Application-layer authorization
```

### 5.2 Revocation Propagation

```
Revocation Event: Agent compromised
──────────────────────────────────────

Step 1: Update StatusList (DID/VC Infrastructure)
├─ Set bit to 1 at agent's index
├─ Update timestamp
└─ Publish new StatusList

Step 2: Registry Notification (A2A Registry)
├─ Mark agent as revoked in database
├─ Invalidate cached credentials
└─ Send notifications to dependent agents

Step 3: ANS Update (if needed)
├─ Mark name as inactive
├─ Remove from search results
└─ Return revocation status on queries

Step 4: Verification Impact
├─ Any verification attempt → checks StatusList
├─ Bit = 1 → verification fails
├─ Agent cannot be used until re-certified
└─ Audit trail records revocation

Propagation Time: <5 seconds
- StatusList update: Immediate
- Cache invalidation: 1-2 seconds
- Full propagation: <5 seconds
```

---

## 6. API Integration Patterns

### 6.1 Unified SDK Pattern

```python
from mcpf import MCPF

# Initialize unified client
mcpf = MCPF(
    did_vc_endpoint="https://did.example.gov",
    ans_endpoint="https://ans.example.gov",
    mcp_registry="https://mcp-registry.example.gov",
    a2a_registry="https://a2a-registry.example.gov"
)

# Example 1: Register agent (uses all components)
agent = mcpf.register_agent(
    name="fraud-detector.finance.bank.agent",
    did="did:web:bank.com:agent:fraud-detector",
    capabilities=["transaction-analysis"],
    role="specialist"
)
# Behind the scenes:
# 1. DID/VC: Verify DID exists
# 2. DID/VC: Issue agent VC
# 3. ANS: Register name
# 4. A2A: Register agent

# Example 2: Verify and invoke agent (uses all components)
result = mcpf.verify_and_delegate(
    agent_name="fraud-detector.finance.bank.agent",
    task="analyze-transaction",
    data={"transaction_id": "tx_123"}
)
# Behind the scenes:
# 1. ANS: Resolve name to DID
# 2. A2A: Check delegation authorization
# 3. DID/VC: Verify credentials and revocation
# 4. Invoke agent with cryptographic proof

# Example 3: Find and verify tool (uses MCP + DID/VC)
tool = mcpf.find_tool(capability="getCurrentWeather")
verified = mcpf.verify_tool(tool.did)
# Behind the scenes:
# 1. MCP Registry: Search by capability
# 2. DID/VC: Verify server credential
# 3. DID/VC: Check revocation status
```

### 6.2 Microservices Integration

```
Microservice Architecture:
──────────────────────────────────────

┌─────────────────────────────────────────┐
│         API Gateway                     │
│  - Authentication                       │
│  - Rate limiting                        │
│  - Request routing                      │
└────────┬────────────────────────────────┘
         │
    ┌────┴─────┬──────────┬────────────┐
    │          │          │            │
┌───▼───┐  ┌──▼───┐  ┌───▼────┐  ┌────▼──┐
│DID/VC │  │ ANS  │  │  MCP   │  │  A2A  │
│Service│  │Service│ │Registry│  │Registry│
└───┬───┘  └──┬───┘  └───┬────┘  └────┬──┘
    │         │          │            │
    └─────────┴──────────┴────────────┘
              │
         Shared Data:
         - PostgreSQL (credentials, records)
         - Redis (caching)
         - Kafka (event bus)

Event Flow:
1. Agent registered → Event published
2. All services subscribe to events
3. Each updates own state
4. Eventual consistency guaranteed
```

---

## 7. Deployment Patterns

### 7.1 Monolithic Deployment

```
Single Server Deployment:
──────────────────────────────────────

┌─────────────────────────────────────┐
│     MPension Fund Complete Stack             │
│                                     │
│  ┌───────────────────────────────┐ │
│  │    Application Layer          │ │
│  │  ┌─────┬─────┬─────┬─────┐  │ │
│  │  │DID/ │ ANS │ MCP │ A2A │  │ │
│  │  │ VC  │     │ Reg │ Reg │  │ │
│  │  └─────┴─────┴─────┴─────┘  │ │
│  └───────────┬──────────────────┘ │
│              │                     │
│  ┌───────────▼──────────────────┐ │
│  │    Database Layer            │ │
│  │    (PostgreSQL)              │ │
│  └──────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘

Pros:
- Simple deployment
- Low operational overhead
- Fast inter-component communication
- Good for small-medium scale

Cons:
- Single point of failure
- Harder to scale components independently
- Limited to single server resources
```

### 7.2 Distributed Deployment

```
Multi-Service Deployment:
──────────────────────────────────────

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  DID/VC  │  │   ANS    │  │   MCP    │  │   A2A    │
│ Service  │  │ Service  │  │ Registry │  │ Registry │
│          │  │          │  │          │  │          │
│ Port     │  │ Port     │  │ Port     │  │ Port     │
│ 8001     │  │ 8002     │  │ 8003     │  │ 8004     │
└─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘
      │             │             │             │
      └─────────────┴─────────────┴─────────────┘
                          │
              ┌───────────▼────────────┐
              │  Message Bus (Kafka)   │
              └────────────────────────┘
                          │
              ┌───────────▼────────────┐
              │ Shared Database Cluster│
              │    (PostgreSQL)        │
              └────────────────────────┘

Pros:
- Independent scaling
- Component isolation
- High availability
- Better for large scale

Cons:
- More complex deployment
- Network latency between components
- Requires orchestration (Kubernetes)
```

---

## 8. Configuration Examples

### 8.1 Unified Configuration

```yaml
mcpf:
  version: "1.0"
  environment: "production"
  
  # DID/VC Infrastructure
  did_vc:
    endpoint: "https://did.example.gov"
    trust_anchor: "did:web:example.gov"
    key_storage: "hsm"
    status_list_ttl: 300
  
  # Agent Name Service
  ans:
    endpoint: "https://ans.example.gov"
    root_zone: ".agent"
    certificate_validity: "P365D"
    cache_ttl: 3600
  
  # MCP Trust Registry
  mcp_registry:
    endpoint: "https://mcp-registry.example.gov"
    verification_required: true
    status_check_enabled: true
    cache_ttl: 1800
  
  # A2A Trust Registry
  a2a_registry:
    endpoint: "https://a2a-registry.example.gov"
    max_delegation_depth: 3
    policy_enforcement: "strict"
    audit_level: "detailed"
  
  # Shared Settings
  security:
    tls_version: "1.3"
    signature_algorithm: "Ed25519"
    key_rotation_days: 90
  
  database:
    host: "postgres.internal"
    port: 5432
    name: "mcpf"
    ssl_mode: "require"
  
  cache:
    redis_url: "redis://redis.internal:6379"
    ttl_default: 3600
  
  logging:
    level: "INFO"
    format: "json"
    audit_enabled: true
```

---

## 9. Testing Integration

### 9.1 Integration Test Example

```python
import pytest
from mcpf import MCPF

@pytest.fixture
def mcpf_client():
    return MCPF(
        did_vc_endpoint="https://test-did.example.com",
        ans_endpoint="https://test-ans.example.com",
        mcp_registry="https://test-mcp.example.com",
        a2a_registry="https://test-a2a.example.com"
    )

def test_complete_agent_workflow(mcpf_client):
    """Test full agent registration and verification workflow"""
    
    # Step 1: Register agent (uses all components)
    agent = mcpf_client.register_agent(
        name="test-agent.test.example.agent",
        did="did:web:example.com:agent:test",
        capabilities=["test-capability"],
        role="specialist"
    )
    
    assert agent.name == "test-agent.test.example.agent"
    assert agent.did == "did:web:example.com:agent:test"
    
    # Step 2: Resolve via ANS
    resolved = mcpf_client.ans.resolve("test-agent.test.example.agent")
    assert resolved.did == agent.did
    
    # Step 3: Verify via A2A Registry
    verification = mcpf_client.a2a.verify(agent.did)
    assert verification.valid == True
    
    # Step 4: Check revocation status (DID/VC)
    status = mcpf_client.did_vc.check_status(agent.credential)
    assert status.revoked == False

def test_mcp_server_integration(mcpf_client):
    """Test MCP server registration and verification"""
    
    # Register server
    server = mcpf_client.register_mcp_server(
        server_id="test-weather",
        did="did:web:example.com:mcp:weather",
        capabilities=["getCurrentWeather"],
        endpoint="https://example.com/mcp/weather"
    )
    
    # Search for server
    results = mcpf_client.mcp_registry.search(
        capability="getCurrentWeather"
    )
    assert len(results) > 0
    assert any(s.did == server.did for s in results)
    
    # Verify server
    verification = mcpf_client.verify_mcp_server(server.did)
    assert verification.valid == True
```

---

## References

- MPension Fund Core: MCPF-core.md
- ANS Specification: MCPF-ans.md
- MCP Registry: MCPF-mcp-registry.md
- A2A Registry: MCPF-a2a-registry.md

---

**END OF MPension Fund INTEROPERABILITY SPECIFICATION**
