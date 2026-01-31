# MCPF Specification

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Specification Version](https://img.shields.io/badge/Version-1.1.0--alpha-blue.svg)](https://github.com/MCPTrustFramework/MCPF-specification/releases)
[![W3C DID](https://img.shields.io/badge/W3C-DID%20Core%20v1.0-green.svg)](https://www.w3.org/TR/did-core/)
[![W3C VC](https://img.shields.io/badge/W3C-VC%20Data%20Model%20v1.1-green.svg)](https://www.w3.org/TR/vc-data-model/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-brightgreen.svg)](https://modelcontextprotocol.io)

**The MCP Trust Framework (MCPF)** provides a complete trust infrastructure for AI agent systems, enabling secure agent-to-agent delegation and tool verification through decentralized identifiers (DIDs) and verifiable credentials (VCs).

## 🌟 What is MCPF?

MCPF solves the trust problem in agentic AI by providing:

- **🔐 Agent Identity** - Every AI agent has a verifiable DID
- **✅ Tool Verification** - MCP servers validated with signed credentials
- **🤝 Delegation Control** - Agent-to-agent trust policies
- **🔍 Discovery** - Human-readable agent names (ANS)
- **⚡ Instant Revocation** - Real-time credential revocation (<5 sec)

## 📚 Specification Documents

### Core Specifications

| Document | Description | Pages |
|----------|-------------|-------|
| [MCPF-core.md](specs/MCPF-core.md) | DID/VC infrastructure, StatusList2021, trust model | ~8,000 lines |
| [MCPF-mcp-registry.md](specs/MCPF-mcp-registry.md) | MCP server governance and verification | ~5,000 lines |
| [MCPF-ans.md](specs/MCPF-ans.md) | Agent Name Service (DNS for AI agents) | ~4,000 lines |
| [MCPF-a2a-registry.md](specs/MCPF-a2a-registry.md) | Agent-to-agent delegation control | ~3,000 lines |
| [MCPF-interop.md](specs/MCPF-interop.md) | Component integration and federation | ~2,500 lines |

**Total:** ~22,500 lines of technical specification

### JSON Schemas

| Schema | Description | Format |
|--------|-------------|--------|
| [mcp-server-credential.json](schemas/mcp-server-credential.json) | MCP server credential schema | W3C VC v1.1 |
| [agent-credential.json](schemas/agent-credential.json) | AI agent credential schema | W3C VC v1.1 |
| [ans-name.json](schemas/ans-name.json) | ANS name record schema | Custom |
| [a2a-policy.json](schemas/a2a-policy.json) | Delegation policy schema | Custom |
| [status-list.json](schemas/status-list.json) | StatusList2021 credential | W3C StatusList |

### Architecture Diagrams

| Diagram | Description | Format |
|---------|-------------|--------|
| [system-architecture.mmd](diagrams/system-architecture.mmd) | Complete MCPF architecture | Mermaid |
| [mcp-verification-workflow.mmd](diagrams/mcp-verification-workflow.mmd) | MCP server verification flow | Mermaid |
| [a2a-delegation-workflow.mmd](diagrams/a2a-delegation-workflow.mmd) | Agent delegation workflow | Mermaid |
| [ans-resolution-flow.mmd](diagrams/ans-resolution-flow.mmd) | ANS name resolution | Mermaid |
| [revocation-propagation.mmd](diagrams/revocation-propagation.mmd) | Revocation event flow | Mermaid |

## 🚀 Quick Start

### For Readers

Browse the specifications in reading order:

1. **Start here:** [MCPF-core.md](specs/MCPF-core.md) - Understand the foundation
2. **Then:** [MCPF-interop.md](specs/MCPF-interop.md) - See how components integrate
3. **Explore:** Individual component specs (ANS, MCP Registry, A2A Registry)

### For Implementers

1. **Read** the specification relevant to your component
2. **Validate** your implementation against JSON schemas
3. **Test** using the [MCPF-conformance](https://github.com/MCPTrustFramework/MCPF-conformance) test suite
4. **Deploy** using [MCPF-quickstarts](https://github.com/MCPTrustFramework/MCPF-quickstarts)

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

As of **v1.1.0-alpha**, MCPF compliance **requires** a challenge-response endpoint at `/.well-known/mcp/challenge` to prove private key ownership. DID:Web alone does not confirm control of the corresponding private key, so all entities must implement the challenge endpoint and declare it in their credentials before they are considered compliant. This is a breaking change for existing deployments.

## 🏗️ Architecture Overview

MCPF consists of four integrated components:

```
┌──────────────────────────────────────────┐
│  Layer 1: Identity Foundation            │
│  • DID/VC Infrastructure                 │
│  • StatusList2021 Revocation             │
│  • Trust Anchors                         │
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
│  • AI Agents                             │
│  • MCP Servers                           │
│  • Applications                          │
└──────────────────────────────────────────┘
```

See [system-architecture.mmd](diagrams/system-architecture.mmd) for detailed diagram.

## 📖 Examples

Complete working examples available at [MCPF-examples](https://github.com/MCPTrustFramework/MCPF-examples):

- **Banking Fraud Detection** - Multi-agent fraud analysis
- **Enterprise Chatbot** - Cross-system agent coordination
- **Healthcare Diagnostics** - Medical AI with certification

## 🔧 Reference Implementations

| Repository | Description | Language | Status |
|------------|-------------|----------|--------|
| [MCPF-did-vc](https://github.com/MCPTrustFramework/MCPF-did-vc) | DID/VC infrastructure | Python | Alpha |
| [MCPF-ans](https://github.com/MCPTrustFramework/MCPF-ans) | Agent Name Service | Python | Alpha |
| [MCPF-registry](https://github.com/MCPTrustFramework/MCPF-registry) | MCP Trust Registry | Python | Alpha |
| [MCPF-a2a-registry](https://github.com/MCPTrustFramework/MCPF-a2a-registry) | A2A Trust Registry | Python | Alpha |

## 📜 Standards Compliance

MCPF is built on established W3C and IETF standards:

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

**Veritrust** operates the first production MCPF deployment:
- **ANS:** https://ans.veritrust.vc
- **MCP Registry:** https://mcp.veritrust.vc
- **A2A Demo:** https://a2a.veritrust.vc

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Areas needing help:**
- Additional language SDKs (Go, Rust, Java)
- Use case examples
- Documentation improvements
- Test coverage

## 📝 License

This specification is released under dual license:
- **Code/Schemas:** [MIT License](LICENSE-MIT)
- **Documentation:** [CC BY 4.0](LICENSE-CC-BY-4.0)

This allows free use, modification, and distribution for both commercial and non-commercial purposes.

## 📞 Contact

- **Website:** https://mcpf.dev
- **Email:** hello@mcpf.dev
- **GitHub:** https://github.com/MCPTrustFramework
- **Discussions:** https://github.com/MCPTrustFramework/MCPF-specification/discussions

## 🗺️ Roadmap

**v1.1.0-alpha** (Current)
- ✅ Mandatory challenge-response endpoint requirement
- ✅ Three-tier compliance model (Basic, Self-Verified, Registry-Verified)
- ✅ Challenge endpoint schema and examples
- ✅ Reference implementations (Python)
- 🚧 TypeScript SDK (in progress)
- 🚧 Conformance tests (in progress)

**v1.1.0-beta** (Q1 2026)
- Production-ready reference implementations
- Complete conformance test suite
- Multiple production deployments
- Community feedback incorporated

**v1.1.0** (Q2 2026)
- Stable specification
- Full multi-language SDK support
- W3C standards track submission
- Enterprise adoption ready

---

**Last Updated:** January 31, 2026  
**Version:** 1.1.0-alpha  
**Status:** Active Development
