#!/usr/bin/env python3
"""
MCPF Tool-Based Identity Discovery — Python Reference Implementation

This example shows how to add the `identify` tool to any MCP server
built with the Python MCP SDK.

Requirements:
    pip install mcp

Usage:
    python python-example.py

See: specs/MCPF-tool-identity.md for the full specification.
"""

import json
from datetime import datetime, timezone


# =============================================================================
# Configuration — customize these values for your server
# =============================================================================

SERVER_CONFIG = {
    "name": "example-mcpf-server",
    "version": "1.0.0",
    "description": "Example MCP server with MCPF tool-based identity discovery",
}

OPERATOR_CONFIG = {
    "name": "Example Organization",
    "jurisdiction": "EU",
    "sector": "Enterprise",
}

# Set to None if your server doesn't have a DID yet (Level 0)
DID = "did:web:mcp.example.com"

# Set to None if you don't have a credential (Level 0-2)
CREDENTIAL_CONFIG = {
    "issuer": "did:web:veritrust.vc",
    "type": ["VerifiableCredential", "MCPServerVerification"],
    "subject": DID,
    "issued": "2026-01-15T00:00:00Z",
    "credential_url": "https://veritrust.vc/credentials/example.json",
}

# Base URL for .well-known endpoints
BASE_URL = "https://mcp.example.com"


# =============================================================================
# identify tool implementation
# =============================================================================

def build_identify_response(include_verification_urls: bool = True) -> dict:
    """
    Build the MCPF identify tool response.
    
    Conforms to: schemas/identify-tool-response.json
    Spec: specs/MCPF-tool-identity.md (MCPF-TID-001 through MCPF-TID-005)
    """
    response = {
        # REQUIRED: Server identity (MCPF-TID-003)
        "identity": {
            "server": {
                "name": SERVER_CONFIG["name"],
                "version": SERVER_CONFIG["version"],
                "description": SERVER_CONFIG["description"],
            },
            "operator": OPERATOR_CONFIG.copy(),
        },
        # REQUIRED: Framework metadata (MCPF-TID-003)
        "framework": {
            "name": "MCPF",
            "version": "1.0",
            "compliance": ["tool-based-discovery"],
            "spec": "https://github.com/MCPTrustFramework/MCPF-specification",
        },
        # REQUIRED: Trust context note (MCPF-TID-005)
        "_note": "",
    }

    # Determine compliance level and build accordingly
    compliance = response["framework"]["compliance"]
    level = 0

    # Level 1+: Add DID
    if DID:
        response["identity"]["did"] = DID
        compliance.append("well-known-discovery")
        level = 1

    # Level 3: Add credentials
    if CREDENTIAL_CONFIG:
        response["credentials"] = CREDENTIAL_CONFIG.copy()
        compliance.append("credential-verified")
        level = 3

    # Add verification URLs (MCPF-TID-004: bridges to .well-known)
    if include_verification_urls and DID:
        response["verification"] = {
            "did_document": f"{BASE_URL}/.well-known/did.json",
            "mcp_manifest": f"{BASE_URL}/.well-known/mcp/manifest.json",
            "trust_registry": f"{BASE_URL}/.well-known/mcp-trust-registry.json",
        }
        # Level 2+: challenge endpoint
        if level >= 2:
            response["verification"]["challenge_endpoint"] = (
                f"{BASE_URL}/.well-known/mcp/challenge"
            )
            compliance.append("challenge-response")

    # Set trust note based on level
    level_notes = {
        0: "Self-attested identity. No independent verification available.",
        1: f"MCPF Level 1. DID identity at {DID}. Verify via .well-known URLs.",
        2: f"MCPF Level 2. Challenge endpoint available for key ownership proof.",
        3: (
            f"MCPF Level 3 compliant. Verify credential at "
            f"{CREDENTIAL_CONFIG['credential_url']}."
        ),
    }
    response["_note"] = level_notes.get(level, level_notes[0])

    return response


# =============================================================================
# MCP Server integration example
# =============================================================================

def register_identify_tool(server):
    """
    Register the identify tool on an MCP server instance.
    
    Usage with mcp SDK:
        from mcp.server import Server
        server = Server("my-server")
        register_identify_tool(server)
    """

    @server.tool()
    async def identify(include_verification_urls: bool = True) -> dict:
        """Returns server identity, ownership proof, and trust credentials.
        Call this to verify who operates this MCP server before trusting its data."""
        return build_identify_response(include_verification_urls)


# =============================================================================
# Standalone test
# =============================================================================

if __name__ == "__main__":
    # Test: generate and print identify response
    response = build_identify_response(include_verification_urls=True)
    print(json.dumps(response, indent=2, ensure_ascii=False))

    # Validate against schema (if jsonschema is installed)
    try:
        import jsonschema
        import os

        schema_path = os.path.join(
            os.path.dirname(__file__),
            "..", "..", "schemas", "identify-tool-response.json"
        )
        if os.path.exists(schema_path):
            with open(schema_path) as f:
                schema = json.load(f)
            jsonschema.validate(response, schema)
            print("\n✓ Response validates against identify-tool-response.json schema")
        else:
            print(f"\n⚠ Schema not found at {schema_path}, skipping validation")
    except ImportError:
        print("\n⚠ jsonschema not installed, skipping validation")
        print("  Install with: pip install jsonschema")
