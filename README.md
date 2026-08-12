<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/arcade-wordmark-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/arcade-wordmark-light.svg">
    <img alt="Arcade" src="assets/arcade-wordmark-light.svg" width="340">
  </picture>
</p>

<h3 align="center">Plugin</h3>

<p align="center">
  Let any agent use Arcade. Ask for what you want and the right tool runs
  <br>across every app you've connected.
  <br>App sign-in happens in the browser. No API keys.
</p>

<p align="center">
  <a href="https://hub.arcade.dev"><img alt="Endpoint" src="https://img.shields.io/badge/endpoint-hub.arcade.dev%2Fmcp-ff5c37"></a>
  <a href="https://agent-plugins.org"><img alt="Agent Plugins 1.0.0" src="https://img.shields.io/badge/Agent_Plugins-1.0.0-4f46e5"></a>
  <a href="CHANGELOG.md"><img alt="Version" src="https://img.shields.io/badge/version-0.16.1-555"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-Apache--2.0-555"></a>
</p>

---

## Install

Every client below gets the same `arcade` MCP server. What else comes with it
depends on what that client can load — the full breakdown is in the
[support matrix](docs/support-matrix.md).

| Client | Install | Instructions |
|---|---|---|
| **Cursor** | [![Install in Cursor](https://img.shields.io/badge/Cursor-one--click-000000)](https://cursor.com/install-mcp?name=arcade&config=eyJ1cmwiOiJodHRwczovL2h1Yi5hcmNhZGUuZGV2L21jcCJ9) | [cursor.md](docs/install/cursor.md) |
| **Claude Code** | [![Install in Claude Code](https://img.shields.io/badge/Claude_Code-install-d97757?logo=claude&logoColor=white)](docs/install/claude-code.md) | [claude-code.md](docs/install/claude-code.md) |
| **Claude Desktop** | [![Download extension](https://img.shields.io/badge/Claude_Desktop-download_.mcpb-d97757?logo=claude&logoColor=white)](https://github.com/arcadeai-labs/arcade/releases/latest/download/arcade-gateway-hub.mcpb) | [claude-desktop.md](docs/install/claude-desktop.md) |
| **VS Code** | [![Install in VS Code](https://img.shields.io/badge/VS_Code-one--click-0098FF?logo=visualstudiocode&logoColor=white)](https://vscode.dev/redirect/mcp/install?name=arcade&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fhub.arcade.dev%2Fmcp%22%7D) | [vscode.md](docs/install/vscode.md) |
| **GitHub Copilot CLI** | [![Install in Copilot CLI](https://img.shields.io/badge/Copilot_CLI-install-24292e?logo=githubcopilot&logoColor=white)](docs/install/copilot.md) | [copilot.md](docs/install/copilot.md) |
| **Codex / ChatGPT** | [![Install in Codex](https://img.shields.io/badge/Codex_·_ChatGPT-install-000000?logo=openai&logoColor=white)](docs/install/codex.md) | [codex.md](docs/install/codex.md) |
| **Kiro** | [![Install in Kiro](https://img.shields.io/badge/Kiro-install-6b46c1)](docs/install/kiro.md) | [kiro.md](docs/install/kiro.md) |
| **OpenCode** | [![Install in OpenCode](https://img.shields.io/badge/OpenCode-install-333333?logo=iterm2&logoColor=white)](docs/install/opencode.md) | [opencode.md](docs/install/opencode.md) |
| **Any MCP client** | `https://hub.arcade.dev/mcp` | [agent-plugins.md](docs/install/agent-plugins.md) |

One command covers most of them:

```bash
npx plugins add arcadeai-labs/arcade
```

Cursor also auto-loads any plugin you install in Claude Code, so if you use
both, install in **one** place — otherwise Cursor lists it twice and splits
its components between the entries. See
[cursor.md](docs/install/cursor.md#avoid-installing-twice).

> **Staging deployment.** The hub currently runs against Arcade staging, so
> sign in with your **staging** Arcade account (the sign-in page is served by
> `cloud.bosslevel.dev`, not `arcade.dev`). Everything else is
> production-shaped.

## What each client gets

| | Tools | Skills | Subagent | Commands | Rule | Hooks |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| **Cursor** | ✅ 8 | ✅ 3 | ✅ | ✅ 4 | ✅ | ✅ |
| **Claude Code** | ✅ 8 | ✅ 3 | ✅ | ✅ 4 | — | ✅ 2 |
| **Claude Cowork / desktop** | ✅ 8 | ✅ 3 | ✅ | ✅ 4 | — | ✅ 2 |
| **GitHub Copilot CLI** | ✅ 8 | ✅ 3 | ✅ | — | — | ✅ 2 |
| **VS Code** | ✅ 8 | ✅ 3 | — | — | — | — |
| **Codex / ChatGPT** | ✅ 8 | ✅ 3 | — | — | — | — |
| **Kiro** | ✅ 8 | ✅ 3 | — | — | — | — |
| **OpenCode** | ✅ 8 | — | — | ✅ 2 | — | ✅ |
| **Claude Desktop (.mcpb)** | ✅ 8 | upload | — | — | — | — |
| **Any MCP client** | ✅ 8 | — | — | — | — | — |

Rules, subagents, commands, and hooks are not portable component types in
Agent Plugins 1.0.0, so each client gets whatever its own plugin format
supports. Full detail, including version floors and install methods, is in the
[support matrix](docs/support-matrix.md).

## Try it

- "What apps do I have connected?"
- "Send a message to #eng that the deploy is done."
- "What's on my calendar tomorrow?"
- `/arcade:status` — check your connection, sign-in, and connected apps
- `/arcade:connect google` — connect an app ahead of time

Your assistant speaks intent to the hub: `Arcade_Run` starts a task and
`Arcade_Task` continues it by `task_id` (confirmation, missing details, or a
sign-in; multi-step keeps the same `task_id`), while
`Arcade_SelectTools` / `Arcade_UseTool` remain the manual escape hatch,
`Arcade_Apps` / `Arcade_ManageToolAuthorization` manage app connections, and
`Arcade_SelectScope` manages org, project, and gateway selection — you never
call any of them yourself.

## Learn more

- [Install guides](docs/install/) — one page per client
- [Client support matrix](docs/support-matrix.md) — what each install gets
- [Agent Plugins](docs/install/agent-plugins.md) — the portable package format
- [Release train](docs/release-train.md) · [Development](docs/development.md)
- Privacy: tasks run through Arcade's hosted hub and the apps you connect —
  [privacy policy](https://www.arcade.dev/privacy-policy).

## License

[Apache-2.0](LICENSE). Copyright (c) 2024–Present Arcade AI.
