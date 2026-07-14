#!/usr/bin/env node
// Packages the plugin's skills as upload-ready ZIPs for the Claude apps
// (claude.ai / Claude Desktop → Customize → Skills → Upload a skill).
//
// claude.ai rejects skill descriptions longer than 200 characters (the Agent
// Skills spec allows 1024, which the in-repo skills use), so each skill gets
// an explicit short description here. Everything else ships verbatim.
//
// Output: clients/claude-desktop/skills/<name>.zip (committed, so README
// download links always work). Run after editing any SKILL.md:
//   node scripts/build-claude-skills.mjs

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "clients/claude-desktop/skills");
const MAX_DESCRIPTION = 200;

// Short descriptions for the claude.ai 200-character limit. Reviewed copy,
// not truncation — keep the trigger words ("use when…") intact.
const shortDescriptions = {
  "using-arcade-tools":
    "Do tasks in external apps — Slack, Gmail, GitHub, Calendar, Notion, Linear, and more — plus live web search, via Arcade tool discovery. Use for any task touching an external app or live data.",
  "managing-arcade-apps":
    "List, disconnect, and fix the apps Arcade is connected to — switch accounts, expired sign-ins, missing permissions, one-time sign-ins. Use when the user asks about their connected apps.",
  "working-with-arcade-gateways":
    "Show, inspect, and switch the user's Arcade gateways — curated sets of apps and tools that determine which tools are available. Use when the user asks about gateways or wants to switch.",
};

mkdirSync(OUT_DIR, { recursive: true });

const skillsDir = join(ROOT, "components/skills");
const built = [];
for (const skillName of readdirSync(skillsDir)) {
  const source = readFileSync(join(skillsDir, skillName, "SKILL.md"), "utf8");
  const short = shortDescriptions[skillName];
  if (!short) {
    console.error(`build-claude-skills: no short description for "${skillName}" — add one to scripts/build-claude-skills.mjs`);
    process.exit(1);
  }
  if (short.length > MAX_DESCRIPTION) {
    console.error(`build-claude-skills: short description for "${skillName}" is ${short.length} chars (max ${MAX_DESCRIPTION})`);
    process.exit(1);
  }

  const rewritten = source.replace(/^(---\n[\s\S]*?^description:)[^\n]*$/m, `$1 ${short}`);
  if (!rewritten.includes(short)) {
    console.error(`build-claude-skills: failed to rewrite description for "${skillName}"`);
    process.exit(1);
  }

  // ZIP layout required by claude.ai: <skill-name>/SKILL.md at the archive
  // root (folder name must match the frontmatter name).
  const staging = mkdtempSync(join(tmpdir(), "arcade-skill-"));
  const skillFolder = join(staging, skillName);
  mkdirSync(skillFolder);
  writeFileSync(join(skillFolder, "SKILL.md"), rewritten);

  const zipPath = join(OUT_DIR, `${skillName}.zip`);
  rmSync(zipPath, { force: true });
  execFileSync("zip", ["-r", "-X", "-q", zipPath, skillName], { cwd: staging });
  rmSync(staging, { recursive: true, force: true });
  built.push(skillName);
}

console.log(`build-claude-skills: packaged ${built.length} skill(s): ${built.join(", ")}`);
