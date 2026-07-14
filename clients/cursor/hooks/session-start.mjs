#!/usr/bin/env node
// Cursor sessionStart hook (Cursor-native flat response shape).
// Always exits 0 so it can never block a session from starting.

try {
  const context =
    'Arcade Gateway Hub is connected as the "arcade" MCP server — external-app ' +
    "tools (Slack, Gmail, GitHub, Calendar, Notion, and more) scoped to the " +
    "user's active Arcade gateway; prefer it for tasks in external apps or " +
    "live data. The using-arcade-tools, managing-arcade-apps, and " +
    "working-with-arcade-gateways skills describe the flow.";

  process.stdout.write(JSON.stringify({ additional_context: context }));
} catch {
  // A hook must never break session startup.
}

process.exit(0);
