# Install in GitHub Copilot CLI

Copilot CLI gets the `arcade` MCP server, all three skills, all three slash
commands, and both session hooks. The `arcade-operator` subagent is Claude
Code and Cursor only.

## Install

Register the marketplace first — this is the supported form, and it keeps
`copilot plugin update` working:

```bash
copilot plugin marketplace add arcadeai-labs/arcade
copilot plugin install arcade@arcade
```

A direct repo install still works but now warns that it is deprecated: "Only
`plugin@marketplace` installs will be supported in a future release."

```bash
copilot plugin install arcadeai-labs/arcade
```

The cross-client installer does the same thing:

```bash
npx plugins add arcadeai-labs/arcade --target copilot
```

## Verify

```bash
copilot plugin list
```

Then in a session, `/mcp` should list **arcade** and its 5 tools — with a
per-server token cost, which is the cheapest way to see what the hub's fixed
surface actually costs you — and `/apps`, `/connect`, `/status` should be
available.

## Why you get more here than in VS Code

Copilot CLI recognizes the Agent Plugins `$schema` and applies spec semantics
**additively on top of standard plugin loading**. The portable core
(`skills/`, `mcp.json`) loads via the standard from the plugin root, and the
non-portable pieces come from Copilot's own locations.

Those locations changed in **Copilot CLI 1.0.80**: `commands/`, `agents/`,
`rules/`, `hooks/hooks.json`, `lsp.json` and `extensions/` are read only under
`com.github.copilot/`, no longer from the plugin root. This repo therefore
carries a `com.github.copilot/` directory holding byte-identical mirrors of the
commands and the hooks manifest; `scripts/check.mjs` fails the build if a
mirror drifts from its root original. The hook *scripts* are not duplicated —
both `hooks.json` copies invoke them through `${CLAUDE_PLUGIN_ROOT}`, which
Copilot substitutes alongside its own `COPILOT_PLUGIN_ROOT`.

Two consequences. Slash commands work here now — they were previously listed
as the one gap, because the root `commands/` directory was never read. And the
subagent is absent: it is deliberately not mirrored, so `--agent` offers
nothing from this plugin in Copilot. Use the skills instead. Use the skills or the subagent instead.

> Copilot CLI resolves `.plugin/plugin.json` **before** the root manifest.
> This repo deliberately ships no such file — if one were added, Copilot would
> drop to legacy loading and the `streamable-http` server would fail to
> register.

## Sign in

No API keys or headers. The first task that touches an app returns a sign-in
link; approve it in the browser and the task continues.

## Also shows up in VS Code

VS Code automatically discovers plugins installed through the Copilot CLI from
`~/.copilot/installed-plugins/`, so installing here covers both surfaces.
