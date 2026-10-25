# Session page: the Timeline tab (step 2b)

Budget: $10. Load the `minion` skill first, then `code` and `page`.

**What the owner asked:** the session page needs "a chronological view: everything in the session's `session.jsonl`, in order" ([../requirements.md](../requirements.md), line 54; the plan is [../plan.md](../plan.md), "2b. Timeline"). The Overview, which ranks work by importance, landed in e2fc11061 ([../overview/](../overview/)). The Timeline is the other view of the same session: what happened, in time order.

## Where

- **Worktree:** `node Server/worktree-up.mjs session-timeline` makes the branch `worktree/session-timeline` and gives you its URL. Commit at every working step. **Don't merge**; the mastermind merges after review.
- **New class:** `public/framework/ai/AISession/SessionTimeline.js` (`class SessionTimeline extends View`), with CSS in `SessionTimeline.css`. Its CSS prefix is `stl-`; add it to `public/framework/styles/css-scopes.txt` under the AISession block, beside `soutline-`.
- **Wiring:** in `AISessionDetail.js`, add `["timeline", "Timeline"]` to `TABS` right after Overview, plus a panel built like `panels.overview`. `?tab=timeline` opens it. Leave every other tab as it is.

## What it draws

- **Rows:** one compact full-width row per event, newest at the bottom, and the panel opens scrolled to the bottom. Each row has a time, an icon and one line of text. Kinds:
  - a **prompt** (its subject; the raw words one click down), read with `PromptLog.read(session_id)`, which the page already uses;
  - **task added** and **task done** (done uses the same green `check_circle` as the Overview's `SessionOutlineView`);
  - **child session started / landed** (name linked with `AICost.session_url`, state, model, and cost via `AICost.cost_line`; never sum costs yourself);
  - **note**, **decision**, **review**;
  - **log** and tag lines.
- **Data:** the session's record, `session.jsonl`, is already streamed by `SessionTasks` (`core/Session/SessionTasks.js`; `AISessionDetail` passes `on_session`). Reuse that tail, or the JSONL lines it reads; don't add a second fetch or poll of the same file. A session with no record shows the prompts alone, or one plain sentence when there is nothing at all.
- **Live:** a new line in the record or the prompt log appears without a reload.
- **Filters ▾:** one button that opens a Popover with a checkbox per kind. By default `log` and tag lines are hidden. Build it exactly like the list header's Filters menu (`AISessionsPage.js` around line 218: `new Popover({anchor, role:"dialog", content}).draw()`, the `sessions-hbtn` button and the `sessions-pop` class) so it looks and behaves the same. Do **not** write a new dropdown widget (Law 6). If the cleanest way is to lift that `pop` helper into one static method both pages call, do it.
- **Phone first:** at 390 px each row fits on one or two lines, with no sideways scroll.

## Small fix on the same page, first

`/framework/ai/sessions/e00f55c9/` (the 8-character short id) hangs on "Reading this session's record…" on the main site, while the full uuid `/framework/ai/sessions/e00f55c9-bad4-4ee2-899e-d629ea1eede6/` works. Make the short id resolve to the full session, or redirect to the full uuid. Reproduce it on current `michael/dev` first.

## Proof (put shots in this folder; findings go in this folder's `session.jsonl` as `log` lines)

- `before-390.png` and `after-390.png` of the full-uuid e00f55c9 page with `?tab=timeline`, plus `after-1920.png`.
- **Two numbers that must agree:** the number of rows drawn with every filter on, and the number of lines in the record plus prompts that your code counted independently, in a node test (`SessionTimeline.test.mjs`) on a small fixture. Keep the row-building logic DOM-free (a static method) so the test can call it.
- The owner's path at 390, a shot at each step: AI → Sessions → e00f55c9 → Timeline tab; then the deputy (`d9c3caec-e496-4199-a0c1-a7bb7c97aa87`) → Timeline.
- Before you report: `node --check` on every edited file, `node Server/smoke.mjs` with no FAIL, and the readme lines updated (`ai/AISession/readme.md` and the "One session" line in `ai/sessions/readme.md`).

## Rules

- Never kill or restart the dev server.
- Never drive the owner's tabs (headless Playwright only, imported from `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`).
- Never `git stash`. Never push.
- Don't touch the Chat or Coverage tabs: the chat is a slot for the shared chat component that mastermind-dictation-2 owns.
- When done, report one screen to `mastermind-sessions-page`: commits, the two numbers, the shot names, and what's left. If the Servex tools are down, write it as the last `log` line in this folder's `session.jsonl`.
