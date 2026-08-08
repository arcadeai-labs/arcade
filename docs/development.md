# Development

## Repo layout

A portable [Agent Plugins](https://agent-plugins.org) core at the root, plus a
small adapter per client. The two portable component types — skills and MCP
servers — sit at the fixed locations the standard requires. Everything the
standard does not cover stays under `components/` or `clients/` and is
declared explicitly, so no client picks it up by folder convention.

| Path | What it is | Used by |
|------|------------|---------|
| `plugin.json` | Agent Plugins 1.0.0 manifest (portable core) | Codex, Copilot, Kiro, VS Code, any conformant client |
| `mcp.json` | Portable MCP config (`streamable-http` → the hub) | Same |
| `skills/` | `using-arcade-tools`, `managing-arcade-apps`, `working-with-arcade-gateways` skills | Every client with a skill system |
| `agents/arcade-operator.agent.md` | The operator subagent | Claude Code / Cowork, Cursor, Copilot CLI |
| `commands/` | `/arcade:do`, `/arcade:apps`, `/arcade:connect`, `/arcade:status` | Cursor + Claude Code / Cowork |
| `hooks/` | Claude-format `hooks.json` + the two shared hook scripts | Claude Code / Cowork, Copilot CLI |
| `clients/cursor/` | Rule, Cursor-native session hook, MCP config | Cursor |
| `clients/claude/` | MCP config | Claude Code / Cowork |
| `clients/claude-desktop/` | One-click `.mcpb` bundle + ready-to-merge connector config | Claude Desktop Chat |
| `clients/opencode/` | The `opencode-arcade-hub` npm plugin + MCP server config | OpenCode |
| `.cursor-plugin/` / `.claude-plugin/` | Plugin + marketplace manifests | Cursor / Claude |
| `docs/` | Install guides, gateway explainer, release-train, this file | — |
| `VERSION` + `release-contract.json` | Shared semver train with `arcadeai-labs/hub` | CI (`check.mjs`) |

### Which manifest a client reads

Three manifests describe the same plugin, and every client resolves them in
its own fixed order. The order is what keeps this safe: a manifest found
earlier wins outright, so adding one in the wrong place silently downgrades a
client instead of failing loudly.

| Client | Resolution order | What it loads |
|--------|------------------|---------------|
| Cursor | `.cursor-plugin/plugin.json` → `.claude-plugin/plugin.json` → `plugin.json` | Everything: rule, skills, subagent, commands, hook, MCP |
| Claude Code / Cowork | `.claude-plugin/plugin.json` only | Skills, subagent, commands, hooks, MCP |
| GitHub Copilot CLI | `.plugin/plugin.json` → `plugin.json` → `.github/plugin/plugin.json` → `.claude-plugin/plugin.json` | Skills + MCP, in Agent Plugins mode via the root manifest's `$schema` |
| VS Code | root `plugin.json` carrying the Agent Plugins `$schema` wins; otherwise Copilot → Claude → legacy | Skills + MCP (it ignores client extension namespaces) |
| Codex / ChatGPT | root `plugin.json` (Agent Plugins), with `.codex-plugin/plugin.json` as an optional overlay | Skills + MCP |
| Kiro | root `plugin.json`, imported from a local folder or GitHub URL | Skills + MCP |
| OpenCode | none — installs the `opencode-arcade-hub` npm package | MCP + injected instructions |

**Never reintroduce `.plugin/`.** That legacy OpenPlugin manifest is resolved
*before* the root manifest by Copilot CLI, so its presence drops Copilot into
legacy loading, where the portable `streamable-http` transport is not
recognized and the server fails to register. Removing it is what lets Copilot
fall through to the Agent Plugins manifest. `check.mjs` fails if the directory
comes back.

## Checks

```bash
node scripts/check.mjs             # structural checks (JSON, frontmatter, paths, versions, endpoint)
bun scripts/opencode-smoke.ts      # OpenCode plugin behavior
claude plugin validate .           # Claude marketplace/plugin manifest validation
cd clients/opencode && bunx tsc --noEmit -p .  # typecheck against real plugin API
cd clients/opencode && npm pack --dry-run
```

All of these run in CI (`.github/workflows/check.yml`) on every push/PR,
along with artifact builds. `QA.md` documents the manual release checklist
(client loads, gateway scenarios, auth-flow scenarios).

## Binary artifacts (.mcpb + skill ZIPs)

Artifacts are **never committed** — Claude's plugin installer rejects repos
containing zip archives ("Nested zip files are not allowed"), and `check.mjs`
fails if any `.zip`/`.mcpb`/`.dxt` is tracked. They're built by the
tag-driven `release.yml` workflow and attached to GitHub Releases; download
links use `releases/latest/download/…`.

Build locally the same way CI does:

```bash
node scripts/build-claude-skills.mjs   # claude.ai skill ZIPs (also rewrites
                                       # descriptions to the 200-char limit)
cd clients/claude-desktop/mcpb
npx -y @anthropic-ai/mcpb pack . ../arcade-gateway-hub.mcpb
```

## Versioning and release

Versions must match across `VERSION`, `release-contract.json`, `plugin.json`,
`.cursor-plugin/plugin.json`, `.claude-plugin/plugin.json`,
`clients/opencode/package.json`, and
`clients/claude-desktop/mcpb/manifest.json` (`check.mjs` enforces this, plus
a matching CHANGELOG entry that includes `requires hub ≥ X.Y.Z`).

Shared semver with the hub server: [`docs/release-train.md`](release-train.md).
Release steps live at the bottom of `QA.md`.

## Design notes

- **One copy of every component, at the location the most clients read.**
  Agent Plugins 1.0.0 fixes `skills/` and `mcp.json` at the plugin root, so
  `check.mjs` requires both. `agents/`, `commands/`, and `hooks/` are not
  portable component types, but the root is also where Claude Code, Cursor,
  and Copilot CLI look for them by default — so they live there too and every
  manifest points at the same files. Only `rules/` stays under `clients/`,
  because Cursor is the only client that reads it.
- **The subagent filename ends in `.agent.md`.** Copilot CLI discovers agents
  only when the filename matches `*.agent.md`; Claude Code and Cursor accept
  any `.md`. The double extension satisfies all three from one file, and
  `check.mjs` enforces it.
- **Declare a path only where the client documents replace semantics.** Cursor
  says a declared path replaces folder discovery, so `.cursor-plugin/plugin.json`
  names every component. Claude Code does not say whether declaring merges or
  replaces, so `.claude-plugin/plugin.json` names only `mcpServers` (its one
  non-default path) and lets discovery find the rest exactly once — a merged
  hooks list would fire the session hook twice per session and the reminder
  twice per prompt. `check.mjs` fails if a default-location component is
  re-declared there.
- **Never put `$schema` in a client manifest.** Cursor resolves
  `.cursor-plugin/plugin.json` first and treats an unrecognized schema id as
  unsupported, which rejects the whole plugin. Only `plugin.json` and
  `mcp.json` carry one (`check.mjs` enforces this).
- **Per-client MCP files stay separate.** The portable `mcp.json` declares
  `type: "streamable-http"`; Claude Code has no such literal and
  `clients/claude/mcp.json` must keep `type: "http"` (checked). Cursor infers
  the transport from `url`, so its copy is a convenience rather than a
  requirement.
- **Client-native hooks.** Cursor gets a flat `{ additional_context }`
  sessionStart hook; Claude gets `hookSpecificOutput.hookEventName =
  "SessionStart"`. Shapes are executed and validated by `check.mjs`.
- **Apps and gateways language.** User-facing copy says sign-in link / app /
  connected / gateway — never authorization/OAuth/scopes/provider. `check.mjs`
  rejects "authorization link" in user-facing files and requires
  `Arcade_SelectGateway` coverage where tools are enumerated.
- **Server identity.** The MCP server key is `arcade` in every client; the
  hosted endpoint is `https://hub.arcade.dev/mcp` (enforced by
  `check.mjs`).
