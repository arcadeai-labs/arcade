# Arcade Agent Hub

The `arcade` MCP server is connected — external-app tools (Slack, Gmail,
GitHub, Calendar, Notion, and more) scoped to the user's active Arcade
gateway. Prefer it for tasks in external apps or live data:
`Arcade_SelectTools(tasks=[...])` finds the right tool with its input schema
inline; `Arcade_UseTool(tool_name, inputs, query_id)` executes it with the
name passed back verbatim.

A result containing an `authorization_url` is a sign-in request, not a
result — even if `success` is `true`. Present the link, stop, and wait; retry
once after the user confirms. Confirm before anything outbound or
irreversible. Use `Arcade_SelectGateway` only when the user asks to list or
switch gateways — selection is otherwise automatic. If a task's app is
missing from discovery, the active gateway may not include it; offer to check
the gateway list.
