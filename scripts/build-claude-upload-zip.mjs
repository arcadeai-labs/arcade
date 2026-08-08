#!/usr/bin/env node
// Builds the Claude plugin-directory upload zip.
//
// Components live at Claude Code's default locations, so the shipped manifest
// leaves `agents` and `commands` undeclared and lets discovery find them once.
// The claude.ai uploader does not discover: it validates those two fields as
// DIRECTORIES and fails without them ("No command files found in specified
// directories"). This script adds them at package time. Nothing is copied —
// the directories are already at the plugin root.
//
// Usage: node scripts/build-claude-upload-zip.mjs [output.zip]
import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const out = resolve(process.argv[2] ?? join(repoRoot, "arcade-claude-plugin-upload.zip"));

const stage = mkdtempSync(join(tmpdir(), "claude-upload-"));
try {
  // Tracked files only: build artifacts (skill zips, .mcpb) stay out, which
  // also keeps the uploader's "no nested archives" rule satisfied.
  execSync(`git -C "${repoRoot}" archive --format=tar HEAD | tar -x -C "${stage}"`, {
    stdio: "inherit",
    shell: "/bin/bash",
  });

  const manifestPath = join(stage, ".claude-plugin/plugin.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.agents = "./agents/";
  manifest.commands = "./commands/";
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  rmSync(out, { force: true });
  execSync(`cd "${stage}" && zip -q -r "${out}" . -x "*.DS_Store"`, {
    stdio: "inherit",
    shell: "/bin/bash",
  });
  console.log(`build-claude-upload-zip: wrote ${out} (version ${manifest.version})`);
} finally {
  rmSync(stage, { recursive: true, force: true });
}
