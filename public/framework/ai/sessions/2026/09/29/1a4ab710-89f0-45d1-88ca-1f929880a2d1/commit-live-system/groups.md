# Commit groups — 2026-09-28

Snapshot before any commit: 326 lines of `git status --short` (`status-before.txt`), a sha1 per
file (`hashes-before.txt`). Six files are excluded — another agent is editing them right now (a
`git diff --stat` taken a minute apart moved): `.claude/skills/ui-test/drive.mjs`,
`Server/health.mjs`, `Server/layout-check.mjs`, `Server/m4a2wav.mjs`, `Server/padding-check.mjs`,
`Server/smoke.mjs`, `public/framework/ext/DesignTool/diff/site-diff.mjs`, and the new untracked
`Server/browser.mjs` it imports. Left for a later pass.

1. **gitignore** — add `layout-check-out/` (screenshot output) and `.merge-landed.json`
   (machine state) to `.gitignore`.
2. **hooks and skills** — `.claude/hooks/*`, `.claude/skills/*` except `ui-test/drive.mjs`
   (being edited) and `.claude/skills/ui-test/` untouched otherwise.
3. **repo config** — `.mcp.json`, `CLAUDE.md`, `dev.mjs`, `server.js`, `public/app.js`.
4. **Servex core** — `Servex/*.js`, `Servex/agents/*`, `Servex/cards/Cards.js`,
   `Servex/proof/*` (real scripts, not output), `Servex/readme.md`, `Servex/sustain.mjs`,
   `Servex/doc/`, `Servex/hidden-launch.vbs`. Untracked until now: `Pool.js`, `Usage.js`,
   `agents/tidy.js` — both imported by `Servex.js`.
5. **Server tools** — `Server/README.md`, `health-supervisor.mjs`, `plugins/*`, `task-cost.mjs`,
   `worktree-down.mjs`, plus untracked `clarity.mjs`, `on-landing.mjs`, `sources.mjs`,
   `text-check.mjs`, `window-lint.mjs`, `window-watch.mjs`.
6. **ai2 page** — all of `public/framework/ai2/` (tracked edits + the untracked
   `activity.js floating.js fold.js meter.js outline.js real.js workspace.js` and two doc files
   `card-standard.md`, `columns-seams.md`) — `fold.js` is also imported by `Servex/cards/Cards.js`.
7. **core/Page + dev/Socket** — `public/framework/core/Page/*` (including the jsonl/ deletes
   and the new `jsonl/full/`, `layout/`, `make/`, `overview/folders/`), `public/framework/dev/Socket/*`.
8. **ext modules** — `ext/AITask/usage.js`, `ext/Ask/pick.js`, `ext/DesignTool/doc/file/*.md`,
   `ext/Doc/*` (+ `doc/tree/`), `ext/demo/demo.js`, `ext/drawer/*` (+ untracked `menu.js`,
   `select.js`, `tabs.js`, `tabs/`, `walkthrough/`, `doc/*`), `ext/files/files.js`,
   `ext/layout/panel.js`, `ext/page.js`, `ext/Chat/` (Composer.js, Mic, Chat.css — named ask),
   `ext/Classify/` (named ask), `framework/page.js`. `Chat` and `Classify` are what
   `ai2/compose.js` and `public/app.js` (group 3) import.
9. **ux modules** — `ux/Content/structure/*`, `ux/Dictate/*` (+ untracked `demo/`,
   `doc/handover.md`, `playground/` — `playground/Playground.js` is imported by `Dictate/page.js`).
10. **research + sources** — `public/framework/research/harness/`, `public/framework/sources/`.
11. **ai task/card logs** — the rest of `public/framework/ai/`: every dated task dir
    (`2026-08-12`, `2026-08-13`, `2026-09-24`, `2026-09-25`, `2026-09-28`), the numeric card tree
    (`2026/09/…`), `board.jsonl`, `usage.jsonl`, `handover.md`, `page.js`/`page.jsonl` files,
    `v/3/board.jsonl`, `audits/`, `cand.txt`, `cards.jsonl`, `council/`, `handoff2*.md`, `todo.md`.

No secrets found in anything above (`sk-`, `ANTHROPIC_`, `OPENROUTER`, real `Bearer <token>`
checked; only innocuous word-substring hits like "task-" or "risk-").
