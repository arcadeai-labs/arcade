# Release QA checklist

Automated checks (`node scripts/check.mjs`, `bun scripts/opencode-smoke.ts`,
`npm pack --dry-run`) run in CI. Everything below tests model or client
behavior and is verified by hand before tagging a release.

## Local loads

- [ ] **Claude Code:** `claude plugin validate .` passes, then load with
  `claude --plugin-dir .` — verify 2 skills, 1 agent (`arcade-operator`),
  4 commands (`/arcade:do`, `/arcade:apps`, `/arcade:connect`, `/arcade:status`), the SessionStart hook context, and the `arcade` MCP
  server connect (sign in with an Arcade staging account).
- [ ] **Cursor:** add the marketplace `arcadeai-labs/arcade` in Cursor's
  plugins panel (or `npx plugins add arcadeai-labs/arcade --target cursor`),
  reload, and in Customize verify exactly: 1 rule, 2 skills, 1 agent,
  6 commands, 1 hook, 1 MCP server — and nothing else, with the arcade logo.
  Confirm no duplicate "Imported" entry (would mean it's also installed in
  Claude Code). Start a new chat and confirm the sessionStart context appears
  (Hooks output channel shows no errors).
- [ ] **OpenCode:** install the published plugin (`opencode plugin
  opencode-arcade-hub`), restart, confirm the `arcade` server is registered
  and tools list. For pre-release checks, load the checkout via `file://`.
- [ ] **Agent Plugins client:** install the checkout into a client that reads
  the root `plugin.json` (`npx plugins add . --target vscode --scope local`)
  and confirm 2 skills plus the `arcade` MCP server, with browser sign-in
  working. Then re-check the Cursor and Claude Code rows above: the portable
  manifest is resolved last, so it must not shadow, duplicate, or strip
  anything from either native install.

## All-apps scope (any client)

There is no gateway to inspect or switch — every connected app is available
to every client. Confirm a task against an app you haven't connected yet
still returns a sign-in link rather than a "not in your gateway" message, and
that no client surfaces gateway language anywhere in its output.

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
- [ ] `VERSION` / `release-contract.json` / CHANGELOG (`requires hub ≥ …`)
  aligned — see [`docs/release-train.md`](docs/release-train.md).
- [ ] If this release depends on new hub behavior: tag `arcadeai-labs/hub`
  with the **same** `vX.Y.Z` the same day (after hub staging canary).
- [ ] `git tag v<version> && git push origin v<version>` — the release
  workflow builds the `.mcpb` + skill ZIPs and attaches them to the GitHub
  Release (download links use `releases/latest/download/…`). Tag must match
  `VERSION`.
- [ ] `/arcade:status` shows `plugin … ↔ hub … (staging|prod)`.
- [ ] npm shows the new `opencode-arcade-hub` version (`npm view
  opencode-arcade-hub version`). The release workflow publishes it via npm
  trusted publishing; if that job failed, `npm publish --access public` from
  `clients/opencode/` by hand and check the package's trusted-publisher
  config. A stale npm version silently serves OpenCode users older guidance.
- [ ] Claude: `claude plugin validate .` passes (a manifest key the schema
  has since dropped fails installs *and* makes `update` report the old
  version as current), then verify `/plugin marketplace update arcade` picks
  up the new version from a machine with the old version installed.
- [ ] README upgrade note accurate for users on older cached versions.
