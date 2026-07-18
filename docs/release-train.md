# Release train — plugin ↔ hub shared semver

The client plugin (`arcadeai-labs/arcade`) and the Agent Hub server
(`arcadeai-labs/hub`) ship on one **release train**:
`release_train: arcade-agent-hub`.

## Rules

1. **Source of truth.** `VERSION` and `release-contract.json` must agree with
   every client manifest version. `scripts/check.mjs` enforces this.
2. **Coordinated releases share `X.Y.Z`.** When hub behavior needs a plugin
   change (new tool, auth change, instruction/status contract), tag **both**
   repos `vX.Y.Z` the same day.
3. **Hub-only cutovers do not bump this plugin.** The public MCP URL stays
   `https://hub.arcade.dev/mcp`; backend flips happen in hub Terraform.
4. **Compatibility floor.** `requires.hub: ">=X.Y.Z"` in
   `release-contract.json`. The current CHANGELOG section must include
   `requires hub ≥ X.Y.Z`.
5. **`/arcade:status`** fetches `GET https://hub.arcade.dev/health` and
   reports `plugin A.B.C ↔ hub X.Y.Z (env)`.

## Cut a release

```bash
# 1. Bump VERSION + release-contract.json + CHANGELOG (+ requires hub line)
# 2. Keep manifest versions in sync (check.mjs)
# 3. PR → merge → tag:
git tag v$(tr -d '[:space:]' < VERSION)
git push origin v$(tr -d '[:space:]' < VERSION)
# 4. If coordinated with hub behavior: tag arcadeai-labs/hub the same vX.Y.Z
```

See also: hub `docs/release-train.md`.
