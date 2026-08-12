# Install in an Agent Plugins client

This repo is a conformant [Agent Plugins 1.0.0](https://agent-plugins.org)
package, so any client that implements the standard can load it directly —
ChatGPT and Codex, GitHub Copilot, Kiro, and VS Code among them.

## What you get

The standard covers two component types, and this plugin ships both:

- **The `arcade` MCP server** (`mcp.json`) — all 8 hub tools over
  `https://hub.arcade.dev/mcp`.
- **Three skills** (`skills/`) — `using-arcade-tools`,
  `managing-arcade-apps`, `setting-up-arcade-scope`.

Rules, the `arcade-operator` subagent, slash commands, and session hooks are
**not** portable component types in 1.0.0. If your client is Cursor or Claude
Code, install through its own plugin system instead — you get everything, and
those manifests are resolved ahead of the portable one so nothing is
duplicated. See [cursor.md](cursor.md) and [claude-code.md](claude-code.md).

## Install

The cross-client installer detects which agent tools you have and installs
into each one natively:

```bash
npx plugins add arcadeai-labs/arcade
```

Add `--target <client>` to pick just one, and check what would be installed
first with `npx plugins discover arcadeai-labs/arcade`.

Each client also has its own flow:

| Client | How | Requires |
|--------|-----|----------|
| **GitHub Copilot CLI** | `copilot plugin install arcadeai-labs/arcade` | Copilot CLI with Open Plugin Spec support |
| **VS Code** | **Chat: Install Plugin From Source** from the Command Palette, then paste `https://github.com/arcadeai-labs/arcade` | `chat.plugins.enabled` set to `true` (Preview) |
| **Kiro** | Agent Steering & Skills panel → **+** → import from GitHub URL or local folder | Kiro ≥ 1.0.288 |
| **Codex / ChatGPT** | The shared plugin directory, or `npx plugins add … --target codex` | Codex with Agent Plugins manifest support |

VS Code also auto-discovers plugins installed via the Copilot CLI from
`~/.copilot/installed-plugins/`, so installing once in the CLI covers both.

## Sign in

Agent Plugins 1.0.0 defines no portable credential or OAuth fields on
purpose — authentication is client-managed. Nothing to configure here: no API
keys, no headers, no environment variables. On the first task that touches an
app, Arcade returns a sign-in link, you approve it in the browser, and the
task continues.

## Verify

Ask your agent:

- "What can Arcade do?" — the three skills should be discoverable.
- "What's on my calendar tomorrow?" — should route through the `arcade`
  server and, the first time, return a sign-in link.

If the tools are missing, confirm the client actually supports MCP servers
from plugins; some clients ship skill support first.
