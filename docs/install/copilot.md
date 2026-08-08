# Install in GitHub Copilot CLI

Copilot CLI gets the most of any Agent Plugins client: the `arcade` MCP
server, all 3 skills, the `arcade-operator` subagent, and both session hooks.

## Install

```bash
copilot plugin install arcadeai-labs/arcade
```

Or register the marketplace first, which keeps `copilot plugin update`
working:

```bash
copilot plugin marketplace add arcadeai-labs/arcade
copilot plugin install arcade@arcade
```

The cross-client installer does the same thing:

```bash
npx plugins add arcadeai-labs/arcade --target copilot
```

## Verify

```bash
copilot plugin list
```

Then in a session, `/mcp` should list **arcade** and its 9 tools, and the
`arcade-operator` agent should be available.

## Why you get more here than in VS Code

Copilot CLI recognizes the Agent Plugins `$schema` and applies spec semantics
**additively on top of standard plugin loading**. So the portable core
(`skills/`, `mcp.json`) loads via the standard, and the non-portable pieces
still come from Copilot's own default locations — `agents/*.agent.md` and
`hooks/hooks.json`, both of which sit at the plugin root in this repo.

Slash commands are the one gap: Copilot has no default discovery location for
commands, and the Agent Plugins manifest is a closed schema that cannot
declare component paths. Use the skills or the subagent instead.

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
