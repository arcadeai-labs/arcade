#!/usr/bin/env node
// Session-start hook shared by every client, emitting the client-native
// response shape. Cursor loads Claude Code plugins ("loadClaudePlugin"), so
// this script can be invoked by either client regardless of which hooks.json
// referenced it — the platform is detected from the hook's stdin payload
// (Cursor's input carries conversation_id / workspace_roots / cursor_version;
// Claude's carries hook_event_name / session_id without those).
//
// Always exits 0 so it can never block a session from starting.

const CONTEXT =
  'Arcade Gateway Hub is connected as the "arcade" MCP server — external-app ' +
  "tools (Slack, Gmail, GitHub, Calendar, Notion, and more) scoped to the " +
  "user's active Arcade gateway; prefer it for tasks in external apps or " +
  "live data. The using-arcade-tools, managing-arcade-apps, and " +
  "working-with-arcade-gateways skills describe the flow; the " +
  "arcade-operator subagent runs these tasks end-to-end where available.";

const readStdin = async () => {
  if (process.stdin.isTTY) return "";
  let data = "";
  try {
    for await (const chunk of process.stdin) data += chunk;
  } catch {
    // No stdin — fall through to the default platform.
  }
  return data;
};

const detectPlatform = (rawInput) => {
  try {
    const input = JSON.parse(rawInput);
    if (
      "conversation_id" in input ||
      "workspace_roots" in input ||
      "cursor_version" in input
    ) {
      return "cursor";
    }
  } catch {
    // Unparseable/absent input: default to Claude's shape, which Cursor
    // ignores harmlessly, while Claude fails loudly on Cursor's shape.
  }
  return "claude";
};

try {
  const platform = detectPlatform(await readStdin());
  const response =
    platform === "cursor"
      ? { additional_context: CONTEXT }
      : {
          hookSpecificOutput: {
            hookEventName: "SessionStart",
            additionalContext: CONTEXT,
          },
        };
  process.stdout.write(JSON.stringify(response));
} catch {
  // A hook must never break session startup.
}

process.exit(0);
