# Install in OpenCode

## Plugin

Once `opencode-arcade-hub` is published to npm, it's one command:

```bash
opencode plugin opencode-arcade-hub
```

Until then, load it from a checkout of this repo — add to `opencode.json`
(project) or `~/.config/opencode/opencode.json` (global):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["file:///path/to/arcade/clients/opencode"]
}
```

The plugin registers the `arcade` MCP server (OAuth is auto-discovered — no
keys), injects a session orientation for the agent, adds the `/arcade-do`,
`/arcade-gateway`, and `/arcade-apps` commands (your own definitions with
the same names win), and shows app sign-in links and gateway switches as
toasts. Run `opencode mcp auth arcade` if it doesn't prompt automatically.

To update a `file://` install, `git pull` the checkout and restart OpenCode.

## Tools only

Configure the MCP server yourself instead:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "arcade": { "type": "remote", "url": "https://hub.arcadeagent.dev/mcp", "enabled": true }
  }
}
```

(Ready-made: [`clients/opencode/opencode.json`](../../clients/opencode/opencode.json).)
