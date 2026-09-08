# Client support matrix

Every install below connects to the same endpoint,
`https://hub.arcade.dev/mcp`. Server-side behavior — sign-in flows and the
hub's built-in agent instructions — is delivered by the MCP connection
itself, so **every** row gets it. The rows differ only in how much of the
plugin the client can load.

## Everything at a glance

| Client | Tools | Skills | Subagent | Commands | Rule | Hooks | Install |
|---|:--:|:--:|:--:|:--:|:--:|:--:|---|
| **Cursor** | 5 | 3 | ✅ | 3 | ✅ | ✅ | [guide](install/cursor.md) |
| **Claude Code (CLI)** | 5 | 3 | ✅ | 3 | — | 2 | [guide](install/claude-code.md) |
| **Claude Cowork / Code desktop** | 5 | 3 | ✅ | 3 | — | 2 | [guide](install/claude-code.md) |
| **GitHub Copilot CLI** | 5 | 3 | — | 3 | — | 2 | [guide](install/copilot.md) |
| **VS Code** | 5 | 3 | — | — | — | — | [guide](install/vscode.md) |
| **Codex / ChatGPT** | 5 | 3 | — | — | — | — | [guide](install/codex.md) |
| **Kiro** | 5 | 3 | — | — | — | — | [guide](install/kiro.md) |
| **OpenCode** | 5 | — | — | 1 | — | ✅ | [guide](install/opencode.md) |
| **Claude Desktop (.mcpb)** | 5 | upload | — | — | — | — | [guide](install/claude-desktop.md) |
| **claude.ai web / mobile** | 5 | upload | — | — | — | — | [guide](install/claude-desktop.md) |
| **Any MCP client** | 5 | — | — | — | — | — | endpoint |

Only skills and MCP servers are portable component types in
[Agent Plugins](https://agent-plugins.org) 1.0.0. Rules, subagents, commands,
and hooks are client-specific, so each client gets whatever its own plugin
format supports — which is why the right-hand columns thin out.

## How the same components reach so many clients

Almost every component exists exactly once, at the location the most clients
discover by default. The exception is Copilot CLI: since 1.0.80 it reads
non-portable components **only** under `com.github.copilot/`, so the commands
and the Claude-format hooks file are mirrored there as byte-identical copies
(`scripts/check.mjs` fails the build if the pairs drift).

| Component | Location | Read by |
|---|---|---|
| Skills | `skills/` | Every client with a skill system, portable or not |
| MCP server | `mcp.json` (portable) | Agent Plugins clients |
| MCP server | `clients/{cursor,claude}/mcp.json` | Cursor, Claude Code |
| Subagent | `agents/arcade-operator.agent.md` | Claude Code, Cursor |
| Commands | `commands/*.md` | Claude Code, Cursor |
| Commands | `com.github.copilot/commands/*.md` (mirror) | Copilot CLI |
| Hooks | `hooks/hooks.json` (Claude format) | Claude Code |
| Hooks | `com.github.copilot/hooks/hooks.json` (mirror) | Copilot CLI |
| Hook scripts | `hooks/*.mjs` | Both hooks files, via `${CLAUDE_PLUGIN_ROOT}` |
| Hooks | `clients/cursor/hooks/hooks.json` | Cursor |
| Rule | `clients/cursor/rules/*.mdc` | Cursor |

The subagent filename ends in `.agent.md` because Copilot CLI only discovers
agents matching that pattern, and Claude Code and Cursor accept any `.md`. The
subagent is no longer shipped to Copilot — it is not mirrored under
`com.github.copilot/` — so the suffix is now only about keeping that option
open.

## Full plugins

| | Cursor | Claude Code (CLI) | Claude Cowork / Code (desktop) | OpenCode |
|---|---|---|---|---|
| **Install** | add marketplace `arcadeai-labs/arcade` in Cursor's plugins panel (native: logo + all components + auto-update) | `claude plugin marketplace add arcadeai-labs/arcade` + `claude plugin install arcade@arcade` | Plugins → Add marketplace → `arcadeai-labs/arcade` | `opencode plugin opencode-arcade-hub` (npm) |
| **One-command alternative** | `npx plugins add arcadeai-labs/arcade --target cursor` | `npx plugins add arcadeai-labs/arcade --target claude-code` | — | — |
| **MCP tools (all 5)** | ✅ | ✅ | ✅ | ✅ |
| **Skills (3)** | ✅ | ✅ | ✅ | — (no skill system; session instructions cover it) |
| **Always-on rule** | ✅ `arcade-gateway-hub` | — (hook context instead) | — (hook context instead) | — (injected instructions instead) |
| **Operator subagent** | ✅ `arcade-operator` | ✅ | ✅ | — |
| **Slash commands** | ✅ 3 (`apps`, `connect`, `status`) | ✅ 3 | ✅ 3 | ✅ 1 (`arcade-apps`) |
| **Session-start context** | ✅ native hook | ✅ native hook | ✅ native hook | ✅ injected `instructions.md` |
| **Per-turn reminder** | ✅ always-apply rule | ✅ `UserPromptSubmit` hook | ✅ same hook | — (session instructions only) |
| **Sign-in link surfacing** | via skills/rule | via skills/hook | via skills/hook | ✅ toast |

## Agent Plugins clients

These read the root `plugin.json` and load the portable component types.

| | GitHub Copilot CLI | VS Code | Codex / ChatGPT | Kiro |
|---|---|---|---|---|
| **Install** | `copilot plugin install arcadeai-labs/arcade` | **Chat: Install Plugin From Source** with the repo URL | `npx plugins add … --target codex` | Agent Steering & Skills → import from GitHub URL or folder |
| **Requires** | Copilot CLI with Open Plugin Spec support | `chat.plugins.enabled` (Preview) | Codex with Agent Plugins manifest support | Kiro ≥ 1.0.288 |
| **MCP tools (all 5)** | ✅ | ✅ | ✅ | ✅ |
| **Skills (3)** | ✅ | ✅ | ✅ | ✅ |
| **Operator subagent** | — (not mirrored; Claude Code + Cursor only) | — | — | — |
| **Hooks** | ✅ 2 (`com.github.copilot/hooks/hooks.json`) | — | — | — |
| **Slash commands** | ✅ 3 (`com.github.copilot/commands/`) | — | — | — |
| **Always-on rule** | — | — | — | — |

Notes:

- **Copilot CLI applies spec semantics additively on top of its standard
  plugin loading:** the portable core (`skills/`, `mcp.json`) comes from the
  standard, and the non-portable kinds come from Copilot's own locations. Those
  locations moved in **1.0.80** (2026-08-14) — `commands/`, `agents/`,
  `rules/`, `hooks/hooks.json`, `lsp.json` and `extensions/` are read only
  under `com.github.copilot/`, no longer from the plugin root. A plugin that
  keeps them at the root loads its tools and skills and silently drops
  everything else; verified with `copilot --agent`, `copilot plugins list`, and
  the client's own `Plugin activation` log lines. The mirror directory is why
  slash commands now work here at all.
- **Copilot CLI resolves `.plugin/plugin.json` before the root manifest.** That
  legacy manifest was removed in 0.11.0 so Copilot falls through to the Agent
  Plugins manifest; see
  [development.md](development.md#which-manifest-a-client-reads).
- **VS Code trade-off:** VS Code can read Copilot- and Claude-format plugins
  (which carry agents, commands, and hooks), but a root `plugin.json` bearing
  the Agent Plugins `$schema` takes priority and switches it to portable
  semantics; it also ignores client extension namespaces. To get the subagent
  and hooks in a Copilot context, install via the
  [Copilot CLI](install/copilot.md) — VS Code auto-discovers plugins from
  `~/.copilot/installed-plugins/`. Note that path carries the Copilot mirror,
  which has hooks and commands but no subagent.
- **Codex** additionally supports a `com.openai` extension namespace and a
  `.codex-plugin/plugin.json` overlay for apps, lifecycle hooks, and directory
  presentation. Neither ships yet: those field shapes are not published, and
  Codex validates a namespace it implements rather than ignoring it.
- Portable MCP config declares `type: "streamable-http"`. Auth stays
  client-managed — Agent Plugins 1.0.0 defines no portable OAuth fields, and
  Arcade's browser sign-in works the same way on this path.

## Tools-only installs

| | Cursor (button) | VS Code (button) | Claude Desktop Chat (`.mcpb`) | Claude Desktop Chat (connector) | claude.ai web / mobile | Any MCP client |
|---|---|---|---|---|---|---|
| **Install** | one-click deeplink from the README | one-click deeplink from the README | download `.mcpb` from the release, double-click, Install | Settings → Connectors → add `https://hub.arcade.dev/mcp` (paid plans) | via account connector (paid plans) | add `https://hub.arcade.dev/mcp` |
| **MCP tools (all 5)** | ✅ | ✅ | ✅ (declared in the install dialog) | ✅ | ✅ | ✅ |
| **Skills** | — (install full plugin) | — (install full plugin) | ✅ optional: upload the 3 skill ZIPs (Customize → Skills) | ✅ same ZIP uploads | ✅ uploads follow the account | — |
| **Commands / subagent / hooks** | — | — | — (not supported by extensions) | — | — | — |
| **Requires** | — | — | Node.js (`mcp-remote` bridge) | paid Claude plan | paid plan + code execution for skills | MCP + OAuth support |

Notes:

- The `.mcpb` and skill ZIPs are downloaded from
  [GitHub Releases](https://github.com/arcadeai-labs/arcade/releases/latest)
  — never committed (Claude's plugin installer rejects repos containing
  archives).
- OpenCode command names use a dash (`/arcade-apps`) because they're injected
  config commands; Cursor/Claude use the plugin namespace (`/arcade:apps`).
- **Don't double-install.** Cursor auto-loads any plugin installed in Claude
  Code, and VS Code auto-loads plugins installed through the Copilot CLI.
  Installing in both halves of either pair makes the client show the plugin
  twice and split its components. Install in one place. Both bridge paths are
  complete: Cursor loads the always-on rule out of the Claude plugin cache,
  and the shared session hook detects the invoking client and emits that
  client's native shape either way.
- Plain-language use ("send a message to #eng") works identically in
  every row — the hub's server instructions carry the flow even with no
  plugin content installed.
