# OmniMCP by Arcade.dev

Give your AI assistant instant access to 500+ everyday tools — Slack, Gmail,
GitHub, Google Calendar, Notion, Linear, Dropbox, and more — over a single
connection. Just ask for what you want; OmniMCP picks the right tool, handles
sign-in, and gets it done.

Endpoint: `https://omni.arcade.dev/mcp`

This repo is one package: a **Cursor plugin**, a **Claude Code / Cowork
plugin**, and a **Claude Desktop** connector. One-click installers also live on
the splash page — **[omni.arcade.dev](https://omni.arcade.dev)**.

The first time you connect you sign in with Arcade. After that, each app
(Google, GitHub, Slack, …) prompts a one-time sign-in the first time it's used.
No API keys to paste.

## Cursor

[![Add arcade MCP server to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=arcade&config=eyJ1cmwiOiJodHRwczovL29tbmkuYXJjYWRlLmRldi9tY3AifQ==)

New user — pick one:

- Click **Add to Cursor** above and approve the install, or
- **Cursor Settings → MCP → Add server** and paste `https://omni.arcade.dev/mcp`.

Then open **Settings → MCP**, find **arcade**, and sign in with Arcade.

## Claude Code (CLI)

```bash
/plugin marketplace add arcadeai-labs/omnimcp   # register this repo as a marketplace
/plugin install arcade@arcade                   # install the plugin
/mcp                                            # sign in to the "arcade" server
```

Then just ask in plain language, or use the commands:

- `/arcade:do <task>` — do something in an app (Slack, Gmail, GitHub, …)
- `/arcade:apps` — see or disconnect your connected apps
- `/arcade:tools <query>` — preview which tools would run (debugging)

Want only the tools (no commands/skills/subagents)? Add the bare server instead:

```bash
claude mcp add --transport http arcade https://omni.arcade.dev/mcp
```

## Claude in the desktop app (Cowork & Code)

Plugins work in **Cowork** and **Code** (not plain Chat).

1. Open the **Plugins** page → **Add marketplace**.
2. Enter `arcadeai-labs/omnimcp` (or `https://github.com/arcadeai-labs/omnimcp`).
3. **Install** the **arcade** plugin and sign in with Arcade when prompted.

You get the same commands, skills, and subagents as Claude Code.

For plain **Chat** (which doesn't use plugins), connect the server directly:
**Settings → Connectors → Add custom connector** → paste
`https://omni.arcade.dev/mcp` (requires a paid Claude plan). That gives the tools
only — no slash commands. If your version lacks custom connectors, merge
[`clients/claude-desktop/claude_desktop_config.json`](clients/claude-desktop/claude_desktop_config.json)
into your `claude_desktop_config.json` and restart.

## Try it

- "Send a Slack message to #eng that the deploy is done."
- "What's on my calendar tomorrow?"
- "Open a GitHub issue in arcadeai-labs/omnimcp titled 'flaky CI'."
- "Summarize my unread email from today."

## What's in this repo

One plugin, three client targets, sharing the same MCP connection:

| Path | Used by | What it is |
|------|---------|------------|
| `.cursor-plugin/` | Cursor | Plugin + marketplace manifest |
| `.claude-plugin/` | Claude Code | Plugin + marketplace manifest |
| `mcp.json` / `.mcp.json` | Cursor / Claude Code | The Omni MCP server connection |
| `agents/` | Claude Code / Cowork | Subagents that run the discovery loop in isolation |
| `skills/` | Cursor + Claude Code / Cowork | Auto-activating guidance for tool use & apps |
| `commands/` | Claude Code / Cowork | `/arcade:do`, `/arcade:apps`, `/arcade:tools` slash commands |
| `hooks/` | Claude Code / Cowork | Session-start priming |
| `rules/` | Cursor | Tool-discovery rule |
| `clients/claude-desktop/` | Claude Desktop | Ready-to-merge connector config |

## Links

- Home: https://omni.arcade.dev
- Endpoint: https://omni.arcade.dev/mcp
- Plugin source: https://github.com/arcadeai-labs/omnimcp

## License

[Apache-2.0](LICENSE). Copyright (c) 2024–Present Arcade AI.
