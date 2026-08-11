import type { Plugin } from "@opencode-ai/plugin"

// Arcade Agent Hub for OpenCode.
//
// Installing this plugin does two things:
//   1. Registers the `arcade` remote MCP server (https://hub.arcade.dev/mcp)
//      via the `config` hook, so the Arcade tools (Slack, Gmail, GitHub,
//      Calendar, Notion, Linear, and more — across all your connected apps)
//      are available — no keys, OAuth is auto-discovered.
//      (You can also configure this manually in opencode.json; see
//      clients/opencode/opencode.json.)
//   2. Surfaces the one-time app sign-in link as a toast when an Arcade tool
//      returns one, so it isn't buried in a tool result.
//
// Install with `opencode plugin opencode-arcade-hub`, add "opencode-arcade-hub"
// to the `plugin` array in opencode.json, or load locally with a "file://" path.

const ARCADE_MCP_URL = "https://hub.arcade.dev/mcp"

// Fallback pattern, used only when an Arcade result isn't parseable JSON.
const SIGNIN_URL =
  /https?:\/\/[^\s"'<>)]*(?:oauth|authoriz|connect|consent)[^\s"'<>)]*/i

const isArcadeTool = (toolName: unknown): boolean =>
  typeof toolName === "string" && /arcade/i.test(toolName)

// Depth-limited search for an `authorization_url` string field, the structured
// sign-in marker in Arcade tool results (present even when success is true).
const findAuthorizationUrl = (value: unknown, depth = 0): string | null => {
  if (depth > 3 || value === null || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  if (typeof record.authorization_url === "string" && record.authorization_url) {
    return record.authorization_url
  }
  for (const child of Object.values(record)) {
    const found = findAuthorizationUrl(child, depth + 1)
    if (found) return found
  }
  return null
}

const extractSignInUrl = (rawOutput: unknown): string | null => {
  const text =
    typeof rawOutput === "string" ? rawOutput : JSON.stringify(rawOutput ?? "")
  try {
    const url = findAuthorizationUrl(JSON.parse(text))
    if (url) return url
  } catch {
    // Not JSON — fall through to the regex heuristic.
  }
  const match = text.match(SIGNIN_URL)
  return match ? match[0] : null
}

// Session instructions shipped with the package (see instructions.md): the
// same one-paragraph orientation the Cursor/Claude session hooks inject.
const INSTRUCTIONS_PATH = new URL("./instructions.md", import.meta.url).pathname

export const ArcadePlugin: Plugin = async ({ client }) => {
  return {
    // Register the Arcade MCP server, session instructions, and slash
    // commands if the user hasn't configured their own.
    config: async (config) => {
      const cfg = config as {
        mcp?: Record<string, unknown>
        instructions?: string[]
        command?: Record<string, unknown>
      }
      cfg.mcp = cfg.mcp ?? {}
      if (!cfg.mcp.arcade) {
        cfg.mcp.arcade = {
          type: "remote",
          url: ARCADE_MCP_URL,
          enabled: true,
        }
      }

      // Session-start orientation, matching the Cursor/Claude hooks.
      cfg.instructions = cfg.instructions ?? []
      if (!cfg.instructions.includes(INSTRUCTIONS_PATH)) {
        cfg.instructions.push(INSTRUCTIONS_PATH)
      }

      // Slash commands mirroring the Cursor/Claude plugin commands.
      cfg.command = cfg.command ?? {}
      const commands: Record<string, { description: string; template: string }> = {
        "arcade-do": {
          description: "Do something with an external service via Arcade",
          template:
            "Use the Arcade tools to accomplish this task and report only the result, a sign-in link, or one clarifying question: $ARGUMENTS",
        },
        "arcade-apps": {
          description: "See, disconnect, or fix your connected Arcade apps",
          template:
            "Use Arcade_Apps (list/disconnect, confirm before disconnecting) and Arcade_ManageToolAuthorization (status/switch_account/reauthorize for connection fixes) to help with this request, using apps language and presenting sign-in links once: $ARGUMENTS",
        },
      }
      for (const [name, command] of Object.entries(commands)) {
        if (!cfg.command[name]) cfg.command[name] = command
      }
    },

    // Surface Arcade moments as toasts: one-time app sign-in links. Scoped to
    // Arcade tool executions so unrelated OAuth-looking URLs from other tools
    // never trigger it.
    "tool.execute.after": async (input, output) => {
      try {
        const call = input as { tool?: unknown }
        if (!isArcadeTool(call?.tool)) return
        const result = output as { output?: unknown }
        const raw = result?.output ?? output

        const url = extractSignInUrl(raw)
        if (url) {
          await client.tui.showToast({
            body: {
              message: `Arcade: sign in to connect an app — ${url}`,
              variant: "info",
            },
          })
        }
      } catch {
        // A plugin hook must never break the tool flow.
      }
    },
  }
}
