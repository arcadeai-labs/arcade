# Install in Kiro

Kiro loads this repo as an [Agent Plugins](https://agent-plugins.org) package
— the `arcade` MCP server plus all three skills.

**Requires Kiro 1.0.288 or newer**, which added Agent Plugin support for
Powers. Older builds can still add the MCP server by hand (below).

## Install

1. Open the **Agent Steering & Skills** section in the Kiro panel.
2. Click **+** and choose to import a plugin.
3. Pick your source:
   - **GitHub** — `https://github.com/arcadeai-labs/arcade`
   - **Local folder** — a checkout of this repo

Kiro has no central marketplace, so import is the supported path.

## Tools only, on older Kiro

Add the server to `~/.kiro/settings/mcp.json` (user level) or
`.kiro/settings/mcp.json` (workspace level):

```json
{
  "mcpServers": {
    "arcade": {
      "url": "https://hub.arcade.dev/mcp"
    }
  }
}
```

Restart Kiro and run `/mcp` to confirm the server is connected, or `/tools` to
list its tools.

## Verify

The 3 skills should appear in the Agent Steering & Skills panel, and the
`arcade` server should list 6 tools.

If a skill does not activate, Kiro matches your request against the skill
`description` — try naming the app explicitly ("in my chat app…", "on my
calendar…").

## Sign in

No API keys. The first task that touches an app returns a sign-in link;
approve it in the browser and the task continues.
