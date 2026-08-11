# opencode-arcade-hub

[Arcade Agent Hub](https://hub.arcade.dev) for **OpenCode** — all of your
connected apps (Slack, Gmail, GitHub, Google Calendar, Notion, Linear, and
more) over a single MCP connection. Just ask for what you want; Arcade picks
the right tool and handles the app sign-in.

## Install

> Not yet published to npm — install from a local checkout for now.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["file:///path/to/arcade/clients/opencode"]
}
```

Once published:

```bash
opencode plugin opencode-arcade-hub
```

The plugin registers the `arcade` remote MCP server for you (OAuth is
auto-discovered — no API keys) and shows a toast with the one-time sign-in link
the first time an app needs connecting. Run `opencode mcp auth arcade` if it
doesn't prompt automatically.

Prefer configuring the MCP server yourself instead of using the plugin? Add:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "arcade": { "type": "remote", "url": "https://hub.arcade.dev/mcp", "enabled": true }
  }
}
```

## What you get

Meta-tools that resolve to your connected apps' tools on demand:

- `Arcade_SelectTools` — find the right tool for a task
- `Arcade_UseTool` — run it
- `Arcade_Apps` — see or disconnect your connected apps
- `Arcade_ManageToolAuthorization` — fix an app connection (switch account,
  expired sign-in, missing permissions)

## Links

- Home: https://hub.arcade.dev
- Endpoint: https://hub.arcade.dev/mcp
- Source: https://github.com/arcadeai-labs/arcade

## License

[Apache-2.0](LICENSE). Copyright (c) 2024–Present Arcade AI.
