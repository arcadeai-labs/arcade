# Install in Claude Desktop

## One click: the `.mcpb` extension (recommended)

1. Download
   [`arcade-gateway-hub.mcpb`](https://github.com/arcadeai-labs/arcade/raw/main/clients/claude-desktop/arcade-gateway-hub.mcpb).
2. Double-click it (or drag it into the Claude Desktop window).
3. Click **Install**, then sign in with Arcade when prompted.

Requires Node.js (the bundle bridges Claude Desktop to the hosted server via
a pinned `mcp-remote` proxy).

> The extension carries the MCP server (all five Arcade tools), and the
> server's own instructions teach Claude the flow — so plain-language
> requests like "switch to my work gateway" work out of the box. Slash
> commands and subagents are Claude Code / Cowork plugin features
> ([install guide](claude-code.md)); the plugin's *skills*, however, can be
> added to Claude Desktop too — see below.

## Add the skills (optional)

The plugin's three skills ship as upload-ready ZIPs for the Claude apps:

- [`using-arcade-tools.zip`](https://github.com/arcadeai-labs/arcade/raw/main/clients/claude-desktop/skills/using-arcade-tools.zip)
- [`managing-arcade-apps.zip`](https://github.com/arcadeai-labs/arcade/raw/main/clients/claude-desktop/skills/managing-arcade-apps.zip)
- [`working-with-arcade-gateways.zip`](https://github.com/arcadeai-labs/arcade/raw/main/clients/claude-desktop/skills/working-with-arcade-gateways.zip)

To install them:

1. Enable **Code execution and file creation** under **Settings →
   Capabilities** (skills require it; Enterprise owners enable Skills in
   Organization settings first).
2. Open **Customize → Skills** → **+ Create skill** → **Upload a skill**.
3. Upload each ZIP and toggle it on.

Skills uploaded this way follow your Claude account, so they also apply on
claude.ai and mobile.

## Alternative: custom connector (paid plans)

**Settings → Connectors → Add custom connector** → paste
`https://hub.arcadeagent.dev/mcp`. Tools only; no extension needed.

## Alternative: config file

Merge
[`clients/claude-desktop/claude_desktop_config.json`](../../clients/claude-desktop/claude_desktop_config.json)
into your `claude_desktop_config.json` and restart Claude Desktop fully.

> Extensions and connectors apply to Claude Desktop **Chat**. For Cowork and
> Code in the desktop app, use the [Claude Code plugin](claude-code.md)
> instead — it adds commands, skills, and the operator subagent.

## Rebuilding the bundle (maintainers)

```bash
cd clients/claude-desktop/mcpb
npx -y @anthropic-ai/mcpb pack . ../arcade-gateway-hub.mcpb
```
