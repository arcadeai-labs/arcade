# Install in Claude Code (CLI)

## Full plugin (recommended)

Two commands from any terminal — no session needed:

```bash
claude plugin marketplace add arcadeai-labs/arcade
claude plugin install arcade@arcade
```

Then start `claude`, run `/mcp`, and sign in to the **arcade** server with
Arcade. You get 3 skills, the `arcade-operator` subagent, the SessionStart
hook, and the commands:

- `/arcade:do <task>` — do something in an app (Slack, Gmail, GitHub, …)
- `/arcade:gateway [name]` — see your gateways or switch the active one
- `/arcade:apps` — see, disconnect, or fix your connected apps
- `/arcade:tools <query>` — preview which tools would run (debugging)

Inside a session, the same install works as `/plugin marketplace add
arcadeai-labs/arcade` then `/plugin install arcade@arcade`.

## Tools only

Skip the plugin and add the bare MCP server:

```bash
claude mcp add --transport http arcade https://hub.arcadeagent.dev/mcp
```

## Claude Cowork / Code in the desktop app

Plugins work there too: **Plugins → Add marketplace** →
`arcadeai-labs/arcade` → install **arcade** → sign in when prompted.
