# Install in Cursor

## Full plugin (recommended)

In Cursor, open the plugins/marketplace panel, **Add marketplace**, and enter:

```text
arcadeai-labs/arcade
```

Then install the **arcade** plugin and reload. Or do the same from a terminal:

```bash
npx plugins add arcadeai-labs/arcade --target cursor
```

Either way installs the plugin natively in Cursor — the logo, the MCP server,
all 3 skills, the `arcade-operator` subagent, all 6 commands, the always-on
rule, and the session-start hook — and enables auto-updates. After reload,
open **Settings → MCP**, find **arcade**, and sign in with Arcade.

Verify under **Settings → Customize**: 1 rule, 3 skills, 1 agent, 6 commands,
1 hook, 1 MCP server.

## Tools only (one click)

If you just want the tools without the skills/commands/rule:

[![Add arcade MCP server to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=arcade&config=eyJ1cmwiOiJodHRwczovL2h1Yi5hcmNhZGVhZ2VudC5kZXYvbWNwIn0=)

This adds the `arcade` MCP server only. Approve it, then sign in under
**Settings → MCP**.

## Avoid installing twice

Cursor also auto-loads any plugin you've installed in **Claude Code**. If you
install **arcade** both natively in Cursor *and* in Claude Code, Cursor shows
it twice and splits its components between the two entries. Pick one:

- Cursor-first users: install natively in Cursor (above); don't also install
  it in Claude Code, or disable the imported copy in Cursor's Plugins panel.
- Claude-Code-first users: the imported copy already gives Cursor everything
  except the always-on rule — you don't need the native Cursor install too.

## Updating

- Native marketplace install: Cursor auto-updates it; or re-run
  `npx plugins add arcadeai-labs/arcade --target cursor`.

## First steps

- `/arcade:status` to verify the connection end to end.
- "What gateways do I have?" / "Switch to <gateway> for this app."
- "Send a Slack message to #eng that the deploy is done."
