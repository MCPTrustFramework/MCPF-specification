/**
 * MCPF Tool-Based Identity Discovery — TypeScript Reference Implementation
 *
 * This example shows how to add the `identify` tool to any MCP server
 * built with the TypeScript MCP SDK.
 *
 * Requirements:
 *   npm install @modelcontextprotocol/sdk
 *
 * See: specs/MCPF-tool-identity.md for the full specification.
 */

// =============================================================================
// Types (matching schemas/identify-tool-response.json)
// =============================================================================

interface MCPFServerIdentity {
  name: string;
  version: string;
  description?: string;
}

interface MCPFOperator {
  name: string;
  name_en?: string;
  jurisdiction?: string;
  sector?: "Government" | "Enterprise" | "Academic" | "Nonprofit" | "Individual" | "Other";
}

interface MCPFCredentials {
  issuer: string;
  type: string[];
  subject: string;
  issued: string;
  credential_url: string;
}

interface MCPFVerification {
  jwks_uri?: string;
  did_document?: string;
  mcp_manifest?: string;
  trust_registry?: string;
  challenge_endpoint?: string;
}

type MCPFComplianceTag =
  | "session-trust-metadata"
  | "tool-based-discovery"
  | "well-known-discovery"
  | "credential-verified"
  | "challenge-response"
  | string; // vendor-prefixed tags allowed

interface MCPFIdentifyResponse {
  identity: {
    server: MCPFServerIdentity;
    operator?: MCPFOperator;
    did?: string;
  };
  framework: {
    name: "MCPF";
    version: string;
    layer?: number;
    compliance?: MCPFComplianceTag[];
    spec?: string;
  };
  credentials?: MCPFCredentials;
  verification?: MCPFVerification;
  _note: string;
}

// =============================================================================
// Configuration — customize for your server
// =============================================================================

const SERVER_CONFIG: MCPFServerIdentity = {
  name: "example-mcpf-server",
  version: "1.0.0",
  description: "Example MCP server with MCPF tool-based identity discovery",
};

const OPERATOR_CONFIG: MCPFOperator = {
  name: "Example Organization",
  jurisdiction: "EU",
  sector: "Enterprise",
};

const DID = "did:web:mcp.example.com";
const BASE_URL = "https://mcp.example.com";

const CREDENTIAL_CONFIG: MCPFCredentials | null = {
  issuer: "did:web:veritrust.vc",
  type: ["VerifiableCredential", "MCPServerVerification"],
  subject: DID,
  issued: "2026-01-15T00:00:00Z",
  credential_url: "https://veritrust.vc/credentials/example.json",
};

// =============================================================================
// identify tool implementation
// =============================================================================

function buildIdentifyResponse(
  includeVerificationUrls: boolean = true
): MCPFIdentifyResponse {
  const compliance: MCPFComplianceTag[] = ["tool-based-discovery"];

  const response: MCPFIdentifyResponse = {
    identity: {
      server: { ...SERVER_CONFIG },
      operator: { ...OPERATOR_CONFIG },
    },
    framework: {
      name: "MCPF",
      version: "1.0",
      compliance,
      spec: "https://github.com/MCPTrustFramework/MCPF-specification",
    },
    _note: "",
  };

  // Level 1+: Add DID
  if (DID) {
    response.identity.did = DID;
    compliance.push("well-known-discovery");
  }

  // Level 3: Add credentials
  if (CREDENTIAL_CONFIG) {
    response.credentials = { ...CREDENTIAL_CONFIG };
    compliance.push("credential-verified");
  }

  // Verification URLs (bridges to .well-known)
  if (includeVerificationUrls && DID) {
    response.verification = {
      did_document: `${BASE_URL}/.well-known/did.json`,
      mcp_manifest: `${BASE_URL}/.well-known/mcp/manifest.json`,
      trust_registry: `${BASE_URL}/.well-known/mcp-trust-registry.json`,
    };
  }

  // Trust context note
  response._note = CREDENTIAL_CONFIG
    ? `MCPF Level 3 compliant. Verify credential at ${CREDENTIAL_CONFIG.credential_url}.`
    : DID
      ? `MCPF Level 1. DID identity at ${DID}. Verify via .well-known URLs.`
      : "Self-attested identity. No independent verification available.";

  return response;
}

// =============================================================================
// MCP Server integration example
// =============================================================================

/**
 * Register the identify tool on an MCP server.
 *
 * Usage with @modelcontextprotocol/sdk:
 *
 *   import { Server } from "@modelcontextprotocol/sdk/server/index.js";
 *   const server = new Server({ name: "my-server", version: "1.0.0" }, { capabilities: { tools: {} } });
 *   registerIdentifyTool(server);
 */
function registerIdentifyTool(server: any): void {
  server.setRequestHandler(
    "tools/list" as any,
    async () => ({
      tools: [
        {
          name: "identify",
          description:
            "Returns server identity, ownership proof, and trust credentials. " +
            "Call this to verify who operates this MCP server before trusting its data.",
          inputSchema: {
            type: "object" as const,
            additionalProperties: false,
            properties: {
              include_verification_urls: {
                type: "boolean" as const,
                description: "Include URLs for external verification (default: true)",
              },
            },
          },
        },
        // ... other tools
      ],
    })
  );

  server.setRequestHandler(
    "tools/call" as any,
    async (request: any) => {
      if (request.params.name === "identify") {
        const includeUrls = request.params.arguments?.include_verification_urls ?? true;
        const response = buildIdentifyResponse(includeUrls);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }
      // ... handle other tools
      throw new Error(`Unknown tool: ${request.params.name}`);
    }
  );
}

// =============================================================================
// Standalone test
// =============================================================================

if (typeof require !== "undefined" && require.main === module) {
  const response = buildIdentifyResponse(true);
  console.log(JSON.stringify(response, null, 2));
  console.log("\n✓ Response built successfully");
}

export {
  MCPFIdentifyResponse,
  MCPFServerIdentity,
  MCPFOperator,
  MCPFCredentials,
  MCPFVerification,
  MCPFComplianceTag,
  buildIdentifyResponse,
  registerIdentifyTool,
};
