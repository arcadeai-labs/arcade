// OpenCode plugin smoke test. Run with: bun scripts/opencode-smoke.ts
// No dependencies: `import type` in index.ts is erased at runtime, so the
// plugin module loads without node_modules.

import { ArcadePlugin } from "../clients/opencode/index.ts"

const failures: string[] = []
const assert = (condition: unknown, message: string): void => {
  if (!condition) failures.push(message)
}

const toasts: string[] = []
const client = {
  tui: {
    showToast: async ({ body }: { body: { message: string } }) => {
      toasts.push(body.message)
    },
  },
}

const hooks = await ArcadePlugin({ client } as never)
assert(typeof hooks.config === "function", "plugin must expose a config hook")
assert(typeof hooks["tool.execute.after"] === "function", "plugin must expose tool.execute.after")

// config: registers the arcade server on an empty config
const emptyConfig: {
  mcp?: Record<string, { url?: string }>
  instructions?: string[]
  command?: Record<string, { description?: string; template?: string }>
} = {}
await hooks.config!(emptyConfig as never)
assert(
  emptyConfig.mcp?.arcade?.url === "https://hub.arcade.dev/mcp",
  "config hook must register the arcade MCP server",
)

// config: injects session instructions pointing at the shipped file
assert(
  emptyConfig.instructions?.some((p) => p.endsWith("instructions.md")) === true,
  "config hook must register the session instructions file",
)

// config: registers the three slash commands
for (const name of ["arcade-do", "arcade-gateway", "arcade-apps"]) {
  assert(
    typeof emptyConfig.command?.[name]?.template === "string" &&
      typeof emptyConfig.command?.[name]?.description === "string",
    `config hook must register the /${name} command`,
  )
}

// config: never overwrites existing user entries (server, commands)
const userConfig = {
  mcp: { arcade: { url: "https://example.com/custom" } },
  command: { "arcade-do": { description: "mine", template: "custom" } },
}
await hooks.config!(userConfig as never)
assert(
  userConfig.mcp.arcade.url === "https://example.com/custom",
  "config hook must not overwrite an existing arcade entry",
)
assert(
  userConfig.command["arcade-do"].template === "custom",
  "config hook must not overwrite an existing user command",
)

// config: idempotent — instructions are not duplicated on re-run
const rerunConfig: { instructions?: string[] } = { instructions: [...(emptyConfig.instructions ?? [])] }
await hooks.config!(rerunConfig as never)
assert(
  rerunConfig.instructions?.filter((p) => p.endsWith("instructions.md")).length === 1,
  "config hook must not duplicate the instructions entry",
)

const after = hooks["tool.execute.after"]!

// toast: structured authorization_url from an Arcade tool, even with success: true
await after(
  { tool: "arcade_Arcade_UseTool" } as never,
  {
    output: JSON.stringify({
      success: true,
      output: { authorization_url: "https://accounts.google.com/o/oauth2/auth?state=x" },
    }),
  } as never,
)
assert(toasts.length === 1, "structured authorization_url from an Arcade tool must toast")

// no toast: OAuth-looking URL from a non-Arcade tool
await after(
  { tool: "webfetch" } as never,
  { output: "see https://evil.example/oauth/authorize?state=y" } as never,
)
assert(toasts.length === 1, "non-Arcade tool output must never toast")

// no toast: Arcade tool result without any sign-in link
await after(
  { tool: "arcade_Arcade_UseTool" } as never,
  { output: JSON.stringify({ success: true, output: { ok: true } }) } as never,
)
assert(toasts.length === 1, "Arcade result without a sign-in link must not toast")

// toast: regex fallback for non-JSON Arcade output
await after(
  { tool: "arcade_Arcade_UseTool" } as never,
  { output: "Sign in at https://slack.com/oauth/authorize?state=z to continue" } as never,
)
assert(toasts.length === 2, "regex fallback must still catch sign-in links in plain-text Arcade output")

// toast: gateway switch confirmation from Arcade_SelectGateway
await after(
  { tool: "arcade_Arcade_SelectGateway" } as never,
  {
    output: JSON.stringify({
      gateway: "gw_123",
      name: "Full Suite",
      scope: "this_app",
      tool_count: 494,
      message: "Connected to Full Suite …",
    }),
  } as never,
)
assert(
  toasts.length === 3 && toasts[2].includes("Full Suite") && toasts[2].includes("this app"),
  "gateway switch must toast with the gateway name and scope",
)

// no toast: gateway list output (no scope field) must stay silent
await after(
  { tool: "arcade_Arcade_SelectGateway" } as never,
  { output: JSON.stringify({ gateways: [], count: 0 }) } as never,
)
assert(toasts.length === 3, "gateway list output must not toast")

if (failures.length > 0) {
  console.error(`opencode-smoke: ${failures.length} failure(s)`)
  for (const message of failures) console.error(`  ✗ ${message}`)
  process.exit(1)
}
console.log("opencode-smoke: all assertions passed")
