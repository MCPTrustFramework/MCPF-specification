# MCPF A2A Trust Registry Specification
## Agent-to-Agent Trust and Delegation Control

**Version:** 1.1  
**Status:** Draft  
**Last Updated:** February 2026

---

## 1. Overview

The MCPF A2A (Agent-to-Agent) Trust Registry governs trust relationships and delegation permissions between AI agents. It provides:
- Agent identity verification
- Relationship authorization (who can delegate to whom)
- Delegation scope enforcement (what actions are permitted)
- Cryptographic proof of delegation chain
- Audit trail for accountability

**Key Concepts:**
- **Orchestrator Agent:** Coordinates workflows, delegates tasks
- **Specialist Agent:** Performs specific domain tasks
- **Delegation:** Transfer of authority/responsibility from one agent to another
- **Scope:** Permissions granted (read, write, execute)

---

## 2. Agent Roles

### 2.1 Role Types

```
orchestrator:
  - Coordinates multi-agent workflows
  - Delegates tasks to specialists
  - Aggregates results

specialist:
  - Domain-specific expertise
  - Receives delegated tasks
  - Returns results to orchestrator

interface:
  - User-facing interaction
  - Translates user intent
  - Delegates to orchestrators

monitor:
  - Observes agent interactions
  - Collects metrics
  - Cannot delegate (read-only)
```

---

## 3. Delegation Model

### 3.1 Delegation Record

```json
{
  "delegationId": "del_abc123",
  "from": {
    "did": "did:web:bank.com:agent:orchestrator",
    "role": "orchestrator"
  },
  "to": {
    "did": "did:web:bank.com:agent:fraud-detector",
    "role": "specialist"
  },
  "scope": {
    "actions": ["analyze-transaction", "generate-risk-score"],
    "permissions": ["read:transactions", "write:risk-flags"],
    "timeLimit": "2025-12-30T11:00:00Z"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "verificationMethod": "did:web:bank.com:agent:orchestrator#key-1",
    "proofValue": "z58DAdFfa9Skq..."
  }
}
```

---

## 4. Relationship Management

Relationships are registered via the A2A Registry API and verified using W3C Verifiable Credentials. See `schemas/a2a-policy.json` for the delegation policy schema.

---

## 5. Delegation Policies

Policies define rules for delegation authorization including agent role requirements, permission scoping, time constraints, and approval workflows. Policies are enforced in strict mode for production deployments.

---

## 6. Audit Trail

All delegation events are logged with cryptographic proof, including creation, invocation, completion, and revocation events.

---

## 7. Integration with A2A Protocol

MCPF A2A Registry is compatible with Google's Agent-to-Agent (A2A) protocol, adding trust verification and delegation scope enforcement on top of standard A2A message flows.

---

## 8. Security Considerations

- Maximum delegation depth: 3 (prevents deep chains)
- Scope escalation prevention: child delegation cannot exceed parent permissions
- Time-bounded delegations with automatic expiry

---

## References

- A2A Protocol: https://github.com/google/agent-protocol
- MCPF Core: specs/MCPF-core.md
- W3C VC: https://www.w3.org/TR/vc-data-model/

---

**END OF MCPF A2A REGISTRY SPECIFICATION**
