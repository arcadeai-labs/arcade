# Changelog

All notable changes to the Arcade Agent Hub plugins are documented here.
This project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Derived from Arcade's earlier plugin packaging at v0.6.0 (see the git
history); this repo targets the gateway hub deployment
(`hub.arcade.dev`).

## [0.4.0] - 2026-07-23

### Changed

- **Run-first guidance across all clients.** The hub's Intent surface is now
  live on `hub.arcade.dev`: agents default to `Arcade_Run` (task in → result
  or typed pause) with `Arcade_Confirm` / `Arcade_Resume` for confirmation,
  missing-input, and sign-in pauses, and `Arcade_Plan` for multi-step
  workflows. `Arcade_SelectTools` / `Arcade_UseTool` remain the documented
  escape hatch (`failed` + `recoverable: try_l1`, explicit catalog control,
  or older hub deployments). Updated the `using-arcade-tools` skill, the
  `arcade-operator` subagent, the Cursor always-on rule, OpenCode
  instructions, the Claude Desktop manifest tool list, and the README.
- Confirmation discipline: agents must relay the hub's `needs_confirm` draft
  and wait for an explicit user yes/no — never approve on the user's behalf.
- `requires hub ≥ 0.2.0` (Intent surface + pause contract).

## [0.3.1] - 2026-07-16

### Changed

- Rebranded to **Arcade Agent Hub** — the hub between you and all your
  apps, across any agent you connect. "Gateway" remains the technical term
  for the curated app/tool sets that scope discovery and execution; only
  the product name changed. Display names, descriptions, and docs updated
  across all four clients.
- Release-train contract with `arcadeai-labs/hub`: `VERSION`,
  `release-contract.json`, and CI changelog enforcement.
  `requires hub ≥ 0.1.6`.

## [0.3.0] - 2026-07-16

### Changed

- The hub moved to its permanent home: every client config, deeplink, and
  doc now points at `https://hub.arcade.dev/mcp` (previously
  `hub.arcadeagent.dev`). The service behind it is the new standalone
  gateway hub with Engine-backed tool discovery — same tools, same
  gateway model, better search coverage of the staging catalog.
- Existing installs pointed at `hub.arcadeagent.dev` keep working until
  that deployment is retired; re-add the server (or update the URL) to
  move to the new endpoint.

## [0.2.0] - 2026-07-14

### Fixed

- **Claude plugin installs from this repo work again.** Claude's installer
  rejects repositories containing zip archives ("Nested zip files are not
  allowed"), and we had committed the `.mcpb` bundle and three skill ZIPs.
  Binary artifacts now live on GitHub Releases (built by the tag-driven
  `release.yml` workflow); README/docs links use
  `releases/latest/download/…`, and `check.mjs` fails if any archive is
  ever committed again.

### Added

- **`/arcade:status`** — connection health check (server → sign-in → active
  gateway → connected apps) with a one-line fix per failure.
- **`/arcade:connect <app>`** — explicit app sign-in flow.
- **OpenCode parity:** the plugin now injects the same session orientation
  the Cursor/Claude hooks provide (via a shipped `instructions.md`),
  registers `/arcade-do`, `/arcade-gateway`, and `/arcade-apps` commands
  (never overwriting user-defined ones), and toasts gateway switches
  ("now using Full Suite (this app)") alongside sign-in links.
- **Vendor-neutral `.plugin/plugin.json`**, verified against the universal
  installer: `npx plugins add arcadeai-labs/arcade` installs into every
  detected client.
- **First-run degradation guidance** in the tools skill and Cursor rule:
  what to tell the user when the `arcade` server is missing or
  unauthenticated, instead of silent fallback.
- **CI hardening:** artifact builds (skill ZIPs + `.mcpb`), `claude plugin
  validate`, and an OpenCode typecheck against the real
  `@opencode-ai/plugin` types (catches plugin-API drift) now run on every
  push.

### Changed

- **`.mcpb` manifest polish** (spec 0.3): the five meta-tools are declared
  so the install dialog shows them, plus privacy policy, documentation, and
  support links.
- Cursor manifest gains `primaryColor` for marketplace presentation.

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
  document now points at `https://hub.arcade.dev/mcp` and
  `github.com/arcadeai-labs/arcade`. The MCP server key stays `arcade`, so
  muscle memory and existing prompts carry over.
- **Renamed for the deployment.** Cursor rule is now `arcade-gateway-hub.mdc`;
  the OpenCode package is `opencode-arcade-hub` (not yet published to npm);
  the logo asset is `assets/arcade.svg`. Displayed names say "Arcade Gateway
  Hub"; the plugin/marketplace identifier remains `arcade`.
- **Versioning reset to 0.1.0** for the new repo. Structural checks
  (`scripts/check.mjs`), the OpenCode smoke test, and the QA checklist were
  updated for the hub endpoint, the third skill, and the fourth command.
