# Release QA checklist

Automated checks (`node scripts/check.mjs`, `bun scripts/opencode-smoke.ts`,
`npm pack --dry-run`) run in CI. Everything below tests model or client
behavior and is verified by hand before tagging a release.

## Local loads

- [ ] **Claude Code:** `claude plugin validate .` passes, then load with
  `claude --plugin-dir .` — verify 3 skills, 1 agent (`arcade-operator`),
  6 commands (`/arcade:do`, `/arcade:gateway`, `/arcade:apps`, `/arcade:connect`, `/arcade:status`,  `/arcade:tools`), the SessionStart hook context, and the `arcade` MCP
  server connect (sign in with an Arcade staging account).
- [ ] **Cursor:** add the marketplace `arcadeai-labs/arcade` in Cursor's
  plugins panel (or `npx plugins add arcadeai-labs/arcade --target cursor`),
  reload, and in Customize verify exactly: 1 rule, 3 skills, 1 agent,
  6 commands, 1 hook, 1 MCP server — and nothing else, with the arcade logo.
  Confirm no duplicate "Imported" entry (would mean it's also installed in
  Claude Code). Start a new chat and confirm the sessionStart context appears
  (Hooks output channel shows no errors).
- [ ] **OpenCode:** load via `file://` path (npm publish pending), restart,
  confirm the `arcade` server is registered and tools list.

## Gateway scenarios (any client)

- [ ] **List:** "what gateways do I have" → readable list with names, apps,
  tool counts; active gateway marked; unrestricted gateways say "all tools";
  no raw JSON dump.
- [ ] **Switch (this app):** "switch to <gateway>" → confirmation summary
  (gateway, apps, tool count, "applies to this app"); a follow-up discovery
  only returns the new gateway's tools.
- [ ] **Cross-client isolation:** switching with the default scope in one
  client does not change another client's active gateway.
- [ ] **Switch (everywhere):** explicit "everywhere"/"all my apps" request
  uses `scope: "everywhere"` and says so.
- [ ] **Inspect:** "what's in <gateway>?" answered from the list output
  (apps + tool count) without switching.
- [ ] **Missing app:** a task whose app is outside the active gateway →
  agent explains the gateway doesn't include it and offers the gateway that
  does; it does not switch on its own or silently fall back.
- [ ] **Unknown name:** a made-up gateway name → agent lists and asks, never
  guesses an id.
- [ ] **No speculative calls:** ordinary tasks don't trigger
  `Arcade_SelectGateway`.

## Auth-flow scenarios (any client)

- [ ] **First sign-in:** task against an unconnected app → sign-in link is
  presented once; agent stops and waits (no retry loop).
- [ ] **Sign-in marked successful:** confirm the agent treats an
  `authorization_url` response as sign-in required even though the result says
  `success: true` — it must not report the task as done.
- [ ] **Completed sign-in:** after confirming, the agent retries once and
  delivers the result.
- [ ] **Pending sign-in:** asking again before signing in re-presents the link
  without spamming new authorizations.
- [ ] **Wrong account:** "switch the account for <app>" →
  `switch_account` flow returns a fresh link; agent reminds about browser
  session reuse.
- [ ] **Expired / missing permissions:** `reauthorize` flow returns a fresh
  link.
- [ ] **Disconnect:** `/arcade:apps` disconnect asks for confirmation first,
  then reports the outcome.
- [ ] **Outbound confirmation:** "email X to Y" prompts for confirmation of
  recipient/content before sending.
- [ ] **Non-auth failure:** a tool error is reported verbatim; at most one
  retry; no fabricated results.

## Release steps

- [ ] All CI checks green on `main`.
- [ ] `git tag v<version> && git push origin v<version>` — the release
  workflow builds the `.mcpb` + skill ZIPs and attaches them to the GitHub
  Release (download links use `releases/latest/download/…`).
- [ ] `npm publish` from `clients/opencode/` once `opencode-arcade-hub` goes
  public (version matches manifests).
- [ ] Claude: verify `/plugin marketplace update arcade` picks up the new
  version from a machine with the old version installed.
- [ ] README upgrade note accurate for users on older cached versions.
