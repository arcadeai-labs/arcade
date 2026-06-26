# Connected Apps — Spec

Status: Draft / proposal
Owner: Arcade (Omni + plugin)
Scope: Omni MCP server changes + `arcade` plugin changes

## 1. Goal

Give users one clean way to **see, connect, and disconnect the apps** Arcade can
act on their behalf — Google, GitHub, Slack, Linear, Notion, Microsoft, Asana,
and so on.

Today there is no app-level surface. To answer "what's connected?" the agent
guesses a representative tool per provider and probes
`Arcade_ManageToolAuthorization(status)` — see the reference session that took
**14 calls and 3 `404 tool not found` errors** to produce one list, and still
couldn't disconnect anything. This spec replaces that with a first-class
**Apps** concept.

## 2. Principles

1. **Users think in "apps," not plumbing.** The end user must never see the
   words *authorization*, *OAuth*, *scopes*, *tokens*, *providers*, or
   *connections*. They see **apps**, **connected / not connected**,
   **permissions**, **sign in**, **disconnect**, **switch account**.
2. **One authoritative list.** "What apps do I have?" is a single call, not N
   probes.
3. **No guessing.** The model never invents tool names to infer state.
4. **Symmetric verbs.** If a user can connect an app, they can disconnect it and
   switch the account.

## 3. Vocabulary mapping (internal → what the user sees)

| Internal concept | User-facing term |
|---|---|
| provider / `omni-google`, `omni-github` … | **App** ("Google", "GitHub") |
| toolkit (Gmail, Calendar, Drive) | **What it can do** / services within an app |
| authorization exists / token valid | **Connected** |
| no authorization | **Not connected** |
| OAuth flow / authorize URL | **Sign in** / **Connect** |
| revoke / delete token | **Disconnect** |
| reauthorize / switch_account | **Switch account** / **Reconnect** |
| scopes | **Permissions** (humanized labels) |
| account `sub` / login | **Connected as `<email/username>`** |

## 4. Data model

### 4.1 App

```jsonc
{
  "app_id": "google",                 // stable slug
  "name": "Google",                   // display name
  "connected": true,                  // any valid authorization present
  "account": "sam@arcade.dev",        // identity of the connected account, or null
  "services": ["Gmail", "Calendar", "Drive"],  // human list of what it powers
  "permissions": [                    // humanized, with granted state
    { "id": "gmail.send",        "label": "Send email",            "granted": true },
    { "id": "calendar.readonly", "label": "Read your calendar",    "granted": true },
    { "id": "drive.file",        "label": "Access files you open", "granted": true }
  ],
  "last_used": "2026-06-25T20:11:00Z" // optional
}
```

Notes:
- `connected` is app-level (any auth present). Because Arcade grants permissions
  incrementally (per tool, as used), an app can be connected but missing some
  permissions — hence per-permission `granted`.
- One app may be backed by **multiple providers/toolkits** (e.g. Microsoft →
  Outlook, OneDrive, SharePoint, Outlook Calendar). The catalog (4.2) rolls
  these up.

### 4.2 App catalog (Omni-owned)

A static mapping Omni maintains, aligned with the registered `omni-*` providers
and the tool allowlist:

```jsonc
{
  "google":    { "name": "Google",    "providers": ["omni-google"],    "services": ["Gmail","Calendar","Drive","Docs"] },
  "github":    { "name": "GitHub",    "providers": ["omni-github"],    "services": ["GitHub"] },
  "slack":     { "name": "Slack",     "providers": ["omni-slack"],     "services": ["Slack"] },
  "linear":    { "name": "Linear",    "providers": ["omni-linear"],    "services": ["Linear"] },
  "notion":    { "name": "Notion",    "providers": ["omni-notion"],    "services": ["Notion"] },
  "asana":     { "name": "Asana",     "providers": ["omni-asana"],     "services": ["Asana"] },
  "microsoft": { "name": "Microsoft", "providers": ["omni-microsoft"], "services": ["Outlook","OneDrive","SharePoint","Outlook Calendar"] }
}
```

### 4.3 Permission humanization

A scope → label dictionary owned by Omni (fallback to a generic label for
unknown scopes), e.g.:

| Scope | Label |
|---|---|
| `https://www.googleapis.com/auth/gmail.send` | Send email |
| `https://www.googleapis.com/auth/calendar.readonly` | Read your calendar |
| `https://www.googleapis.com/auth/drive.file` | Access files you open with Arcade |
| `channels:read` | Read channel list |
| `Files.Read` | Read your files |
| `read` (Linear) | Read your issues |

## 5. Omni (server) changes

### 5.1 New meta-tool: `Arcade_Apps`

Replaces app-management duties; `Arcade_ManageToolAuthorization` stays for
low-level per-tool repair (and as the mechanism this calls under the hood).

```
Arcade_Apps(action, app_id?, query_id?)
```

| `action` | Args | Returns |
|---|---|---|
| `list` | — | `{ "apps": [App, …] }` (every app in the catalog, connected or not) |
| `connect` | `app_id` | `{ "app_id", "connect_url", "message" }` — the "sign in" link |
| `disconnect` | `app_id` | `{ "app_id", "connected": false }` — revokes all authorizations for the app |
| `switch_account` | `app_id` | `{ "app_id", "connect_url" }` — disconnect + fresh sign-in |

Design rules:
- `list` is **one call**, authoritative, provider-agnostic to the caller.
- All responses use the App model in §4.1 (humanized permissions, friendly
  names). No raw scopes/provider ids in the user-visible fields (keep raw values
  in an optional `_debug` block if useful for the model).
- `connect` requests the app's baseline permission bundle from the catalog so a
  first connect is useful without needing a specific tool call first.

### 5.2 Engine dependencies

`Arcade_Apps` is a thin roll-up over Engine capabilities:

1. **List authorizations for a user** → provider_id, scopes, status, account
   identity, timestamps. (Likely exists internally; expose to Omni.)
2. **Revoke/delete an authorization** by (user, provider) → required for
   `disconnect`. **This is the main net-new backend capability.**
3. **Account identity per authorization** (email/login) for the "Connected as"
   field. If not stored, derive via a cached `*_WhoAmI` call.

Omni adds on top: the app catalog (§4.2), scope humanization (§4.3), and the
provider→app roll-up.

### 5.3 Phasing

- **Phase 1 (no Engine revoke yet):** ship `Arcade_Apps(list, connect)` using the
  existing list-authorizations + authorize flow. Immediately kills the
  guessing/N+1 problem and gives a real "Apps" list + sign-in.
- **Phase 2:** add Engine revoke → enables `disconnect` and `switch_account`
  (true logout).

## 6. Plugin (`arcade`) changes

All user-facing names move from "auth/authorization" to **apps**.

### 6.1 Command rename

- `commands/auth.md` → `commands/apps.md` → **`/arcade:apps`**
  - Description: "See and manage your connected apps (Google, Slack, GitHub, …)."
  - Behavior: delegate to the `apps-agent` subagent; default to listing apps,
    and handle "connect/disconnect/switch" phrasing in `$ARGUMENTS`.

### 6.2 Skill rename

- `skills/arcade-authorization/` → `skills/arcade-apps/`
  - `name: arcade-apps`
  - Teaches the **voice rules** (§6.5) and the `Arcade_Apps` flow.

### 6.3 New subagent

- `agents/apps-agent.md` (`name: apps-agent`)
  - Description: "Use when the user asks what apps are connected, or wants to
    connect, disconnect, or switch the account for an app."
  - Runs `Arcade_Apps(list)` and renders a table; uses `connect` / `disconnect`
    / `switch_account` for actions. Inherits MCP tools (no `tools:` allowlist —
    see the v0.2.1 fix).

### 6.4 Copy changes in existing components

- `arcade-operator` / `inbox-agent` / `schedule-agent`: when a tool needs auth,
  say *"You need to connect your **Google** app — sign in here: `<url>`"* — never
  "authorization required."
- `hooks/post-tool-surface-auth.mjs`: change the injected text from "Omni needs
  authorization…" to "Arcade needs you to **connect the `<App>` app**. Share this
  sign-in link…".
- `session-start-availability.mjs`: "If an app isn't connected yet, the user can
  run `/arcade:apps` to connect it."

### 6.5 Voice rules (bake into the apps skill)

- Say **app**, **connected / not connected**, **sign in / connect**,
  **disconnect**, **switch account**, **permissions**.
- Never say authorization, OAuth, scopes, tokens, providers, connections.
- Show **Connected as `<account>`** when known.
- Present permissions as friendly labels, not scope strings.

## 7. UX flows (what the user sees)

**"What apps do I have?"**
> **Connected**
> • **Google** — connected as sam@arcade.dev — Gmail, Calendar, Drive
> • **GitHub** — connected
> • **Slack** — connected (read access)
> • **Linear** — connected
> • **Microsoft** — connected — OneDrive
>
> **Not connected:** Notion, Asana
>
> Want to connect one? Just say "connect Notion."

**"Connect Notion"** → returns a sign-in link.
**"Disconnect Slack"** → "Slack disconnected."
**"Switch my Google account"** → sign-in link for a different account.

(One `Arcade_Apps(list)` call instead of 14 probes; zero invented tool names.)

## 8. Backward compatibility

- `Arcade_ManageToolAuthorization` remains for per-tool repair and as the
  underlying mechanism. `Arcade_Apps` is the new, preferred surface.
- Plugin: keep `/arcade:auth` as a hidden alias of `/arcade:apps` for one
  release, then drop it.

## 9. Open questions

1. **Partial connection UX:** how to present an app that's connected but missing
   a permission a task needs (upgrade-in-place vs. reconnect)?
2. **Connect scope bundle:** does app-level `connect` request a baseline set, or
   stay lazy (per-tool) and only pre-warm common permissions?
3. **Account identity source:** stored on the authorization vs. derived via
   `*_WhoAmI`? (Affects whether `list` is fully self-contained.)
4. **Icons/branding** for an eventual visual picker (out of scope for MCP text,
   relevant for dashboards).
