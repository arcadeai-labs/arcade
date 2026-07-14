---
description: See your Arcade gateways or switch the active one (this app or everywhere).
---

Help the user view and switch their Arcade gateways using the
`Arcade_SelectGateway` tool (the `working-with-arcade-gateways` skill has the
full flow).

- **No arguments or "list":** call `Arcade_SelectGateway(action: "list")` and
  present each gateway — name, apps, tool count — with the active one first
  and clearly marked. Say "all tools" for unrestricted gateways.
- **A gateway name or id:** switch to it. Match names against the list
  (`action: "list"` first if needed), then call `action: "select"` with the
  `gateway` id. Default `scope: "this_app"`; use `scope: "everywhere"` only
  when the user says everywhere / all apps / account-wide. Relay the
  confirmation summary (gateway, apps, tool count, where it applies).
- **"What's in <gateway>?":** answer from the list output (apps + tool
  count); to preview tools for a task, use
  `Arcade_SelectTools(tasks: [...], gateway: "<id>")` and show
  `tool_name — description`.

The switch takes effect on the next tool call. Never guess gateway ids.

Request:

$ARGUMENTS
