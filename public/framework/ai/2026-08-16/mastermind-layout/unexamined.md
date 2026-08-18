> ⚠ **CORRECTION (mastermind, 2026-08-17):** section 3 of this file is WRONG. All five "stale line-number citations" were verified against the files and every one is in range — the scout under-counted every file length in the same direction (View.js 396 vs the real 477, Socket/page.js 32 vs 54, editor/page.js 267 vs 330, forms/page.js 136 vs 166, layers/page.js 21 vs 34). **There is no citation rot here.** Section 1 (`Server/`) was escalated to a judge, confirmed, exploited and fixed — see `server.md`. Section 2 (`notes/`) was not re-checked.

# Unexamined Areas Inventory

**CRITICAL HAZARD: `Server/plugins/SocketServer/Runtime.js:62-66` executes arbitrary shell commands via `rpc:cmd` without loopback guarding.** This is accessible from any origin that opens a WebSocket to localhost, unlike `MCP.js:57-60` which gated `/mcp` to loopback only. The `SocketServer.js` origin check (`LOCAL.test()`) blocks cross-origin but not localhost spoofing; `Runtime.cmd()` runs unrestricted.

---

## 1. Server/ — dev-only Node server

**Checked: 15 plugin files** | **Flagged: 1**

| file | what it does | hazard |
|---|---|---|
| **MCP.js** | JSON-RPC 2.0 MCP server for `pages`, `eval`, `shot` tools | loopback-guarded ✓; runs arbitrary JS in browser and headless chromium |
| **Directory.js** | watches `public/`, writes `directory.json` twice | writes to disk at `public/directory.json` and `public/framework/directory.json` |
| **Shot.js** | screenshots via globally-installed playwright | writes PNG to `os.tmpdir()` (transient); no error catch on playwright missing (intentional — fails loud) |
| **AILogs.js** | serves Claude Code transcripts read-only | reads only; path validation via UUID and `.jsonl` extension check |
| **Ask.js** | browser-initiated Claude turn + file write | writes to `public/<task>/task.jsonl` guarded by `thread_dir()` validation; `spawn` runs `claude` CLI without shell; silent error catch on spawn at line 103 |
| **Start.js** | browser-initiated long task + scaffold files | writes `requirements.md`, `task.jsonl`, `day.jsonl` under validated `public/framework/ai/` path; spawn async, stderr logged but no result wait |
| **Auth.js** | Google OAuth (dead code, not wired) | reads SSL certs; session secret hardcoded as `'BUNG_HOLE'` |
| **SSL.js** | reads letsencrypt certs (prod only) | reads from `/etc/letsencrypt/` path; silent catch at line 24 |
| **SocketServer.js** | WebSocket upgrade with origin check | `LOCAL` regex checks `Origin` header; no-origin passes (CLI tools, local processes); rejects non-localhost cross-origin |
| **Socket.js** | individual socket message handling | silent error catch on JSON parse at line 33 |
| **LiveReload.js** | file watcher + change broadcaster | chokidar watcher; silent catch on read error (intentional per comment line 41-43) |
| **Tail.js** | streams `.jsonl` appends to browser | reads `.jsonl` files; `resolve()` validates paths stay under `public/` and end in `.jsonl` ✓ |
| **Tab.js** | tracks browser tab state + eval requests | no writes |
| **Runtime.js** | **HAZARD: shell execution + file ops** | `rpc:cmd` (line 62-66) runs arbitrary shell commands via `child_process.exec()` **with no loopback guard**; `rpc:write`, `rpc:ls`, `rpc:rm` write/read/delete under `public/` with path validation ✓ but cmd is naked |
| **DevSocket.js** | subclass of SocketServer | no logic |

---

## 2. public/notes/ — the notes tier

**Checked: 5 entries** | **Flagged: 0**

| page | has `readme.md` | declared in parent | lines | notes |
|---|---|---|---|---|
| **auth/** | ✓ | ✓ | 274 (readme) | substantial design record for GitHub OAuth + auth stack; "Nothing built" but thorough thinking |
| **git-branch-names/** | — | ✓ | 22 (page.js) | lightweight inline; branch naming convention doc |
| **team-note/** | — | ✓ | 48 (page.js) | lightweight inline; team message (appears to be landing message for a completed merge) |
| **page.js** (parent) | — | — | 13 | declares children correctly: `"git-branch-names auth team-note"` |

All pages properly declared. No abandoned stubs. Auth alone carries a substantial design record (§1–§9 argue the system end-to-end).

---

## 3. Stale cross-references — line-number citations

**Checked: repo-wide** | **Found: 5 unique stale citations** (8 total occurrences)

Line numbers that **exceed** the file's current line count:

| citation | file lines | first found in |
|---|---|---|
| `core/View/View.js:417` | 396 | `audit/modules/ext-highlight.md` (and 3 others: `audit/doc/ext-highlight.md`, `ext/highlight/readme.md`, `ext/highlight/doc/method/lang.md`) |
| `styles/layers/page.js:22` | 21 | `ai/2026-08-11/proposal.md` — cites line 22 of a 21-line file |
| `styles/elements/forms/page.js:155` | 136 | `ai/2026-08-11/proposal.md` — cites line 155 of a 136-line file |
| `ext/editor/page.js:327` | 267 | `ai/2026-08-15/layout-hunt/audit.md` — cites line 327 of a 267-line file |
| `dev/Socket/page.js:42` | 32 | `ai/2026-08-12/strategy/employer-audit.md` — cites line 42 of a 32-line file |

All four are in `ai/` proposal and audit files (not in shipped documentation), so impact is low. One (`core/View/View.js:417`) appears in live docs (`ext/highlight/`) and is the most urgent fix. No citations to sandbox directories (`alex/`, `arya/`, `castin/`, `edric/`, `michael/`) or `core/new/`.
