#!/usr/bin/env node
// Repo-wide structural checks for the Arcade Agent Hub plugin package.
// No dependencies; run with: node scripts/check.mjs

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENDPOINT = "https://hub.arcade.dev/mcp";
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const errors = [];
const fail = (message) => errors.push(message);
const read = (path) => readFileSync(join(ROOT, path), "utf8");

// --- JSON validity -----------------------------------------------------------
const jsonFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(join(ROOT, dir))) {
    if (entry === ".git" || entry === "node_modules") continue;
    const rel = join(dir, entry);
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
    else if (entry.endsWith(".json")) jsonFiles.push(rel);
  }
};
walk(".");

const json = {};
for (const file of jsonFiles) {
  try {
    json[file] = JSON.parse(read(file));
  } catch (parseError) {
    fail(`${file}: invalid JSON — ${parseError.message}`);
  }
}

// --- No root default-discovery locations ------------------------------------
for (const forbidden of ["skills", "agents", "commands", "hooks", "rules", "mcp.json", ".mcp.json"]) {
  if (existsSync(join(ROOT, forbidden))) {
    fail(`root ${forbidden} exists — components must live under components/ or clients/ and be declared explicitly`);
  }
}

// --- Manifest component paths exist ------------------------------------------
// Rules are a Cursor-only component; every other component must be declared
// explicitly in both manifests.
const manifestKeys = {
  ".cursor-plugin/plugin.json": ["rules", "skills", "agents", "commands", "hooks", "mcpServers"],
  ".claude-plugin/plugin.json": ["skills", "agents", "commands", "hooks", "mcpServers"],
};
for (const [manifest, pathKeys] of Object.entries(manifestKeys)) {
  const data = json[manifest];
  if (!data) continue;
  for (const key of pathKeys) {
    if (!(key in data)) {
      fail(`${manifest}: missing explicit "${key}" declaration`);
      continue;
    }
    const values = Array.isArray(data[key]) ? data[key] : [data[key]];
    for (const value of values) {
      if (typeof value !== "string") continue;
      const target = value.replace(/^\.\//, "");
      if (!existsSync(join(ROOT, target))) fail(`${manifest}: ${key} path does not exist: ${value}`);
    }
  }
}

// --- Frontmatter -------------------------------------------------------------
const frontmatter = (path) => {
  const text = read(path);
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z][A-Za-z-]*):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2];
  }
  return fields;
};

const componentNames = new Map();
const registerName = (name, source) => {
  if (componentNames.has(name)) fail(`duplicate component name "${name}" (${componentNames.get(name)} and ${source})`);
  else componentNames.set(name, source);
};

for (const skillDir of readdirSync(join(ROOT, "components/skills"))) {
  const path = `components/skills/${skillDir}/SKILL.md`;
  const fields = frontmatter(path);
  if (!fields?.name || !fields?.description) fail(`${path}: frontmatter must include name and description`);
  else {
    if (fields.name !== skillDir) fail(`${path}: frontmatter name "${fields.name}" != directory "${skillDir}"`);
    if (!KEBAB.test(fields.name)) fail(`${path}: name is not kebab-case`);
    registerName(fields.name, path);
  }
}
for (const agentFile of readdirSync(join(ROOT, "components/agents"))) {
  const path = `components/agents/${agentFile}`;
  const fields = frontmatter(path);
  if (!fields?.name || !fields?.description) fail(`${path}: frontmatter must include name and description`);
  else {
    if (!KEBAB.test(fields.name)) fail(`${path}: name is not kebab-case`);
    registerName(fields.name, path);
  }
}
for (const commandFile of readdirSync(join(ROOT, "components/commands"))) {
  const path = `components/commands/${commandFile}`;
  const fields = frontmatter(path);
  if (!fields?.description) fail(`${path}: frontmatter must include description`);
  registerName(commandFile.replace(/\.md$/, ""), path);
}
for (const ruleFile of readdirSync(join(ROOT, "clients/cursor/rules"))) {
  const path = `clients/cursor/rules/${ruleFile}`;
  const fields = frontmatter(path);
  if (!fields?.description || !("alwaysApply" in fields)) {
    fail(`${path}: rule frontmatter must include description and alwaysApply`);
  }
}

// --- Version consistency ------------------------------------------------------
const versions = {
  ".cursor-plugin/plugin.json": json[".cursor-plugin/plugin.json"]?.version,
  ".claude-plugin/plugin.json": json[".claude-plugin/plugin.json"]?.version,
  "clients/opencode/package.json": json["clients/opencode/package.json"]?.version,
  ".plugin/plugin.json": json[".plugin/plugin.json"]?.version,
  "clients/claude-desktop/mcpb/manifest.json": json["clients/claude-desktop/mcpb/manifest.json"]?.version,
};
if (new Set(Object.values(versions)).size !== 1) {
  fail(`version mismatch: ${JSON.stringify(versions)}`);
}
const version = Object.values(versions)[0];
const fileVersion = read("VERSION").trim();
if (fileVersion !== version) {
  fail(`VERSION file ${JSON.stringify(fileVersion)} != manifest version ${JSON.stringify(version)}`);
}
if (version && !read("CHANGELOG.md").includes(`## [${version}]`)) {
  fail(`CHANGELOG.md has no entry for ${version}`);
}

// --- Release-train contract (shared semver with arcadeai-labs/hub) ------------
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const parseSemver = (value, label) => {
  const match = SEMVER.exec(value);
  if (!match) {
    fail(`${label}: not semver X.Y.Z: ${JSON.stringify(value)}`);
    return null;
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
};
const contract = json["release-contract.json"];
if (!contract) {
  fail("release-contract.json missing or invalid JSON");
} else {
  if (contract.release_train !== "arcade-agent-hub") {
    fail('release-contract.json: release_train must be "arcade-agent-hub"');
  }
  if (contract.component !== "plugin") {
    fail('release-contract.json: component must be "plugin"');
  }
  if (contract.version !== version) {
    fail(`release-contract.json version ${JSON.stringify(contract.version)} != ${JSON.stringify(version)}`);
  }
  if (contract.endpoint !== ENDPOINT) {
    fail(`release-contract.json: endpoint must be ${ENDPOINT}`);
  }
  const requiresHub = contract.requires?.hub;
  if (typeof requiresHub !== "string" || !requiresHub.startsWith(">=")) {
    fail('release-contract.json: requires.hub must use ">=" form (e.g. ">=0.1.6")');
  } else {
    const floor = requiresHub.slice(2).trim();
    parseSemver(floor, "requires.hub");
    const changelog = read("CHANGELOG.md");
    const heading = `## [${version}]`;
    const start = changelog.indexOf(heading);
    if (start < 0) {
      fail(`CHANGELOG.md missing entry ${heading}`);
    } else {
      const rest = changelog.slice(start + heading.length);
      const next = rest.search(/\n## \[/);
      const section = next < 0 ? rest : rest.slice(0, next);
      const requiresMatch = section.match(/requires\s+hub\s*[≥>=]+\s*(\d+\.\d+\.\d+)/i);
      if (!requiresMatch) {
        fail(`CHANGELOG.md [${version}] must include 'requires hub ≥ ${floor}' (or >=)`);
      } else if (requiresMatch[1] !== floor) {
        fail(`CHANGELOG.md requires hub ≥ ${requiresMatch[1]} != contract ${floor}`);
      }
    }
  }
}

// --- Endpoint consistency ------------------------------------------------------
for (const file of [
  "clients/cursor/mcp.json",
  "clients/claude/mcp.json",
  "clients/claude-desktop/claude_desktop_config.json",
  "clients/opencode/opencode.json",
  "clients/opencode/index.ts",
  "release-contract.json",
]) {
  if (!read(file).includes(ENDPOINT)) fail(`${file}: does not reference ${ENDPOINT}`);
}

// --- MCP server key ------------------------------------------------------------
for (const file of ["clients/cursor/mcp.json", "clients/claude/mcp.json", "clients/claude-desktop/claude_desktop_config.json"]) {
  if (!json[file]?.mcpServers?.arcade) fail(`${file}: mcpServers must define the "arcade" server key`);
}

// --- Hook script executes with client-native shapes ---------------------------
// One shared script serves both clients (Cursor also loads Claude Code
// plugins, so either client may invoke either hooks.json). The platform is
// detected from the hook's stdin payload; verify both detections.
const runHook = (script, stdinPayload) => {
  try {
    return JSON.parse(
      execFileSync("node", [join(ROOT, script)], {
        encoding: "utf8",
        timeout: 10_000,
        input: stdinPayload,
      }),
    );
  } catch (execError) {
    fail(`${script}: failed to execute or emit JSON — ${execError.message}`);
    return null;
  }
};
const HOOK_SCRIPT = "components/hooks/session-start.mjs";
const cursorHook = runHook(HOOK_SCRIPT, JSON.stringify({ conversation_id: "c", workspace_roots: ["/tmp"] }));
if (cursorHook && typeof cursorHook.additional_context !== "string") {
  fail(`${HOOK_SCRIPT}: cursor-shaped stdin must emit flat { additional_context }`);
}
const claudeHook = runHook(HOOK_SCRIPT, JSON.stringify({ hook_event_name: "SessionStart", session_id: "s" }));
if (claudeHook && claudeHook.hookSpecificOutput?.hookEventName !== "SessionStart") {
  fail(`${HOOK_SCRIPT}: claude-shaped stdin must emit hookSpecificOutput.hookEventName = SessionStart`);
}
// Both hooks.json files must reference the shared script.
for (const hooksFile of ["clients/cursor/hooks/hooks.json", "clients/claude/hooks/hooks.json"]) {
  if (!read(hooksFile).includes("components/hooks/session-start.mjs")) {
    fail(`${hooksFile}: must reference the shared ${HOOK_SCRIPT}`);
  }
}

// --- Per-turn reminder fires on app work and stays quiet on local work --------
// Claude Code has no always-apply rule, so this hook is the only thing keeping
// Arcade present after the session-start context has scrolled away. It has to
// stay silent on coding turns: a reminder that fires on everything is both a
// context cost and an invitation to reach for a remote tool to edit a file.
const PROMPT_HOOK = "components/hooks/user-prompt-submit.mjs";
const runPromptHook = (prompt) => {
  try {
    return execFileSync("node", [join(ROOT, PROMPT_HOOK)], {
      encoding: "utf8",
      timeout: 10_000,
      input: JSON.stringify({ hook_event_name: "UserPromptSubmit", prompt }),
    }).trim();
  } catch (execError) {
    fail(`${PROMPT_HOOK}: failed to execute — ${execError.message}`);
    return "";
  }
};
for (const prompt of [
  // Named app, channel, handle, address, URL.
  "send a slack message to #eng that the deploy is done",
  "open a GitHub issue for this",
  "email alex@example.com the release notes",
  "summarize https://modelcontextprotocol.io/changelog",
  "ask @priya whether the migration landed",
  // The user's own accounts.
  "what are my 5 most recent emails?",
  "what is on my calendar tomorrow",
  // Reaching people without naming a product.
  "Ping the team about the outage",
  "reply to Sarah and let her know it shipped",
  "did anyone respond to my question",
  // Scheduling, with modifiers between article and noun.
  "book a 30 minute call with the design team",
  // Trackers, docs, storage.
  "file a ticket for this bug",
  "create a doc summarizing the incident",
  "upload the report to Drive",
  // People and customers.
  "who is the account owner for Acme",
  // Research and anything time-sensitive.
  "search the web for the Go 1.26 release date",
  "what's the latest version of Go",
  "any updates on the migration?",
  "is github down right now",
  "find out what our competitors charge",
  // Comms verbs that are also nouns, here with a real recipient.
  "message the team that we are live",
  "email Sarah the release notes",
  "notify everyone about the incident",
  "make a doc for the launch",
]) {
  const out = runPromptHook(prompt);
  if (!out) {
    fail(`${PROMPT_HOOK}: stayed silent on app work: ${JSON.stringify(prompt)}`);
    continue;
  }
  let parsed;
  try {
    parsed = JSON.parse(out);
  } catch {
    fail(`${PROMPT_HOOK}: emitted non-JSON for ${JSON.stringify(prompt)}`);
    continue;
  }
  if (parsed.hookSpecificOutput?.hookEventName !== "UserPromptSubmit") {
    fail(`${PROMPT_HOOK}: hookEventName must be UserPromptSubmit`);
  }
  if (typeof parsed.hookSpecificOutput?.additionalContext !== "string") {
    fail(`${PROMPT_HOOK}: must inject additionalContext`);
  }
}
for (const prompt of [
  "refactor this function to use a map",
  "run the tests and fix the failure",
  "git commit these changes and push",
  "add an email validation regex to this file",
  "why is this file failing to compile",
  "implement a retry function with backoff",
  "rename the variable to userCount",
  "update the README in this repo",
  "write unit tests for the parser",
  "fix the failing test in internal/run",
  "explain what this code does",
  "npm install the new dependency",
  // The same comms words as nouns, with no recipient anywhere.
  "write a parser for the message format",
  "the message queue is backing up in this service",
  "reduce ping latency in the client",
  "rename the sendEmail function",
  // Build-tool invocations that plain English would otherwise swallow.
  "go test ./... and fix what breaks",
  "make check then commit",
]) {
  if (runPromptHook(prompt) !== "") {
    fail(`${PROMPT_HOOK}: fired on local work: ${JSON.stringify(prompt)}`);
  }
}
// Malformed and empty input must never break a prompt.
for (const raw of ["", "not json", "{}"]) {
  try {
    execFileSync("node", [join(ROOT, PROMPT_HOOK)], {
      encoding: "utf8",
      timeout: 10_000,
      input: raw,
    });
  } catch (execError) {
    fail(`${PROMPT_HOOK}: non-zero exit on ${JSON.stringify(raw)} — ${execError.message}`);
  }
}
if (!read("clients/claude/hooks/hooks.json").includes(PROMPT_HOOK)) {
  fail(`clients/claude/hooks/hooks.json: must wire ${PROMPT_HOOK} on UserPromptSubmit`);
}

// --- Language consistency -------------------------------------------------------
const userFacing = [
  "components/commands/do.md",
  "components/commands/apps.md",
  "components/commands/status.md",
  "components/commands/connect.md",
  "components/skills/using-arcade-tools/SKILL.md",
  "components/skills/managing-arcade-apps/SKILL.md",
  "components/skills/working-with-arcade-gateways/SKILL.md",
  "clients/cursor/rules/arcade-gateway-hub.mdc",
];
for (const file of userFacing) {
  if (/authorization link/i.test(read(file))) {
    fail(`${file}: says "authorization link" — user-facing copy uses "sign-in link"`);
  }
}

// --- No committed archives ---------------------------------------------------------
// Claude's plugin installer rejects repos containing zip archives ("Nested
// zip files are not allowed"), and .mcpb bundles are zips. Built artifacts
// are attached to GitHub Releases instead (see .github/workflows/release.yml).
const trackedArchives = execFileSync("git", ["ls-files", "*.zip", "*.mcpb", "*.dxt"], {
  cwd: ROOT,
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean);
for (const archive of trackedArchives) {
  fail(`${archive}: archives must not be committed (breaks Claude plugin installs) — attach to a GitHub Release instead`);
}

// --- Gateway coverage ------------------------------------------------------------
// The hub's defining tool must be documented wherever tools are enumerated.
for (const file of [
  "components/skills/working-with-arcade-gateways/SKILL.md",
  "README.md",
  "clients/opencode/README.md",
]) {
  if (!read(file).includes("Arcade_SelectGateway")) {
    fail(`${file}: does not mention Arcade_SelectGateway`);
  }
}

// --- Report --------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`check.mjs: ${errors.length} problem(s)\n`);
  for (const message of errors) console.error(`  ✗ ${message}`);
  process.exit(1);
}
console.log(`check.mjs: all checks passed (${jsonFiles.length} JSON files, version ${version})`);
