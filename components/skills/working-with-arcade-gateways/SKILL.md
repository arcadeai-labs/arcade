---
name: working-with-arcade-gateways
description: Show, inspect, and switch the user's Arcade gateways — curated sets of apps and tools (a team's support toolset, an engineering toolset, a full catalog) that determine which tools are available. Use when the user asks what gateways they have, what apps or tools a gateway includes, which gateway is active, or wants to switch gateways for this app or everywhere. Not for running tasks — selection is otherwise automatic.
---

# Working with Arcade gateways

A **gateway** is a curated set of apps and tools the user (or their team) has
assembled in Arcade — for example "Slack + Gmail", "Support toolset", or a
full catalog. The active gateway determines which tools `Arcade_SelectTools`
can find and `Arcade_UseTool` can run. Selection is automatic and persists
across sessions; only touch it when the user asks.

`Arcade_SelectGateway` lives on the `arcade` MCP server.

## Quick start

```text
Arcade_SelectGateway(action: "list")                             # all gateways + which is active
Arcade_SelectGateway(action: "select", gateway: "<id from list>",
                     scope: "this_app" | "everywhere")           # make one the default
```

## Viewing gateways

Call `Arcade_SelectGateway(action: "list")` and present each gateway with its
name, its apps, and its tool count. Mark the active one. Gateways with
`all_tools: true` are unrestricted — say "all tools" instead of a count.

```text
Arcade_SelectGateway(action: "list")
  → {gateways: [{gateway: "gw_…", name: "Slack + Gmail Gateway", apps: ["Gmail","Slack"],
                 tool_count: 12, default_for_this_app: true}, …],
     active_gateway: "gw_…"}
Reply:
  Active (this app): Slack + Gmail Gateway — Gmail, Slack (12 tools)
  Others: Full Suite — Attio, Datadog, Github, … (494 tools); work — GoogleSearch,
  Linear, Slack (53 tools); …
```

The list spans every project the user belongs to. `default_for_this_app` /
`default_everywhere` mark where the current default comes from; when exactly
one gateway exists it is used automatically.

## Inspecting a gateway's resources

- **Apps:** already in the `list` output (`apps`, `tool_count`) — no extra
  call needed for an overview.
- **Tools:** to preview which tools a gateway would provide for a task, pass
  the gateway id to discovery without selecting it:
  `Arcade_SelectTools(tasks: ["<task>"], gateway: "<id>")`. Present the
  results as `tool_name — description` only when the user asked to see them.
- **Connected apps:** `Arcade_Apps(action: "list")` shows the connected state
  of the active gateway's apps (see `managing-arcade-apps`).

## Switching gateways

1. If the target is ambiguous, `list` first and match by name.
2. Call `select` with the `gateway` id from `list`.
   - `scope: "this_app"` (default) — only this client changes; other apps
     keep their own selection.
   - `scope: "everywhere"` — account-wide default.
3. Relay the confirmation summary (gateway, apps, tool count, where it
   applies) so the user knows what just changed.

The switch takes effect on the next tool call — no restart or reconnect.

## One-off routing

To run a single task through a different gateway without changing the
default, pass `gateway` on the call itself:
`Arcade_SelectTools(tasks: [...], gateway: "<id>")` then
`Arcade_UseTool(tool_name, inputs, query_id, gateway: "<id>")`.

## Errors

- Unknown gateway id → `list` and match by name; never guess ids.
- "No gateways are available" → the user's account has none; suggest creating
  one in the Arcade dashboard.
- A task's app is missing from discovery → the active gateway may not include
  it; check `list` and offer the gateway that does.

## When not to use

- Normal task execution — the active gateway applies automatically; don't
  call `list` or `select` speculatively before tasks.
- Managing app sign-ins — that's `managing-arcade-apps`.

## Style

- Gateways language: gateway, active, switch, "applies to this app" /
  "applies everywhere". Show gateway names prominently; ids only as the value
  passed back to `select`.
- Don't dump the raw list output — summarize with the active gateway first.
