# Roadmap — work items from ecosystem research

Derived from examining popular open-source plugins across our four clients
(July 2026): Vercel's plugin (Cursor + Claude, knowledge-graph + injection
engine), Linear's Cursor plugin (minimal MCP + branding), 1Password's
(hooks-only), Superpowers (750k+ installs, the Claude Code skills archetype),
Anthropic's `.mcpb` manifest spec, and oh-my-opencode (the OpenCode
capability ceiling). Items are scoped to this repo unless noted.

## UX

- [x] **`/arcade:status` command (+ skill coverage).** Every polished plugin
  has a preflight/status surface (Vercel's `/vercel-plugin:status`, its
  command `_conventions.md` preflight sections). Ours has no way to answer
  "am I connected, signed in, and on which gateway?" without triggering a
  task. One command: MCP server reachable → signed-in account → active
  gateway → connected apps count, with a fix-it hint per failure.
- [x] **First-run guidance when the server is missing or unauthenticated.**
  Skills assume the `arcade` server exists and is signed in. Add a short
  "if the tools are missing/erroring, check /mcp (Claude) or Settings → MCP
  (Cursor)" branch to the skills and rule so agents degrade with
  instructions instead of silence.
- [x] **Cursor manifest polish: `primaryColor` + logo treatment.** Linear
  ships `primaryColor` for marketplace presentation; we don't. Trivial.
- [x] **`.mcpb` install-dialog polish.** The manifest spec (0.3+) lets the
  install UI show declared `tools` before install, plus
  `privacy_policies`, localized strings, and richer compatibility. Ours
  declares none of that — the dialog shows a bare server. Declare the five
  meta-tools with one-line descriptions, add the privacy policy URL, bump
  `manifest_version`.
- [x] **OpenCode gateway toast.** The plugin already watches
  `tool.execute.after` for sign-in links; also watch `Arcade_SelectGateway`
  select results and toast "Now using <gateway> (this app)" — switching
  feedback is otherwise buried in JSON output.
- [x] **OpenCode session context parity.** Cursor/Claude get a session-start
  context line via hooks; OpenCode gets nothing. Investigate injecting the
  equivalent via the plugin API (`experimental` chat/system hooks) so all
  four clients start with the same one-paragraph orientation.

## Features

- [x] **`/arcade:connect <app>` command.** "Connect my Google account" as an
  explicit flow (ManageToolAuthorization `authorize` + sign-in link
  etiquette) instead of waiting for a task to trip over the missing app.
- [x] **Vendor-neutral `.plugin/plugin.json` + `npx plugins add` support.**
  Vercel's installer CLI (vercel-labs/plugins) translates a neutral manifest
  into every detected client (Claude Code, Cursor; Codex/Copilot/Grok/Kimi
  per their docs). Add the neutral manifest, test
  `npx plugins add arcadeai-labs/arcade`, and document it as the single
  cross-client install command — this is also our cheapest path to Codex
  and Copilot CLI users.
- [x] **OpenCode commands.** OpenCode supports markdown commands in the
  config dir; the plugin currently ships tools + toasts only. Evaluate
  installing `/arcade-do`, `/arcade-gateway`, `/arcade-apps` equivalents
  (oh-my-opencode demonstrates command + skill loading from a plugin).
- [ ] **Per-gateway context primer (exploration).** Vercel front-loads a
  knowledge graph; our equivalent would be a session-start line naming the
  user's active gateway and its apps (requires a cheap authenticated call
  from a hook — weigh the latency/auth cost before building).

## Reliability

- [x] **Artifact freshness in CI.** `check.mjs` verifies skill ZIPs exist but
  not that they're current, and the `.mcpb` isn't checked at all. CI should
  rebuild both and fail on drift (needs deterministic zips — strip
  timestamps).
- [x] **`claude plugin validate .` in CI.** Currently a manual QA step;
  Vercel runs client-shape validation in CI. Same for a headless Cursor
  hook-shape run (we execute hooks in check.mjs — extend to assert both
  client shapes stay parallel in content).
- [x] **Real-client OpenCode load test.** The smoke test exercises the module
  in isolation; add a CI job that installs the plugin into an actual
  `opencode` invocation (their ecosystem's plugins are bitten by
  `@opencode-ai/plugin` API drift regularly — we pin, but a load test
  catches breakage on bump).
- [x] **Update-awareness for local installs.** Claude marketplace installs
  update on `marketplace update`; Cursor local-dir installs never do. At
  minimum, document the update path per client in the install guides;
  optionally have the session hook compare plugin version against the hub's
  `/health` metadata (no telemetry — a read in the user's own session).

## Distribution / other

- [ ] **Publish `opencode-arcade-hub` to npm** (activates the documented
  one-liner; needs the npm automation token).
- [ ] **Cursor Marketplace submission** (Linear/Vercel/1Password are listed;
  we're local-install only).
- [ ] **Claude community marketplace submission**
  (`anthropics/claude-plugins-community`) so `/plugin install` works without
  adding our marketplace first; the official curated marketplace is
  invite-only — the community path is actionable now.
- [ ] **Claude Desktop Connectors Directory submission** for the `.mcpb`
  (directory extensions auto-update; sideloaded ones don't).
- [ ] **README visual demo.** Popular plugins lead with a 20-second GIF
  (gateway list → switch → task). Text-only READMEs underperform in
  marketplace listings.
- [ ] **Landing page buttons.** `hub.arcade.dev` links to install docs;
  the Cursor deeplink and `.mcpb` download could be first-class buttons on
  the page itself (requires a hub page update in the server repo).

## Deliberately not adopting

- **Client-side knowledge library / injection engine** (Vercel): our
  knowledge is served at call time by the hub; shipping it would go stale
  and duplicate `Arcade_SelectTools`. Vercel themselves walked auto-injection
  back to "lightweight by default".
- **Client-side telemetry** (Vercel's DAU phone-home): analytics stay
  server-side in the hub.
- **Framework-scale surface** (oh-my-opencode's 11 agents/53 hooks): one
  operator subagent and three skills is the right size for a tool-execution
  plugin; growth should come from server capability, not plugin sprawl.
