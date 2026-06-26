import type { Plugin } from "@opencode-ai/plugin"

// Arcade (OmniMCP) for OpenCode.
//
// Installing this plugin does two things:
//   1. Registers the `arcade` remote MCP server (https://omni.arcade.dev/mcp)
//      via the `config` hook, so the 500+ Arcade tools (Slack, Gmail, GitHub,
//      Calendar, Notion, Linear, and more) are available — no keys, OAuth is
//      auto-discovered. (You can also configure this manually in opencode.json;
//      see clients/opencode/opencode.json.)
//   2. Surfaces the one-time app sign-in link as a toast when an Arcade tool
//      returns one, so it isn't buried in a tool result.
//
// Use it by adding "opencode-arcade" to the `plugin` array in opencode.json,
// or load locally with a "file://" path.

const ARCADE_MCP_URL = "https://omni.arcade.dev/mcp"

const SIGNIN_URL =
  /https?:\/\/[^\s"'<>)]*(?:oauth|authoriz|connect|consent)[^\s"'<>)]*/i

export const ArcadePlugin: Plugin = async ({ client }) => {
  return {
    // Register the Arcade MCP server if it isn't already configured.
    config: async (config) => {
      const cfg = config as { mcp?: Record<string, unknown> }
      cfg.mcp = cfg.mcp ?? {}
      if (!cfg.mcp.arcade) {
        cfg.mcp.arcade = {
          type: "remote",
          url: ARCADE_MCP_URL,
          enabled: true,
        }
      }
    },

    // When an Arcade tool returns a sign-in link, surface it as a toast.
    "tool.execute.after": async (_input, output) => {
      try {
        const result = output as { output?: unknown }
        const text =
          typeof result?.output === "string"
            ? result.output
            : JSON.stringify(output ?? "")
        const match = text.match(SIGNIN_URL)
        if (!match) return
        await client.tui.showToast({
          body: {
            message: `Arcade: sign in to connect an app — ${match[0]}`,
            variant: "info",
          },
        })
      } catch {
        // A plugin hook must never break the tool flow.
      }
    },
  }
}
