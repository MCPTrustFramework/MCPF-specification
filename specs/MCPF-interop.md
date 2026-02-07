# MCPF Component Interoperability Specification
## How the Four Components Work Together

**Version:** 1.1  
**Status:** Draft  
**Last Updated:** February 2026

---

## 1. Overview

MCPF consists of four integrated components:

1. **DID/VC Infrastructure** - Cryptographic identity foundation
2. **ANS (Agent Name Service)** - Human-readable discovery
3. **MCP Trust Registry** - Tool/server governance
4. **A2A Trust Registry** - Agent relationship control

This document describes how these components integrate and interact.

---

## 2. Component Integration Map

```
DID/VC Infrastructure (Foundation)
  ├── Issues DIDs for all entities
  ├── Issues VCs for agents and servers
  └── Manages StatusList2021 for revocation
       │
  ┌────┴─────┬──────────┬────────────┐
  │          │          │            │
  ANS      MCP       A2A         Agents
  Service  Registry  Registry    (Consumers)
```

---

## 3. Integration Scenarios

### 3.1 Agent Registration (Full Stack)
DID issuance → ANS name registration → A2A agent registration → Verification

### 3.2 MCP Server Usage (Full Stack)
Server registration → Agent discovery → Credential verification → Tool invocation

### 3.3 Agent Delegation (Full Stack)
ANS discovery → A2A relationship check → Delegation with proof → Tool access

---

## 4. Data Flow Patterns

DID resolution, credential verification, and cross-component queries all flow through the DID/VC Infrastructure as the trust foundation.

---

## 5. Security Integration

Trust chain verification flows from the root DID/VC infrastructure through ANS (name-to-DID binding), MCP/A2A registries (application-layer authorization), to consumer agents. Revocation propagates in <5 seconds across all components.

---

## 6. Deployment Patterns

Supports both monolithic (single server) and distributed (microservices with Kafka event bus) deployment patterns.

---

## References

- MCPF Core: specs/MCPF-core.md
- ANS Specification: specs/MCPF-ans.md
- MCP Registry: specs/MCPF-mcp-registry.md
- A2A Registry: specs/MCPF-a2a-registry.md

---

**END OF MCPF INTEROPERABILITY SPECIFICATION**
