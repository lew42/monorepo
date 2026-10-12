Budget: $10

# session-gate — a session's minions go through a worktree and the gate; a landing checks the owner's words

The owner's words (2026-10-01, `.claude/skills/servex-mastermind/improvements.md`, the last two items): "Voice-session minions edit main directly, with no review … Fix in the session-smart brief and Servex: a session's minions take a pool worktree and land through merge.mjs (smoke test, review, shots) like every task. AND every task's landing review checks the OWNER'S WORDS (owner-words.md, or the session lines that started it) item by item, not just the brief."

## What went wrong (read the evidence first)
`%LOCALAPPDATA%\lew42\servex\registry.json`: `minion-chat-duplicate-messages`, `minion-chat-autoscroll`, `minion-chat-menu-merge`, `minion-context-card-type`, `minion-voice-tts`, `minion-dictate-*` — all `role: minion`, `parent: null`, `cwd: C:\Code\lew42\monorepo` (the MAIN tree), `permission_mode: acceptEdits`. The smart session (`Servex/agents/session-smart.md`) spawned them straight with `spawn_agent`, so they wrote into the live site. By 15:35 the ✦ sheet was broken for the owner.

## Fence
`Servex/agents/Agents.js` (spawn), `Servex/Pool.js` (if a helper is needed), `Servex/agents/session-smart.md`, `Server/on-landing.mjs`, a new `Server/owner-check.mjs`, `Server/doc/on-landing.md` or the existing doc that describes on-landing, tests beside them (`*.test.mjs`), and your own task dir. Nothing under `public/` except your task dir. Do not touch `.claude/skills/*` (say what you'd change there on the card).

## Build
1. **A minion never gets the main tree.** In `Agents.spawn` (around line 127, where `open_task` is called with `worktree_of(spec.cwd)`): when `role` is `minion` and `spec.cwd` is not inside `worktrees/`, take a pool worktree (`this.servex.pool.take(parent-or-spawner id)`), set `spec.cwd` to its path, and record the worktree in the task line (open_task already takes `worktree`). Log one line (`this.say`) saying the minion was moved into `<slot>`. Anyone who wants the main tree on purpose passes `cwd` explicitly to a worktree path? No: main stays refused for minions; a mastermind that needs main does the edit itself (the sub-mastermind skill already says a few-line edit is the mastermind's own). Keep the change under ~25 lines; a test in `Servex/agents/*.test.mjs` with a fake pool proves: minion + no cwd → pool path; minion + worktree cwd → untouched; task-mastermind + no cwd → untouched.
2. **The brief says so.** In `session-smart.md` item 5 ("For new work…"): one added sentence — a session never spawns a `minion` itself; it spawns a `task-mastermind`, which takes a worktree and lands through `node Server/merge.mjs` (smoke test, review, shots at 400 and 1920). If it does spawn a minion anyway, Servex moves it into a pool worktree, and that minion must still merge through `merge.mjs` and say "ready to merge" on its card.
3. **Owner-words check at landing.** New `Server/owner-check.mjs <task dir>`: finds the owner's words — `<task dir>/owner-words.md`, else the nearest ancestor task dir's, else the `session` lines the task's `assign` line 1 points at (a `brief` or `session` field; look at how `Sessions.js` names session files, `public<home>ai/<session>.jsonl`). Splits them into items (numbered lines, bullet lines, else sentences). Spawns ONE fresh Sonnet reviewer inside Servex exactly the way `on-landing.mjs` already spawns the clarity agent (copy that pattern), with the items, the task's landing `outcome`, and `git diff --stat` of the task's merge, asking for one line per item: `done` / `partly` / `missing` + where. Writes `<task dir>/owner-check.md` (a table: item, verdict, evidence) and appends ONE line to the task's task.jsonl through `.claude/hooks/append.mjs`: `{"log":{"msg":"owner-check: N items, D done, P partly, M missing — owner-check.md"}}`. A `missing` item also gets one `card_reply` nag on the task's card, like the doc-check does. Never throws; exit code 0.
4. **Wire it in** `on-landing.mjs` after doc-check. Keep it one function call plus the error line pattern already used there.

## Proof (on the card)
- Test output for item 1 (3 cases).
- `node Server/owner-check.mjs public/framework/ai/2026-09-30/proposal-flow` (it has an `owner-words`-shaped requirements and a landing): show the table it wrote and the one log line.
- `node Server/owner-check.mjs <a task dir with no owner words>` → one "owner-check: no owner words found" line, exit 0.

## How you work
- Load the `minion` skill first, then `code`. Read the readme chain for `Servex/` and `Servex/agents/` and `Server/`.
- `take_worktree` from Servex; work and commit there by exact path. `Server/` and `Servex/` changes are not pages: review size `light` (`node Server/review.mjs <taskdir> <worktree> --size light`), answer every finding with an answer line in the main tree's `<taskdir>/task.jsonl` (`{"review":{"answer":{"n":N,"reply":"fixed: …"}}}` via append.mjs — never typed into review.md), then `MSYS_NO_PATHCONV=1 node Server/merge.mjs <worktree>`. Say "landed <sha>" on the card. A Servex restart is NOT yours; say "needs a Servex restart" on the card.
- Every look is headless. Log only through `node .claude/hooks/append.mjs <task.jsonl> <lines.json>`.
- Report on the card `2026/10/01/process-fixes-session-minions-through-th` (card_reply): two sentences at start, the proof when landed, or if blocked. Nothing else to the mastermind.
