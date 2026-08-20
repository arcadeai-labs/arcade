#!/usr/bin/env node
// Repo-wide structural checks for the Arcade Plugin package.
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

// --- Root layout -------------------------------------------------------------
// Agent Plugins 1.0.0 fixes the two portable component types at the plugin
// root and forbids relocating them. Everything else is client-specific, so it
// stays under components/ or clients/ and is declared explicitly — otherwise a
// client picks it up by folder convention in a bundle that never intended it.
// skills/ and mcp.json are the portable component types, fixed at the root by
// the standard. agents/, commands/, and hooks/ are *not* portable, but the
// root is where Claude Code, Cursor, and Copilot CLI look for them by default,
// so keeping one copy there is what gets the same components loaded in every
// client that supports them.
for (const required of ["plugin.json", "mcp.json", "skills", "agents", "commands", "hooks/hooks.json"]) {
  if (!existsSync(join(ROOT, required))) {
    fail(`root ${required} is missing — clients discover components there by default`);
  }
}
// rules/ is Cursor-only, and .mcp.json is the legacy MCP location that would
// register the server a second time alongside the portable mcp.json.
for (const forbidden of ["rules", ".mcp.json"]) {
  if (existsSync(join(ROOT, forbidden))) {
    fail(`root ${forbidden} exists — it belongs under clients/ and must be declared explicitly`);
  }
}

// --- Agent Plugins portable core ----------------------------------------------
// Both schemas are closed: an unknown top-level key makes the package
// non-conformant, and a client that does not recognize a $schema value rejects
// the plugin outright rather than ignoring the field.
const PLUGIN_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";
const PLUGIN_NAME = /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const PLUGIN_FIELDS = new Set([
  "$schema", "name", "version", "description", "author",
  "homepage", "repository", "license", "keywords", "extensions",
]);
const AUTHOR_FIELDS = new Set(["name", "email", "url"]);
const MCP_VARIANTS = {
  stdio: new Set(["type", "command", "args", "env", "cwd"]),
  "streamable-http": new Set(["type", "url", "headers"]),
  sse: new Set(["type", "url", "headers"]),
};

const portable = json["plugin.json"];
if (portable) {
  if (portable.$schema !== PLUGIN_SCHEMA) {
    fail(`plugin.json: $schema must be ${PLUGIN_SCHEMA}`);
  }
  if (typeof portable.name !== "string" || portable.name.length > 64 || !PLUGIN_NAME.test(portable.name)) {
    fail(`plugin.json: name ${JSON.stringify(portable.name)} violates the Agent Plugins name constraints`);
  }
  for (const key of Object.keys(portable)) {
    if (!PLUGIN_FIELDS.has(key)) {
      fail(`plugin.json: "${key}" is not an allowed top-level field — the manifest schema is closed (client data belongs under "extensions")`);
    }
  }
  for (const key of Object.keys(portable.author ?? {})) {
    if (!AUTHOR_FIELDS.has(key)) fail(`plugin.json: author.${key} is not allowed (name, email, url only)`);
  }
}

const portableMcp = json["mcp.json"];
if (portableMcp) {
  if (portableMcp.$schema !== MCP_SCHEMA) {
    fail(`mcp.json: $schema must be ${MCP_SCHEMA}`);
  }
  if (portable && portableMcp.$schema !== undefined && portable.$schema !== undefined) {
    const pluginVersion = String(portable.$schema).split("/").at(-2);
    const mcpVersion = String(portableMcp.$schema).split("/").at(-2);
    if (pluginVersion !== mcpVersion) {
      fail(`mcp.json targets Agent Plugins ${mcpVersion} but plugin.json targets ${pluginVersion} — the versions must match`);
    }
  }
  for (const key of Object.keys(portableMcp)) {
    if (key !== "$schema" && key !== "mcpServers") {
      fail(`mcp.json: "${key}" is not allowed — the document holds only $schema and mcpServers`);
    }
  }
  for (const [server, config] of Object.entries(portableMcp.mcpServers ?? {})) {
    const allowed = MCP_VARIANTS[config?.type];
    if (!allowed) {
      fail(`mcp.json: server "${server}" declares unsupported type ${JSON.stringify(config?.type)}`);
      continue;
    }
    for (const key of Object.keys(config)) {
      if (!allowed.has(key)) {
        fail(`mcp.json: server "${server}" has "${key}", which does not belong to the ${config.type} variant`);
      }
    }
  }
  if (portableMcp.mcpServers?.arcade?.type !== "streamable-http") {
    fail('mcp.json: the arcade server must use the portable "streamable-http" transport');
  }
}

// A client manifest must never carry an Agent Plugins $schema. Cursor resolves
// .cursor-plugin/plugin.json ahead of the root manifest and treats an
// unrecognized schema id as unsupported, which rejects the whole plugin.
for (const manifest of [".cursor-plugin/plugin.json", ".claude-plugin/plugin.json"]) {
  if (json[manifest]?.$schema !== undefined) {
    fail(`${manifest}: must not declare $schema — only the root portable manifests do`);
  }
}

// The legacy OpenPlugin manifest must stay gone. GitHub Copilot CLI resolves
// .plugin/plugin.json *before* the root manifest, so reintroducing it would
// shadow the Agent Plugins core and drop Copilot back to legacy loading, where
// the portable "streamable-http" transport is not understood.
if (existsSync(join(ROOT, ".plugin"))) {
  fail(".plugin/ exists — it shadows the root Agent Plugins manifest in Copilot CLI; the portable core replaces it");
}

// Claude Code has no "streamable-http" transport literal, so pointing it at
// the portable mcp.json would silently drop the server.
if (json["clients/claude/mcp.json"]?.mcpServers?.arcade?.type !== "http") {
  fail('clients/claude/mcp.json: the arcade server must keep type "http" for Claude Code');
}

// skills/, agents/, commands/, and hooks/hooks.json are all Claude Code
// default locations. Declaring them again in the manifest risks a merged
// rather than replaced list, which for hooks means firing twice per session
// and per prompt.
for (const key of ["skills", "agents", "commands", "hooks"]) {
  if (key in (json[".claude-plugin/plugin.json"] ?? {})) {
    fail(`.claude-plugin/plugin.json: drop "${key}" — it sits at a Claude default location, and declaring it too risks loading it twice`);
  }
}
// The claude.ai uploader is the exception: it validates `agents` and
// `commands` as directories, so the upload build adds them at package time.
for (const field of ['manifest.agents = "./agents/"', 'manifest.commands = "./commands/"']) {
  if (!read("scripts/build-claude-upload-zip.mjs").includes(field)) {
    fail(`scripts/build-claude-upload-zip.mjs: must set ${field} for the claude.ai uploader`);
  }
}

// --- Manifest component paths exist ------------------------------------------
// Rules are a Cursor-only component; every other component must be declared
// explicitly in both manifests.
// Cursor documents that a declared path *replaces* folder discovery, so its
// manifest names every component explicitly and nothing is ambiguous. Claude
// Code does not specify whether a declared path replaces or merges with its
// default, so anything already sitting at a Claude default location is left
// undeclared and discovered exactly once — a merged hooks list would fire the
// session-start and per-turn hooks twice. Only the non-default MCP path is
// named there.
const manifestKeys = {
  ".cursor-plugin/plugin.json": ["rules", "skills", "agents", "commands", "hooks", "mcpServers"],
  ".claude-plugin/plugin.json": ["mcpServers"],
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

for (const skillDir of readdirSync(join(ROOT, "skills"))) {
  const path = `skills/${skillDir}/SKILL.md`;
  const fields = frontmatter(path);
  if (!fields?.name || !fields?.description) fail(`${path}: frontmatter must include name and description`);
  else {
    if (fields.name !== skillDir) fail(`${path}: frontmatter name "${fields.name}" != directory "${skillDir}"`);
    if (!KEBAB.test(fields.name)) fail(`${path}: name is not kebab-case`);
    registerName(fields.name, path);
  }
}
for (const agentFile of readdirSync(join(ROOT, "agents"))) {
  const path = `agents/${agentFile}`;
  // Copilot CLI only discovers agents whose filename ends in .agent.md, while
  // Claude Code and Cursor accept any .md — the double extension satisfies all
  // three from one file.
  if (!agentFile.endsWith(".agent.md")) {
    fail(`${path}: agent files must end in .agent.md so Copilot CLI discovers them`);
  }
  const fields = frontmatter(path);
  if (!fields?.name || !fields?.description) fail(`${path}: frontmatter must include name and description`);
  else {
    if (!KEBAB.test(fields.name)) fail(`${path}: name is not kebab-case`);
    registerName(fields.name, path);
  }
}
for (const commandFile of readdirSync(join(ROOT, "commands"))) {
  const path = `commands/${commandFile}`;
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
  "plugin.json": json["plugin.json"]?.version,
  ".cursor-plugin/plugin.json": json[".cursor-plugin/plugin.json"]?.version,
  ".claude-plugin/plugin.json": json[".claude-plugin/plugin.json"]?.version,
  "clients/opencode/package.json": json["clients/opencode/package.json"]?.version,
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
  "mcp.json",
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
for (const file of ["mcp.json", "clients/cursor/mcp.json", "clients/claude/mcp.json", "clients/claude-desktop/claude_desktop_config.json"]) {
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
const HOOK_SCRIPT = "hooks/session-start.mjs";
const cursorHook = runHook(HOOK_SCRIPT, JSON.stringify({ conversation_id: "c", workspace_roots: ["/tmp"] }));
if (cursorHook && typeof cursorHook.additional_context !== "string") {
  fail(`${HOOK_SCRIPT}: cursor-shaped stdin must emit flat { additional_context }`);
}
const claudeHook = runHook(HOOK_SCRIPT, JSON.stringify({ hook_event_name: "SessionStart", session_id: "s" }));
if (claudeHook && claudeHook.hookSpecificOutput?.hookEventName !== "SessionStart") {
  fail(`${HOOK_SCRIPT}: claude-shaped stdin must emit hookSpecificOutput.hookEventName = SessionStart`);
}
// Both hooks.json files must reference the shared script.
for (const hooksFile of ["clients/cursor/hooks/hooks.json", "hooks/hooks.json"]) {
  if (!read(hooksFile).includes("hooks/session-start.mjs")) {
    fail(`${hooksFile}: must reference the shared ${HOOK_SCRIPT}`);
  }
}

// --- Per-turn reminder: every real prompt, never a bare continuation --------
// Claude Code has no always-apply rule, so this hook is the only thing keeping
// Arcade present after the session-start context has scrolled away. Earlier
// versions classified which prompts deserved it and were wrong on about a
// third of ordinary phrasing, so the reminder now goes out on every prompt
// that carries a task. The only exclusion is structural: a prompt made
// entirely of continuation words cannot be redirected by a reminder.
const PROMPT_HOOK = "hooks/user-prompt-submit.mjs";
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
  // App work of every shape, including the phrasings intent matching missed.
  "send a slack message to #eng that the deploy is done",
  "email alex@example.com the release notes",
  "what gateways do I have?",
  "disconnect my google account",
  "list open PRs on arcadeai-labs/hub",
  "is the API up?",
  "what did the CEO say in the all-hands?",
  "draft a customer apology and put it in a doc",
  "find the invoice from last month",
  "we're having an incident - page the on-call",
  // Local work still gets it: the reminder states availability, and an agent
  // that does not need Arcade simply does not call it.
  "refactor this function to use a map",
  "run the tests and fix the failure",
  "git commit these changes and push",
  // Short but substantive — must not be mistaken for a continuation.
  "check slack",
  "do it now for #eng",
]) {
  const out = runPromptHook(prompt);
  if (!out) {
    fail(`${PROMPT_HOOK}: emitted nothing for a real prompt: ${JSON.stringify(prompt)}`);
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
// Prompts carrying no task: the model is mid-flight and already holds context.
for (const prompt of [
  "yes",
  "ok",
  "continue",
  "thanks",
  "fix it",
  "actually hold on",
  "go ahead",
]) {
  if (runPromptHook(prompt) !== "") {
    fail(`${PROMPT_HOOK}: spent context on a bare continuation: ${JSON.stringify(prompt)}`);
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
if (!read("hooks/hooks.json").includes(PROMPT_HOOK)) {
  fail(`hooks/hooks.json: must wire ${PROMPT_HOOK} on UserPromptSubmit`);
}

// --- Install docs are reachable and real ----------------------------------------
// Every client we claim to support needs a page, that page has to be linked
// from the index, and every link in the README has to resolve.
const installIndex = read("docs/install/README.md");
for (const page of readdirSync(join(ROOT, "docs/install"))) {
  if (page === "README.md" || !page.endsWith(".md")) continue;
  if (!installIndex.includes(`(${page})`)) {
    fail(`docs/install/${page}: not linked from docs/install/README.md`);
  }
}
for (const source of ["README.md", "docs/support-matrix.md"]) {
  for (const [, page] of read(source).matchAll(/\((?:docs\/)?install\/([a-z0-9-]+\.md)[)#]/g)) {
    if (!existsSync(join(ROOT, "docs/install", page))) {
      fail(`${source}: links docs/install/${page}, which does not exist`);
    }
  }
}

// --- Language consistency -------------------------------------------------------
const userFacing = [
  "commands/apps.md",
  "commands/status.md",
  "commands/connect.md",
  "skills/using-arcade-tools/SKILL.md",
  "skills/managing-arcade-apps/SKILL.md",
  "skills/setting-up-arcade-scope/SKILL.md",
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

// --- Report --------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`check.mjs: ${errors.length} problem(s)\n`);
  for (const message of errors) console.error(`  ✗ ${message}`);
  process.exit(1);
}
console.log(`check.mjs: all checks passed (${jsonFiles.length} JSON files, version ${version})`);
