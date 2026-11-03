# launch-audit — static lew42.com: what breaks, what to commit, what other devs can run

Verified live: headless Playwright, `**/socket*` aborted + WebSocket routes closed, against `http://localhost/`.

## 1. Runtime — needs the dev server?

| Feature | Static? | Degrades how | Fix / hide |
|---|---|---|---|
| DevBar (chrome, every page) | **yes**✓ | renders full, 0 console errors — socket rows read "off — not localhost" | mounted unconditionally in `app.js` (`devbar(this)`, no env check) — JS/CSS ship to every visitor even though it's dev-only chrome; gate the mount on hostname to stop shipping it at all |
| DevBar Ask tab / `ext/Ask` | no | `available()` check shows "localhost only — no bridge here"; `ask()`/`thread()`/`start()` throw if called directly | already guarded in the UI; fine as-is |
| `dev/Socket` | n/a (the gate itself) | by design: off localhost, `send`/`request` no-op, nothing connects, nothing throws | this *is* the fix; the guard is load-bearing, don't remove |
| `dev/Claim` | n/a | server-side only — evaluated inside `Server/plugins/MCP.js`, ships **zero bytes** to a visitor | none needed |
| `ext/AITask` dashboard (`/framework/ai/`) | **yes**✓ | renders full (427 elements, 11.7KB text), 0 console errors — task/day `.jsonl` are static files, fetched directly | "start task" (`rpc:start`) and chat/session replay (streams from `~/.claude/projects/`) are dev-only; hide those two controls off localhost |
| `ext/Panel` persistence | yes | `FileSaver` → `read_only()` + one `console.warn` when `dev` is false; pages already swap to `LocalStorageSaver` (genuinely persists, per-browser) | none — already the blessed pattern |
| `ext/editor` | yes | same `dev ? FileSaver : LocalStorageSaver` swap | none |
| `ext/DesignTool` `analyze()` | yes | pure client-side measurement, no socket calls found | none |
| `ext/DesignTool` vision/shots | n/a | authoring-time Node script (`run.mjs`) + `mcp__site__shot`; never runs in a visitor's browser | none — not a page feature |
| live-reload | no | Socket disabled → no reload on file change; irrelevant once files stop changing | none needed |

## 2. Commit — what's in the tree that shouldn't ship

`git ls-files public/framework/ai/` = **671** tracked files, 25.4MB. Table sums to **671**.

| Category | Count | Size | Committed / ignored | A stranger reads | Verdict |
|---|---|---|---|---|---|
| `task.jsonl` | 171 | — | committed | the owner's prompts, file paths, decisions verbatim | move out of `public/`, or `.gitignore` |
| `day.jsonl` | 6 | — | committed | same, one line per task | same |
| `session.json` | 9 | — | committed | prompt text + `session_id` (summary, not a raw transcript) | same — served today at its literal static path in prod, no dev server needed |
| `usage.json`/`usage.jsonl` | 2 | — | **leaked past `.gitignore`** | token/usage numbers | `.gitignore` only covers top-level `usage.json`; dated snapshots (`2026-08-15/usage.json`) aren't matched — widen the pattern |
| `.png` (shots) | 136 | 18MB (~70% of the weight) | committed; 15 sit under `**/shots/`, ignored **after** they were already committed | screenshots of the dev UI mid-build | `git rm --cached` the `shots/` ones; the rest still ship weight for no runtime value |
| `.md`/`.js`/`.css`/other `.json`/`.tmp` | 347 | ~7.4MB | committed | requirements, findings, proposals — text, not secrets | fine as prose, but same "should this even ship" question as the rest |
| `Server/data/`, `public/data/` | 0 tracked | — | `public/data/` is gitignored; no `Server/data/` found in the tree | n/a | already correct |

**How served today:** `session.json`/`task.jsonl` are read two ways — `ext/AITask` `fetch()`s them as plain static JSON (works identically in prod, since `public/` ships as-is — no dev server needed to *read* them), and the chat/session tab additionally streams `~/.claude/projects/*.jsonl` over the dev server only (`ext/AITask/readme.md`). The static-file path is what makes leaving them in `public/` risky: prod would serve them to anyone who guesses or crawls the URL.

## 3. Other devs — `.claude/` on a fresh clone

| Item | Works? | Needs | Fix |
|---|---|---|---|
| `hooks/ledger.mjs` (all 4 events) | yes | Node only, `${CLAUDE_PROJECT_DIR}`-relative, `path.sep`-normalized | none |
| `skills/new-task`, `finish-task`, `code`, `css`, `layout`, `new-page`, `new-css-class`, `documentation`, `skill-improvement` | yes | plain reading/writing in-repo | none |
| `skills/check-claude-usage` | **no** | `~/.claude/bin/claude-usage.py` — not in the repo (the owner's `~/.claude/` is explicitly not committed), PowerShell-only syntax | ship the script in `.claude/bin/` or drop the skill's hard dependency; add a bash form |
| `skills/mastermind` | partial | assumes `check-claude-usage` works | same fix |
| `skills/fork-claude-session` | yes | needs the `claude` CLI on PATH; commands are cross-platform | none |
| `.mcp.json` (`site`) | yes | dev server on `localhost/mcp`; same machine, portable | none |
| figma MCP | **no** | not in `.mcp.json` at all — configured only in the owner's user-level Claude Code config | add it to `.mcp.json` if every dev should have it, or document it as opt-in |
| `.claude/skills` count | note | brief expected ~15, repo has **12** | some skills may not have made it into the copy — worth a second pass |

## Verdicts

1. **Ship the AI dashboard/DevBar, don't hide them** — both already render clean and error-free static (verified live); the design already gates every risky call behind `Socket.disabled`. The only real gap is two dev-only controls (start task, chat replay) that should hide off localhost, not the whole rail.
2. **Push blockers:** move `public/framework/ai/**` (task/day/session logs, pngs) out of `public/` or gitignore it — it is prompt/session data served as static files today; widen `.gitignore` to catch dated `usage.json` snapshots; `git rm --cached` the 15 already-committed `shots/` pngs.
3. **Fix before other devs are unblocked:** `check-claude-usage` needs its script in the repo (or a documented manual fallback); add figma to `.mcp.json` or document it as owner-only.
4. **Fine as-is:** `dev/Socket`'s localhost gate, `ext/Panel`/`ext/editor`'s Saver swap, `dev/Claim` (server-only), `hooks/ledger.mjs`, the core skills.
