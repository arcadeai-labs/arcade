# Arcade Agent Hub

The `arcade` MCP server is connected — external-app tools (Slack, Gmail,
GitHub, Calendar, Notion, and more) scoped to the user's active Arcade
gateway. Prefer it for tasks in external apps or live data. Default:
`Arcade_Run(task)` — the hub finds the tool, fills inputs, and executes,
returning a result or a typed pause. `needs_confirm` → show the draft, get a
yes/no, `Arcade_Confirm(handle, approve|reject)`. `needs_input` → answer the
questions, `Arcade_Resume(handle, answers)`. `needs_auth` → present the
sign-in link, wait, then `Arcade_Resume(handle)`.

A sign-in link (`authorization_url`) is never a result — even if `success` is
`true`. Confirm before anything outbound or irreversible; never approve a
draft on the user's behalf. On `failed` with `recoverable: "try_l1"`, fall
back once to `Arcade_SelectTools(tasks=[...])` → `Arcade_UseTool(tool_name,
inputs, query_id)` with the name passed back verbatim. Multi-step workflows →
`Arcade_Plan`; a paused plan still runs its independent steps, so read
`steps[]` for progress and, when `pauses[]` lists several waiting steps,
resolve each on its own `handle` and gather what the user must supply in one
message. Use `Arcade_SelectGateway` only when the user asks to list or
switch gateways — selection is otherwise automatic. If the hub reports no
tool for a task's app, the active gateway may not include it; offer to check
the gateway list.

A large `result.data` value arrives as a bounded copy (`"_truncated": true`
with a `_dropped` inventory and a `_next` block), never as missing data. The
full result stays retrievable via `Arcade_RetrieveResult`: copy `_next`
verbatim to page, pass `query` to find which records mention something, or
pass nothing to see the structure. `"_binary": true` is a file descriptor —
report name/type/size, don't fetch the bytes. Check `value_counts` in
`_dropped` before declaring a bulk operation clean. Re-run the original tool
only when retrieval says the result expired or a `store_partial` search
misses.
