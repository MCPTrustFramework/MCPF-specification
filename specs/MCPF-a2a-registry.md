# MPension Fund A2A Trust Registry Specification
## Agent-to-Agent Trust and Delegation Control

**Version:** 1.1  
**Status:** Draft  
**Last Updated:** January 2026

---

## 1. Overview

The MPension Fund A2A (Agent-to-Agent) Trust Registry governs trust relationships and delegation permissions between AI agents. It provides:
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
  - Makes final decisions

specialist:
  - Domain-specific expertise
  - Receives delegated tasks
  - May delegate to sub-specialists
  - Returns results to orchestrator

interface:
  - User-facing interaction
  - Translates user intent
  - Delegates to orchestrators
  - Presents results to users

monitor:
  - Observes agent interactions
  - Collects metrics
  - Triggers alerts
  - Cannot delegate (read-only)
```

### 2.2 Role Hierarchy

```
┌─────────────────────────────────────┐
│         Interface Agent             │
│    (User-facing, initiates)         │
└──────────────┬──────────────────────┘
               │ delegates to
               ↓
┌─────────────────────────────────────┐
│      Orchestrator Agent             │
│   (Coordinates, delegates)          │
└──────────┬──────────────────────────┘
           │ delegates to
           ↓
┌─────────────────────────────────────┐
│      Specialist Agents              │
│   (Execute specific tasks)          │
└─────────────────────────────────────┘
```

---

## 3. Delegation Model

### 3.1 Delegation Record

```json
{
  "delegationId": "del_abc123",
  "from": {
    "did": "did:web:bank.com:agent:orchestrator",
    "role": "orchestrator",
    "name": "Workflow Orchestrator"
  },
  "to": {
    "did": "did:web:bank.com:agent:fraud-detector",
    "role": "specialist",
    "name": "Fraud Detection Specialist"
  },
  "scope": {
    "actions": ["analyze-transaction", "generate-risk-score"],
    "permissions": ["read:transactions", "write:risk-flags"],
    "dataAccess": ["transaction-data", "user-profile"],
    "timeLimit": "2025-12-30T11:00:00Z"
  },
  "context": {
    "taskId": "task_xyz789",
    "taskType": "fraud-analysis",
    "priority": "high",
    "metadata": {
      "transactionId": "tx_12345",
      "amount": 50000,
      "currency": "USD"
    }
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-12-30T10:00:00Z",
    "verificationMethod": "did:web:bank.com:agent:orchestrator#key-1",
    "proofValue": "z58DAdFfa9Skq..."
  },
  "audit": {
    "createdAt": "2025-12-30T10:00:00Z",
    "expiresAt": "2025-12-30T11:00:00Z",
    "status": "active"
  }
}
```

### 3.2 Delegation Verification

```python
def verify_delegation(delegation_record, registry):
    """
    Verify delegation is authorized and valid
    """
    # Step 1: Verify delegation signature
    from_agent = delegation_record['from']
    did_doc = resolve_did(from_agent['did'])
    public_key = extract_public_key(did_doc)
    
    if not verify_signature(delegation_record, public_key):
        raise InvalidDelegation("Signature verification failed")
    
    # Step 2: Check relationship authorization
    relationship = registry.get_relationship(
        from_did=from_agent['did'],
        to_did=delegation_record['to']['did']
    )
    
    if not relationship or relationship['status'] != 'authorized':
        raise UnauthorizedDelegation("No authorized relationship")
    
    # Step 3: Validate scope
    requested_permissions = delegation_record['scope']['permissions']
    allowed_permissions = relationship['allowedPermissions']
    
    for perm in requested_permissions:
        if perm not in allowed_permissions:
            raise ScopeViolation(f"Permission not allowed: {perm}")
    
    # Step 4: Check time constraints
    now = datetime.utcnow()
    expires = parse_datetime(delegation_record['audit']['expiresAt'])
    
    if now > expires:
        raise ExpiredDelegation("Delegation has expired")
    
    # All checks passed
    return True
```

---

## 4. Relationship Management

### 4.1 Relationship Registration

```http
POST /api/v1/relationships
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "fromAgent": "did:web:bank.com:agent:orchestrator",
  "toAgent": "did:web:bank.com:agent:fraud-detector",
  "relationshipType": "delegation",
  "allowedActions": [
    "analyze-transaction",
    "generate-risk-score",
    "flag-suspicious-activity"
  ],
  "allowedPermissions": [
    "read:transactions",
    "read:user-profiles",
    "write:risk-flags",
    "write:audit-logs"
  ],
  "constraints": {
    "maxDelegationDepth": 2,
    "timeRestrictions": {
      "businessHours": true,
      "timezone": "Asia/Singapore"
    },
    "dataClassification": ["confidential", "internal"],
    "requiresApproval": false
  },
  "validFrom": "2025-01-01T00:00:00Z",
  "validTo": "2026-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "relationshipId": "rel_abc123",
  "status": "active",
  "credential": {
    "type": "RelationshipCredential",
    "issuer": "did:web:example.gov",
    "credentialSubject": {
      "fromAgent": "did:web:bank.com:agent:orchestrator",
      "toAgent": "did:web:bank.com:agent:fraud-detector",
      "allowedActions": ["analyze-transaction", "generate-risk-score"],
      "allowedPermissions": ["read:transactions", "write:risk-flags"]
    },
    "proof": { ... }
  },
  "registeredAt": "2025-12-30T10:00:00Z"
}
```

### 4.2 Relationship Query

```http
GET /api/v1/relationships?fromAgent=did:web:bank.com:agent:orchestrator

Response:
{
  "relationships": [
    {
      "relationshipId": "rel_abc123",
      "toAgent": "did:web:bank.com:agent:fraud-detector",
      "relationshipType": "delegation",
      "status": "active",
      "allowedActions": ["analyze-transaction", "generate-risk-score"],
      "allowedPermissions": ["read:transactions", "write:risk-flags"]
    },
    {
      "relationshipId": "rel_def456",
      "toAgent": "did:web:bank.com:agent:compliance-checker",
      "relationshipType": "delegation",
      "status": "active",
      "allowedActions": ["check-compliance", "verify-kyc"],
      "allowedPermissions": ["read:customer-data", "write:compliance-reports"]
    }
  ],
  "totalCount": 2
}
```

---

## 5. Delegation Policies

### 5.1 Policy Schema

```json
{
  "policyId": "pol_fraud_analysis_v1",
  "name": "Fraud Analysis Delegation Policy",
  "version": "1.0",
  "scope": {
    "applicableTo": ["orchestrator"],
    "for": ["fraud-detection-tasks"]
  },
  "rules": [
    {
      "ruleId": "rule_001",
      "condition": {
        "taskType": "fraud-analysis",
        "transactionAmount": { "gt": 10000 }
      },
      "requirements": {
        "toAgent": {
          "role": "specialist",
          "capabilities": ["transaction-analysis"],
          "certification": ["fraud-detection-certified"]
        },
        "permissions": {
          "allowed": ["read:transactions", "write:risk-flags"],
          "denied": ["write:account-data", "execute:transfers"]
        },
        "constraints": {
          "timeLimit": 300,
          "requiresApproval": false,
          "auditLevel": "detailed"
        }
      }
    },
    {
      "ruleId": "rule_002",
      "condition": {
        "taskType": "fraud-analysis",
        "transactionAmount": { "gt": 100000 }
      },
      "requirements": {
        "toAgent": {
          "role": "specialist",
          "capabilities": ["transaction-analysis", "executive-review"],
          "certification": ["senior-fraud-analyst"]
        },
        "permissions": {
          "allowed": ["read:transactions", "read:full-history", "write:escalation"],
          "denied": ["write:account-data"]
        },
        "constraints": {
          "timeLimit": 600,
          "requiresApproval": true,
          "approver": "did:web:bank.com:agent:supervisor",
          "auditLevel": "comprehensive"
        }
      }
    }
  ],
  "enforcement": "strict",
  "auditRequired": true
}
```

### 5.2 Policy Evaluation

```python
def evaluate_delegation_policy(delegation_request, policy):
    """
    Evaluate if delegation request complies with policy
    """
    # Find matching rule
    matching_rule = None
    for rule in policy['rules']:
        if evaluate_condition(rule['condition'], delegation_request):
            matching_rule = rule
            break
    
    if not matching_rule:
        return {
            'allowed': False,
            'reason': 'No matching policy rule'
        }
    
    requirements = matching_rule['requirements']
    
    # Check to-agent requirements
    to_agent = get_agent(delegation_request['toAgent'])
    
    if to_agent['role'] != requirements['toAgent']['role']:
        return {
            'allowed': False,
            'reason': f"Agent role mismatch: expected {requirements['toAgent']['role']}"
        }
    
    for cap in requirements['toAgent']['capabilities']:
        if cap not in to_agent['capabilities']:
            return {
                'allowed': False,
                'reason': f"Missing capability: {cap}"
            }
    
    # Check permissions
    requested_perms = delegation_request['permissions']
    allowed_perms = requirements['permissions']['allowed']
    denied_perms = requirements['permissions']['denied']
    
    for perm in requested_perms:
        if perm in denied_perms:
            return {
                'allowed': False,
                'reason': f"Permission denied: {perm}"
            }
        if perm not in allowed_perms:
            return {
                'allowed': False,
                'reason': f"Permission not allowed: {perm}"
            }
    
    # Check approval requirement
    if requirements['constraints']['requiresApproval']:
        if not delegation_request.get('approval'):
            return {
                'allowed': False,
                'reason': 'Approval required but not provided',
                'approver': requirements['constraints']['approver']
            }
    
    # All checks passed
    return {
        'allowed': True,
        'constraints': requirements['constraints'],
        'auditLevel': requirements['constraints']['auditLevel']
    }
```

---

## 6. Audit Trail

### 6.1 Audit Event Schema

```json
{
  "eventId": "evt_abc123",
  "eventType": "delegation-created",
  "timestamp": "2025-12-30T10:00:00Z",
  "delegation": {
    "delegationId": "del_abc123",
    "fromAgent": "did:web:bank.com:agent:orchestrator",
    "toAgent": "did:web:bank.com:agent:fraud-detector",
    "scope": {
      "actions": ["analyze-transaction"],
      "permissions": ["read:transactions", "write:risk-flags"]
    }
  },
  "context": {
    "taskId": "task_xyz789",
    "transactionId": "tx_12345",
    "requestedBy": "user_john_doe",
    "ipAddress": "203.123.45.67"
  },
  "policyEvaluation": {
    "policyId": "pol_fraud_analysis_v1",
    "ruleId": "rule_001",
    "result": "allowed",
    "evaluationTime": "5ms"
  },
  "verification": {
    "signatureValid": true,
    "relationshipAuthorized": true,
    "scopeValid": true,
    "verificationTime": "15ms"
  },
  "metadata": {
    "registryVersion": "1.0",
    "clientSdk": "mcpf-python/1.0",
    "requestId": "req_xyz789"
  }
}
```

### 6.2 Audit Query API

```http
GET /api/v1/audit-logs?delegationId=del_abc123

Response:
{
  "delegationId": "del_abc123",
  "events": [
    {
      "eventType": "delegation-created",
      "timestamp": "2025-12-30T10:00:00Z",
      "result": "success"
    },
    {
      "eventType": "delegation-invoked",
      "timestamp": "2025-12-30T10:01:00Z",
      "action": "analyze-transaction",
      "result": "success"
    },
    {
      "eventType": "delegation-completed",
      "timestamp": "2025-12-30T10:05:00Z",
      "outcome": "risk-score-generated",
      "result": "success"
    }
  ],
  "totalEvents": 3,
  "delegationChain": [
    "did:web:bank.com:agent:orchestrator",
    "did:web:bank.com:agent:fraud-detector"
  ]
}
```

---

## 7. Integration with A2A Protocol

### 7.1 A2A Protocol Compatibility

MPension Fund A2A Registry is compatible with Google's Agent-to-Agent (A2A) protocol:

```
A2A Protocol Flow + MPension Fund Trust:

1. Agent Discovery (via ANS)
   └─ fraud-detector.finance.bank.agent → DID

2. Relationship Check (via A2A Registry)
   └─ Verify orchestrator can delegate to fraud-detector

3. Delegation Request (A2A Protocol)
   └─ Standard A2A task delegation

4. Trust Verification (MCPF)
   └─ Verify signature, check permissions, validate scope

5. Task Execution (A2A Protocol)
   └─ Standard A2A task execution

6. Audit Logging (MCPF)
   └─ Record complete delegation chain
```

### 7.2 A2A Message Format

```json
{
  "@context": "https://a2a.anthropic.com/v1",
  "type": "TaskDelegation",
  "from": "did:web:bank.com:agent:orchestrator",
  "to": "did:web:bank.com:agent:fraud-detector",
  "task": {
    "id": "task_xyz789",
    "type": "fraud-analysis",
    "data": {
      "transactionId": "tx_12345",
      "amount": 50000,
      "currency": "USD"
    }
  },
  "mcpf": {
    "delegationId": "del_abc123",
    "scope": {
      "permissions": ["read:transactions", "write:risk-flags"]
    },
    "proof": {
      "type": "Ed25519Signature2020",
      "verificationMethod": "did:web:bank.com:agent:orchestrator#key-1",
      "proofValue": "z58DAdFfa9Skq..."
    }
  }
}
```

---

## 8. Security Considerations

### 8.1 Delegation Chain Limits

```python
MAX_DELEGATION_DEPTH = 3  # Prevent deep chains

def check_delegation_depth(delegation_record):
    """
    Prevent excessively deep delegation chains
    """
    depth = 1
    current = delegation_record
    
    while current.get('parent_delegation'):
        depth += 1
        if depth > MAX_DELEGATION_DEPTH:
            raise DelegationDepthExceeded(
                f"Delegation depth {depth} exceeds maximum {MAX_DELEGATION_DEPTH}"
            )
        current = get_delegation(current['parent_delegation'])
    
    return depth
```

### 8.2 Scope Escalation Prevention

```python
def prevent_scope_escalation(parent_scope, child_scope):
    """
    Ensure child delegation cannot exceed parent permissions
    """
    parent_perms = set(parent_scope['permissions'])
    child_perms = set(child_scope['permissions'])
    
    if not child_perms.issubset(parent_perms):
        excess = child_perms - parent_perms
        raise ScopeEscalation(
            f"Child scope exceeds parent: {excess}"
        )
    
    return True
```

---

## References

- A2A Protocol: https://github.com/google/agent-protocol
- MPension Fund Core: https://github.com/MCPTrustFramework/MCPF-specification/blob/main/MCPF-core.md
- OAuth 2.0: https://www.rfc-editor.org/rfc/rfc6749
- W3C VC: https://www.w3.org/TR/vc-data-model/

---

**END OF MPension Fund A2A REGISTRY SPECIFICATION**
