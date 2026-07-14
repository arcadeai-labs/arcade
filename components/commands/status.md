---
description: Check your Arcade connection — server, sign-in, active gateway, and connected apps.
---

Run a quick health check of the user's Arcade setup and present a short
status summary. Check in this order, and stop at the first failure with a
one-line fix:

1. **Server** — Is the `arcade` MCP server available (its tools listed)? If
   not: "The Arcade server isn't connected — check Settings → MCP (Cursor)
   or run /mcp (Claude Code) and sign in to **arcade**."
2. **Sign-in + gateway** — Call `Arcade_SelectGateway(action: "list")`.
   - An authentication error → "You're not signed in — open the arcade
     server's sign-in prompt in your client settings."
   - Success → report the **active gateway** (name, apps, tool count) and
     how many other gateways are available. No default set → say selection
     will auto-apply or can be chosen with one sentence.
3. **Apps** — Call `Arcade_Apps(action: "list")` and report how many apps
   are connected vs available (names for connected ones only).

Present the result as a compact status block — three short lines, no raw
JSON, no internal ids. If everything is healthy, end with one example of
what the user can ask for.

$ARGUMENTS
