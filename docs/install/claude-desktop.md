# Install in Claude Desktop

## One click: the `.mcpb` extension (recommended)

1. Download
   [`arcade-gateway-hub.mcpb`](https://github.com/arcadeai-labs/arcade/raw/main/clients/claude-desktop/arcade-gateway-hub.mcpb).
2. Double-click it (or drag it into the Claude Desktop window).
3. Click **Install**, then sign in with Arcade when prompted.

Requires Node.js (the bundle bridges Claude Desktop to the hosted server via
a pinned `mcp-remote` proxy).

> **Tools only.** Claude Desktop extensions can carry an MCP server but not
> skills, commands, or subagents — those are Claude Code / Cowork plugin
> features. You get all five Arcade tools (discovery, execution, gateways,
> apps, connection repair), and the server's own instructions teach Claude
> the flow — so plain-language requests like "switch to my work gateway"
> still work. For the full experience (slash commands, skills, the operator
> subagent), use the [Claude Code plugin](claude-code.md) in Cowork or Code.

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
