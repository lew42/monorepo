# Plan: the AI page becomes the AI 2 inbox

![the target](plan.png)

**Before:** [AI 2 at 1920](shots/before-ai2-1920.png) has the inbox; [AI at 1920](shots/before-ai-1920.png) has only a placeholder.

**The idea in one line:** the AI 2 inbox becomes a class, `InboxRail`. The AI page's Inbox tab and AI 2 both use it, so nothing is copied and AI 2 keeps working as v1.

## Five small merges, in order

Each one is smoke-tested (`merge.mjs`) and screenshot-checked at 400 and 1920. AI 2 is shot before and after every merge; any difference is a regression and blocks the merge.

1. **`core/Page/ext/`: the extension system** (light, now). A page.jsonl line `{"ext": "Inbox"}` loads `core/Page/ext/Inbox/` and calls its `setup(page)`, the way `Server.use(Plugin)` does. Hooks are events on the page: `line` (each page.jsonl line) and `render`. The drawer's page inbox (`ext/drawer/inbox.js`) moves into `core/Page/ext/Inbox/`; the old file re-exports it. A message is `{"inbox": {type, author, text, at}}`; the older `from` still reads as `author`.
1b. **Path modules become extensions** (after 1, Sonnet). Modules that add a sub-path under any page (the Markdown routes `core/Page/Markdown.js`, the path AI `core/Page/ai/`, dynamic routes `core/Page/dynamic/`, the editor workspace `core/Page/make/` or `/edit`) are listed on the core/Page pages as extensions: the path each adds and where it saves. The cheap ones move onto `core/Page/ext/`; the rest are documented, with the seam named.
2. **`InboxRail`, the base class** (heavy, after 4:50). AI 2's `board()` closure becomes a class whose parts are methods: the head, the filters (Needs you, search, notes, archived), the rows, the pill, the detail and sub columns. `AIRail extends InboxRail` adds the usage meters, "+ New card" and auto-transcribe. AI 2 switches to `AIRail`, and must look identical.
   The rail's CSS moves out of `ai2.css` into a ux block, `ux/Inbox/`, so the AI page never loads `ai2.css` and needs no `ai.css`.
   **A row is the page preview, the detail is the page's main view** (the owner, 2026-09-30): a row is drawn by the same `page.preview()` the page system uses for comments, tasks and cards, not an inbox-only row. The rail is a **flush stack** (the name in [rules.md](/framework/design/layout/doc/rules.md)): no padding, no gaps, rows touching, one box with only its outer corners rounded. It is **persistent navigation**: it can be resized, it stays put, and a click swaps only the detail, so nothing in the rail jumps or re-renders.
   **AI 2 froze for about 13 s on load** (the owner, 2026-09-30). Minion ai2-hang finds the cause and fixes it in AI 2 first ([ai2-hang/](ai2-hang/requirements.md)); `InboxRail` must not carry the stall over.
2b. **Only what matters reaches the Inbox** (the owner, 2026-09-30). Every row gets a score from one written rule (`ai2/needs-rule.js`); 50 and up means the owner must act. A priority filter at the top of the rail, default 50: the Inbox is the rail at 50, the Log is the same rail at 0. A stalled ask drops below 50 (Servex revives the quiet agent; the owner has nothing to do) and reads as a plain line: what was asked, who owns it, how long it has been quiet. Minion `priority` ([brief](priority/requirements.md)) does the scoring, in parallel with the rail minion, which builds the filter.
3. **The Inbox tab on /framework/ai/** (heavy). The tab mounts `AIRail`. Cards open at their real address, `/framework/ai/2026/09/30/<card>/`, beside the rail. Live, sub-cards, read/unread, archive, auto-resolve, search and the Needs you filter all come with the class.
4. **The Log tab, same UI** (after 3). `LogRail extends InboxRail`: one row per task with its status dot; a click opens the task beside the rail. Tabs: Inbox · Log · System.
5. **A card shows what it is about** (after 4). The first refined-prompt card, posted by hand on [Now: one inbox everywhere](/framework/ai2/2026/09/30/now-one-inbox-everywhere-and-refined-pro/); a card's body previews the page it references (`#Page`, `/path`). The Servex prompt hook and Refine belong to mastermind-servex-9.

6. **Every system gets its own inbox** (after 3, and after the system page template lands: the `System` class from [ui-system](../ui-system/requirements.md), queued after tonight's 10 PM reset; the seam is written into its task.jsonl — the tab is theirs to place, the rail is ours). Each system page (ai, design, code, ui) turns on `{"ext": "Inbox"}` in its page.jsonl and shows an Inbox tab drawn by `InboxRail`, so messaging a system is one appended line.
7. **No `ai2.css`** (last). What is left of it (card bodies, the overview) moves into ui/ux blocks; AI 2 imports those blocks, so it still looks the same, and `ai2.css` is deleted. Page CSS keeps only overrides.

## Who builds

- Merge 1: one Sonnet minion, now. Merge 1b: one Sonnet minion, right after it, in the same worktree.
- Merges 2 and 3: one Opus minion in one worktree (the refactor is the risky part; it is judged by a pixel check of AI 2).
- Merges 4 and 5: one Sonnet minion, after 3 lands.
- Merges 6 and 7: one Opus minion, after 5 (6 waits on the system page template).

## Not now

Storage stays as it is: cards keep their date folders (`ai/2026/09/30/<card>/`), which keep each folder small enough to read one at a time. mastermind-servex's storage proposal owns any change.


AI 2 is not redirected. It stays as v1 until the owner approves the move.

**Merge 6 seam (mastermind-servex-9, 2026-09-30):** `core/System` (extends ext/Doc, from worktree/ui-system) gives a page with `{"ext":"Inbox"}` an Inbox tab. Until `InboxRail` exists, that tab shows `page.inbox` as a plain list. Merge 6 swaps `InboxRail` into System's inbox-tab method. The tab slot belongs to ui-system, and the rail belongs to us. Merge 6 no longer waits on anyone.

**Item 9 seam (one-dictation, 2026-09-30):** a smart refinement is a `{chat:{…, from:{kind:"assistant",id:"smart"}, card, level, re}}` line. Their `Sessions.js` also appends the same line to the selected card through `cards.append`. Merge 5 makes the card body draw those lines: `summary` and `edit` are the card's points, and `clean` folds under them.

## Paused 2026-10-01 (weekly pacing stop from vscode-mastermind). Resume here.

Live in michael/dev: merge 1 (f37c0923, the rail class), merges 2+3 (e7027021, /framework/ai/ opens on the inbox with Inbox · Log · System), the System tab's "Who starts the agents" (3685013c).

Next, in order:
1. **Merge 5, card bodies show the refined dictation.** Not started: minion-rail (session 17f73622-0d6e-4137-9753-f84ff1f4ef28) landed its rail task before the merge 5 message reached it. The worktree is clean at f610afdb. Brief: rail/requirements.md, "Next: merge 5". Wake minion-rail with send_to_agent revive:true (it keeps its context) or spawn a fresh minion on that brief, build, then review.mjs, the four widths, and merge. Then post the example card's lines by hand (ask 7).
2. **Merge 6, every System gets an Inbox tab.** This waits for core/System (worktree/ui-system 4adf0a6d, not yet in michael/dev). Swap InboxRail into System's inbox tab (System.js `inbox_section`).
3. **Merge 7, no ai2.css.** It is at 1,993 lines; move what remains into ux/Inbox or rail.css.
4. **Landing:** docs, the Sonnet docs-check, review.mjs, the documentation skill, finish-task, release topics, stop minion-rail, `worktree-down inbox-ext` (this also stops its server on :51490), and post "Landed" on the card.

Known traps: merge.mjs refuses while tracked edits sit uncommitted in the worktree (park them on a side branch, never git stash). Don't name all-tasks/ in a worktree smoke. The worktree's .worktrees.json entry was re-added by hand.


## Next after merge 7: tabs are detected, not hand-listed (vscode-mastermind relaying the owner, 2026-10-01)

- Drop the hand-written `TABS` array in `ai/overview.js`.
- Derive the tabs from the page's own index: the `{"file": "x/page.jsonl"}` lines in `ai/page.jsonl`, plus the page.js children.
- Keep only the children that declare `{"settings": {"tab": true}}` in their own page.jsonl. This keeps the 40+ date folders out.
- Order by the child's `weight` (default 1), with Inbox pinned first.
- This stays "declared, not crawled", because the watcher or the create-file tool writes the index.
- Document it on the System tab.
