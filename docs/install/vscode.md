# Install in VS Code

VS Code loads this repo as an [Agent Plugins](https://agent-plugins.org) 1.0.0
package, which covers the `arcade` MCP server and both skills.

**Requires** agent plugins to be enabled: set `chat.plugins.enabled` to `true`
(Preview feature).

## Full plugin — server + skills

1. Open the Command Palette and run **Chat: Install Plugin From Source**.
2. Paste the repository URL:

   ```text
   https://github.com/arcadeai-labs/arcade
   ```

3. Reload, then open the MCP server list and sign in to **arcade**.

Or install from a terminal:

```bash
npx plugins add arcadeai-labs/arcade --target vscode
```

Verify in the Extensions view under **Agent Plugins - Installed**, and check
that the 2 skills appear in **Chat: Configure Skills**.

## Tools only — one click

[![Install the arcade MCP server in VS Code](https://img.shields.io/badge/VS_Code-add_arcade_MCP-0098FF?logo=visualstudiocode&logoColor=white)](https://vscode.dev/redirect/mcp/install?name=arcade&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fhub.arcade.dev%2Fmcp%22%7D)

Using Insiders? Use
[this link](https://insiders.vscode.dev/redirect/mcp/install?name=arcade&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fhub.arcade.dev%2Fmcp%22%7D&quality=insiders)
instead. Either adds the server without the skills.

## What you don't get, and why

The operator subagent, slash commands, and session hooks are **not** portable
component types in Agent Plugins 1.0.0. VS Code can read those from its
Copilot and Claude plugin formats, but a root `plugin.json` carrying the Agent
Plugins `$schema` takes priority and switches VS Code to portable semantics —
it also ignores client extension namespaces. So VS Code gets the part that
matters (the tools and the skills that teach an agent how to use them) and
none of the client-specific extras.

If you want the full bundle in a GitHub Copilot context, install through the
[Copilot CLI](copilot.md) instead: VS Code automatically discovers plugins
from `~/.copilot/installed-plugins/`, and that path loads the subagent and
hooks too.

## Sign in

Nothing to configure — no API keys, no headers. On the first task that touches
an app, Arcade returns a sign-in link; approve it in the browser and the task
continues.

## First steps

- "What can Arcade do?"
- "What's on my calendar tomorrow?"
- "Send a Slack message to #eng that the deploy is done."
