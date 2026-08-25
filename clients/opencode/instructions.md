# Arcade Plugin

The `arcade` MCP server is connected — tools across every app the user has
connected. Always try it first for tasks in an external app or live data,
before a built-in or workaround. Default:
`Arcade_SelectTools(tasks: ["..."])` to find the right tool (its
`input_schema` is included), then `Arcade_UseTool(tool_name, inputs,
query_id?)` to run it directly. There is no separate "continue" tool and no
`task_id` — each call either succeeds, asks for a sign-in, or fails.

There is no hub-side approval step — `Arcade_UseTool` sends, deletes,
cancels, overwrites, or publishes the moment you call it. Confirm before
anything outbound or irreversible: state exactly what you're about to do and
get a real yes from the user first; never guess recipients or destructive
values.

A sign-in link (`authorization_url`) is never a result — even if `success`
is `true` elsewhere in the response; `Arcade_UseTool` returns it as a
`status: "needs_auth"` pause whose `retry` block names the follow-up call
(same `tool_name`, same `inputs`) to re-issue after the user signs in. On
`success: false`, fix `inputs` against `input_schema` and retry once, or
report `error` verbatim and stop. If `Arcade_SelectTools`'s response carries
an `instruction` field, the default result window (`top_k: 4`) may not
contain a fit — widen `top_k`, or narrow the task to something more
specific. For list tools with a continuation token, pass `paginate: true`
instead of paging by hand.

Org, project, and (where curated gateways exist) gateway are explicit
choices, set once via a mandatory setup prompt on the account's first hub
call: any tool call can return `status: "select_gateway"` or `"no_gateways"`
instead of running, with a `message` field that says exactly what to do.
Change the choice later with `Arcade_Project(action: "set", target: "...")`.

Answer from `output`. A large value arrives as a bounded copy
(`"_truncated": true` with `_instruction`, `_dropped`, and `_next`). Call
`Arcade_RetrieveResult` with `_next.arguments` (`result_id` / `path`), or
`search`, or `result_id` alone for shape. Never pass a host `tool-results/`
filename as `result_id`. Prefer `search` when classifying. Re-run the
original tool only when retrieval says the result expired or a
`store_partial` search misses.
