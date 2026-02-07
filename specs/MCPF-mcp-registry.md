# MCPF MCP Registry Specification
## MCP Server Governance and Trust Layer

**Version:** 1.1  
**Status:** Draft  
**Last Updated:** February 2026

---

## 1. Overview

The MCPF MCP Registry provides a trust layer for Model Context Protocol (MCP) servers, enabling:
- Cryptographic verification of MCP server identity
- Capability-based access control
- Real-time revocation of compromised servers
- Audit trail for compliance
- Discovery and resolution of trusted servers

**Relationship to Official MCP Registry:**
- MCPF MCP Registry adds trust infrastructure to the official MCP Registry
- Does not replace the official registry
- Compatible with existing MCP implementations

---

## 2. Architecture

The registry consists of a Server Registry (DIDs, credentials, capabilities, status), a Verification Service (signature check, revocation check, capability validation), and a Search/Discovery layer (by capability, operator, or domain).

---

## 3. MCP Server Registration

Operators submit server details, the registry verifies the operator, issues a DID, and the trust anchor issues a Verifiable Credential. See `schemas/mcp-server-credential.json` for the credential schema.

---

## 4. MCP Server Discovery

### 4.1 Search API

```http
GET /api/v1/servers/search?capability=getCurrentWeather
```

Returns matching servers with DIDs, capabilities, operator info, and credential URLs.

### 4.2 Well-Known Discovery

```http
GET /.well-known/mcp-trust-registry.json
```

Returns registry endpoint, trust anchor DID, status list endpoint, and supported capabilities.

---

## 5. MCP Server Verification

Verification includes: credential signature verification, expiration check, revocation status check (via StatusList2021), capability validation, and scope validation.

---

## 6. Capability Management

Capabilities define what tools an MCP server exposes, with scope levels (read, write, execute, admin), rate limits, and SLA targets.

---

## 7. Revocation and Incident Management

Immediate revocation for security breaches, key exposure, or malicious activity. Scheduled revocation for expired audits or service discontinuation. Status list update propagates in <5 seconds.

---

## 8. Audit and Compliance

All registration, verification, and revocation events are logged with cryptographic proof for compliance reporting.

---

## 9. API Reference

```
POST   /api/v1/servers/register
GET    /api/v1/servers
GET    /api/v1/servers/{did}
GET    /api/v1/servers/{did}/credential
GET    /api/v1/servers/search
POST   /api/v1/verify
POST   /api/v1/revoke
GET    /api/v1/audit-logs
```

---

## References

- MCP Protocol: https://modelcontextprotocol.io
- MCPF Core: specs/MCPF-core.md
- W3C VC Data Model: https://www.w3.org/TR/vc-data-model/

---

**END OF MCPF MCP REGISTRY SPECIFICATION**
