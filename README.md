# Arcade Gateway Hub plugins

Connect your AI assistant to your Arcade **gateways** — curated sets of apps
and tools (Slack, Gmail, GitHub, Google Calendar, Notion, Linear, and more)
that you or your team assemble in Arcade. One connection covers every gateway
on your account; discovery and execution follow the gateway you select, and
you can switch per app or account-wide.

Endpoint: `https://hub.arcadeagent.dev/mcp`

This repo packages client plugins for the hosted gateway hub (the server
itself is a separate codebase): a **Cursor plugin**, a **Claude Code / Cowork
plugin**, a **Claude Desktop** connector, and an **OpenCode** plugin.

The first time you connect you sign in with Arcade. After that, each app
(Google, GitHub, Slack, …) prompts a one-time sign-in the first time it's
used. No API keys to paste.

> The gateway hub is currently a staging deployment: sign in with your Arcade
> staging account. The plugin layout and tools are identical to the production
> Omni plugin, so this repo tracks the hub's rollout.

## The tools

Every client gets the same five meta-tools, which resolve to your gateways'
tools on demand:

- `Arcade_SelectTools` — find the right tool for a task (scoped to your
  active gateway)
- `Arcade_UseTool` — run it
- `Arcade_SelectGateway` — see your gateways, what's in them, or switch the
  active one (per app or everywhere)
- `Arcade_Apps` — see or disconnect your connected apps
- `Arcade_ManageToolAuthorization` — fix an app connection (switch account,
  expired sign-in, missing permissions)

The plugins add guidance (skills, a rule), slash commands, an operator
subagent, and session hooks on the clients that support them.

## Gateways in one minute

A gateway is a curated toolset — "Slack + Gmail", "Support", "Full Suite".
Your account can have many, across every project you belong to.

- Selection is automatic: with one gateway it's used implicitly; your last
  selection persists across sessions.
- "What gateways do I have?" / "switch to Full Suite" — the assistant lists
  and switches with `Arcade_SelectGateway`.
- A switch scoped to **this app** doesn't change your other clients;
  **everywhere** sets the account-wide default.
- Tools not in the active gateway simply don't surface — switch gateways to
  reach them.

## Cursor

**Tools only (one click):**

[![Add arcade MCP server to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=arcade&config=eyJ1cmwiOiJodHRwczovL2h1Yi5hcmNhZGVhZ2VudC5kZXYvbWNwIn0=)

This adds the `arcade` MCP server only — no rule, skills, commands, or hooks.
Approve the install, then open **Settings → MCP**, find **arcade**, and sign in
with Arcade.

**Full plugin** (rule + skills + commands + subagent + hook): copy or symlink
this repo to `~/.cursor/plugins/local/arcade` and restart Cursor.

## Claude Code (CLI)

```bash
/plugin marketplace add arcadeai-labs/arcade    # register this repo as a marketplace
/plugin install arcade@arcade                   # install the plugin
/mcp                                            # sign in to the "arcade" server
```

Then just ask in plain language, or use the commands:

- `/arcade:do <task>` — do something in an app (Slack, Gmail, GitHub, …)
- `/arcade:gateway [name]` — see your gateways or switch the active one
- `/arcade:apps` — see, disconnect, or fix your connected apps
- `/arcade:tools <query>` — preview which tools would run (debugging)

Want only the tools (no commands/skills/subagent)? Add the bare server instead:

```bash
claude mcp add --transport http arcade https://hub.arcadeagent.dev/mcp
```

## Claude in the desktop app (Cowork & Code)

Plugins work in **Cowork** and **Code** (not plain Chat).

1. Open the **Plugins** page → **Add marketplace**.
2. Enter `arcadeai-labs/arcade` (or `https://github.com/arcadeai-labs/arcade`).
3. **Install** the **arcade** plugin and sign in with Arcade when prompted.

You get the same commands, skills, and operator subagent as Claude Code.

For plain **Chat** (which doesn't use plugins), connect the server directly:
**Settings → Connectors → Add custom connector** → paste
`https://hub.arcadeagent.dev/mcp` (requires a paid Claude plan). That gives the
tools only — no slash commands. If your version lacks custom connectors, merge
[`clients/claude-desktop/claude_desktop_config.json`](clients/claude-desktop/claude_desktop_config.json)
into your `claude_desktop_config.json` and restart (requires Node; uses a
pinned `mcp-remote` stdio proxy).

## OpenCode

The `opencode-arcade-hub` plugin is not yet on npm; load it from a local
checkout:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["file:///path/to/arcade/clients/opencode"]
}
```

It registers the `arcade` MCP server for you (OAuth is auto-discovered — no
keys) and shows app sign-in links as toasts. Run `opencode mcp auth arcade` if
it doesn't prompt automatically.

Prefer configuring the MCP server yourself? Add to `opencode.json` (project) or
`~/.config/opencode/opencode.json` (global):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "arcade": { "type": "remote", "url": "https://hub.arcadeagent.dev/mcp", "enabled": true }
  }
}
```

(Ready-made: [`clients/opencode/opencode.json`](clients/opencode/opencode.json).)

## Try it

- "What gateways do I have?"
- "Switch to the Full Suite gateway."
- "Send a Slack message to #eng that the deploy is done."
- "What's on my calendar tomorrow?"
- "Open a GitHub issue in arcadeai-labs/arcade titled 'flaky CI'."

## What's in this repo

One shared core plus a small adapter per client. Every manifest declares its
component paths explicitly — nothing loads by folder convention.

| Path | What it is | Used by |
|------|------------|---------|
| `components/skills/` | `using-arcade-tools`, `managing-arcade-apps`, `working-with-arcade-gateways` skills | Cursor + Claude Code / Cowork |
| `components/agents/` | The `arcade-operator` subagent | Cursor + Claude Code / Cowork |
| `components/commands/` | `/arcade:do`, `/arcade:gateway`, `/arcade:apps`, `/arcade:tools` | Cursor + Claude Code / Cowork |
| `clients/cursor/` | Rule, Cursor-native session hook, MCP config | Cursor |
| `clients/claude/` | Claude-native session hook, MCP config | Claude Code / Cowork |
| `clients/claude-desktop/` | Ready-to-merge connector config (pinned `mcp-remote`) | Claude Desktop Chat |
| `clients/opencode/` | The `opencode-arcade-hub` npm plugin + MCP server config | OpenCode |
| `.cursor-plugin/` / `.claude-plugin/` | Plugin + marketplace manifests | Cursor / Claude |

## Privacy

Tasks run through Arcade's hosted gateway hub (`hub.arcadeagent.dev`) and the
apps you connect. See [Arcade's privacy policy](https://www.arcade.dev/privacy-policy)
for how data is handled.

## Links

- Endpoint: https://hub.arcadeagent.dev/mcp
- Plugin source: https://github.com/arcadeai-labs/arcade
- Production Omni plugin (curated catalog, no gateways): https://github.com/arcadeai-labs/omnimcp

## License

[Apache-2.0](LICENSE). Copyright (c) 2024–Present Arcade AI.
