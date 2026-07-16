#!/usr/bin/env node
// Builds the Claude plugin-directory upload zip.
//
// The claude.ai plugin uploader validates `commands` and `agents` manifest
// entries as DIRECTORIES, while this repo keeps those files under
// components/ (shared across clients) and lists them individually — a form
// Claude Code accepts but the uploader rejects ("No command files found in
// specified directories"). This script stages the tracked tree, copies
// commands/agents into top-level directories, rewrites the manifest to
// directory form, and zips the result.
//
// Usage: node scripts/build-claude-upload-zip.mjs [output.zip]
import { execSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

  mkdirSync(join(stage, "commands"), { recursive: true });
  mkdirSync(join(stage, "agents"), { recursive: true });
  cpSync(join(stage, "components/commands"), join(stage, "commands"), { recursive: true });
  cpSync(join(stage, "components/agents"), join(stage, "agents"), { recursive: true });

  const manifestPath = join(stage, ".claude-plugin/plugin.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.commands = "./commands/";
  manifest.agents = "./agents/";
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
