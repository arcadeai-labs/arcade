# Development

## Repo layout

One shared core plus a small adapter per client. Every manifest declares its
component paths explicitly — nothing loads by folder convention, so each
client gets exactly its intended bundle.

| Path | What it is | Used by |
|------|------------|---------|
| `components/skills/` | `using-arcade-tools`, `managing-arcade-apps`, `working-with-arcade-gateways` skills | Cursor + Claude Code / Cowork |
| `components/agents/` | The `arcade-operator` subagent | Cursor + Claude Code / Cowork |
| `components/commands/` | `/arcade:do`, `/arcade:gateway`, `/arcade:apps`, `/arcade:tools` | Cursor + Claude Code / Cowork |
| `clients/cursor/` | Rule, Cursor-native session hook, MCP config | Cursor |
| `clients/claude/` | Claude-native session hook, MCP config | Claude Code / Cowork |
| `clients/claude-desktop/` | One-click `.mcpb` bundle + ready-to-merge connector config | Claude Desktop Chat |
| `clients/opencode/` | The `opencode-arcade-hub` npm plugin + MCP server config | OpenCode |
| `.cursor-plugin/` / `.claude-plugin/` | Plugin + marketplace manifests | Cursor / Claude |
| `docs/` | Install guides, gateway explainer, this file | — |

## Checks

```bash
node scripts/check.mjs        # structural checks (JSON, frontmatter, paths, versions, endpoint)
bun scripts/opencode-smoke.ts # OpenCode plugin behavior
cd clients/opencode && npm pack --dry-run
```

All three run in CI (`.github/workflows/check.yml`) on every push/PR.
`QA.md` documents the manual release checklist (client loads, gateway
scenarios, auth-flow scenarios).

## Rebuilding the Claude Desktop artifacts

Both artifact sets are committed so README download links always work.

The `.mcpb` extension, after changing
`clients/claude-desktop/mcpb/manifest.json`:

```bash
cd clients/claude-desktop/mcpb
npx -y @anthropic-ai/mcpb pack . ../arcade-gateway-hub.mcpb
```

The claude.ai skill ZIPs, after editing any `components/skills/*/SKILL.md`
(also rewrites each description to the 200-character claude.ai limit —
short copies live in the script):

```bash
node scripts/build-claude-skills.mjs
```

`check.mjs` fails if a skill lacks its committed ZIP.

## Versioning and release

Versions must match across `.cursor-plugin/plugin.json`,
`.claude-plugin/plugin.json`, and `clients/opencode/package.json`
(`check.mjs` enforces this, plus a matching CHANGELOG entry). Release steps
live at the bottom of `QA.md`.

## Design notes

- **Explicit manifests.** Both plugin manifests declare every component path;
  root-level `skills/`, `agents/`, `commands/`, `hooks/`, `mcp.json` are
  forbidden (checked) so nothing loads by folder-convention accident.
- **Client-native hooks.** Cursor gets a flat `{ additional_context }`
  sessionStart hook; Claude gets `hookSpecificOutput.hookEventName =
  "SessionStart"`. Shapes are executed and validated by `check.mjs`.
- **Apps and gateways language.** User-facing copy says sign-in link / app /
  connected / gateway — never authorization/OAuth/scopes/provider. `check.mjs`
  rejects "authorization link" in user-facing files and requires
  `Arcade_SelectGateway` coverage where tools are enumerated.
- **Server identity.** The MCP server key is `arcade` in every client; the
  hosted endpoint is `https://hub.arcadeagent.dev/mcp` (enforced by
  `check.mjs`).
