# MCPF Tool-Based Identity Discovery — Examples

This directory contains reference implementations and production examples for the MCPF `identify` tool specification ([MCPF-tool-identity.md](../../specs/MCPF-tool-identity.md)).

## Files

| File | Description |
|------|-------------|
| [kisc-production-response.json](kisc-production-response.json) | Live production response from KISC MCP Server (Latvian Government) |
| [python-example.py](python-example.py) | Python reference implementation using MCP SDK |
| [typescript-example.ts](typescript-example.ts) | TypeScript reference implementation using MCP SDK |

## Production Reference: KISC MCP Server

The first known production deployment of tool-based identity discovery is the **KISC MCP Server** operated by Latvia's Cultural Information Systems Centre.

- **Server URL:** https://llm.kis.gov.lv
- **Repository:** https://github.com/kisc-gov-lv/ikt-arh-kultura-valodu-tehnologijas
- **Connected via:** Anthropic MCP Connector (Claude.ai)
- **Credential Issuer:** VeriTrust (did:web:veritrust.vc)

The KISC server demonstrates the **dual-path architecture**: the `identify` tool returns metadata including URLs to `.well-known` endpoints, bridging tool-based discovery to HTTP-based verification.

## Quick Start

### Add `identify` to an existing Python MCP server:

```python
from mcp.server import Server

server = Server("my-server")

@server.tool()
async def identify(include_verification_urls: bool = True) -> dict:
    """Returns server identity, ownership proof, and trust credentials."""
    return {
        "identity": {
            "server": {"name": "my-server", "version": "1.0.0"},
            "operator": {"name": "My Organization"}
        },
        "framework": {
            "name": "MCPF",
            "version": "1.0",
            "compliance": ["tool-based-discovery"]
        },
        "_note": "Self-attested identity. No independent verification available."
    }
```

### Validate against schema:

```bash
pip install jsonschema
python -c "
import json, jsonschema
with open('../../schemas/identify-tool-response.json') as f:
    schema = json.load(f)
with open('kisc-production-response.json') as f:
    response = json.load(f)
jsonschema.validate(response, schema)
print('✓ Valid')
"
```

## Compliance Levels

| Level | What `identify` returns | What else is needed |
|-------|------------------------|---------------------|
| **0** | `identity.server` + `framework` + `_note` | Nothing |
| **1** | + `identity.did` + `verification.did_document` | DID document at `.well-known` |
| **2** | + `verification.challenge_endpoint` | Challenge endpoint |
| **3** | + `credentials` with `credential_url` | Trust registry credential |

## See Also

- [MCPF-tool-identity.md](../../specs/MCPF-tool-identity.md) — Full specification
- [identify-tool-response.json](../../schemas/identify-tool-response.json) — JSON Schema
- [identify-tool-definition.json](../../schemas/identify-tool-definition.json) — MCP tool definition schema
- [dual-path-discovery.mmd](../../diagrams/dual-path-discovery.mmd) — Architecture diagram
