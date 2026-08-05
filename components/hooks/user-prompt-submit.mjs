#!/usr/bin/env node
// Per-turn availability reminder for the Claude clients.
//
// The session-start hook states once, at the top of the conversation, that
// Arcade is connected. That is the wrong moment: by the thirtieth turn the
// model is anchored on recent context and reaches for a built-in or a shell
// command instead. Cursor solves this with an always-apply rule that rides
// every turn; Claude Code has no rule equivalent, so the reminder has to be a
// hook, and UserPromptSubmit is the one event whose context lands alongside
// the prompt it is about.
//
// It fires only when the prompt looks like external-app or live-data work.
// A reminder on every turn of a coding session would cost context on turns it
// cannot help and would be tuned out on the turns it could.
//
// Always exits 0: a stuck or failing hook on this event stalls the prompt.

// Written as a factual statement rather than an instruction. Anthropic's hook
// documentation is explicit that out-of-band imperatives can trip Claude's
// prompt-injection defenses, which surfaces the text to the user instead of
// treating it as context.
const REMINDER =
  'The "arcade" MCP server is connected. It runs tasks in the user\'s external ' +
  "apps and returns live data — Slack, Gmail, GitHub, Google Calendar, Notion, " +
  "Linear, Drive, and web search — scoped to their active Arcade gateway. " +
  "Arcade_Run takes the task in plain language; Arcade_Plan handles multi-step " +
  "work. These reach real accounts, which built-in web search and shell " +
  "commands do not.";

// Naming an app is signal enough on its own: someone who says "Slack" means
// the product, whatever else the sentence contains.
const APP_PATTERN =
  /\b(slack|gmail|g-?mail|outlook|inbox|mailbox|calendar|gcal|github|gitlab|notion|linear|jira|asana|trello|confluence|zendesk|intercom|hubspot|salesforce|stripe|dropbox|google\s+(?:drive|docs|sheets|slides|contacts)|onedrive|sharepoint|discord|telegram|whatsapp|zoom|posthog|datadog|reddit|youtube|wikipedia|twitter|linkedin)\b/i;

// Live-data and outbound cues. Weaker than an app name, so a prompt that is
// plainly about the local codebase suppresses these.
// "my 5 most recent emails" puts words between the possessive and the noun,
// so the gap is part of the pattern rather than an exact adjacency.
const LIVE_DATA_PATTERN =
  /\b(search\s+(?:the\s+)?web|web\s+search|google\s+it|look\s+up|latest\s+news|breaking\s+news|current\s+(?:price|weather|events?|status)|what'?s\s+(?:new|happening)|who\s+won|stock\s+price|weather\s+(?:in|for|today)|send\s+(?:an?\s+)?(?:email|message|dm|invite)|schedule\s+(?:a\s+)?(?:meeting|call|event)|unread\s+(?:emails?|messages?)|my\s+(?:\w+\s+){0,3}(?:emails?|inbox|calendar|meetings?|messages?|schedule|notifications?))\b/i;

// Local work: the failure mode a nudge could cause is an agent reaching for a
// remote tool to do something in the repo in front of it.
const LOCAL_WORK_PATTERN =
  /\b(this\s+(?:repo|file|function|test|branch|codebase|project)|in\s+the\s+(?:repo|codebase)|run\s+the\s+tests?|npm\s+|yarn\s+|pnpm\s+|bun\s+|go\s+(?:test|build|run)|cargo\s+|make\s+|git\s+(?:commit|push|pull|rebase|merge|status|diff|log)|refactor|compile|stack\s+trace|lint)\b/i;

const wantsArcade = (prompt) => {
  if (!prompt || typeof prompt !== "string") return false;
  if (APP_PATTERN.test(prompt)) return true;
  return LIVE_DATA_PATTERN.test(prompt) && !LOCAL_WORK_PATTERN.test(prompt);
};

const readStdin = async () => {
  if (process.stdin.isTTY) return "";
  let data = "";
  try {
    for await (const chunk of process.stdin) data += chunk;
  } catch {
    // No readable stdin: emit nothing rather than guess.
  }
  return data;
};

try {
  const raw = await readStdin();
  let prompt = "";
  try {
    prompt = JSON.parse(raw)?.prompt ?? "";
  } catch {
    // Unparseable input: stay silent. A reminder is never worth a broken turn.
  }
  if (wantsArcade(prompt)) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: REMINDER,
        },
      }),
    );
  }
} catch {
  // A hook must never break a prompt.
}

process.exit(0);

export { wantsArcade, REMINDER };
