# Install in Codex or ChatGPT

Codex and ChatGPT share one plugin directory, so a single install shows up on
both surfaces. You get the `arcade` MCP server and all 3 skills.

## Install

```bash
npx plugins add arcadeai-labs/arcade --target codex
```

Or install from a local marketplace, which is useful before the plugin is
listed publicly. Add an entry to `~/.agents/plugins/marketplace.json` (or
`.agents/plugins/marketplace.json` in a repo) pointing at a checkout:

```json
{
  "plugins": [
    {
      "name": "arcade",
      "source": "./path/to/arcade"
    }
  ]
}
```

Codex caches installed plugins under
`~/.codex/plugins/cache/$MARKETPLACE/$PLUGIN/$VERSION/`; local sources resolve
to `local`.

## Verify

The 3 skills should be listed among your available skills, and the `arcade`
MCP server should appear with its 9 tools.

## How Codex reads this package

Codex recognizes a root `plugin.json` using the Agent Plugins 1.0.0 schema and
maps its metadata, `skills/`, and `mcp.json` into a Codex plugin manifest.
Codex-specific settings — apps, lifecycle hooks, and directory presentation —
come from an inline `com.openai` extension namespace or a `.codex-plugin/plugin.json`
overlay.

This repo ships **neither** yet. The field shapes for those Codex-specific
blocks are not published outside the implementing pull request, and Codex
validates a namespace it implements rather than ignoring it, so a wrong guess
would fail rather than degrade. The portable core is unaffected: skills and
the MCP server load normally. Adding the overlay is tracked in
[the roadmap](../roadmap.md).

## Sign in

No API keys. The first task that touches an app returns a sign-in link;
approve it in the browser and the task continues.

## First steps

- "What's on my calendar tomorrow?"
- "Summarize my unread Slack mentions."
