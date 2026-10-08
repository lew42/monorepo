# Minion brief: the rail becomes a class; the AI page's Inbox tab uses it

Load the `minion` skill first, then `code`, `layout` and `navigation`. Parent: task-mastermind-inbox-ext. Task dir: `public/framework/ai/2026-09-30/inbox-ext/` — read its `requirements.md` (asks 3 to 6 are yours), `owner-words.md` and `plan.md` (the picture is the target) before anything.

## The owner's words (verbatim, the part that is yours)

> let's merge or move the AI2 inbox which is the default tab to the AI, the new AI pages. Let's make it an inbox tab.

> The AI, the current AI2 inbox page has a custom preview rail that has these uh, usage meters on it, and so we don't need that. We don't need the AI usage meters on the inbox for every single page. So ... we need a way to override the rail and customize it, and that shouldn't actually be hard by just you know using object oriented overrides to have a base sidebar ... template and then you override it and you add a uh, uh, the progress bars above it or whatever.

> in terms of getting the a current AI page to look more like the AI2 dashboard. That should be a priority.

> it is a navigation. It's a, uh, a persistent navigation, resizing that little rail You know, it shouldn't jump when you click on an item.

**The rail is persistent navigation.** It is resizable (the grip) and it stays put. A click on a row swaps only the detail column, so nothing in the rail re-renders, scrolls or shifts. Prove it: record each row's `getBoundingClientRect()` and the rail's `scrollTop` before and after a click (and a sub-card click), and show that nothing moved and the row element is the same node. Build it into `InboxRail`, so every subclass gets it.

**Speed:** AI 2 froze for about 13 s on load (minion ai2-hang is fixing it; read `../ai2-hang/profile.md` first). `InboxRail` must not carry that cost. Show the first rows within 2 s and keep main-thread lag under 200 ms once the page settles; use the probe `../ai2-hang/probe.mjs` on `/framework/ai/` and `/framework/ai2/`.

**Before you start,** merge `michael/dev` into the worktree branch: it has 9ecda14e (the unread dot is a dot again, no longer an 8×38 oval), and the dot must stay a dot in `ux/Inbox/`.

> it is a navigation. It's a, uh, a persistent navigation, resizing that little rail You know, it shouldn't jump when you click on an item.

**The rail is persistent navigation.** It is resizable (the grip) and it stays put. A click on a row swaps only the detail column, so nothing in the rail re-renders, scrolls or shifts. Prove it: record each row's `getBoundingClientRect()` and the rail's `scrollTop` before and after a click (and a sub-card click), and show that nothing moved and the row element is the same node. Build it into `InboxRail`, so every subclass gets it.

**Speed:** AI 2 froze for about 13 s on load (minion ai2-hang is fixing it; read `../ai2-hang/profile.md` first). `InboxRail` must not carry that cost. Show the first rows within 2 s and keep main-thread lag under 200 ms once the page settles; use the probe `../ai2-hang/probe.mjs` on `/framework/ai/` and `/framework/ai2/`.

**Before you start,** merge `michael/dev` into the worktree branch: it has 9ecda14e (the unread dot is a dot again, no longer an 8×38 oval), and the dot must stay a dot in `ux/Inbox/`.

> it is a navigation. It's a, uh, a persistent navigation, resizing that little rail You know, it shouldn't jump when you click on an item.

**The rail is persistent navigation.** It is resizable (the grip) and it stays put. A click on a row swaps only the detail column, so nothing in the rail re-renders, scrolls or shifts. Prove it: record each row's `getBoundingClientRect()` and the rail's `scrollTop` before and after a click (and a sub-card click), and show that nothing moved and the row element is the same node. Build it into `InboxRail`, so every subclass gets it.

**Speed:** AI 2 froze for about 13 s on load (minion ai2-hang is fixing it; read `../ai2-hang/profile.md` first). `InboxRail` must not carry that cost. Show the first rows within 2 s and keep main-thread lag under 200 ms once the page settles; use the probe `../ai2-hang/probe.mjs` on `/framework/ai/` and `/framework/ai2/`.

**Before you start,** merge `michael/dev` into the worktree branch: it has 9ecda14e (the unread dot is a dot again, no longer an 8×38 oval), and the dot must stay a dot in `ux/Inbox/`.

> it is a navigation. It's a, uh, a persistent navigation, resizing that little rail You know, it shouldn't jump when you click on an item.

**The rail is persistent navigation.** It is resizable (the grip) and it stays put. A click on a row swaps only the detail column, so nothing in the rail re-renders, scrolls or shifts. Prove it: record each row's `getBoundingClientRect()` and the rail's `scrollTop` before and after a click (and a sub-card click), and show that nothing moved and the row element is the same node. Build it into `InboxRail`, so every subclass gets it.

**Speed:** AI 2 froze for about 13 s on load (minion ai2-hang is fixing it; read `../ai2-hang/profile.md` first). `InboxRail` must not carry that cost. Show the first rows within 2 s and keep main-thread lag under 200 ms once the page settles; use the probe `../ai2-hang/probe.mjs` on `/framework/ai/` and `/framework/ai2/`.

**Before you start,** merge `michael/dev` into the worktree branch: it has 9ecda14e (the unread dot is a dot again, no longer an 8×38 oval), and the dot must stay a dot in `ux/Inbox/`.

> it is a navigation. It's a, uh, a persistent navigation, resizing that little rail You know, it shouldn't jump when you click on an item.

**The rail is persistent navigation.** It is resizable (the grip) and it stays put. A click on a row swaps only the detail column, so nothing in the rail re-renders, scrolls or shifts. Prove it: record each row's `getBoundingClientRect()` and the rail's `scrollTop` before and after a click (and a sub-card click), and show that nothing moved and the row element is the same node. Build it into `InboxRail`, so every subclass gets it.

**Speed:** AI 2 froze for about 13 s on load (minion ai2-hang is fixing it; read `../ai2-hang/profile.md` first). `InboxRail` must not carry that cost. Show the first rows within 2 s and keep main-thread lag under 200 ms once the page settles; use the probe `../ai2-hang/probe.mjs` on `/framework/ai/` and `/framework/ai2/`.

**Before you start,** merge `michael/dev` into the worktree branch: it has 9ecda14e (the unread dot is a dot again, no longer an 8×38 oval), and the dot must stay a dot in `ux/Inbox/`.

> it is a navigation. It's a, uh, a persistent navigation, resizing that little rail You know, it shouldn't jump when you click on an item.

**The rail is persistent navigation.** It is resizable (the grip) and it stays put. A click on a row swaps only the detail column, so nothing in the rail re-renders, scrolls or shifts. Prove it: record each row's `getBoundingClientRect()` and the rail's `scrollTop` before and after a click (and a sub-card click), and show that nothing moved and the row element is the same node. Build it into `InboxRail`, so every subclass gets it.

**Speed:** AI 2 froze for about 13 s on load (minion ai2-hang is fixing it; read `../ai2-hang/profile.md` first). `InboxRail` must not carry that cost. Show the first rows within 2 s and keep main-thread lag under 200 ms once the page settles; use the probe `../ai2-hang/probe.mjs` on `/framework/ai/` and `/framework/ai2/`.

**Before you start,** merge `michael/dev` into the worktree branch: it has 9ecda14e (the unread dot is a dot again, no longer an 8×38 oval), and the dot must stay a dot in `ux/Inbox/`.

> it is a navigation. It's a, uh, a persistent navigation, resizing that little rail You know, it shouldn't jump when you click on an item.

**The rail is persistent navigation.** It is resizable (the grip) and it stays put. A click on a row swaps only the detail column, so nothing in the rail re-renders, scrolls or shifts. Prove it: record each row's `getBoundingClientRect()` and the rail's `scrollTop` before and after a click (and a sub-card click), and show that nothing moved and the row element is the same node. Build it into `InboxRail`, so every subclass gets it.

**Speed:** AI 2 froze for about 13 s on load (minion ai2-hang is fixing it; read `../ai2-hang/profile.md` first). `InboxRail` must not carry that cost. Show the first rows within 2 s and keep main-thread lag under 200 ms once the page settles; use the probe `../ai2-hang/probe.mjs` on `/framework/ai/` and `/framework/ai2/`.

**Before you start,** merge `michael/dev` into the worktree branch: it has 9ecda14e (the unread dot is a dot again, no longer an 8×38 oval), and the dot must stay a dot in `ux/Inbox/`.

> it is a navigation. It's a, uh, a persistent navigation, resizing that little rail You know, it shouldn't jump when you click on an item.

**The rail is persistent navigation.** It is resizable (the grip) and it stays put. A click on a row swaps only the detail column, so nothing in the rail re-renders, scrolls or shifts. Prove it: record each row's `getBoundingClientRect()` and the rail's `scrollTop` before and after a click (and a sub-card click), and show that nothing moved and the row element is the same node. Build it into `InboxRail`, so every subclass gets it.

**Speed:** AI 2 froze for about 13 s on load (minion ai2-hang is fixing it; read `../ai2-hang/profile.md` first). `InboxRail` must not carry that cost. Show the first rows within 2 s and keep main-thread lag under 200 ms once the page settles; use the probe `../ai2-hang/probe.mjs` on `/framework/ai/` and `/framework/ai2/`.

**Before you start,** merge `michael/dev` into the worktree branch: it has 9ecda14e (the unread dot is a dot again, no longer an 8×38 oval), and the dot must stay a dot in `ux/Inbox/`.

> it is a navigation. It's a, uh, a persistent navigation, resizing that little rail You know, it shouldn't jump when you click on an item.

**The rail is persistent navigation.** It is resizable (the grip) and it stays put. A click on a row swaps only the detail column, so nothing in the rail re-renders, scrolls or shifts. Prove it: record each row's `getBoundingClientRect()` and the rail's `scrollTop` before and after a click (and a sub-card click), and show that nothing moved and the row element is the same node. Build it into `InboxRail`, so every subclass gets it.

**Speed:** AI 2 froze for about 13 s on load (minion ai2-hang is fixing it; read `../ai2-hang/profile.md` first). `InboxRail` must not carry that cost. Show the first rows within 2 s and keep main-thread lag under 200 ms once the page settles; use the probe `../ai2-hang/probe.mjs` on `/framework/ai/` and `/framework/ai2/`.

**Before you start,** merge `michael/dev` into the worktree branch: it has 9ecda14e (the unread dot is a dot again, no longer an 8×38 oval), and the dot must stay a dot in `ux/Inbox/`.

And from the mastermind's brief: keep every feature (the sidebar on click, read/unread, archive, auto-resolve, search, Needs you as a filter, the Log in the same UI), and **never regress AI 2**: it stays as v1 until the owner approves.

## Where you work

Worktree `C:\Code\lew42\worktrees\inbox-ext` (branch `worktree/inbox-ext`, server http://localhost:51490/). It already holds merge 1 (`core/Page/ext/`, the Inbox extension). Commit after each finished piece. Don't merge; I merge.

## Deliverables, in order (commit each)

0. **Shots first.** Before any edit, shoot `/framework/ai2/` and `/framework/ai2/2026/09/30/now-one-inbox-everywhere-and-refined-pro/` at 400 and 1920 on the worktree server (headless Playwright, `windowsHide: true`) into `rail/shots/before-*.png`. Every later AI 2 shot is compared to these. A difference you can't explain is a regression and must be fixed before you go on.
1. **`InboxRail`, the base class.** AI 2's `board(page)` closure in `ai2/page.js` (lines ~203–990) becomes a class whose parts are methods (house style: assign-based, every method a seam, parts as static subclasses; see the `code` skill): the head, the filters (Needs you chip, search, notes, archived), the rows and their order, the "N updated" pill, the detail column (`page.$pages`), the sub column (`page.$sub`), the grip. The rows' source is a method a subclass overrides. Put the generic base in `core/Page/ext/Inbox/Rail.js` if its ai2 imports can become overridable methods; if a dependency truly can't move yet, keep the base in `ai2/rail.js` and write why in one line in the file and in your log.
2. **`AIRail extends InboxRail`** (`ai2/rail.js`): adds the usage meters (`usage_head`), "+ New card", auto-transcribe, Live, the focus-follow. The meters exist ONLY here. `ai2/page.js` now builds `new AIRail(...)` instead of calling `board()`, and AI 2 looks and behaves exactly as before (step 0's shots, plus: open a card, open a sub-card, tick Needs you, search, archive a row, read/unread).
3. **The Inbox tab on `/framework/ai/`.** Today it is a placeholder (`ai/overview.js` `tab_page`, `ai/page.js` `content()`). Make the default tab mount `AIRail`, full width (`bleed`, like AI 2), with the page title and the tab strip above it as AI 2 has them. A card opens beside the rail at its REAL address, `/framework/ai/2026/09/30/<card>/` (the card folders already live there on disk): replace the year pass-through in `ai/page.js route()` with the same `Card.Folder({shell})` AI 2 uses, and route `live/` the same way. The System tab and every old url (`/framework/ai/system/`, `overview/`, `skills/`, dates, `log/`, `effort/`, the concept pages, `?v1`) keep working. A reload on a card url lands on the same card with the rail beside it.
4. **Proof.** At 400 and 1920 (and read the shots yourself, in bands): `/framework/ai/` (rail + Live), a card opened from the rail, a sub-card, the Needs you filter on, a search; `/framework/ai/system/`; AI 2 again vs step 0. Zero console errors and zero failed requests on `/framework/ai/`, a card url, `/framework/ai/system/`, `/framework/ai2/`, `/framework/`. Run `node Server/layout-check.mjs <urls> --widths 400,1920` from the worktree. Shots in `rail/shots/`.

## Fence

`ai2/page.js`, `ai2/rail.js` (new), `ai2/ai2.css` (only if a class moved), `core/Page/ext/Inbox/Rail.js` (new) and its readme, `ai/page.js`, `ai/overview.js`, `ai/ai.css` if it exists. Nothing in Servex, `core/Page/*.js`, or other ai2 files unless one import line must change — say so in your log.

## Rules

`windowsHide: true` on every process; stop every server you start except the worktree's own. Log each step and decision in your task.jsonl. If you hit something only the owner can decide, message me and keep going on the rest. When done, message task-mastermind-inbox-ext: commits, the shots, what's left. No cap: do it right, not fast.


## What changed since this brief was written (read this before deliverable 0)

Merged into michael/dev as fc6f256e, and your worktree is already up to date (skip the "merge michael/dev" step):
- The freeze fix (`ai2-hang/profile.md`), × that archives, and the pinned **Now** card at `/framework/ai2/now/` and `/framework/ai/now/` (ai/page.js already has a `now` route case; keep it).
- **INBOX ZERO replaces "50 and up"** (the owner, 2026-09-30): the Inbox shows rows scoring **≥ 90**, and scores decay with age (`needs-rule.js`). AI 2's `page.js` already has the floor (`min_score`, `?min=`, default 90; `floored()`; group and page rows obey it) and **Clear all**. Deliverable 3b is therefore a MOVE: those go into `InboxRail` as methods, default 90, not 50.
- **Law 6 of CLAUDE.md (new): one of everything.** The AI page and AI 2 draw the same rail from the same class. No copy.

## Added: the Log in the same UI (the owner, 2026-09-30, via vscode-mastermind)

5. **The Log tab** on `/framework/ai/` is the same rail at `?min=0`: every row, newest first, the same flush stack, the same detail column. Build it as a subclass or a setting of `InboxRail`, not a second list. The tabs read Inbox · Log · System. The old `log/` url keeps working.
6. **Needs you stays a filter** on the rail (the chip), not a separate tab, on both pages.

Report each finished deliverable to me as you commit it, so I can merge in pieces: first AIRail with AI 2 unchanged (1, 2, 2b), then the AI page's Inbox tab (3, 3b), then the Log (5).

## Next: merge 5, a card body shows the refined dictation (asks 7 and 9)

The owner's words are asks 7 and 9 in [../requirements.md](../requirements.md): "Chat and card are ONE content model". The sidebar is chat mode (informal); the card is page mode (the refined, final points). The flow runs right to left: while a card is selected and the owner dictates, the refinement is written into that card's page.jsonl.

The Servex side has landed (49f93b37, live after the next Servex restart). It appends one line per refinement to the selected card's page.jsonl:
`{"chat":{"at","session","path","from":{"kind":"assistant","id":"smart"},"via","text","card","level":"clean"|"edit"|"summary","re"}}`

Deliverables:
1. The card's detail view (the one a rail row opens, on /framework/ai/ and /framework/ai2/) draws these lines at the top of its body. `summary` and `edit` lines are the card's points, newest first. `clean` lines fold under them in a closed `details` ("what was said, cleaned up"). A card with none of these lines looks exactly as it does today.
2. One drawing, not two (law 6): if the card page already draws `chat` lines anywhere, extend that; don't add a second renderer.
3. Prove it with a fixture: append three lines (one of each level) to a throwaway card in the WORKTREE only, shoot it at 400 and 1920, then remove the fixture. Never write to a real card's page.jsonl in the main tree.
4. The example card for ask 7 is `/framework/ai2/2026/09/30/now-one-inbox-everywhere-and-refined-pro/` (empty). Note in your report what lines it would need; the mastermind posts them by hand after the merge.

Commit when it works, and say the commit id. Merge 6 (each System's Inbox tab uses InboxRail) waits until `core/System` lands from worktree/ui-system.
