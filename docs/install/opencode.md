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
keys) and shows app sign-in links as toasts. Run `opencode mcp auth arcade`
if it doesn't prompt automatically.

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
