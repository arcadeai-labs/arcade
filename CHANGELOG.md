# Changelog

All notable changes to the Arcade Gateway Hub plugins are documented here.
This project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Derived from the [OmniMCP plugin](https://github.com/arcadeai-labs/omnimcp)
at v0.6.0; this repo targets the gateway hub deployment
(`hub.arcadeagent.dev`) instead of the curated production Omni server.

## [0.1.0] - 2026-07-14

### Added

- **Gateway support throughout.** The hub's fifth meta-tool,
  `Arcade_SelectGateway`, is now first-class: a new
  `working-with-arcade-gateways` skill (view gateways, inspect their apps and
  tools, switch per app or everywhere, one-off `gateway` routing on
  SelectTools/UseTool), a new `/arcade:gateway` command, and gateway-awareness
  woven into the existing skills, rule, subagent, and session hooks (missing
  app in discovery → check the active gateway; never switch speculatively).

### Changed

- **Retargeted to the gateway hub.** Every client config, manifest, hook, and
  document now points at `https://hub.arcadeagent.dev/mcp` and
  `github.com/arcadeai-labs/arcade`. The MCP server key stays `arcade`, so
  muscle memory and existing prompts carry over.
- **Renamed for the deployment.** Cursor rule is now `arcade-gateway-hub.mdc`;
  the OpenCode package is `opencode-arcade-hub` (not yet published to npm);
  the logo asset is `assets/arcade.svg`. Displayed names say "Arcade Gateway
  Hub"; the plugin/marketplace identifier remains `arcade`.
- **Versioning reset to 0.1.0** for the new repo. Structural checks
  (`scripts/check.mjs`), the OpenCode smoke test, and the QA checklist were
  updated for the hub endpoint, the third skill, and the fourth command.
