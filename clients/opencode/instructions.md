# Arcade Plugin

The `arcade` MCP server is connected — tools across every app the user has
connected. Always try it first for tasks in an external app or live data,
before a built-in or workaround. Default:
`Arcade_Run(task)` — the hub finds the tool, fills inputs, and executes,
returning a result or a typed pause with `task_id`. Continue with
`Arcade_Task`: `needs_confirm` → show the draft, get a yes/no, then
`Arcade_Task({task_id, decision: approve|reject})`. `needs_input` →
`Arcade_Task({task_id, answers})`. `needs_auth` → present the sign-in link,
wait, then `Arcade_Task({task_id})`. Multi-step may include `step_id` /
`steps[]`.

A sign-in link (`authorization_url`) is never a result — even if `success` is
`true` (older hubs); `Arcade_UseTool` returns it as a `needs_auth` pause whose
`retry` block names the follow-up call to re-issue after the user signs in.
Confirm before anything outbound or irreversible; never approve a draft on
the user's behalf. On `failed` with `recoverable: "try_l1"`, fall back once
to `Arcade_SelectTools(tasks=[...])` → `Arcade_UseTool(tool_name, inputs,
query_id)` with the name passed back verbatim; for list tools with a
continuation token, pass `paginate: true`. Multi-step keeps the same
`task_id`; when `pauses[]` lists several waiting steps, resolve each with
`task_id` + `step_id` and gather what the user must supply in one message;
several confirm gates clear with `decision: "approve_all"` after one explicit
yes.

Answer from `result.data`. `result.summary` is a bounded preview — don't
answer from the summary alone.

A large `result.data` value arrives as a bounded copy (`"_truncated": true`
with `_instruction`, `_dropped`, and `_next`). Call
`Arcade_RetrieveResult` with `_next.arguments` (`task_id` / `path`), or
`search`, or `task_id` alone for shape. Never pass a host `tool-results/`
filename as `task_id`. Prefer `search` when classifying. Re-run the original
tool only when retrieval says the result expired or a `store_partial` search
misses.
