# Changelog

All notable changes to the OmniMCP plugin are documented here. This project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-06-25

### Fixed

- Subagents no longer fabricate results. Their `tools:` allowlist used
  `mcp__arcade__*`, but a plugin-bundled MCP server is namespaced
  (`plugin:arcade:arcade`), so the allowlist matched no tools and the subagents
  had no way to call them. Removed the `tools:` restriction so subagents inherit
  the MCP tools, and added an explicit no-fabrication guard.
- Renamed the slash command stems to `do`/`tools`/`auth` so they read as
  `/arcade:do`, `/arcade:tools`, `/arcade:auth` instead of the redundant
  `/arcade:arcade` (plugin commands are scoped as `plugin:command`).

## [0.2.0] - 2026-06-25

### Added

- **Claude Code plugin** (`.claude-plugin/`): installable via
  `/plugin marketplace add arcadeai-labs/omnimcp`.
  - Subagents (`agents/`): `arcade-operator` (general), `inbox-agent` (email),
    and `schedule-agent` (calendar) run the discovery loop in an isolated
    context so it never clutters the main conversation.
  - Skills (`skills/`): `arcade-tool-use` and `arcade-authorization`.
  - Slash commands (`commands/`): `/arcade:do`, `/arcade:tools`, `/arcade:auth`.
  - Hooks (`hooks/`): session-start availability priming and post-tool
    authorization-link surfacing.
- **Claude Desktop** connector config (`clients/claude-desktop/`).
- Shared `.mcp.json` for Claude Code alongside the existing Cursor `mcp.json`.

### Changed

- The plugin is now installed and referenced as `arcade` across all clients
  (Cursor, Claude Code, Claude Desktop), and the MCP server key is `arcade`
  (Claude Code tools are `mcp__arcade__Arcade_*`).
- README now covers all three client targets (Cursor, Claude Code, Claude
  Desktop) and documents the repo layout.

## [0.1.0] - 2026-06-04

### Added

- Initial release of the Omni by Arcade Cursor plugin.
- Hosted MCP server connection to `https://omni.arcade.dev/mcp` (OAuth via
  RFC 9728 Protected Resource Metadata, delegated to Arcade/Ory).
- Bundled rule (`rules/omni-tool-discovery.mdc`) teaching the
  `Arcade_SelectTools → Arcade_UseTool` flow, the `Toolkit_Action` naming
  convention, and authorization handling.
