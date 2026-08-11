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
// Earlier versions tried to classify which prompts deserved the reminder.
// Three rounds of widening later it was still wrong on about a third of
// ordinary phrasing — silent on "disconnect my google account", on "list
// open PRs", and firing on "update the changelog" — and each fix bought one
// phrasing rather than a class of them. Classifying
// intent from a regex over one sentence is the wrong tool, and the reminder
// costs about the same whether it goes out always or two thirds of the time.
// So it goes out always, and the only thing left to decide is cheap and
// structural rather than semantic.
//
// Always exits 0: a stuck or failing hook on this event stalls the prompt.

// Written as a factual statement rather than an instruction. Anthropic's hook
// documentation is explicit that out-of-band imperatives can trip Claude's
// prompt-injection defenses, which surfaces the text to the user instead of
// treating it as context.
const REMINDER =
  'The "arcade" MCP server is connected. It runs tasks across all of the ' +
  "user's connected apps — Slack, Gmail, GitHub, Calendar, Notion, Linear, " +
  "Drive — and returns live web data. Arcade_Run takes a task in plain " +
  "language; Arcade_Task continues it (confirm, input, sign-in) and " +
  "carries multi-step work by task_id.";

// A prompt that carries no task cannot be redirected by a reminder: the model
// is mid-flight on the previous turn and already holds its context. Skipping
// these is a judgment about the shape of the prompt, not its meaning, so it
// cannot be wrong the way intent matching was — "check slack" is two words but
// none of them are in this vocabulary.
const CONTINUATION_WORDS = new Set([
  "yes", "y", "yeah", "yep", "yup", "no", "nope", "ok", "okay", "k",
  "sure", "please", "pls", "plz", "thanks", "thank", "you", "ty",
  "continue", "proceed", "go", "ahead", "do", "it", "that", "this",
  "fix", "retry", "again", "next", "stop", "wait", "hold", "on",
  "actually", "done", "lgtm", "ship", "perfect", "great", "good",
  "cool", "nice", "right", "correct", "now", "and", "then", "the",
  "a", "an", "keep", "going",
]);

// Bounded on purpose: a longer sentence made only of these words is unusual
// enough that injecting is the safer default.
const MAX_CONTINUATION_WORDS = 4;

const isBareContinuation = (prompt) => {
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0 || words.length > MAX_CONTINUATION_WORDS) return false;
  return words.every((word) => CONTINUATION_WORDS.has(word));
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
  if (typeof prompt === "string" && prompt.trim() && !isBareContinuation(prompt)) {
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

export { isBareContinuation, REMINDER };
