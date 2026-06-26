import type { Plugin } from "@opencode-ai/plugin"

// Arcade (OmniMCP) plugin for OpenCode.
//
// The Arcade tools themselves come from the `arcade` MCP server configured in
// opencode.json (see clients/opencode/opencode.json) — this plugin is a small
// supplement that makes the one-time app sign-in obvious: when an Arcade tool
// returns a sign-in link, it surfaces that link in the structured log so it
// isn't buried in a tool result.
//
// Drop this file into `.opencode/plugins/` (project) or
// `~/.config/opencode/plugins/` (global).

const SIGNIN_URL =
  /https?:\/\/[^\s"'<>)]*(?:oauth|authoriz|connect|consent)[^\s"'<>)]*/i

export const ArcadePlugin: Plugin = async ({ client }) => {
  try {
    await client.app.log({
      body: {
        service: "arcade",
        level: "info",
        message:
          "Arcade (OmniMCP) plugin loaded. External-service tools are provided by the 'arcade' MCP server; run `opencode mcp auth arcade` if a sign-in is needed.",
      },
    })
  } catch {
    // Never let logging break startup.
  }

  return {
    "tool.execute.after": async (input, output) => {
      try {
        const blob = JSON.stringify(output ?? "")
        const match = blob.match(SIGNIN_URL)
        if (!match) return
        await client.app.log({
          body: {
            service: "arcade",
            level: "info",
            message:
              "An Arcade app needs to be connected. Open the sign-in link, then retry the request.",
            extra: { signin_url: match[0], tool: (input as { tool?: string })?.tool },
          },
        })
      } catch {
        // A plugin hook must never break the tool flow.
      }
    },
  }
}
