# Arcade Gateway Hub

One connection to your Arcade **gateways** — curated sets of apps and tools
(Slack, Gmail, GitHub, Calendar, Notion, Linear, and more). Ask for what you
want; the right tool from your active gateway runs, and one-time app sign-ins
happen in the browser. No API keys.

Endpoint: `https://hub.arcadeagent.dev/mcp` · Sign in with your Arcade
account.

## Add it to your client

| Client | Install |
|--------|---------|
| **Cursor** | [![Install MCP server in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=arcade&config=eyJ1cmwiOiJodHRwczovL2h1Yi5hcmNhZGVhZ2VudC5kZXYvbWNwIn0=) |
| **Claude Code** | [![Install plugin in Claude Code](https://img.shields.io/badge/Claude_Code-install_plugin-d97757?logo=claude&logoColor=white)](docs/install/claude-code.md) |
| **Claude Desktop** | [![Download extension for Claude Desktop](https://img.shields.io/badge/Claude_Desktop-download_extension-d97757?logo=claude&logoColor=white)](https://github.com/arcadeai-labs/arcade/releases/latest/download/arcade-gateway-hub.mcpb) |
| **OpenCode** | [![Install plugin in OpenCode](https://img.shields.io/badge/OpenCode-install_plugin-333333?logo=iterm2&logoColor=white)](docs/install/opencode.md) |

- **Cursor** — the button adds the `arcade` MCP server (approve, then sign in
  under **Settings → MCP**). For the full plugin — rule, skills, commands,
  subagent — see [docs/install/cursor.md](docs/install/cursor.md).
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

Or install into every detected client at once with the universal installer:

```bash
npx plugins add arcadeai-labs/arcade
```

## Try it

- "What gateways do I have?" / "Switch to Full Suite."
- "Send a Slack message to #eng that the deploy is done."
- "What's on my calendar tomorrow?"
- `/arcade:status` — check your connection, sign-in, and active gateway
- `/arcade:connect google` — connect an app ahead of time

Your assistant handles discovery with five meta-tools (`Arcade_SelectTools`,
`Arcade_UseTool`, `Arcade_SelectGateway`, `Arcade_Apps`,
`Arcade_ManageToolAuthorization`) — you never call them yourself.

## Learn more

- [Gateways — how selection and scoping work](docs/gateways.md)
- [Install guides](docs/install/) · [Development & repo layout](docs/development.md)
- Privacy: tasks run through Arcade's hosted hub and the apps you connect —
  [privacy policy](https://www.arcade.dev/privacy-policy).

## License

[Apache-2.0](LICENSE). Copyright (c) 2024–Present Arcade AI.
