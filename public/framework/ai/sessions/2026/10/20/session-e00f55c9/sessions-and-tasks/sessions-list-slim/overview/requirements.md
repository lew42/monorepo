# Session detail page: the Overview, grouped by prompt (step 2a)

Budget: $10. Load the `minion` skill first, then `code`, `page`, `css`. Sonnet, high effort.

The owner's words: [../requirements.md](../requirements.md), the fourth, fifth, seventh and **eighth** passes (the eighth, 2026-10-25, changes the grouping: read it). The design you build: [../plan.md](../plan.md), section 2, "SessionOutline" and "2a". Read both before anything else; build exactly 2a, nothing from 2b–2d. Log as you go: `log` lines in `session.jsonl` in THIS folder through `node .claude/hooks/append.mjs`.

## The job

On `/framework/ai/sessions/<id>/` the Overview tab today is `SessionFeed` (`public/framework/ai/AISession/SessionFeed.js`, wired in `AISessionDetail.js` around line 185–210): a flat list of every task. Replace it on that tab with:

1. **`public/framework/ai/AISession/SessionOutline.js`**, DOM-free, `class SessionOutline`: input = the replayed Session (`session._tasks`, what `SessionFeed.record(session)` receives), the `SessionWork` tree (`ready` promise, `work.tree`), and the session's `prompts.jsonl` (format: `PromptLog.js`; each prompt has an id and a `subject`). Output = groups `[{kind: "child"|"own", session?, prompt?, tasks: [...], usd, done, total}]`, as in the eighth pass above. The "own" group sub-groups by prompt. Join: a record task's `get_one("source")?.prompt` = prompt id. A record task whose `path` matches a `SessionWork` node gets that node (its rolled cost, its child session `n.session`, model, state). Folder nodes no task points at go in "Other work". **The structure comes from the record** (the deputy, 2026-10-24): Prompt entries in `session.tasks` with their asks nested under them, and every spawn a Session entry under the task that caused it (`children` is the computed view; plan: `../../deputy/session-entries/plan.md`). Those are landing now, so put the `source.prompt` join in ONE method, `SessionOutline.source(session)`, used only when the record has no Prompt entries; switching to the entries must be a one-place change. Ranking exactly as plan.md says (cost × 0.5^(age days ÷ 2) plus recency; and a "newest first" mode). A `node` test beside it (`SessionOutline.test.mjs`) on a small fixture: the join, the "Other work" group, and the ranking order.
2. **`SessionOutlineView.js`** (+ `SessionOutline.css`, class prefix `soutline-`; check `public/framework/styles/css-scopes.txt` per the `new-css-class` rule): the Overview tab draws it. Each group: a heading line (subject, time, "4 of 9 done", cost). Each task: ONE full-width row; title clamps to two lines on a phone; our own state icon (Material `radio_button_unchecked` open, an amber dot running, `check_circle` in `var(--ok)` done, grey struck dropped) — never an `<input type=checkbox>`; the child session on the same row (model · cost · state · link "session →"); subtasks folded under a `details`. Clicking a done task opens its proof in place: `outcome`, `evidence`/`links` as links, `commit`, the child session link. A small "Ranked by cost · newest first" toggle at the top.
3. **No play, pause, stop buttons** anywhere on this page: add an additive option to `public/framework/core/Task/TaskView.js` (`row(t, { verbs: false })` or the existing shape of its options) and use it. Report in your log what those buttons do today (read `Task.can` and the click handler; one line) — the owner asked.
4. **Live:** redraw when the record replays (the same call SessionFeed gets). Keep `SessionFeed.js` in the repo (Board or other callers may use it; grep), just not on the Overview.

**Money:** every dollar figure printed comes from `AICost` (`public/framework/ai/AITask/AICost.js`: `AICost.summary` / `cost_line`, e.g. "$285 this tab · $1054 with children"; check `git log michael/dev -- public/framework/ai/AITask/AICost.js` for the newest, merge `michael/dev` into your branch if the deputy's cost-line work has landed). `SessionWork`'s rolled sum may WEIGHT the ranking but is never printed (it adds older, inflated day snapshots). Other pieces: `TaskView.STAGE` icons as reference, `MobileData.usd` for money format.

## Where

Worktree: `node Server/worktree-up.mjs session-overview` (never plain `git worktree add`; never kill or restart the dev server, never drive the owner's tabs, never `git stash`). Commit at every working step.

## Done means

- First, before any edit: `before-390.png` and `before-1920.png` of `/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/` from the main site (`http://monorepo.localhost/`), saved in this folder.
- After: the same at 390 and 1920 from your worktree, plus one shot with a done task's proof opened. Headless Playwright only (imports as `file:///C:/…`), scripts in your session scratchpad.
- **The owner's path** (seventh pass), headless at 390 from your worktree, a shot at each step: `/framework/ai/` → the Sessions tab → find session `e00f55c9` in the list → click it → the Overview is what opens (no `?tab=`) → click the Coverage/chat tab. Save as `path-1.png` … `path-5.png`; log any step that fails.
- Two numbers that must agree, logged: tasks drawn on the Overview (counting "Other work") = record tasks + unreferenced folder nodes, computed by `SessionOutline` and by a separate count in your test script.
- `node SessionOutline.test.mjs` passes; `node --check` every edited file; `node Server/smoke.mjs` on the page shows no FAIL.
- `public/framework/ai/AISession/readme.md` and `public/framework/ai/sessions/readme.md` ("One session" line): the Overview is SessionOutline, one sentence each.
- Last log line: branch, the two numbers, shot paths, what the play/stop buttons did. Do NOT merge.

Cut first if short: the "newest first" toggle, the proof's commit field.
