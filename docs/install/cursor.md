# Install in Cursor

## Tools only (one click)

[![Add arcade MCP server to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=arcade&config=eyJ1cmwiOiJodHRwczovL2h1Yi5hcmNhZGVhZ2VudC5kZXYvbWNwIn0=)

This adds the `arcade` MCP server only — no rule, skills, commands, or hooks.
Approve the install, then open **Settings → MCP**, find **arcade**, and sign
in with Arcade.

## Full plugin (rule + skills + commands + subagent + hook)

Copy or symlink this repo and restart Cursor:

```bash
git clone https://github.com/arcadeai-labs/arcade ~/.cursor/plugins/local/arcade
```

After the restart, **Settings → MCP → arcade → sign in** with Arcade. Verify
under Customize: 1 rule, 3 skills, 1 agent, 4 commands, 1 hook, 1 MCP server.

## First steps

- "What gateways do I have?"
- "Switch to <gateway> for this app."
- "Send a Slack message to #eng that the deploy is done."
- `/arcade:status` to verify the connection end to end.

## Updating

Local-directory installs don't self-update — pull the repo:

```bash
git -C ~/.cursor/plugins/local/arcade pull
```

then reload Cursor.
