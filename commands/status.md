---
description: Check your Arcade connection — server, sign-in, org/project/gateway scope, connected apps, and plugin↔hub versions.
---

Run a quick health check of the user's Arcade setup and present a short
status summary. Check in this order, and stop at the first failure with a
one-line fix:

1. **Server** — Is the `arcade` MCP server available (its tools listed)? If
   not: "The Arcade server isn't connected — check Settings → MCP (Cursor)
   or run /mcp (Claude Code) and sign in to **arcade**."
2. **Release train** — Fetch `GET https://hub.arcade.dev/health` (no auth).
   Read this plugin's version from its manifest/`VERSION` (currently in
   `release-contract.json`). Report one line:
   `plugin <pluginVersion> ↔ hub <health.version> (<health.env>)` and note
   the Engine host from `health.engine` only if useful. If `/health` fails,
   say the hub health endpoint is unreachable and continue with sign-in
   checks. If `health.version` is missing, omit the hub side of the line.
3. **Scope** — Call `Arcade_SelectScope(action: "list")` and report the
   active org and project, plus the active gateway if one is set, e.g.
   `org: Acme · project: Support · gateway: Full Suite` (omit the gateway
   segment when the deployment has none). If the tool isn't available or the
   call errors, skip this line silently — it's informational, not a health
   check that should block the rest of the status report.
4. **Sign-in + apps** — Call `Arcade_Apps(action: "list")`.
   - An authentication error → "You're not signed in — open the arcade
     server's sign-in prompt in your client settings."
   - Success → report how many apps are connected vs available (names for
     connected ones only).

Present the result as a compact status block — short lines, no raw JSON, no
internal ids. If everything is healthy, end with one example of what the
user can ask for.

$ARGUMENTS
