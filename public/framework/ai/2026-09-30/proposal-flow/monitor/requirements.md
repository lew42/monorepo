Budget: $12

# monitor — the main branch is production; health.mjs watches template changes

Items 9, 10 and 8 of [../requirements.md](../requirements.md). Extend `Server/health.mjs` — do not start over. Read its header comment and `Server/doc/` first.

## Fence
`Server/health.mjs`, `Server/health-supervisor.mjs`, `Server/doc/health*.md`, `.claude/hooks/health-guard.mjs` (only if the report format changes), `public/framework/ai/health/` (readme, shots). Nothing else.

## Build
1. **Template, not data.** A change to `.js`, `.css`, `.html`, `page.js` under `public/` triggers a check. A change to `.jsonl`, `.md`, `.json` under `public/framework/ai/` (logs, cards, day files) does NOT — those are data, rendered by templates already tested. Keep the existing debounce.
2. **The check, per changed page:** load headless; collect console errors; take a screenshot (1920 wide, to `public/framework/ai/health/shots/<date>/<slug>.png`, overwritten per page so it never grows); measure stalls — inject a `PerformanceObserver` for `longtask` before load and record any task over 2 s, plus "did the page settle within 10 s"; count console warnings matching `JSONL: unknown verb` as a finding.
3. **Report twice:** to the editor as today (the health log read by `health-guard.mjs`), AND to the dashboard: one `log` line appended (validated, via `.claude/hooks/append.mjs`) to the editing agent's task.jsonl when the ledger knows it — `{"log":{"at":"NOW","msg":"health: <page> — <N console errors>, stall <s> s, shot <path>"}}` — or to `public/framework/ai/health/<date>.jsonl` alone when it does not.
4. **One supervisor.** `health-supervisor.mjs` takes a lock (pid file; a live pid means exit quietly). Two were running at once on 2026-09-30.
5. A quick layout scan is NOT in scope (later).

## Proof (on the card, with links)
- Break a page in the worktree (a `throw` in some page.js), save → the finding appears with the shot path; restore it.
- Append a line to any `.jsonl` under `ai/` → no check runs (the log says so).
- A test page with a 3 s busy loop → stall flagged.
- Start the supervisor twice → one process.

Update `Server/doc/health.md` so the next reader can run it from the doc alone.

## How you work
- Load the `minion` skill first, then the `code` skill. Read the readme chain for every directory you touch (`/framework/ai/readmes/`).
- Work ONLY in the worktree `C:/Code/lew42/worktrees/proposal-flow` (branch `worktree/proposal-flow`, its server `http://localhost:62566/`). Never edit the main tree. Other minions share this worktree with their own fences — touch only your files.
- Commit each piece as soon as it works, by exact path, on this branch. Do not merge: say "ready to merge" on the card and the mastermind merges.
- Every look is headless (`mcp__site__shot` or Playwright). Never touch the owner's tabs.
- Log with the validated route only: `node .claude/hooks/append.mjs <task.jsonl> <lines.json>` or Servex `append_log`. Never `echo >>`.
- Report on the card `2026/09/30/proposal-flow-main-is-production-then-pr` (card_reply): two sentences at start, at "ready to merge" with the proof links, and if blocked. Nothing else goes to the mastermind.
- The owner's words are verbatim in `public/framework/ai/2026-09-30/proposal-flow/owner-words.md` (last section). Re-read them before you start; build what they say.
