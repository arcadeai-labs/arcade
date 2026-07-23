# Arcade Agent Hub

The hub between you and all your apps — across any agent you connect. Ask
for what you want; the right tool runs, scoped to your active Arcade
**gateway** (a curated set of apps and tools like Slack, Gmail, GitHub,
Calendar, Notion, Linear), and one-time app sign-ins happen in the browser.
No API keys.

Endpoint: `https://hub.arcade.dev/mcp`

> **Staging deployment.** The Arcade Agent Hub currently runs against Arcade
> staging, so sign in with your **staging** Arcade account (the sign-in page
> is served by `cloud.bosslevel.dev`, not `arcade.dev`). Everything below is
> otherwise production-shaped.

## Add it to your client

| Client | Install |
|--------|---------|
| **Cursor** | [![Install MCP server in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=arcade&config=eyJ1cmwiOiJodHRwczovL2h1Yi5hcmNhZGUuZGV2L21jcCJ9) |
| **Claude Code** | [![Install plugin in Claude Code](https://img.shields.io/badge/Claude_Code-install_plugin-d97757?logo=claude&logoColor=white)](docs/install/claude-code.md) |
| **Claude Desktop** | [![Download extension for Claude Desktop](https://img.shields.io/badge/Claude_Desktop-download_extension-d97757?logo=claude&logoColor=white)](https://github.com/arcadeai-labs/arcade/releases/latest/download/arcade-gateway-hub.mcpb) |
| **OpenCode** | [![Install plugin in OpenCode](https://img.shields.io/badge/OpenCode-install_plugin-333333?logo=iterm2&logoColor=white)](docs/install/opencode.md) |

- **Cursor** — the button adds the `arcade` MCP server only (tools, no
  skills/commands/rule). For the full plugin, add the marketplace
  `arcadeai-labs/arcade` in Cursor's plugins panel (or
  `npx plugins add arcadeai-labs/arcade --target cursor`), then sign in under
  **Settings → MCP**. Details: [docs/install/cursor.md](docs/install/cursor.md).
- **Claude Code** — two commands, no session needed:

  ```bash
  claude plugin marketplace add arcadeai-labs/arcade
  claude plugin install arcade@arcade
  ```

- **Claude Desktop** — the button downloads
  `arcade-gateway-hub.mcpb`; double-click it, click **Install**, sign in.
  The skills can be added too, as uploadable ZIPs
  ([details & alternatives](docs/install/claude-desktop.md)).
- **OpenCode** — `opencode plugin opencode-arcade-hub` once published; local
  install today: [docs/install/opencode.md](docs/install/opencode.md).

Cursor auto-loads Claude Code plugins, so if you use both editors, install in
**one** place to avoid a duplicate entry in Cursor — see the note in the
[Cursor guide](docs/install/cursor.md#avoid-installing-twice).

## Try it

- "What gateways do I have?" / "Switch to Full Suite."
- "Send a Slack message to #eng that the deploy is done."
- "What's on my calendar tomorrow?"
- `/arcade:status` — check your connection, sign-in, and active gateway
- `/arcade:connect google` — connect an app ahead of time

Your assistant speaks intent to the hub: `Arcade_Run` executes a task end to
end (pausing for your confirmation, missing details, or a sign-in — handled
via `Arcade_Confirm` / `Arcade_Resume`, with `Arcade_Plan` for multi-step
workflows), while `Arcade_SelectTools` / `Arcade_UseTool` remain the manual
escape hatch and `Arcade_SelectGateway`, `Arcade_Apps`,
`Arcade_ManageToolAuthorization` manage gateways and app connections — you
never call any of them yourself.

## Learn more

- [Gateways — how selection and scoping work](docs/gateways.md)
- [Client support matrix — what each install gets](docs/support-matrix.md)
- [Release train (shared semver with hub)](docs/release-train.md)
- [Install guides](docs/install/) · [Development & repo layout](docs/development.md)
- Privacy: tasks run through Arcade's hosted hub and the apps you connect —
  [privacy policy](https://www.arcade.dev/privacy-policy).

## License

[Apache-2.0](LICENSE). Copyright (c) 2024–Present Arcade AI.
