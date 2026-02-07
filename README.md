# MCPF Specification

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Specification Version](https://img.shields.io/badge/Version-1.2.0--alpha-blue.svg)](https://github.com/MCPTrustFramework/MCPF-specification/releases)
[![W3C DID](https://img.shields.io/badge/W3C-DID%20Core%20v1.0-green.svg)](https://www.w3.org/TR/did-core/)
[![W3C VC](https://img.shields.io/badge/W3C-VC%20Data%20Model%20v1.1-green.svg)](https://www.w3.org/TR/vc-data-model/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-brightgreen.svg)](https://modelcontextprotocol.io)

**The MCP Trust Framework (MCPF)** provides a complete trust infrastructure for AI agent systems, enabling secure agent-to-agent delegation and tool verification through decentralized identifiers (DIDs) and verifiable credentials (VCs).

## 🌟 What is MCPF?

MCPF solves the trust problem in agentic AI by providing:

- **🔐 Agent Identity** — Every AI agent has a verifiable DID
- **🛡️ Tool-Based Identity Discovery** — AI agents verify server identity through the MCP protocol itself
- **✅ Tool Verification** — MCP servers validated with signed credentials
- **🤝 Delegation Control** — Agent-to-agent trust policies
- **🔍 Discovery** — Human-readable agent names (ANS) + dual-path `.well-known` bridging
- **⚡ Instant Revocation** — Real-time credential revocation (<5 sec)

## 🆕 Tool-Based Identity Discovery (v1.2)

AI clients like Claude.ai, ChatGPT, and Cursor interact with MCP servers **exclusively through tools** — they cannot access `.well-known` HTTP endpoints directly. MCPF v1.2 standardizes the `identify` tool as a **required component at all compliance levels**, enabling AI agents to discover and evaluate server trust at runtime.

**How it works:**

```
AI Agent ──[MCP protocol]──> MCP Server
    │                            │
    ├── tools/list               │
    │   └── "identify" tool ◄────┘
    │
    ├── Call identify ───────────> Returns:
    │                              • Server identity & operator
    │                              • MCPF compliance metadata
    │                              • Credential references
    │                              • .well-known verification URLs
    │
    └── Evaluate trust based on response
```

**Production reference:** [KISC MCP Server](https://github.com/kisc-gov-lv/ikt-arh-kultura-valodu-tehnologijas) (Latvian Government) — first known production deployment.

See [MCPF-tool-identity.md](specs/MCPF-tool-identity.md) for the full specification.

## 📚 Specification Documents

### Core Specifications

| Document | Description |
|----------|-------------|
| [MCPF-core.md](specs/MCPF-core.md) | DID/VC infrastructure, StatusList2021, trust model, compliance levels |
| [MCPF-tool-identity.md](specs/MCPF-tool-identity.md) | **NEW** — Tool-based identity discovery (`identify` tool) |
| [MCPF-mcp-registry.md](specs/MCPF-mcp-registry.md) | MCP server governance and verification |
| [MCPF-ans.md](specs/MCPF-ans.md) | Agent Name Service (DNS for AI agents) |
| [MCPF-a2a-registry.md](specs/MCPF-a2a-registry.md) | Agent-to-agent delegation control |
| [MCPF-interop.md](specs/MCPF-interop.md) | Component integration and federation |

### JSON Schemas

| Schema | Description | Format |
|--------|-------------|--------|
| [identify-tool-response.json](schemas/identify-tool-response.json) | **NEW** — `identify` tool response schema | MCPF |
| [identify-tool-definition.json](schemas/identify-tool-definition.json) | **NEW** — `identify` MCP tool definition | MCP |
| [mcp-server-credential.json](schemas/mcp-server-credential.json) | MCP server credential schema | W3C VC v1.1 |
| [agent-credential.json](schemas/agent-credential.json) | AI agent credential schema | W3C VC v1.1 |
| [challenge-endpoint.json](schemas/challenge-endpoint.json) | Challenge-response protocol schema | MCPF |
| [ans-name.json](schemas/ans-name.json) | ANS name record schema | Custom |
| [a2a-policy.json](schemas/a2a-policy.json) | Delegation policy schema | Custom |
| [status-list.json](schemas/status-list.json) | StatusList2021 credential | W3C StatusList |

### Architecture Diagrams

| Diagram | Description | Format |
|---------|-------------|--------|
| [dual-path-discovery.mmd](diagrams/dual-path-discovery.mmd) | **NEW** — Tool vs HTTP identity discovery paths | Mermaid |
| [system-architecture.mmd](diagrams/system-architecture.mmd) | Complete MCPF architecture | Mermaid |
| [mcp-verification-workflow.mmd](diagrams/mcp-verification-workflow.mmd) | MCP server verification flow | Mermaid |
| [a2a-delegation-workflow.mmd](diagrams/a2a-delegation-workflow.mmd) | Agent delegation workflow | Mermaid |
| [ans-resolution-flow.mmd](diagrams/ans-resolution-flow.mmd) | ANS name resolution | Mermaid |
| [revocation-propagation.mmd](diagrams/revocation-propagation.mmd) | Revocation event flow | Mermaid |

## 🚀 Quick Start

### For Readers

Browse the specifications in reading order:

1. **Start here:** [MCPF-core.md](specs/MCPF-core.md) — Understand the foundation
2. **New in v1.2:** [MCPF-tool-identity.md](specs/MCPF-tool-identity.md) — Tool-based identity discovery
3. **Then:** [MCPF-interop.md](specs/MCPF-interop.md) — See how components integrate
4. **Explore:** Individual component specs (ANS, MCP Registry, A2A Registry)

### For Implementers

**Add MCPF identity to your MCP server in 5 minutes:**

```python
# Python MCP SDK
@server.tool()
async def identify(include_verification_urls: bool = True) -> dict:
    """Returns server identity, ownership proof, and trust credentials."""
    return {
        "identity": {
            "server": {"name": "my-server", "version": "1.0.0"},
            "operator": {"name": "My Organization"}
        },
        "framework": {"name": "MCPF", "version": "1.0", "compliance": ["tool-based-discovery"]},
        "_note": "Self-attested identity. No independent verification available."
    }
```

See [examples/identify-tool/](examples/identify-tool/) for complete implementations in Python and TypeScript.

### For Integration

**Python:**
```bash
pip install mcpf
```
See: [MCPF-python](https://github.com/MCPTrustFramework/MCPF-python)

**TypeScript:**
```bash
npm install @mcpf/sdk
```
See: [MCPF-typescript](https://github.com/MCPTrustFramework/MCPF-typescript)

## 🔐 Security Notice

As of **v1.2.0-alpha**, MCPF compliance **requires** the `identify` tool at all levels (Level 0+). Servers at Level 2+ must also implement the challenge-response endpoint at `/.well-known/mcp/challenge` to prove private key ownership.

## 🏗️ Architecture Overview

MCPF consists of four integrated components with dual-path discovery:

```
┌──────────────────────────────────────────┐
│  Layer 1: Identity Foundation            │
│  • DID/VC Infrastructure                 │
│  • StatusList2021 Revocation             │
│  • Trust Anchors                         │
│  • identify tool (tool-based discovery)  │
│  • .well-known (HTTP-based discovery)    │
└──────────────┬───────────────────────────┘
               │
┌──────────────┴───────────────────────────┐
│  Layer 2: Discovery & Registries         │
│  • ANS (Agent Name Service)              │
│  • MCP Trust Registry                    │
│  • A2A Trust Registry                    │
└──────────────┬───────────────────────────┘
               │
┌──────────────┴───────────────────────────┐
│  Layer 3: Consumers                      │
│  • AI Agents (via identify tool)         │
│  • Crawlers/SDKs (via .well-known)       │
│  • Applications                          │
└──────────────────────────────────────────┘
```

See [system-architecture.mmd](diagrams/system-architecture.mmd) and [dual-path-discovery.mmd](diagrams/dual-path-discovery.mmd) for detailed diagrams.

## 📖 Examples

Complete working examples available at [MCPF-examples](https://github.com/MCPTrustFramework/MCPF-examples):

- **Tool-Based Identity Discovery** — KISC Latvian government reference implementation
- **Banking Fraud Detection** — Multi-agent fraud analysis
- **Enterprise Chatbot** — Cross-system agent coordination

## 🔧 Reference Implementations

| Repository | Description | Language | Status |
|------------|-------------|----------|--------|
| [MCPF-did-vc](https://github.com/MCPTrustFramework/MCPF-did-vc) | DID/VC infrastructure | Python | Alpha |
| [MCPF-ans](https://github.com/MCPTrustFramework/MCPF-ans) | Agent Name Service | Python | Alpha |
| [MCPF-registry](https://github.com/MCPTrustFramework/MCPF-registry) | MCP Trust Registry | Python | Alpha |
| [MCPF-a2a-registry](https://github.com/MCPTrustFramework/MCPF-a2a-registry) | A2A Trust Registry | Python | Alpha |

## 📜 Standards Compliance

### W3C Standards
- ✅ [DID Core v1.0](https://www.w3.org/TR/did-core/)
- ✅ [VC Data Model v1.1](https://www.w3.org/TR/vc-data-model/)
- ✅ [StatusList2021](https://w3c-ccg.github.io/vc-status-list-2021/)

### IETF Standards
- ✅ [OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749) (RFC 6749)
- ✅ [JWT](https://www.rfc-editor.org/rfc/rfc7519) (RFC 7519)
- ✅ [Ed25519](https://www.rfc-editor.org/rfc/rfc8032) (RFC 8032)

### Protocol Compatibility
- ✅ [MCP (Model Context Protocol)](https://modelcontextprotocol.io)
- ✅ [Google A2A Protocol](https://github.com/google/agent-protocol)

## 🌐 Production Deployments

| Deployment | Operator | Level | Status |
|------------|----------|-------|--------|
| [KISC MCP Server](https://llm.kis.gov.lv) | Latvian Government (KISC) | Level 1 | ✅ Production |
| [VeriTrust](https://veritrust.vc) | VeriTrust | Level 3 | ✅ Production |

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Areas needing help:**
- Additional language SDKs (Go, Rust, Java)
- `identify` tool implementations in existing MCP servers
- Use case examples
- Conformance test coverage

## 📝 License

This specification is released under dual license:
- **Code/Schemas:** [MIT License](LICENSE-MIT)
- **Documentation:** [CC BY 4.0](LICENSE-CC-BY-4.0)

## 📞 Contact

- **Website:** https://mcpf.dev
- **Email:** hello@mcpf.dev
- **GitHub:** https://github.com/MCPTrustFramework
- **Discussions:** https://github.com/MCPTrustFramework/MCPF-specification/discussions

## 🗺️ Roadmap

**v1.2.0-alpha** (Current)
- ✅ Tool-based identity discovery specification (`identify` tool)
- ✅ Dual-path discovery architecture (tool + HTTP)
- ✅ Four-tier compliance model (Level 0–3 with `identify` at all levels)
- ✅ KISC production reference deployment
- ✅ JSON schemas for identify tool response and definition
- 🚧 Conformance tests for tool-based discovery
- 🚧 SDK integration (Python + TypeScript)

**v1.2.0-beta** (Q1 2026)
- Production-ready SDK support for `identify` tool
- Complete conformance test suite
- Additional production deployments
- Community feedback incorporated

**v1.2.0** (Q2 2026)
- Stable specification
- Full multi-language SDK support
- W3C standards track submission
- Enterprise adoption ready

---

**Last Updated:** February 7, 2026  
**Version:** 1.2.0-alpha  
**Status:** Active Development
