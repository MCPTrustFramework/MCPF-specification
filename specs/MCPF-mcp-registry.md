# MPension Fund MCP Registry Specification
## MCP Server Governance and Trust Layer

**Version:** 1.1  
**Status:** Draft  
**Last Updated:** January 2026

---

## 1. Overview

The MPension Fund MCP Registry provides a trust layer for Model Context Protocol (MCP) servers, enabling:
- Cryptographic verification of MCP server identity
- Capability-based access control
- Real-time revocation of compromised servers
- Audit trail for compliance
- Discovery and resolution of trusted servers

**Relationship to Official MCP Registry:**
- MPension Fund MCP Registry adds trust infrastructure to the official Anthropic MCP Registry
- Does not replace the official registry
- Compatible with existing MCP implementations

---

## 2. Architecture

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────┐
│              MPension Fund MCP REGISTRY ARCHITECTURE             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │   MCP Server     │         │   Trust Anchor   │    │
│  │   Operator       │────────→│   (Issuer)       │    │
│  │                  │ Request │                  │    │
│  └──────────────────┘  Cred   └────────┬─────────┘    │
│                                         │              │
│                                    Issues VC           │
│                                         ↓              │
│  ┌──────────────────────────────────────────────────┐ │
│  │            MCP TRUST REGISTRY                    │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │ Server Registry                            │ │ │
│  │  │ - DIDs                                     │ │ │
│  │  │ - Credentials                              │ │ │
│  │  │ - Capabilities                             │ │ │
│  │  │ - Status                                   │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │ Verification Service                       │ │ │
│  │  │ - Signature check                          │ │ │
│  │  │ - Revocation check                         │ │ │
│  │  │ - Capability validation                    │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────────┐ │ │
│  │  │ Search/Discovery                           │ │ │
│  │  │ - By capability                            │ │ │
│  │  │ - By operator                              │ │ │
│  │  │ - By domain                                │ │ │
│  │  └────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────┘ │
│                           ↑                           │
│                      Query/Verify                     │
│                           │                           │
│  ┌──────────────────────────────────────┐            │
│  │      AI Agent (Consumer)             │            │
│  │   Needs to invoke MCP server         │            │
│  └──────────────────────────────────────┘            │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### 2.2 Trust Flow

```
1. Server Registration
   Operator → Submit server details → Registry
   Registry → Verify operator → Issue DID
   Registry → Request credential → Trust Anchor
   Trust Anchor → Verify server → Issue VC
   Registry → Store credential → Database

2. Agent Discovery
   Agent → Search by capability → Registry
   Registry → Return matching servers → Agent
   Agent → Select server → Continue to verification

3. Agent Verification
   Agent → Request credential → Registry
   Registry → Return server credential → Agent
   Agent → Verify signature → DID resolver
   Agent → Check revocation → Status list
   Agent → Validate capabilities → Policy engine
   Agent → Proceed if valid → Invoke MCP server

4. Revocation (If Needed)
   Operator/Anchor → Report incident → Registry
   Registry → Update status list → Set bit to 1
   Registry → Notify consumers → Alert system
   Agents → Next verification → Detect revocation
```

---

## 3. MCP Server Registration

### 3.1 Registration Process

**Step 1: Operator Submits Request**
```http
POST /api/v1/servers/register
Content-Type: application/json
Authorization: Bearer {operator-token}

{
  "serverId": "weather-api",
  "operatorDid": "did:web:weather.example.gov",
  "name": "National Weather API",
  "description": "Real-time weather data for Singapore",
  "endpoint": "https://weather.example.gov/mcp",
  "capabilities": [
    {
      "name": "getCurrentWeather",
      "description": "Get current weather conditions",
      "parameters": {
        "location": "string",
        "units": "metric|imperial"
      },
      "scope": "read"
    },
    {
      "name": "getForecast",
      "description": "Get weather forecast",
      "parameters": {
        "location": "string",
        "days": "integer"
      },
      "scope": "read"
    }
  ],
  "dataClassification": "public",
  "compliance": ["PDPA"],
  "documentation": "https://weather.example.gov/mcp/docs"
}
```

**Step 2: Registry Verifies Operator**
```python
def verify_operator(operator_did):
    # Resolve operator DID
    did_document = resolve_did(operator_did)
    
    # Check operator has valid credential
    operator_cred = get_operator_credential(operator_did)
    
    # Verify credential from trust anchor
    if not verify_credential(operator_cred):
        raise InvalidOperator("Operator credential invalid")
    
    # Check operator not revoked
    if check_revocation(operator_cred):
        raise RevokedOperator("Operator credential revoked")
    
    return True
```

**Step 3: Registry Issues DID**
```
Generated DID: did:web:weather.example.gov:mcp:api

DID Document:
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:web:weather.example.gov:mcp:api",
  "controller": "did:web:weather.example.gov",
  "verificationMethod": [{
    "id": "did:web:weather.example.gov:mcp:api#key-1",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:web:weather.example.gov:mcp:api",
    "publicKeyMultibase": "z6Mkf..."
  }],
  "service": [{
    "id": "did:web:weather.example.gov:mcp:api#mcp-endpoint",
    "type": "MCPServer",
    "serviceEndpoint": "https://weather.example.gov/mcp"
  }]
}
```

**Step 4: Trust Anchor Issues Credential**
```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://mcpf.dev/schemas/v1"
  ],
  "type": ["VerifiableCredential", "MCPServerCredential"],
  "issuer": "did:web:example.gov",
  "issuanceDate": "2025-01-15T00:00:00Z",
  "expirationDate": "2026-01-15T00:00:00Z",
  "credentialSubject": {
    "id": "did:web:weather.example.gov:mcp:api",
    "serverId": "weather-api",
    "name": "National Weather API",
    "operator": "National Weather Service",
    "operatorDid": "did:web:weather.example.gov",
    "capabilities": [
      {
        "name": "getCurrentWeather",
        "scope": "read",
        "dataAccess": "public"
      },
      {
        "name": "getForecast",
        "scope": "read",
        "dataAccess": "public"
      }
    ],
    "dataClassification": "public",
    "endpoint": "https://weather.example.gov/mcp",
    "compliance": ["PDPA"],
    "securityAudit": {
      "date": "2025-01-10",
      "status": "passed",
      "auditor": "SGS Singapore"
    }
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
    "proofValue": "z3sG8AdFfa9SkqZ..."
  }
}
```

**Step 5: Registry Stores Credential**
```
Database Entry:
├─ DID: did:web:weather.example.gov:mcp:api
├─ Server ID: weather-api
├─ Operator DID: did:web:weather.example.gov
├─ Credential: [full VC]
├─ Status: active
├─ Registered: 2025-01-15
├─ Last Verified: 2025-01-15
└─ Endpoints: [https://weather.example.gov/mcp]
```

### 3.2 Registration Requirements

**Operator Requirements:**
- Valid DID with controller access
- Organization verification
- Security audit (for production)
- Compliance documentation

**Server Requirements:**
- Valid endpoint (HTTPS required)
- MCP protocol compliance
- Capability documentation
- Data classification labels

**Security Requirements:**
- TLS 1.3 minimum
- Ed25519 or ECDSA P-256 keys
- Key rotation plan
- Incident response contact

---

## 4. MCP Server Discovery

### 4.1 Search API

**Search by Capability**
```http
GET /api/v1/servers/search?capability=getCurrentWeather
Authorization: Bearer {agent-token}

Response:
{
  "query": {
    "capability": "getCurrentWeather"
  },
  "results": [
    {
      "did": "did:web:weather.example.gov:mcp:api",
      "serverId": "weather-api",
      "name": "National Weather API",
      "operator": "National Weather Service",
      "capabilities": ["getCurrentWeather", "getForecast"],
      "dataClassification": "public",
      "status": "active",
      "registeredAt": "2025-01-15T00:00:00Z",
      "credentialUrl": "/api/v1/servers/did:web:weather.example.gov:mcp:api/credential"
    },
    {
      "did": "did:web:openweather.org:mcp:api",
      "serverId": "openweather-global",
      "name": "OpenWeather Global API",
      "operator": "OpenWeather Ltd",
      "capabilities": ["getCurrentWeather", "getForecast", "getHistorical"],
      "dataClassification": "public",
      "status": "active",
      "registeredAt": "2024-11-20T00:00:00Z",
      "credentialUrl": "/api/v1/servers/did:web:openweather.org:mcp:api/credential"
    }
  ],
  "totalResults": 2
}
```

**Search by Operator**
```http
GET /api/v1/servers/search?operator=weather.example.gov

Response:
{
  "query": {
    "operator": "weather.example.gov"
  },
  "results": [
    {
      "did": "did:web:weather.example.gov:mcp:api",
      "serverId": "weather-api",
      "name": "National Weather API",
      "capabilities": ["getCurrentWeather", "getForecast"],
      "status": "active"
    },
    {
      "did": "did:web:weather.example.gov:mcp:historical",
      "serverId": "weather-historical",
      "name": "National Historical Weather Data",
      "capabilities": ["getHistoricalData", "getAnnualStatistics"],
      "status": "active"
    }
  ],
  "totalResults": 2
}
```

**Search by Data Classification**
```http
GET /api/v1/servers/search?dataClassification=public&compliance=PDPA

Response:
{
  "query": {
    "dataClassification": "public",
    "compliance": ["PDPA"]
  },
  "results": [
    /* Servers matching criteria */
  ],
  "totalResults": 15
}
```

### 4.2 Well-Known Discovery

Servers can be discovered via `.well-known` endpoint:

```http
GET /.well-known/mcp-trust-registry.json

Response:
{
  "registryEndpoint": "https://mcp-registry.example.gov/api/v1",
  "trustAnchor": "did:web:example.gov",
  "statusListEndpoint": "https://example.gov/status/mcp",
  "version": "1.0",
  "supportedCapabilities": [
    "server-registration",
    "credential-verification",
    "revocation-check",
    "search-discovery"
  ]
}
```

---

## 5. MCP Server Verification

### 5.1 Verification Workflow

```python
def verify_mcp_server(server_did, required_capabilities):
    """
    Verify MCP server before invocation
    """
    # Step 1: Retrieve server credential from registry
    response = requests.get(
        f"https://mcp-registry.example.gov/api/v1/servers/{server_did}"
    )
    server_data = response.json()
    credential = server_data['credential']
    
    # Step 2: Verify credential signature
    issuer_did = credential['issuer']
    issuer_doc = resolve_did(issuer_did)
    public_key = extract_public_key(issuer_doc)
    
    if not verify_signature(credential, public_key):
        raise InvalidCredential("Signature verification failed")
    
    # Step 3: Check expiration
    now = datetime.utcnow()
    issuance = parse_datetime(credential['issuanceDate'])
    expiration = parse_datetime(credential['expirationDate'])
    
    if now < issuance or now > expiration:
        raise ExpiredCredential("Credential expired or not yet valid")
    
    # Step 4: Check revocation status
    status = credential['credentialStatus']
    status_list = fetch_status_list(status['statusListCredential'])
    index = int(status['statusListIndex'])
    
    if check_bit(status_list, index) == 1:
        raise RevokedCredential("Server credential revoked")
    
    # Step 5: Verify capabilities
    server_caps = credential['credentialSubject']['capabilities']
    cap_names = [c['name'] for c in server_caps]
    
    for req_cap in required_capabilities:
        if req_cap not in cap_names:
            raise MissingCapability(f"Server lacks capability: {req_cap}")
    
    # Step 6: Validate scope
    for cap in server_caps:
        if cap['scope'] not in ['read', 'write', 'execute']:
            raise InvalidScope(f"Invalid scope: {cap['scope']}")
    
    # All checks passed
    return {
        'valid': True,
        'server_did': server_did,
        'endpoint': credential['credentialSubject']['endpoint'],
        'capabilities': server_caps,
        'operator': credential['credentialSubject']['operator']
    }
```

### 5.2 Verification Response

**Success Response:**
```json
{
  "verification": {
    "status": "valid",
    "timestamp": "2025-12-30T10:00:00Z",
    "checks": {
      "signatureValid": true,
      "notExpired": true,
      "notRevoked": true,
      "capabilitiesMatch": true,
      "scopeValid": true
    }
  },
  "server": {
    "did": "did:web:weather.example.gov:mcp:api",
    "name": "National Weather API",
    "endpoint": "https://weather.example.gov/mcp",
    "capabilities": [
      {"name": "getCurrentWeather", "scope": "read"},
      {"name": "getForecast", "scope": "read"}
    ],
    "operator": "National Weather Service",
    "dataClassification": "public"
  }
}
```

**Failure Response:**
```json
{
  "verification": {
    "status": "invalid",
    "timestamp": "2025-12-30T10:00:00Z",
    "reason": "credential-revoked",
    "details": "Server credential revoked on 2025-12-29 due to security incident",
    "checks": {
      "signatureValid": true,
      "notExpired": true,
      "notRevoked": false,
      "capabilitiesMatch": null,
      "scopeValid": null
    }
  },
  "alternativeServers": [
    "did:web:backup-weather.example.gov:mcp:api"
  ]
}
```

---

## 6. Capability Management

### 6.1 Capability Schema

```json
{
  "name": "getCurrentWeather",
  "description": "Retrieve current weather conditions",
  "category": "weather-data",
  "scope": "read",
  "parameters": {
    "location": {
      "type": "string",
      "required": true,
      "description": "City or coordinates"
    },
    "units": {
      "type": "string",
      "enum": ["metric", "imperial"],
      "default": "metric"
    }
  },
  "returns": {
    "type": "object",
    "properties": {
      "temperature": "number",
      "humidity": "number",
      "condition": "string"
    }
  },
  "dataAccess": "public",
  "rateLimit": {
    "requests": 1000,
    "period": "hour"
  },
  "sla": {
    "availability": "99.9%",
    "responseTime": "200ms"
  }
}
```

### 6.2 Scope Definitions

**Scope Levels:**
- **read:** Read-only data access, no state changes
- **write:** Modify data, create resources
- **execute:** Execute actions, trigger workflows
- **admin:** Administrative operations

**Scope Validation:**
```python
def validate_scope(capability, operation):
    """
    Validate operation against capability scope
    """
    scope_hierarchy = {
        'read': ['read'],
        'write': ['read', 'write'],
        'execute': ['read', 'write', 'execute'],
        'admin': ['read', 'write', 'execute', 'admin']
    }
    
    cap_scope = capability['scope']
    allowed = scope_hierarchy.get(cap_scope, [])
    
    if operation not in allowed:
        raise ScopeViolation(
            f"Operation '{operation}' not allowed with scope '{cap_scope}'"
        )
    
    return True
```

---

## 7. Revocation and Incident Management

### 7.1 Revocation Triggers

**Immediate Revocation:**
- Security breach (server compromised)
- Malicious activity detected
- Private key exposure
- Operator request (emergency)

**Scheduled Revocation:**
- Certificate expiration
- Failed security audit
- Policy violation
- Service discontinuation

### 7.2 Revocation Process

**Step 1: Incident Detection**
```
Trigger Sources:
├─ Security monitoring system
├─ Operator report
├─ Trust anchor audit
├─ External security researcher
└─ User complaints
```

**Step 2: Investigation**
```python
def investigate_incident(server_did, incident_report):
    # Gather evidence
    evidence = {
        'incident_type': incident_report['type'],
        'timestamp': incident_report['timestamp'],
        'description': incident_report['description'],
        'severity': assess_severity(incident_report)
    }
    
    # Determine action
    if evidence['severity'] == 'critical':
        return 'immediate-revocation'
    elif evidence['severity'] == 'high':
        return 'suspend-and-investigate'
    else:
        return 'monitor-and-review'
```

**Step 3: Revocation**
```python
def revoke_server(server_did, reason):
    # Update status list
    credential = get_server_credential(server_did)
    status = credential['credentialStatus']
    index = int(status['statusListIndex'])
    
    update_status_bit(
        status_list_url=status['statusListCredential'],
        index=index,
        value=1  # 1 = revoked
    )
    
    # Update registry database
    update_server_status(
        server_did=server_did,
        status='revoked',
        reason=reason,
        timestamp=datetime.utcnow()
    )
    
    # Notify stakeholders
    notify_revocation(
        server_did=server_did,
        reason=reason,
        alternative_servers=get_alternative_servers(server_did)
    )
```

**Step 4: Notification**
```json
{
  "notificationType": "server-revocation",
  "serverDid": "did:web:weather.example.gov:mcp:api",
  "serverId": "weather-api",
  "revocationDate": "2025-12-29T14:30:00Z",
  "reason": "security-incident",
  "details": "Unauthorized access detected, credentials compromised",
  "alternativeServers": [
    {
      "did": "did:web:backup-weather.example.gov:mcp:api",
      "name": "Backup Weather API",
      "status": "active"
    }
  ],
  "contactEmail": "security@weather.example.gov"
}
```

---

## 8. Audit and Compliance

### 8.1 Audit Trail

**Logged Events:**
```
Registration Events:
├─ Server registration request
├─ Operator verification
├─ Credential issuance
└─ Registration completion

Verification Events:
├─ Verification request
├─ Signature check
├─ Revocation check
├─ Capability validation
└─ Verification result

Revocation Events:
├─ Incident report
├─ Investigation started
├─ Revocation decision
├─ Status list update
└─ Notification sent
```

**Audit Log Schema:**
```json
{
  "eventId": "evt_abc123",
  "timestamp": "2025-12-30T10:00:00Z",
  "eventType": "server-verification",
  "actor": {
    "did": "did:web:bank.com:agent:fraud-detector",
    "type": "agent"
  },
  "subject": {
    "did": "did:web:weather.example.gov:mcp:api",
    "type": "mcp-server"
  },
  "action": "verify-credential",
  "result": "success",
  "details": {
    "checks": {
      "signatureValid": true,
      "notRevoked": true,
      "notExpired": true
    },
    "verificationTime": "15ms"
  },
  "metadata": {
    "ipAddress": "203.123.45.67",
    "userAgent": "MCPF-Python-SDK/1.0",
    "requestId": "req_xyz789"
  }
}
```

### 8.2 Compliance Reports

**Monthly Report:**
```
MPension Fund MCP Registry - Monthly Report
Period: December 2025

Registration Activity:
├─ New registrations: 45
├─ Renewals: 120
├─ Revocations: 3
└─ Active servers: 1,247

Verification Activity:
├─ Total verifications: 2,345,678
├─ Success rate: 99.87%
├─ Average response time: 12ms
└─ Failed verifications: 3,045 (0.13%)

Security Incidents:
├─ Reported: 5
├─ Investigated: 5
├─ Revocations: 3
└─ False positives: 2

Compliance:
├─ Security audits completed: 15
├─ Policy violations: 0
├─ Regulatory checks: Passed
└─ Uptime: 99.99%
```

---

## 9. API Reference

### 9.1 Registry Endpoints

**Server Management:**
```
POST   /api/v1/servers/register         # Register new server
GET    /api/v1/servers                   # List all servers
GET    /api/v1/servers/{did}             # Get server details
PUT    /api/v1/servers/{did}             # Update server
DELETE /api/v1/servers/{did}             # Revoke server
```

**Search and Discovery:**
```
GET    /api/v1/servers/search            # Search servers
GET    /api/v1/servers/{did}/credential  # Get server credential
GET    /api/v1/capabilities               # List all capabilities
GET    /api/v1/operators                  # List all operators
```

**Verification:**
```
POST   /api/v1/verify                     # Verify server credential
GET    /api/v1/status/{statusListId}      # Get status list
POST   /api/v1/batch-verify               # Batch verification
```

**Administration:**
```
POST   /api/v1/revoke                     # Revoke credential
GET    /api/v1/audit-logs                 # Get audit logs
GET    /api/v1/reports/monthly            # Get monthly report
```

### 9.2 Authentication

All API requests require authentication:

```http
Authorization: Bearer {jwt-token}

JWT Claims:
{
  "sub": "did:web:bank.com:agent:fraud-detector",
  "iss": "https://mcp-registry.example.gov",
  "aud": "mcp-registry-api",
  "iat": 1735560000,
  "exp": 1735563600,
  "scope": ["server:read", "server:verify"]
}
```

---

## 10. Integration Examples

### 10.1 Python Integration

```python
from mcpf import MCPRegistry

# Initialize registry client
registry = MCPRegistry("https://mcp-registry.example.gov")

# Search for weather servers
servers = registry.search(capability="getCurrentWeather")

# Get first server
server = servers[0]

# Verify server credential
verification = registry.verify(server['did'])

if verification['valid']:
    # Server is trusted, proceed to invoke
    endpoint = server['endpoint']
    # ... invoke MCP server
else:
    # Server not trusted
    print(f"Verification failed: {verification['reason']}")
```

### 10.2 TypeScript Integration

```typescript
import { MCPRegistry } from '@mcpf/registry';

const registry = new MCPRegistry('https://mcp-registry.example.gov');

// Search for servers
const servers = await registry.search({
  capability: 'getCurrentWeather',
  dataClassification: 'public'
});

// Verify server
const server = servers[0];
const verification = await registry.verify(server.did);

if (verification.valid) {
  // Proceed to invoke
  const endpoint = server.endpoint;
  // ... invoke MCP server
}
```

---

## References

- MCP Protocol: https://modelcontextprotocol.io
- MPension Fund Core: https://github.com/MCPTrustFramework/MCPF-specification/blob/main/MCPF-core.md
- Official MCP Registry: https://github.com/modelcontextprotocol/servers
- W3C VC Data Model: https://www.w3.org/TR/vc-data-model/

---

**END OF MPension Fund MCP REGISTRY SPECIFICATION**
