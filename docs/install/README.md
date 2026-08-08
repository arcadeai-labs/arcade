# Install guides

One page per client. Every one of them connects to the same endpoint,
`https://hub.arcade.dev/mcp`; they differ only in how much of the plugin the
client can load.

| Client | Guide | One-click | Gets |
|---|---|---|---|
| Cursor | [cursor.md](cursor.md) | [add MCP server](https://cursor.com/install-mcp?name=arcade&config=eyJ1cmwiOiJodHRwczovL2h1Yi5hcmNhZGUuZGV2L21jcCJ9) | Everything |
| Claude Code | [claude-code.md](claude-code.md) | — (two commands) | Everything but the rule |
| Claude Desktop | [claude-desktop.md](claude-desktop.md) | [download .mcpb](https://github.com/arcadeai-labs/arcade/releases/latest/download/arcade-gateway-hub.mcpb) | Tools, skills by upload |
| GitHub Copilot CLI | [copilot.md](copilot.md) | — (one command) | Tools, skills, subagent, hooks |
| VS Code | [vscode.md](vscode.md) | [add MCP server](https://vscode.dev/redirect/mcp/install?name=arcade&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fhub.arcade.dev%2Fmcp%22%7D) | Tools, skills |
| Codex / ChatGPT | [codex.md](codex.md) | — (one command) | Tools, skills |
| Kiro | [kiro.md](kiro.md) | — (panel import) | Tools, skills |
| OpenCode | [opencode.md](opencode.md) | — (one command) | Tools, commands, instructions |
| Any MCP client | [agent-plugins.md](agent-plugins.md) | — | Tools |

One command covers most clients at once:

```bash
npx plugins add arcadeai-labs/arcade
```

See the [support matrix](../support-matrix.md) for the component-by-component
breakdown and the reasoning behind each gap, and
[agent-plugins.md](agent-plugins.md) for what the portable package format is
and which clients read it.

> **Don't install twice.** Cursor auto-loads plugins installed in Claude Code,
> and VS Code auto-loads plugins installed through the Copilot CLI. Pick one
> place per pair or the plugin shows up duplicated with its components split.
