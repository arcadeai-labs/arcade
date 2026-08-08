# Changelog

All notable changes to the Arcade Agent Hub plugins are documented here.
This project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Derived from Arcade's earlier plugin packaging at v0.6.0 (see the git
history); this repo targets the gateway hub deployment
(`hub.arcade.dev`).

## [0.11.0] - 2026-08-08

Requires hub >= 0.10.0. Packaging and copy only — no hub change.

### Added

- **Agent Plugins 1.0.0 support.** A root `plugin.json` and `mcp.json`
  make this a conformant Agent Plugin, so ChatGPT/Codex, GitHub Copilot,
  Kiro, and VS Code load the three skills and the `arcade` MCP server
  from the same package Cursor and Claude Code already use. Cursor
  resolves `.cursor-plugin/plugin.json` ahead of the root manifest, so
  native Cursor and Claude Code installs are unchanged: the always-on
  rule, operator subagent, commands, and hooks all still load.
- **The subagent and hooks now reach GitHub Copilot CLI.** Copilot applies
  Agent Plugins semantics *additively on top of* its standard plugin loading,
  so components sitting at its default locations load alongside the portable
  core. Moving them to the root means one copy of the operator subagent and
  the two session hooks now serves Claude Code, Cursor, and Copilot CLI.
- **A page per client.** New install guides for
  [VS Code](docs/install/vscode.md), [Copilot CLI](docs/install/copilot.md),
  [Codex / ChatGPT](docs/install/codex.md), and [Kiro](docs/install/kiro.md),
  plus an [index](docs/install/README.md) covering every client. `check.mjs`
  fails if a guide is unlinked or a link points at a missing page.
- **Branded README with one-click install.** A centered Arcade wordmark that
  follows the reader's light or dark theme, a complete support matrix, and
  working install buttons — real deeplinks for Cursor, VS Code, and the
  Claude Desktop extension; the guide for everything else.
- **Portable-core validation in `check.mjs`.** Both root documents are
  checked against the closed Agent Plugins schemas offline — allowed
  fields, name constraints, transport variants, and matching spec
  versions — plus three regressions worth guarding: a client manifest must
  never declare `$schema`, `clients/claude/mcp.json` must keep
  `type: "http"` because Claude Code has no `streamable-http` literal, and
  `.plugin/` must not come back.

### Removed

- **The legacy `.plugin/plugin.json` manifest.** GitHub Copilot CLI resolves
  that path *before* the root manifest, so keeping it would have pinned
  Copilot to legacy loading — where the portable `streamable-http` transport
  is not recognized and the `arcade` server fails to register. Removing it
  lets Copilot fall through to the Agent Plugins manifest. `npx plugins
  discover` resolves the package and all 3 skills identically without it, so
  no install path regresses.

### Changed

- **Every component moved to the location the most clients read.**
  `components/` is gone: skills are at `skills/` (required by the standard),
  and the subagent, commands, and Claude-format hooks are at `agents/`,
  `commands/`, and `hooks/` — the default discovery paths for Claude Code,
  Cursor, and Copilot CLI. Every manifest points at the same files, so there
  is one copy of each component rather than one per client. Content is
  unchanged; only `rules/` stays under `clients/`, since Cursor alone reads
  it.
- **The subagent is now `arcade-operator.agent.md`.** Copilot CLI only
  discovers agents matching `*.agent.md`, while Claude Code and Cursor accept
  any `.md`, so the double extension satisfies all three from one file.
- **`.claude-plugin/plugin.json` no longer declares component paths.**
  Everything except the MCP config now sits at a Claude Code default location,
  and Claude does not document whether a declared path replaces or merges with
  its default — a merged hooks list would fire the session-start and per-turn
  hooks twice. The manifest names only the non-default `mcpServers`, so each
  component is discovered exactly once. The claude.ai uploader validates
  rather than discovers, so the upload build adds `agents` and `commands` at
  package time. Cursor keeps its explicit declarations, since Cursor documents
  that a declared path replaces folder discovery.
- **Descriptions lead with what the plugin does, not how it is scoped.**
  Every manifest and marketplace entry now says the plugin lets any agent
  use Arcade, instead of describing gateways. Gateway behavior itself is
  unchanged and still covered by the skills, `Arcade_SelectGateway`, and
  `/arcade:status`.

## [0.10.0] - 2026-08-06

Requires hub >= 0.10.0. Coordinated release: the hub adds typed
needs_auth pauses on Arcade_UseTool, server-side pagination, and
Arcade_Confirm approve_all; this release teaches every client's guidance
those contracts.

### Changed

- **Sign-in guidance covers the UseTool pause.** A 1,221-call usage
  study found that when an authorization URL arrived inside a
  success:true UseTool result, zero of 15 threads ever completed the
  call. Hub 0.10.0 returns a typed needs_auth pause with a retry block;
  the skills, Cursor rule, opencode instructions, and operator agent now
  say: present the link, stop, and re-issue the same call after the user
  confirms (with the older success:true shape still called out for old
  hubs).
- **Pagination goes through the server.** The same study's largest
  thread hand-walked 48 Gmail pages. Guidance now tells agents to pass
  paginate: true on list tools with continuation tokens instead of
  walking next_page_token/next_cursor call by call.
- **Batch approvals.** When a plan stages several confirm gates at once,
  show all the drafts, get one explicit yes to the batch, and clear them
  with Arcade_Confirm(handle, "approve_all") — replacing the
  approve-one-reveal-next treadmill observed to stall every multi-write
  plan in the dataset.

## [0.9.2] - 2026-08-05

Requires hub >= 0.9.8 (the all-apps fallback this guidance describes).

### Changed

- **Gateway guidance matches the all-apps fallback.** Hub 0.9.8 makes a
  zero-gateway account work through a virtual "All your apps" scope, and
  its gateway list now reports that scope as active. The
  `working-with-arcade-gateways` skill previously told agents to treat
  "no gateways" as a setup problem and send the user to the dashboard —
  wrong for those accounts. It now explains that all-apps is normal,
  gateways are optional curation, and only an account with *nothing*
  active needs dashboard setup.

## [0.9.1] - 2026-08-05

### Changed

- **One reminder, on every prompt that carries a task.** 0.9.0 sent a
  short line always and a fuller one when the prompt looked like app
  work. Running two twenty-turn sessions through that classifier found
  it wrong on roughly a third of ordinary phrasing: silent on "what
  gateways do I have?", "disconnect my google account", "list open PRs
  on <repo>", "is the API up?", "what did the CEO say in the
  all-hands?", and firing on "update the changelog". Each miss was a
  different gap — an unlisted noun, an unlisted verb, a word-gap limit
  two words short, a polarity written only one way — so each fix bought
  one phrasing rather than a class of them.

  Classifying intent from a regex over one sentence was the wrong tool,
  and it cost about the same as sending one text unconditionally. There
  is now a single reminder and no matcher. The one exclusion is
  structural rather than semantic: a prompt made entirely of
  continuation words ("yes", "continue", "fix it") cannot be redirected
  by a reminder, because the model is mid-flight on the previous turn
  and already holds its context. Measured over the same two sessions,
  this is cheaper than 0.9.0 — 53 tokens per turn against 69 — while
  reaching every prompt the classifier used to miss.
  `requires hub ≥ 0.9.2` (unchanged from 0.9.0).

## [0.9.0] - 2026-08-05

### Changed

- **The reminder now goes out on every prompt, in two sizes.** A model
  cannot choose a tool it has forgotten exists, and conditional
  matching — however broad — can only ever be a guess about which
  turns matter. Every prompt now carries a one-line statement that the
  `arcade` server is connected and what it reaches (~50 tokens). The
  fuller text, naming the gateway scoping and `Arcade_Plan`, replaces
  it on prompts that look like external-app or live-data work, where
  the extra detail can change the next decision.

  The matcher did not go away; it now chooses between two texts rather
  than between speaking and staying silent, so a miss costs detail
  instead of costing availability. Budget for roughly 50 tokens per
  prompt, about 100 on matching turns — near 10k over a 150-prompt
  session, against 15k had the fuller text gone out every time.
  `requires hub ≥ 0.9.2` (unchanged from 0.8.2).

## [0.8.2] - 2026-08-05

### Changed

- **Example data looks like example data.** The
  `managing-arcade-apps` skill illustrated a connected-apps reply with
  a real person's email address and GitHub handle, and a hook test
  fixture used the same address. Both now use `example.com`
  placeholders. The skill ships to every install, so the address was
  in shipped guidance rather than only in the repo.
  `requires hub ≥ 0.9.2` (unchanged from 0.8.1).

## [0.8.1] - 2026-08-05

### Changed

- **The per-turn reminder covers far more of what people actually
  ask.** 0.8.0 matched a list of product names and a handful of
  live-data phrases, which missed most real requests: "ping the team
  about the outage", "file a ticket", "book a 30 minute call", "any
  updates on the migration", "who is the account owner for Acme",
  "upload the report", "is github down". Matching is now three tiers —
  unambiguous signals (an app by name, `#channel`, `@handle`, an email
  address, a URL, "my calendar") fire on their own; a much broader set
  of intents (reaching people, scheduling, tickets, docs, storage, CRM,
  research, anything time-sensitive) fires unless the prompt is plainly
  local work.

  Widening the net exposed two ways English collides with the
  suppression list. `go <word>` read "Go 1.26" as a go subcommand and
  silenced a web search, and `make <word>` would have read "make a doc"
  as a build target; build tools now require real subcommands. In the
  other direction, comms verbs that are also nouns — "the message
  format", "an email regex", "ping latency" — fired until the pattern
  began requiring an actual recipient: a handle, a pronoun, a named
  group, or a capitalized name. Both directions are pinned in
  `scripts/check.mjs`. `requires hub ≥ 0.9.2` (unchanged from 0.8.0).

## [0.8.0] - 2026-08-05

### Added

- **A per-turn reminder for the Claude clients.** Agents were reaching
  for built-in web search or a shell command on tasks Arcade should
  have run. The plugin already announced Arcade at session start, but
  that is the wrong moment: by the thirtieth turn the model is anchored
  on recent context and the announcement has scrolled out of reach.
  Cursor solves this with the always-apply rule, which rides every
  turn; Claude Code has no rule equivalent, so a `UserPromptSubmit`
  hook now restates — alongside the prompt itself — that the `arcade`
  server is connected, what it reaches, and that `Arcade_Run` takes a
  task in plain language.

  It fires only when the prompt looks like external-app or live-data
  work: naming an app, asking about your own mail or calendar, or
  asking for something current. A coding turn gets nothing, which keeps
  the context cost at zero where it cannot help and avoids nudging an
  agent toward a remote tool for work in the repo in front of it. The
  wording is a factual statement rather than an instruction, because
  out-of-band imperatives can trip Claude's prompt-injection defenses
  and get surfaced to the user instead of read as context.
  `requires hub ≥ 0.9.2` (unchanged from 0.7.1).

## [0.7.1] - 2026-08-04

### Changed

- **`result.summary` is a preview, and every surface now says so.** Hub
  0.9.2 clamps a result summary to a few hundred characters, because it
  rides next to `result.data` and an uncapped one shipped the payload
  twice — a search tool whose output was 11 KB of JSON sent those bytes as
  the summary as well. Nothing told the agent, so a model answering from
  `result.summary` would silently report a complete result as a partial
  one. The `using-arcade-tools` skill, the operator agent, the Cursor
  always-on rule, and the OpenCode instructions now all say to answer from
  `result.data` and treat the summary as a preview. Unlike a truncated
  result, a cut summary carries no retrieval pointer and needs none: what
  it dropped is in `result.data` beside it.
  `requires hub ≥ 0.9.2` (raised from 0.9.0 — the release that bounded
  summaries).

## [0.7.0] - 2026-08-04

### Removed

- **`/arcade:gateway` and `/arcade:tools`.** Both were surfaces for
  machinery the hub now runs on its own. Gateway scoping follows the user
  automatically and switching works in plain words (the
  `working-with-arcade-gateways` skill still carries the flow when someone
  asks), so a dedicated command taught users a meta concept they no longer
  need — and its "preview tools per gateway" step was exactly the
  discovery narration the always-on rule forbids. `/arcade:tools` was that
  narration as a command. The OpenCode plugin drops its mirrored
  `arcade-gateway` command, and its `arcade-do` template no longer
  hardcodes the SelectTools→UseTool escape hatch. Four commands remain:
  `/arcade:do`, `/arcade:apps`, `/arcade:connect`, `/arcade:status`.
  `requires hub ≥ 0.9.0` (unchanged from 0.6.0).

## [0.6.0] - 2026-08-04

### Changed

- **Truncated results are retrieved, not re-run.** Hub 0.9.0 keeps every
  oversized result server-side for 24 hours and adds
  `Arcade_RetrieveResult`, so "re-run with a narrower task" is no longer
  the answer to a truncation marker. Every guidance surface (the
  `using-arcade-tools` skill, the operator agent, the Cursor always-on
  rule, and the OpenCode instructions) now teaches the retrieval contract:
  copy a result's `_next` block verbatim to page, pass `query` to find
  which records mention something (hits return as readable paths, with
  byte-range slices into long text), or call with only the execution id
  for the result's structure. New markers are taught alongside:
  `_projected` (one fat field clipped across records; `full_value` names
  the path to read one back), `"_binary": true` (file descriptors — report
  name/type/size, never fetch base64), the `value_counts` census in
  `_dropped` (status counts over the whole list, so three failures behind
  997 successes are caught before declaring a bulk operation clean), and
  `store_partial` / `_retrieval_partial` (a zero-match search over a
  partial store is not evidence of absence). Re-running the original tool
  is reserved for expired results and partial-store misses.
  `requires hub ≥ 0.9.0` (the release that added `Arcade_RetrieveResult`
  and the result budget; both hosted hubs are on it).

## [0.5.0] - 2026-08-03

### Added

- **Large results are explained, not mistaken for missing data.** Hub 0.7.0+
  bounds oversized `result.data` values as truncated copies — an object with
  `"_truncated": true`, an `_original_bytes` size, and a `_dropped` shape
  inventory (kind, item counts, item keys) of what was cut. Every guidance
  surface (the `using-arcade-tools` skill, the operator agent, the Cursor
  always-on rule, and the OpenCode instructions) now teaches the shape:
  deliver what is there, answer "how many?" from the inventory, and re-run
  with a narrower task when the cut detail matters — never report the data
  as absent. `requires hub ≥ 0.7.0` (the release that introduced the
  `_dropped` inventory; the hosted hub is beyond it).

## [0.4.3] - 2026-07-28

### Fixed

- **OpenCode installs current guidance again.** `opencode-arcade-hub` is
  published on npm, but publishing was a manual step no release performed, so
  `opencode plugin opencode-arcade-hub` — the command in our own install guide
  — had served 0.3.1 since July 16: instructions that teach
  `Arcade_SelectTools` and never mention `Arcade_Run` or `Arcade_Plan`. The
  release workflow now publishes the package on tag and fails loudly instead
  of drifting silently, and the QA checklist verifies the published version.

### Changed

- Install docs corrected against what each path actually does: OpenCode
  installs from npm rather than a `file://` checkout, the clients get all nine
  hub tools rather than five, and Cursor's imported-from-Claude-Code copy does
  carry the always-on rule — the previous claim that it lacked one pushed
  users toward the double-install the same docs warn against.
- Packaging and documentation only — no guidance or tool change; floor
  unchanged at `requires hub ≥ 0.2.0`.

## [0.4.2] - 2026-07-28

### Fixed

- **Claude Code installs work again.** Claude Code's manifest schema no longer
  accepts a `logo` key, so `claude plugin install arcade@arcade` failed with
  "invalid manifest file … Unrecognized key: `logo`", and `claude plugin
  update` reported the installed 0.3.1 as already current — leaving every
  Claude Code user stranded before the Run-first guidance in 0.4.0. Removed
  `logo` from `.claude-plugin/plugin.json` and the `.claude-plugin/`
  marketplace entry; `claude plugin validate .` now passes. Cursor's manifest
  keeps its logo, which that client still supports. Verify after upgrading
  with `claude plugin list`.
- Packaging only — no guidance or tool change; floor unchanged at
  `requires hub ≥ 0.2.0`.

## [0.4.1] - 2026-07-28

### Changed

- **A paused plan is no longer treated as a stopped plan.** Since hub 0.5.0 a
  step waiting on the user only holds back its own dependents — independent
  branches keep executing — and several steps can wait at once. The guidance
  previously described one pause per envelope, so agents reported a plan as
  blocked when only one branch was, and resolved pauses one round trip at a
  time. All four client surfaces now teach: read `steps[]` for real progress,
  treat `pauses[]` (present when more than one step waits) as independently
  resolvable by each entry's own `handle` and `step_id`, gather everything the
  user must supply in one exchange, and rely on one sign-in covering every step
  waiting on the same app. Updated the `using-arcade-tools` skill, the
  `arcade-operator` subagent, the Cursor always-on rule, and the OpenCode
  instructions.
- Claude Desktop manifest: `Arcade_Plan` described as executing independent
  steps together rather than "as sequential steps".
- Documentation only — no tool, schema, or install change. `pauses[]` appears
  only on hub ≥ 0.5.0; against older deployments the guidance is inert and the
  single-pause path is unchanged, so the floor stays `requires hub ≥ 0.2.0`.

## [0.4.0] - 2026-07-23

### Changed

- **Run-first guidance across all clients.** The hub's Intent surface is now
  live on `hub.arcade.dev`: agents default to `Arcade_Run` (task in → result
  or typed pause) with `Arcade_Confirm` / `Arcade_Resume` for confirmation,
  missing-input, and sign-in pauses, and `Arcade_Plan` for multi-step
  workflows. `Arcade_SelectTools` / `Arcade_UseTool` remain the documented
  escape hatch (`failed` + `recoverable: try_l1`, explicit catalog control,
  or older hub deployments). Updated the `using-arcade-tools` skill, the
  `arcade-operator` subagent, the Cursor always-on rule, OpenCode
  instructions, the Claude Desktop manifest tool list, and the README.
- Confirmation discipline: agents must relay the hub's `needs_confirm` draft
  and wait for an explicit user yes/no — never approve on the user's behalf.
- `requires hub ≥ 0.2.0` (Intent surface + pause contract).

## [0.3.1] - 2026-07-16

### Changed

- Rebranded to **Arcade Agent Hub** — the hub between you and all your
  apps, across any agent you connect. "Gateway" remains the technical term
  for the curated app/tool sets that scope discovery and execution; only
  the product name changed. Display names, descriptions, and docs updated
  across all four clients.
- Release-train contract with `arcadeai-labs/hub`: `VERSION`,
  `release-contract.json`, and CI changelog enforcement.
  `requires hub ≥ 0.1.6`.

## [0.3.0] - 2026-07-16

### Changed

- The hub moved to its permanent home: every client config, deeplink, and
  doc now points at `https://hub.arcade.dev/mcp` (previously
  `hub.arcadeagent.dev`). The service behind it is the new standalone
  gateway hub with Engine-backed tool discovery — same tools, same
  gateway model, better search coverage of the staging catalog.
- Existing installs pointed at `hub.arcadeagent.dev` keep working until
  that deployment is retired; re-add the server (or update the URL) to
  move to the new endpoint.

## [0.2.0] - 2026-07-14

### Fixed

- **Claude plugin installs from this repo work again.** Claude's installer
  rejects repositories containing zip archives ("Nested zip files are not
  allowed"), and we had committed the `.mcpb` bundle and three skill ZIPs.
  Binary artifacts now live on GitHub Releases (built by the tag-driven
  `release.yml` workflow); README/docs links use
  `releases/latest/download/…`, and `check.mjs` fails if any archive is
  ever committed again.

### Added

- **`/arcade:status`** — connection health check (server → sign-in → active
  gateway → connected apps) with a one-line fix per failure.
- **`/arcade:connect <app>`** — explicit app sign-in flow.
- **OpenCode parity:** the plugin now injects the same session orientation
  the Cursor/Claude hooks provide (via a shipped `instructions.md`),
  registers `/arcade-do`, `/arcade-gateway`, and `/arcade-apps` commands
  (never overwriting user-defined ones), and toasts gateway switches
  ("now using Full Suite (this app)") alongside sign-in links.
- **Vendor-neutral `.plugin/plugin.json`**, verified against the universal
  installer: `npx plugins add arcadeai-labs/arcade` installs into every
  detected client.
- **First-run degradation guidance** in the tools skill and Cursor rule:
  what to tell the user when the `arcade` server is missing or
  unauthenticated, instead of silent fallback.
- **CI hardening:** artifact builds (skill ZIPs + `.mcpb`), `claude plugin
  validate`, and an OpenCode typecheck against the real
  `@opencode-ai/plugin` types (catches plugin-API drift) now run on every
  push.

### Changed

- **`.mcpb` manifest polish** (spec 0.3): the five meta-tools are declared
  so the install dialog shows them, plus privacy policy, documentation, and
  support links.
- Cursor manifest gains `primaryColor` for marketplace presentation.

## [0.1.0] - 2026-07-14

### Added

- **Gateway support throughout.** The hub's fifth meta-tool,
  `Arcade_SelectGateway`, is now first-class: a new
  `working-with-arcade-gateways` skill (view gateways, inspect their apps and
  tools, switch per app or everywhere, one-off `gateway` routing on
  SelectTools/UseTool), a new `/arcade:gateway` command, and gateway-awareness
  woven into the existing skills, rule, subagent, and session hooks (missing
  app in discovery → check the active gateway; never switch speculatively).

### Changed

- **Retargeted to the gateway hub.** Every client config, manifest, hook, and
  document now points at `https://hub.arcade.dev/mcp` and
  `github.com/arcadeai-labs/arcade`. The MCP server key stays `arcade`, so
  muscle memory and existing prompts carry over.
- **Renamed for the deployment.** Cursor rule is now `arcade-gateway-hub.mdc`;
  the OpenCode package is `opencode-arcade-hub` (not yet published to npm);
  the logo asset is `assets/arcade.svg`. Displayed names say "Arcade Gateway
  Hub"; the plugin/marketplace identifier remains `arcade`.
- **Versioning reset to 0.1.0** for the new repo. Structural checks
  (`scripts/check.mjs`), the OpenCode smoke test, and the QA checklist were
  updated for the hub endpoint, the third skill, and the fourth command.
