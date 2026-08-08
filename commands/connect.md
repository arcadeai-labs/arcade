---
description: Connect an app to Arcade (Google, GitHub, Slack, Notion, …) with a one-time sign-in.
---

Help the user connect the app they name to Arcade, using the
`managing-arcade-apps` skill's sign-in etiquette.

1. Confirm the app is available: `Arcade_Apps(action: "list")`. If it's
   already connected, say so (with the account) and stop — offer
   `switch_account` if they wanted a different account.
2. Start the sign-in: find one tool for that app via
   `Arcade_SelectTools(tasks: ["<something basic in that app>"])`, then call
   `Arcade_ManageToolAuthorization(action: "authorize", tool_name: "<from
   select>", reason: "user_requested")`.
3. Present the sign-in link: "Sign in to connect your **<App>** here, then
   tell me to continue." Stop and wait — never poll or retry in a loop.
4. When the user confirms, verify with
   `Arcade_ManageToolAuthorization(action: "status", ...)` and report the
   connected account.

If the app isn't in the list, the active gateway may not include it — check
`Arcade_SelectGateway(action: "list")` and offer the gateway that has it.

App to connect:

$ARGUMENTS
