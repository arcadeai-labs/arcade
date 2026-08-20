---
name: setting-up-arcade-scope
description: Handle the one-time mandatory pause where Arcade asks the user to pick their org, project, and (if curated gateways exist) gateway, and the explicit `Arcade_Project` flow for changing that choice later. Use the first time any hub tool call for an account returns a `select_gateway` or `no_gateways` status, or when the user explicitly asks to change their org, project, or gateway. Not for running tasks — scope is otherwise automatic and invisible.
---

# Setting up Arcade scope

**Scope** is the org, project, and (where curated gateways exist outside an
all-apps-only deployment) gateway a hub call runs against. Every account
picks this exactly once: the very first hub tool call it ever makes returns
a blocking setup prompt instead of running, and that prompt must be answered
before anything else can proceed. After that one prompt, the choice is
persisted and invisible — never surface it again unless the user explicitly
asks to change org, project, or gateway.

`Arcade_Project` lives on the `arcade` MCP server.

## Quick start

```text
Arcade_Project(action: "list")                        # current + available org/project/gateway choices
Arcade_Project(action: "set", target: "...", scope?)  # change org/project/gateway (id from list)
```

## Recognizing the setup prompt

Any hub tool call (`Arcade_SelectTools`, `Arcade_UseTool`, `Arcade_Apps`,
`Arcade_Project`) can return one of these **instead of** doing what you
asked:

- **`"status": "select_gateway"`** — scope isn't set yet. The response's
  `message` field already says exactly what to do (ask the user, then call
  `Arcade_Project` with their pick) — follow it. `projects[]` lists the
  choices grouped by project, each with a `gateway` id and display `name`.
- **`"status": "no_gateways"`** — nothing can be resolved at all (no apps
  available to the account). `message` says this is an account-setup gap
  that only the Arcade dashboard (or whoever manages the account) can fix —
  no `Arcade_Project` call will help. Relay that plainly and stop.

Both are ordinary (non-error) tool results, not a special pause type — treat
them as "the tool needs one more piece of information before it can run."

## Presenting the choices

1. Show the choices by name — project names and gateway/app-bundle names —
   never raw ids (`gateway` values are ids, `name` values are what to show).
2. Get the user's actual pick. Never guess or auto-select on their behalf,
   even if there's an obvious single choice — a one-item list is still a
   choice for the user to confirm, not one to skip past.
3. Call `Arcade_Project(action: "set", target: "<id from the choices>")`.
4. Retry the original call you were making (the same `Arcade_SelectTools` /
   `Arcade_UseTool` / etc. call, unchanged) — it now resolves normally.
   Don't mention scope again unless the user brings it up.

### Example

```text
Arcade_SelectTools(tasks: ["Send a message to #eng saying the deploy is done"])
  → {status: "select_gateway",
     message: "Before running anything, ask the user which set of apps to
               use. List the options below grouped by org/project and wait
               for their choice, then call Arcade_Project with the chosen
               target. Do not guess.",
     projects: [{project: "Engineering",
                 gateways: [{gateway: "full-suite", name: "Full Suite", apps: [...]}]}]}
Present the choice → user picks "Full Suite" →
Arcade_Project(action: "set", target: "full-suite")
  → {target: "full-suite", name: "Full Suite", message: "Connected to Full Suite: ..."}
Retry the original call:
Arcade_SelectTools(tasks: ["Send a message to #eng saying the deploy is done"])
  → normal results
```

## Changing org, project, or gateway later

Only when the user explicitly asks ("switch my project", "use the other
org", "change my gateway") — never speculatively.

1. If the target is ambiguous, call `Arcade_Project(action: "list")` first
   and match the user's words against the names it returns — **never guess
   an id.** `list` groups choices by org, then project, each with an
   "all apps in this project" target plus any curated gateways.
2. Call `Arcade_Project(action: "set", target: "...")` with the id from
   `list`. Add `scope: "everywhere"` only if the user wants the change to
   apply account-wide instead of just this app (default `this_app`).
3. Relay the confirmation (`message` in the response) so the user knows the
   new scope took effect.

The change takes effect on the next tool call — no restart or reconnect.

## Errors

- Unknown org/project/gateway name → `list` and match by name; never guess.
- `action: "set"` refused as "pinned" → this deployment fixed the scope
  itself; tell the user it can't be changed here.
- Gateway not offered by `list` → that account's deployment may not have
  curated gateways configured (e.g. an all-apps-only deployment) — org and
  project selection still apply, gateway just isn't part of this account's
  choice.

## When NOT to use

- **Never call `Arcade_Project` speculatively during normal task
  execution.** Scope is automatic and persists after the one mandatory
  prompt — don't call `list` or `set` before ordinary tasks "just in case."
- Only act on this flow when a tool call actually returns `select_gateway` /
  `no_gateways`, or when the user explicitly asks to change their org,
  project, or gateway.
- Performing tasks inside an app — that's `using-arcade-tools`.
- Managing app connections/sign-ins — that's `managing-arcade-apps`.

## Style

- Scope language: org, project, gateway, "set up", "change" / "switch".
  Show names prominently; ids only as the value passed to `target`.
- Don't dump the raw list output — summarize with names, and mark whichever
  choice is currently active.
