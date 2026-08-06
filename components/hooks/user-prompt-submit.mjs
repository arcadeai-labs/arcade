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
// Matching is three-tier, because the failure that matters is a miss, not a
// stray reminder:
//
//   1. STRONG   — the prompt is unambiguously about something outside this
//                 machine (an app by name, #channel, @handle, an address, a
//                 URL). Fires regardless of anything else in the sentence.
//   2. INTENT   — the prompt asks for an action or information that lives
//                 outside the repo. Fires unless the prompt is plainly local.
//   3. LOCAL    — code, tests, git, the filesystem. Suppresses tier 2.
//
// Always exits 0: a stuck or failing hook on this event stalls the prompt.

// Written as a factual statement rather than an instruction. Anthropic's hook
// documentation is explicit that out-of-band imperatives can trip Claude's
// prompt-injection defenses, which surfaces the text to the user instead of
// treating it as context.
const REMINDER =
  'The "arcade" MCP server is connected. It runs tasks in the user\'s external ' +
  "apps and returns live data — messaging, mail, calendars, issue trackers, " +
  "docs, CRMs, cloud storage, and web search — scoped to their active Arcade " +
  "gateway. Arcade_Run takes the task in plain language; Arcade_Plan handles " +
  "multi-step work. These reach real accounts and current data, which built-in " +
  "knowledge and shell commands do not.";

// Tier 1. Naming an app, a channel, a person, an address, or a URL means the
// subject is outside this machine whatever else the sentence says.
const STRONG_SIGNALS = [
  // Products, by name.
  String.raw`\b(slack|gmail|g-?mail|outlook|office\s*365|inbox|mailbox|calendar|gcal|` +
    String.raw`github|gitlab|bitbucket|notion|linear|jira|asana|trello|clickup|monday\.com|shortcut|` +
    String.raw`confluence|zendesk|intercom|freshdesk|hubspot|salesforce|pipedrive|attio|apollo|` +
    String.raw`stripe|quickbooks|xero|dropbox|box\.com|onedrive|sharepoint|` +
    String.raw`google\s+(?:drive|docs|sheets|slides|contacts|meet|forms|tasks)|` +
    String.raw`discord|telegram|whatsapp|signal|teams|zoom|webex|` +
    String.raw`posthog|datadog|sentry|grafana|pagerduty|opsgenie|` +
    String.raw`reddit|youtube|wikipedia|twitter|x\.com|linkedin|mastodon|bluesky|` +
    String.raw`airtable|coda|figma|miro|greenhouse|ashby|lever|workday|servicenow|shopify)\b`,
  // #channel — no space after the hash, so markdown headings do not match.
  String.raw`(?:^|\s)#[a-z][a-z0-9_-]{1,}\b`,
  // @handle — excluding scoped package names (@scope/pkg) and decorators.
  String.raw`(?:^|\s)@[a-z][a-z0-9._-]{2,}(?!/)\b`,
  // An email address is a recipient, not a string literal.
  String.raw`\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b`,
  // A URL is something to fetch, read, or share.
  String.raw`https?://\S+`,
  // The user's own accounts and data.
  String.raw`\bmy\s+(?:\w+\s+){0,3}(?:emails?|inbox|mailbox|calendar|meetings?|messages?|` +
    String.raw`schedule|notifications?|tickets?|issues?|tasks?|contacts?|files?|docs?|` +
    String.raw`repos?|repositories|prs?|pull\s+requests?|drive|notes?)\b`,
];

// Tier 2. Work that happens somewhere other than this repo. Broad on purpose:
// a miss is the failure this hook exists to prevent, and tier 3 is what keeps
// the breadth honest.
const INTENT_SIGNALS = [
  // Reaching people. Unambiguous outbound verbs stand alone.
  String.raw`\b(send|forward|reply|respond|follow\s+up|reach\s+out|announce|broadcast|invite|cc)\b`,
  // message/email/ping/text are also ordinary nouns — "the message format",
  // "an email regex", "ping latency". Requiring merely a following word does
  // not help, because a noun always follows. The target has to name a person
  // or a group. Capitalized names are covered by NAMED_RECIPIENT below.
  String.raw`\b(message|dm|ping|email|text|notify)\s+(?:@\w+|everyone|them|him|her|us|me|` +
    String.raw`the\s+(?:team|channel|group|room|list|folks|others|customer|client))\b`,
  // "… to the team", "… with the group" reads as outbound whatever the verb.
  String.raw`\b(?:to|with)\s+(?:the\s+)?(?:team|channel|group|everyone|stakeholders|customer|client)\b`,
  String.raw`\bshare\s+(?:this|it|that|the)\b`,
  String.raw`\b(tell|ask|remind|update)\s+(?:the\s+)?(?:team|channel|group|everyone|him|her|them|@?\w+)\b`,
  // Time and scheduling. Modifiers sit between the article and the noun
  // ("book a 30 minute call"), so the gap is part of the pattern.
  String.raw`\b(schedule|reschedule|book|cancel|set\s+up)\s+(?:a\s+|the\s+|an\s+)?` +
    String.raw`(?:[\w:-]+\s+){0,3}(?:meeting|call|event|invite|time|appointment|sync|1:1|standup)\b`,
  String.raw`\b(availability|free\s+time|find\s+a\s+time|what'?s\s+on|agenda\s+for)\b`,
  // Trackers and work items.
  String.raw`\b(create|open|file|close|assign|triage|comment\s+on)\s+(?:a\s+|an\s+|the\s+)?` +
    String.raw`(?:issue|ticket|task|bug|story|epic|pr|pull\s+request|card)\b`,
  // Documents, storage, records.
  String.raw`\b(create|make|write|draft|update|append\s+to|share|put\s+together)\s+` +
    String.raw`(?:a\s+|an\s+|the\s+)?(?:[\w-]+\s+){0,2}` +
    String.raw`(?:doc|document|page|spreadsheet|sheet|slide|deck|note|file|folder|record|report|summary)\b`,
  // Moving bytes somewhere is never a local-repo action on its own.
  String.raw`\b(upload|download|attach)\b`,
  // People and customers.
  String.raw`\b(look\s+up|find|search\s+for)\s+(?:the\s+)?(?:contact|customer|account|lead|candidate|company|person)\b`,
  String.raw`\b(who\s+is|what'?s\s+the\s+email\s+(?:for|of)|contact\s+(?:info|details))\b`,
  // Research and the open web.
  String.raw`\b(search\s+(?:the\s+)?web|web\s+search|google\s+it|look\s+it\s+up|research|` +
    String.raw`find\s+out|check\s+online|browse|fetch\s+(?:the\s+)?(?:page|url|site))\b`,
  // Anything whose answer changes over time.
  String.raw`\b(latest|current|recent|today'?s|this\s+week|right\s+now|as\s+of\s+(?:today|now)|` +
    String.raw`up\s+to\s+date|breaking|news|headlines)\b`,
  String.raw`\b(what'?s\s+(?:new|happening|the\s+status)|any\s+updates?|did\s+(?:anyone|he|she|they)\s+` +
    String.raw`(?:reply|respond|say)|what\s+did\s+\w+\s+say)\b`,
  String.raw`\b(who\s+won|stock\s+price|share\s+price|exchange\s+rate|weather|forecast|` +
    String.raw`is\s+\w+\s+down|status\s+page|outage)\b`,
];

// Tier 3. The failure a broad net could cause is an agent reaching for a
// remote tool to do something in the repo in front of it. Only suppresses
// tier 2 — an explicitly named app still wins.
const LOCAL_WORK_SIGNALS = [
  String.raw`\bthis\s+(?:repo|file|function|method|class|test|branch|codebase|project|code|script|module|package)\b`,
  String.raw`\bin\s+(?:the|this)\s+(?:repo|codebase|project|file|directory|folder)\b`,
  String.raw`\b(run|write|fix|add)\s+(?:the\s+|a\s+|some\s+)?(?:tests?|unit\s+tests?|test\s+case)\b`,
  String.raw`\b(refactor|compile|typecheck|type-check|lint|debug|stack\s+trace|traceback|` +
    String.raw`syntax\s+error|build\s+(?:error|fails?)|failing\s+test)\b`,
  String.raw`\bgit\s+(?:commit|push|pull|rebase|merge|status|diff|log|stash|checkout|branch)\b`,
  // Build tools need a real subcommand. A bare "<tool> <word>" swallowed
  // ordinary English: "Go 1.26" read as a go subcommand and silenced a web
  // search, and "make a doc" would have read as a build target.
  String.raw`\b(npm|yarn|pnpm|bun)\s+(install|run|test|add|remove|build|ci|exec|x)\b`,
  String.raw`\b(pip|uv|poetry)\s+(install|add|sync|run|lock)\b`,
  String.raw`\bcargo\s+(build|test|run|check|clippy|fmt|add)\b`,
  String.raw`\bgo\s+(test|build|run|mod|get|vet|fmt|install|generate|work|tool)\b`,
  String.raw`\bdocker\s+(build|run|compose|ps|exec|image)\b`,
  String.raw`\b(kubectl|terraform|gradle|mvn)\s+\w`,
  String.raw`\bmake\s+(build|test|install|clean|dev|check|lint|fmt|all|docs)\b`,
  String.raw`\b(implement|rename|extract|inline)\s+(?:a\s+|the\s+)?(?:function|method|class|variable|type|interface)\b`,
];

const union = (patterns) => new RegExp(patterns.join("|"), "i");
const STRONG = union(STRONG_SIGNALS);
const INTENT = union(INTENT_SIGNALS);
const LOCAL = union(LOCAL_WORK_SIGNALS);

// "email Sarah the notes" — a capitalized word after a comms verb is a person.
// Case-sensitive on purpose, which is why it cannot live in the unions above.
const NAMED_RECIPIENT =
  /\b(?:message|dm|ping|email|text|notify|tell|ask|remind)\s+[A-Z][a-z]+\b/;

const wantsArcade = (prompt) => {
  if (!prompt || typeof prompt !== "string") return false;
  if (STRONG.test(prompt)) return true;
  if (NAMED_RECIPIENT.test(prompt) && !LOCAL.test(prompt)) return true;
  return INTENT.test(prompt) && !LOCAL.test(prompt);
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
