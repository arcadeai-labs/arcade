---
name: setting-up-arcade-scope
description: Handle the one-time mandatory pause where Arcade asks the user to pick their org, project, and (if curated gateways exist) gateway, and the explicit `Arcade_SelectScope` flow for changing that choice later. Use the first time any hub tool call for an account returns a menu-shaped needs_input pause, or when the user explicitly asks to change their org, project, or gateway. Not for running tasks — scope is otherwise automatic and invisible.
---

# Setting up Arcade scope

**Scope** is the org, project, and (where curated gateways exist outside an
all-apps-only deployment) gateway a hub call runs against. Every account
picks this exactly once: the very first hub tool call it ever makes returns a
blocking setup pause that must be answered before anything else can proceed.
After that one pause, the choice is persisted and invisible — never surface
it again unless the user explicitly asks to change org, project, or gateway.

`Arcade_SelectScope` lives on the `arcade` MCP server.

## Quick start

```text
Arcade_Task({task_id, answers: {<field id>: <value>}})   # answer the mandatory setup pause
Arcade_SelectScope(action: "list")                       # current + available org/project/gateway choices
Arcade_SelectScope(action: "select", ...)                # change org/project/gateway (ids from list)
```

## Recognizing the mandatory setup pause

Any hub call can return `needs_input`, but there are two different shapes:

- **Ordinary input** — one field asking for a value to fill in (an email
  address, a channel name). Covered in `using-arcade-tools`.
- **A MENU** — one or more `pause.fields` entries that each enumerate a set of
  *named choices to pick one from* (org, project, and optionally gateway),
  rather than asking for a free-form value. This is the setup pause. It shows
  up exactly once per account, on that account's first hub call, and blocks
  every other part of the task — nothing else can succeed until it's
  answered, because no org/project is selected yet.

Tell the two apart by whether the field carries a list of options: a MENU
field has choices to pick among; an ordinary field does not.

## Presenting the menu

1. Show each field's choices by name — org names, project names, and (if
   present) gateway names — never raw ids.
2. Get the user's actual pick for each field. Never guess or auto-select on
   their behalf, even if there's an obvious single choice — a one-item list
   is still a choice for the user to confirm, not one to skip past.
3. Relay the picks back with `Arcade_Task({task_id, answers: {<field id>:
   <value>}})`, matching each answer to the field id it came from (same
   contract as the ordinary `needs_input` pause in `using-arcade-tools`).
4. Once answered, the run continues normally. Don't mention scope again
   unless the user brings it up.

### Example

```text
Arcade_Run(task: "Send a Slack message to #eng saying the deploy is done")
  → {status: "needs_input", task_id: "task_…",
     pause: {fields: [{id: "org", choices: ["Acme Corp", "Acme Sandbox"]},
                       {id: "project", choices: ["Support", "Engineering"]}]}}
Present both menus → user picks "Acme Corp" and "Engineering" →
Arcade_Task(task_id: "task_…", answers: {org: "Acme Corp", project: "Engineering"})
  → run continues to the original task
```

## Changing org, project, or gateway later

Only when the user explicitly asks ("switch my project", "use the other
org", "change my gateway") — never speculatively.

1. If the target is ambiguous, call `Arcade_SelectScope(action: "list")` first
   and match the user's words against the names it returns — **never guess
   an id.**
2. Call `Arcade_SelectScope(action: "select", ...)` with whichever of
   org/project/gateway the user wants changed, using the id from `list`.
   Leave the rest unspecified so they stay as they are.
3. Relay the confirmation (what changed, to what) so the user knows the new
   scope took effect.

The change takes effect on the next tool call — no restart or reconnect.

## Errors

- Unknown org/project/gateway name → `list` and match by name; never guess.
- Gateway not offered by `list` → that account's deployment may not have
  curated gateways configured (e.g. an all-apps-only deployment) — org and
  project selection still apply, gateway just isn't part of this account's
  choice.

## When NOT to use

- **Never call `Arcade_SelectScope` speculatively during normal task
  execution.** Scope is automatic and persists after the one mandatory
  pause — don't call `list` or `select` before ordinary tasks "just in
  case."
- Only act on this flow when the mandatory setup pause actually appears (a
  MENU-shaped `needs_input`), or when the user explicitly asks to change
  their org, project, or gateway.
- Performing tasks inside an app — that's `using-arcade-tools`.
- Managing app connections/sign-ins — that's `managing-arcade-apps`.

## Style

- Scope language: org, project, gateway, "set up", "change" / "switch".
  Show names prominently; ids only as the value passed back to `select` or
  in `answers`.
- Don't dump the raw list/pause output — summarize with names, and mark
  whichever choice is currently active.
