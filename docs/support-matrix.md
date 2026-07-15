# Client support matrix

What each client gets, per install method, as of v0.2.0. Server-side
behavior — gateway scoping, auto-selection, per-app defaults, OAuth
sign-in flows, and the hub's built-in agent instructions — is delivered by
the MCP connection itself, so **every** row below includes it.

## Full plugins

| | Cursor | Claude Code (CLI) | Claude Cowork / Code (desktop) | OpenCode |
|---|---|---|---|---|
| **Install** | add marketplace `arcadeai-labs/arcade` in Cursor's plugins panel (native: logo + all components + auto-update) | `claude plugin marketplace add arcadeai-labs/arcade` + `claude plugin install arcade@arcade` | Plugins → Add marketplace → `arcadeai-labs/arcade` | `opencode.json` `plugin: ["file:///…/clients/opencode"]` (npm publish pending) |
| **One-command alternative** | `npx plugins add arcadeai-labs/arcade --target cursor` | `npx plugins add arcadeai-labs/arcade --target claude-code` | — | — |
| **MCP tools (all 5)** | ✅ | ✅ | ✅ | ✅ |
| **Skills (3)** | ✅ | ✅ | ✅ | — (no skill system; session instructions cover it) |
| **Always-on rule** | ✅ `arcade-gateway-hub` | — (hook context instead) | — (hook context instead) | — (injected instructions instead) |
| **Operator subagent** | ✅ `arcade-operator` | ✅ | ✅ | — |
| **Slash commands** | ✅ 6 (`do`, `gateway`, `apps`, `connect`, `status`, `tools`) | ✅ 6 | ✅ 6 | ✅ 3 (`arcade-do`, `arcade-gateway`, `arcade-apps`) |
| **Session-start context** | ✅ native hook | ✅ native hook | ✅ native hook | ✅ injected `instructions.md` |
| **Sign-in link surfacing** | via skills/rule | via skills/hook | via skills/hook | ✅ toast |
| **Gateway-switch feedback** | via skill guidance | via skill guidance | via skill guidance | ✅ toast |

## Tools-only installs

| | Cursor (button) | Claude Desktop Chat (`.mcpb`) | Claude Desktop Chat (connector) | claude.ai web / mobile | Any MCP client |
|---|---|---|---|---|---|
| **Install** | one-click deeplink from the README | download `.mcpb` from the release, double-click, Install | Settings → Connectors → add `https://hub.arcadeagent.dev/mcp` (paid plans) | via account connector (paid plans) | add `https://hub.arcadeagent.dev/mcp` |
| **MCP tools (all 5)** | ✅ | ✅ (declared in the install dialog) | ✅ | ✅ | ✅ |
| **Skills** | — (install full plugin) | ✅ optional: upload the 3 skill ZIPs (Customize → Skills) | ✅ same ZIP uploads | ✅ uploads follow the account | — |
| **Commands / subagent / hooks** | — | — (not supported by extensions) | — | — | — |
| **Requires** | — | Node.js (`mcp-remote` bridge) | paid Claude plan | paid plan + code execution for skills | MCP + OAuth support |

Notes:

- The `.mcpb` and skill ZIPs are downloaded from
  [GitHub Releases](https://github.com/arcadeai-labs/arcade/releases/latest)
  — never committed (Claude's plugin installer rejects repos containing
  archives).
- OpenCode command names use a dash (`/arcade-do`) because they're injected
  config commands; Cursor/Claude use the plugin namespace (`/arcade:do`).
- **Don't double-install for Cursor:** Cursor also auto-loads any plugin
  installed in Claude Code (the "Claude→Cursor bridge"). Installing arcade
  both natively in Cursor and in Claude Code makes Cursor show it twice and
  split its components. Install in one place. The bridge path omits only the
  Cursor-specific always-on rule (the Claude manifest has no rules concept);
  the shared session hook detects the invoking client and emits that
  client's native shape either way.
- Plain-language use ("switch to my work gateway") works identically in
  every row — the hub's server instructions carry the flow even with no
  plugin content installed.
