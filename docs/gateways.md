# Gateways

A **gateway** is a curated set of apps and tools you or your team assemble in
Arcade — "Slack + Gmail", "Support", "Full Suite". Your account can have many,
across every project you belong to. The active gateway determines which tools
your assistant can discover and run.

## How selection works

- **Automatic by default.** With one gateway it's used implicitly; your last
  selection persists across sessions. You never have to manage it.
- **Ask to see or switch.** "What gateways do I have?" lists them with their
  apps and tool counts; "switch to Full Suite" changes the active one.
- **Per app or everywhere.** A switch scoped to *this app* (the default)
  doesn't change your other clients — Cursor and Claude Code can point at
  different gateways. *Everywhere* sets the account-wide default.
- **Out-of-gateway tools don't surface.** If a task needs an app the active
  gateway doesn't include, your assistant will say so and offer the gateway
  that has it — switching is one sentence away.

## The five meta-tools

Every client gets the same five tools, which resolve to your gateways' tools
on demand:

| Tool | What it does |
|------|--------------|
| `Arcade_SelectTools` | Find the right tool for a task (scoped to the active gateway) |
| `Arcade_UseTool` | Run it |
| `Arcade_SelectGateway` | See your gateways, what's in them, or switch (this app / everywhere) |
| `Arcade_Apps` | See or disconnect your connected apps |
| `Arcade_ManageToolAuthorization` | Fix an app connection (switch account, expired sign-in, permissions) |

## Sign-ins

The first time a task needs an app you haven't connected, you get a one-time
sign-in link. Complete it in the browser and tell your assistant to continue —
no API keys, ever.

## Privacy

Tasks run through Arcade's hosted Agent Hub (`hub.arcade.dev`) and the
apps you connect. See
[Arcade's privacy policy](https://www.arcade.dev/privacy-policy) for how data
is handled.
