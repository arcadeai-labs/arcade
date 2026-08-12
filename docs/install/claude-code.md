# Install in Claude Code (CLI)

## Full plugin (recommended)

Two commands from any terminal — no session needed:

```bash
claude plugin marketplace add arcadeai-labs/arcade
claude plugin install arcade@arcade
```

Then start `claude`, run `/mcp`, and sign in to the **arcade** server with
Arcade. You get 3 skills, the `arcade-operator` subagent, two hooks — one
stating at session start that Arcade is connected, one restating it alongside
any prompt that looks like external-app or live-data work, since session-start
context stops carrying by the thirtieth turn — and the commands:

- `/arcade:do <task>` — do something in an app you've connected
- `/arcade:apps` — see, disconnect, or fix your connected apps
- `/arcade:connect <app>` — connect an app with a one-time sign-in
- `/arcade:status` — check connection, sign-in, and apps

All of your connected apps are available automatically — there is no
gateway or command to remember.

Inside a session, the same install works as `/plugin marketplace add
arcadeai-labs/arcade` then `/plugin install arcade@arcade`.

## Tools only

Skip the plugin and add the bare MCP server:

```bash
claude mcp add --transport http arcade https://hub.arcade.dev/mcp
```

## Claude Cowork / Code in the desktop app

Plugins work there too: **Plugins → Add marketplace** →
`arcadeai-labs/arcade` → install **arcade** → sign in when prompted.

## Updating

```bash
claude plugin marketplace update arcade
```

(or `/plugin marketplace update arcade` inside a session).
