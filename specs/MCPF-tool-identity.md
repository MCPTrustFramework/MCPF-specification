# MCPF Tool-Based Identity Discovery Specification

**Version:** 1.0.0-draft  
**Status:** Draft  
**Date:** 2026-02-07  
**Authors:** MCP Trust Framework Contributors  
**Reference Implementation:** [KISC MCP Server](https://github.com/kisc-gov-lv/ikt-arh-kultura-valodu-tehnologijas) (Latvian Government)

---

## Abstract

This document specifies **Tool-Based Identity Discovery** — a mechanism for MCP servers to expose their identity, trust credentials, and verification metadata through a standard MCP tool named `identify`. This enables AI clients that interact exclusively through the MCP tool protocol to discover and evaluate server trust without requiring direct HTTP access to `.well-known` endpoints.

Tool-based identity discovery operates in parallel with HTTP-based `.well-known` discovery, creating a **dual-path** architecture that ensures trust metadata is accessible to all consumers regardless of their transport capabilities.

---

## 1. Introduction

### 1.1 Problem Statement

The Model Context Protocol (MCP) enables AI clients (hosts) to interact with external tools and data sources through a structured JSON-RPC protocol. MCPF adds a trust layer through identity, credentials, and verification.

However, the primary consumers of MCP servers — AI agents running inside platforms like Claude.ai, ChatGPT, Cursor, and similar products — interact with servers **exclusively** through the MCP tool protocol. These agents:

- **CANNOT** make arbitrary HTTP requests to `.well-known` URLs
- **CANNOT** access the server's web endpoints directly
- **CAN ONLY** call tools listed in the server's `tools/list` response

This creates a critical gap: the trust metadata that MCPF provides via `.well-known` HTTP endpoints is invisible to the AI agent that is actually consuming the MCP server's tools.

### 1.2 Solution

Tool-based identity discovery solves this by adding an `identify` tool to the MCP server's tool list. When called, it returns the server's identity, MCPF compliance information, credential references, and URLs to `.well-known` verification resources.

This approach:

1. Works within the existing MCP protocol — no extensions needed
2. Is accessible to any MCP client, regardless of transport capabilities
3. Bridges to `.well-known` endpoints by returning their URLs
4. Is backward-compatible — clients that don't call `identify` are unaffected

### 1.3 Relationship to `.well-known` Discovery

Tool-based discovery does **not** replace `.well-known` discovery. Both paths serve different consumers:

| Path | Consumer | Transport | Use Case |
|------|----------|-----------|----------|
| **Tool-based** (`identify`) | AI agents, MCP hosts | MCP protocol (JSON-RPC) | Runtime trust decisions by AI |
| **HTTP-based** (`.well-known`) | Crawlers, registries, SDKs | HTTP/HTTPS | Indexing, automated verification |

Both paths MUST return consistent information. The `identify` tool response references `.well-known` URLs, creating a bridge between the two discovery mechanisms.

### 1.4 Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHOULD", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [BCP 14](https://www.rfc-editor.org/info/bcp14) [RFC 2119] [RFC 8174].

| Term | Definition |
|------|-----------|
| **AI Client** | An MCP host or agent that interacts with MCP servers through the MCP protocol |
| **Identity Response** | The JSON object returned by the `identify` tool |
| **Compliance Tag** | A string identifier indicating a specific MCPF capability |
| **Verification URL** | A URL pointing to a `.well-known` resource for out-of-band verification |

---

## 2. Normative Requirements

### 2.1 MCPF-TID-001: `identify` Tool Presence

All MCPF-compliant MCP servers MUST expose a tool named `identify` in their `tools/list` response.

The tool MUST be available at **all compliance levels** (Level 0 through Level 3).

The tool MUST NOT require authentication or authorization to call. Trust metadata is public information that enables trust evaluation before any privileged interaction.

### 2.2 MCPF-TID-002: Tool Definition

The `identify` tool MUST conform to the MCP tool definition specified in `schemas/identify-tool-definition.json`.

**Summary:**

```json
{
  "name": "identify",
  "description": "Returns server identity, ownership proof, and trust credentials. Call this to verify who operates this MCP server before trusting its data.",
  "inputSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "include_verification_urls": {
        "type": "boolean",
        "description": "Include URLs for external verification (default: true)"
      }
    }
  }
}
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include_verification_urls` | boolean | `true` | When `true`, includes the `verification` object with `.well-known` URLs. When `false`, omits verification URLs. |

### 2.3 MCPF-TID-003: Response Schema

The `identify` tool MUST return a JSON object conforming to `schemas/identify-tool-response.json`.

**Required fields:**
- `identity.server.name` — Server identifier string
- `identity.server.version` — Semantic version string
- `framework.name` — MUST be `"MCPF"`
- `framework.version` — MCPF spec version implemented
- `_note` — Human-readable trust context string

**Conditional fields (by compliance level):**
- Level 0: `identity.server`, `framework` (minimum)
- Level 1+: `identity.did`, `verification` object with `.well-known` URLs
- Level 2+: `verification.challenge_endpoint`
- Level 3: `credentials` object with issuer and credential URL

**Optional fields (all levels):**
- `identity.operator` — Organization operating the server
- `framework.layer` — MCPF architecture layer number
- `framework.compliance` — Array of compliance tags

### 2.4 MCPF-TID-004: Dual-Path Consistency

If an MCP server exposes both the `identify` tool and `.well-known` HTTP endpoints, the information returned by both paths MUST be consistent.

Specifically:
- `identity.did` in the tool response MUST match the `id` field in `/.well-known/did.json`
- `credentials.credential_url` MUST resolve to a valid credential whose `credentialSubject.id` matches `identity.did`
- `verification` URLs MUST resolve to valid resources

### 2.5 MCPF-TID-005: Trust Context Note

The response MUST include a `_note` field containing a human-readable string that indicates:
- The compliance level of the server's self-attestation
- How to verify the claims (e.g., "Verify credentials at the provided URLs")
- That the consumer should apply their own trust policy

**Example:**
```
"This server implements MCPF Layer 1 trust discovery. Verify credentials at the provided URLs or trust this self-attestation based on your policy."
```

---

## 3. Response Schema

### 3.1 Complete Response Structure

```json
{
  "identity": {
    "server": {
      "name": "string (REQUIRED)",
      "version": "string (REQUIRED)",
      "description": "string (OPTIONAL)"
    },
    "operator": {
      "name": "string (OPTIONAL)",
      "name_en": "string (OPTIONAL)",
      "jurisdiction": "string (OPTIONAL)",
      "sector": "string (OPTIONAL)"
    },
    "did": "string (OPTIONAL, REQUIRED Level 1+)"
  },
  "framework": {
    "name": "MCPF (REQUIRED)",
    "version": "string (REQUIRED)",
    "layer": "integer (OPTIONAL)",
    "compliance": ["string (OPTIONAL)"],
    "spec": "string (OPTIONAL)"
  },
  "credentials": {
    "issuer": "string (OPTIONAL, REQUIRED Level 3)",
    "type": ["string (OPTIONAL)"],
    "subject": "string (OPTIONAL)",
    "issued": "string (OPTIONAL)",
    "credential_url": "string (OPTIONAL, REQUIRED Level 3)"
  },
  "verification": {
    "jwks_uri": "string (OPTIONAL)",
    "did_document": "string (OPTIONAL, REQUIRED Level 1+)",
    "mcp_manifest": "string (OPTIONAL)",
    "trust_registry": "string (OPTIONAL)",
    "challenge_endpoint": "string (OPTIONAL, REQUIRED Level 2+)"
  },
  "_note": "string (REQUIRED)"
}
```

### 3.2 Compliance Tags

The `framework.compliance` array MAY contain one or more of the following standardized tags:

| Tag | Meaning |
|-----|---------|
| `session-trust-metadata` | Server includes trust metadata in session context |
| `tool-based-discovery` | Server exposes `identify` tool (this spec) |
| `well-known-discovery` | Server publishes `.well-known` HTTP endpoints |
| `credential-verified` | Server holds a verified credential from a trust anchor |
| `challenge-response` | Server implements challenge-response key ownership proof |

Implementations MAY include additional vendor-specific tags. Vendor tags SHOULD use a namespace prefix (e.g., `vendor:custom-tag`).

### 3.3 Extension Points

The response schema allows `additionalProperties` at the top level and within the `identity.operator` object. This enables vendor-specific extensions without breaking schema validation.

Vendor extensions SHOULD:
- Use a namespace prefix to avoid collisions (e.g., `x-vendor-field`)
- Not override the meaning of standard fields
- Be documented if intended for interoperability

---

## 4. Implementation Guide

### 4.1 Minimal Implementation (Level 0)

A Level 0 implementation requires only the `identify` tool with basic self-attestation:

```python
# Python (MCP SDK)
@server.tool()
async def identify(include_verification_urls: bool = True) -> dict:
    """Returns server identity, ownership proof, and trust credentials."""
    return {
        "identity": {
            "server": {
                "name": "my-mcp-server",
                "version": "1.0.0",
                "description": "My MCP server description"
            },
            "operator": {
                "name": "My Organization"
            }
        },
        "framework": {
            "name": "MCPF",
            "version": "1.0",
            "compliance": ["tool-based-discovery"]
        },
        "_note": "Self-attested identity. No independent verification available."
    }
```

### 4.2 Full Implementation (Level 3)

A Level 3 implementation includes DID, credentials, and all verification URLs:

```python
@server.tool()
async def identify(include_verification_urls: bool = True) -> dict:
    """Returns server identity, ownership proof, and trust credentials."""
    response = {
        "identity": {
            "server": {
                "name": "my-production-server",
                "version": "2.0.0",
                "description": "Production MCP server with full MCPF compliance"
            },
            "operator": {
                "name": "Acme Corporation",
                "jurisdiction": "EU",
                "sector": "Enterprise"
            },
            "did": "did:web:mcp.acme.com"
        },
        "framework": {
            "name": "MCPF",
            "version": "1.0",
            "layer": 1,
            "compliance": [
                "tool-based-discovery",
                "well-known-discovery",
                "credential-verified",
                "challenge-response"
            ],
            "spec": "https://github.com/MCPTrustFramework/MCPF-specification"
        },
        "credentials": {
            "issuer": "did:web:veritrust.vc",
            "type": ["VerifiableCredential", "MCPServerVerification"],
            "subject": "did:web:mcp.acme.com",
            "issued": "2026-01-15T00:00:00Z",
            "credential_url": "https://veritrust.vc/credentials/acme-mcp.json"
        },
        "_note": "MCPF Level 3 compliant. Verify credential at credential_url. Challenge endpoint available for key ownership proof."
    }
    
    if include_verification_urls:
        response["verification"] = {
            "jwks_uri": "https://mcp.acme.com/.well-known/jwks.json",
            "did_document": "https://mcp.acme.com/.well-known/did.json",
            "mcp_manifest": "https://mcp.acme.com/.well-known/mcp/manifest.json",
            "trust_registry": "https://mcp.acme.com/.well-known/mcp-trust-registry.json",
            "challenge_endpoint": "https://mcp.acme.com/.well-known/mcp/challenge"
        }
    
    return response
```

### 4.3 TypeScript Implementation

```typescript
server.tool("identify", {
  description: "Returns server identity, ownership proof, and trust credentials.",
  inputSchema: {
    type: "object",
    properties: {
      include_verification_urls: {
        type: "boolean",
        description: "Include URLs for external verification (default: true)"
      }
    }
  }
}, async ({ include_verification_urls = true }) => {
  const response: any = {
    identity: {
      server: { name: "my-server", version: "1.0.0" },
      operator: { name: "My Org" },
      did: "did:web:mcp.example.com"
    },
    framework: {
      name: "MCPF",
      version: "1.0",
      compliance: ["tool-based-discovery", "well-known-discovery"]
    },
    _note: "Verify credentials at the provided URLs."
  };
  
  if (include_verification_urls) {
    response.verification = {
      did_document: "https://mcp.example.com/.well-known/did.json",
      mcp_manifest: "https://mcp.example.com/.well-known/mcp/manifest.json"
    };
  }
  
  return response;
});
```

---

## 5. AI Client Behavior

### 5.1 Discovery Flow

When an AI client connects to an MCP server, it SHOULD:

1. Check if the server's `tools/list` includes an `identify` tool
2. If present, call `identify` with default parameters
3. Evaluate the response against its trust policy
4. Optionally, use verification URLs for deeper validation

### 5.2 Trust Evaluation

AI clients SHOULD evaluate the `identify` response based on their trust requirements:

| Check | Description | Reliability |
|-------|-------------|-------------|
| `framework.name == "MCPF"` | Server claims MCPF compliance | Self-attested |
| `identity.did` present | Server has a DID identity | Verifiable via `.well-known` |
| `credentials.credential_url` present | Server claims third-party verification | Verifiable via URL |
| `framework.compliance` contains `challenge-response` | Key ownership provable | Cryptographically verifiable |

### 5.3 Caching

AI clients MAY cache the `identify` response for the duration of an MCP session. The response SHOULD be refreshed:
- When a new session is established
- If a verification check fails
- Periodically (recommended: every 3600 seconds)

---

## 6. Security Considerations

### 6.1 Self-Attestation Limitations

The `identify` tool returns **self-attested** information. A malicious server can return false identity claims. AI clients MUST NOT treat the `identify` response as verified truth without independent validation via the verification URLs.

### 6.2 Verification URL Safety

Verification URLs point to external resources. AI clients that fetch these URLs SHOULD:
- Only fetch URLs over HTTPS
- Validate that the domain matches the claimed DID (e.g., `did:web:example.com` → `https://example.com/...`)
- Set appropriate timeouts
- Handle failures gracefully (treat as unverified, not as an error)

### 6.3 Information Disclosure

The `identify` tool exposes server metadata publicly. Operators SHOULD:
- Only include information they are comfortable making public
- Not include sensitive internal details in the response
- Use the `include_verification_urls` parameter to control URL exposure

---

## 7. Production Reference: KISC MCP Server

The first known production deployment of tool-based identity discovery is the **KISC MCP Server** operated by the Latvian Government's Cultural Information Systems Centre (KISC).

**Server:** https://llm.kis.gov.lv  
**Repository:** https://github.com/kisc-gov-lv/ikt-arh-kultura-valodu-tehnologijas  
**Domain:** Cultural heritage and language technology architecture documentation  
**Connected via:** Anthropic MCP Connector (Claude.ai)

**Live `identify` response (February 2026):**

```json
{
  "identity": {
    "server": {
      "name": "kisc-arch-kultura-valodu-mcp",
      "version": "0.2.0",
      "description": "MCP server for Latvian cultural heritage and language technology architecture documentation"
    },
    "operator": {
      "name": "Kultūras informācijas sistēmu centrs (KISC)",
      "name_en": "Cultural Information Systems Centre",
      "jurisdiction": "Latvia",
      "sector": "Government"
    },
    "did": "did:web:llm.kis.gov.lv"
  },
  "framework": {
    "name": "MCPF",
    "version": "0.1",
    "layer": 1,
    "compliance": ["session-trust-metadata", "tool-based-discovery"],
    "spec": "https://github.com/MCPTrustFramework/MCPF-specification"
  },
  "credentials": {
    "issuer": "did:web:veritrust.vc",
    "type": ["VerifiableCredential", "MCPServerVerification"],
    "subject": "did:web:llm.kis.gov.lv",
    "issued": "2026-01-29T10:12:41Z",
    "credential_url": "https://veritrust.vc/portal/mcp/credentials/aec9930b-9139-4b33-ac6f-ad3bd3d91da0.json"
  },
  "verification": {
    "jwks_uri": "https://llm.kis.gov.lv/.well-known/jwks.json",
    "did_document": "https://llm.kis.gov.lv/.well-known/did.json",
    "mcp_manifest": "https://llm.kis.gov.lv/.well-known/mcp/manifest.json",
    "trust_registry": "https://llm.kis.gov.lv/.well-known/mcp-trust-registry.json"
  },
  "_note": "This server implements MCPF Layer 1 trust discovery. Verify credentials at the provided URLs or trust this self-attestation based on your policy."
}
```

**Key design insight:** The tool response *bridges* to `.well-known` URLs — it returns pointers, not duplicated data. This ensures a single source of truth while making it discoverable through the MCP tool protocol.

---

## 8. Conformance

### 8.1 Conformance Checklist

An implementation conforms to this specification if it satisfies all of the following:

- [ ] **MCPF-TID-001:** Server exposes `identify` tool in `tools/list`
- [ ] **MCPF-TID-002:** Tool definition matches `schemas/identify-tool-definition.json`
- [ ] **MCPF-TID-003:** Response conforms to `schemas/identify-tool-response.json`
- [ ] **MCPF-TID-004:** Response is consistent with `.well-known` endpoints (if both exist)
- [ ] **MCPF-TID-005:** Response includes `_note` field with trust context

### 8.2 Conformance Testing

Conformance tests are defined in the [MCPF-conformance](https://github.com/MCPTrustFramework/MCPF-conformance) repository under `tests/tool-identity/`.

---

## References

- [MCP Specification](https://modelcontextprotocol.io) — Model Context Protocol
- [MCPF Core](specs/MCPF-core.md) — MCPF DID/VC infrastructure
- [W3C DID Core v1.0](https://www.w3.org/TR/did-core/) — Decentralized Identifiers
- [W3C VC Data Model v1.1](https://www.w3.org/TR/vc-data-model/) — Verifiable Credentials
- [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) — Key words for use in RFCs
- [KISC MCP Server](https://github.com/kisc-gov-lv/ikt-arh-kultura-valodu-tehnologijas) — Reference implementation

---

**END OF MCPF TOOL-BASED IDENTITY DISCOVERY SPECIFICATION**
