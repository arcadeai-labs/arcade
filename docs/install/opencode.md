# Install in OpenCode

## Plugin

One command — the plugin is published to npm as
[`opencode-arcade-hub`](https://www.npmjs.com/package/opencode-arcade-hub):

```bash
opencode plugin opencode-arcade-hub
```

That writes the plugin into the current project's `.opencode/opencode.json`;
add `-g` to install it globally instead. Each release publishes a matching npm
version, so `opencode plugin` upgrades you with the rest of the train.

To develop against a checkout instead, point at it from `opencode.json`
(project) or `~/.config/opencode/opencode.json` (global):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["file:///path/to/arcade/clients/opencode"]
}
```

The plugin registers the `arcade` MCP server (OAuth is auto-discovered — no
keys), injects a session orientation for the agent, adds the `/arcade-do`
and `/arcade-apps` commands (your own definitions with the same names win),
and shows app sign-in links as toasts. Run `opencode mcp auth arcade` if it
doesn't prompt automatically.

To update a `file://` install, `git pull` the checkout and restart OpenCode.

## Tools only

Configure the MCP server yourself instead:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "arcade": { "type": "remote", "url": "https://hub.arcade.dev/mcp", "enabled": true }
  }
}
```

(Ready-made: [`clients/opencode/opencode.json`](../../clients/opencode/opencode.json).)
