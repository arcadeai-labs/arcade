# Client support matrix

What each client gets, per install method, as of v0.2.0. The five meta-tools
(`Arcade_SelectTools`, `Arcade_UseTool`, `Arcade_SelectGateway`,
`Arcade_Apps`, `Arcade_ManageToolAuthorization`) and the server's own
instructions come from the hosted hub, so **every row with "Tools" gets full
gateway support** — the differences are in the local guidance layers
(skills, rule, commands, subagent, hooks).

## The matrix

| Client / install | Tools (5) | Server instructions | Skills (3) | Rule | Subagent | Slash commands | Session hook | Toasts | Auto-update |
|---|---|---|---|---|---|---|---|---|---|
| **Cursor** — deeplink button | ✅ | ✅ | — | — | — | — | — | — | n/a |
| **Cursor** — local plugin dir | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 6 (`/arcade:*`) | ✅ sessionStart | — | ❌ `git pull` |
| **Cursor** — `npx plugins add` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 6 | ✅ | — | ❌ re-run |
| **Claude Code (CLI)** — plugin install | ✅ | ✅ | ✅ | n/a | ✅ | ✅ 6 (`/arcade:*`) | ✅ SessionStart | — | ✅ `marketplace update` |
| **Claude Code (CLI)** — bare `claude mcp add` | ✅ | ✅ | — | n/a | — | — | — | — | n/a |
| **Claude Cowork / desktop Code** — Plugins UI | ✅ | ✅ | ✅ | n/a | ✅ | ✅ 6 | ✅ | — | ✅ |
| **Claude Desktop (Chat)** — `.mcpb` extension | ✅ | ✅ | ⬆ upload | n/a | n/a | n/a | n/a | — | ❌ re-download |
| **Claude Desktop (Chat)** — custom connector | ✅ | ✅ | ⬆ upload | n/a | n/a | n/a | n/a | — | n/a |
| **claude.ai web / mobile** — connector + skill upload | ✅ | ✅ | ⬆ upload | n/a | n/a | n/a | n/a | — | n/a |
| **OpenCode** — plugin (`file://`, npm pending) | ✅ | ✅ | ✳ instructions | n/a | n/a | ✅ 3 (`/arcade-*`) | ✳ instructions | ✅ sign-in + gateway | ❌ `git pull` |
| **OpenCode** — manual `opencode.json` mcp entry | ✅ | ✅ | — | n/a | n/a | — | — | — | n/a |
| **Codex / Copilot CLI / Grok / Kimi** — `npx plugins add` | ⚠ untested | ⚠ | ⚠ | n/a | ⚠ | ⚠ | ⚠ | — | ❌ |

Legend: ✅ supported · — not included in this install · n/a the client has no
such concept · ⬆ upload — the three skills install separately as ZIPs via
**Customize → Skills** (account-wide: applies to Desktop, web, and mobile) ·
✳ the OpenCode plugin injects the equivalent guidance through a session
instructions file rather than discrete skills/hooks · ⚠ the universal
installer claims support; we haven't verified.

## Feature notes

- **Tools + gateways**: identical everywhere — discovery/execution scoped to
  the active gateway, per-app defaults, sign-in links. Delivered by the hub,
  not the plugin.
- **Server instructions**: the hub's initialize instructions teach the
  discovery flow and `Arcade_SelectGateway`, so even tools-only installs
  handle "switch to my work gateway" in plain language.
- **Skills**: `using-arcade-tools`, `managing-arcade-apps`,
  `working-with-arcade-gateways`.
- **Rule**: Cursor-only concept (`arcade-gateway-hub.mdc`, always applied).
- **Subagent**: `arcade-operator` (Cursor + Claude Code/Cowork only).
- **Slash commands**: `/arcade:do`, `/arcade:gateway`, `/arcade:apps`,
  `/arcade:connect`, `/arcade:status`, `/arcade:tools` on Cursor/Claude;
  `/arcade-do`, `/arcade-gateway`, `/arcade-apps` on OpenCode (registered by
  the plugin's config hook; user-defined commands with the same names win).
- **Toasts**: OpenCode-only concept — one-time app sign-in links and gateway
  switches surface as TUI toasts.
- **Session hook**: one-paragraph orientation at session start
  (Cursor-native and Claude-native shapes; OpenCode equivalent via
  instructions).

## Install commands (copy-paste)

| Client | Command / action |
|---|---|
| Any detected client | `npx plugins add arcadeai-labs/arcade` |
| Cursor (tools only) | [deeplink button](../README.md#add-it-to-your-client) |
| Cursor (full) | `git clone https://github.com/arcadeai-labs/arcade ~/.cursor/plugins/local/arcade` |
| Claude Code | `claude plugin marketplace add arcadeai-labs/arcade && claude plugin install arcade@arcade` |
| Claude Desktop | download [`arcade-gateway-hub.mcpb`](https://github.com/arcadeai-labs/arcade/releases/latest/download/arcade-gateway-hub.mcpb), double-click, Install |
| OpenCode | `"plugin": ["file:///path/to/arcade/clients/opencode"]` (npm publish pending) |
