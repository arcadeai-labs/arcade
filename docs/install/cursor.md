# Install in Cursor

## Tools only (one click)

[![Add arcade MCP server to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=arcade&config=eyJ1cmwiOiJodHRwczovL2h1Yi5hcmNhZGVhZ2VudC5kZXYvbWNwIn0=)

This adds the `arcade` MCP server only — no rule, skills, commands, or hooks.
Approve the install, then open **Settings → MCP**, find **arcade**, and sign
in with Arcade.

## Recommended: install once via Claude Code

Cursor automatically loads installed Claude Code plugins, so one install
covers both editors — with auto-updates:

```bash
claude plugin marketplace add arcadeai-labs/arcade
claude plugin install arcade@arcade
```

Reload Cursor. This surfaces the MCP server, all 3 skills, the
`arcade-operator` subagent, all 6 commands, and the session-start context
hook (the hook detects which client invoked it and answers in that client's
native shape). The only piece that can't bridge is the Cursor-specific
always-on rule — its guidance is substantially covered by the hook + skills.

Update later with `claude plugin marketplace update arcade`.

## Full native install (adds the rule)

Copy the repo — **a real directory, not a symlink** (Cursor rejects symlink
targets outside its plugins folder):

```bash
git clone https://github.com/arcadeai-labs/arcade ~/.cursor/plugins/local/arcade
```

Reload Cursor and verify under Customize: 1 rule, 3 skills, 1 agent,
6 commands, 1 hook, 1 MCP server. If you also have the Claude Code install,
disable one of the two `arcade` plugins in the Plugins UI to avoid
duplicates. Update with `git -C ~/.cursor/plugins/local/arcade pull` + reload.

## First steps

- `/arcade:status` to verify the connection end to end.
- "What gateways do I have?" / "Switch to <gateway> for this app."
- "Send a Slack message to #eng that the deploy is done."
