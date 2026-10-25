# Chat v2: update in place, never redraw

Budget: $5. Load the `minion` skill first, then `code`. Your parent is `mastermind-chat-v2`. The owner's raw words are in `public/framework/ai/2026/10/25/dictation-that-never-fails-in-the-browse/`.

## What the owner wants

Chat v2 is a direct picture of the session's data. Every new line (a delta from the item tool) shows at once as a small in-place update: no redraw, no flicker, no jumping. That is the test it has to pass.

## Where things are

- Worktree `C:\Code\lew42\worktrees\chat-v2`, branch `worktree/chat-v2`, served at `http://localhost:61527/`. It is current with michael/dev. Commit there after every working piece; never edit the main tree.
- Code: `public/framework/ext/Chat/v2/`. Read its `readme.md` first, then `ChatV2.js` (the view) and `ChatV2Model.js` (folds lines into `root[]` plus a `by_id` Map).
- Today, `read(entries)` pushes the new lines and calls `draw()`, which rebuilds the whole chat. Replace that.

## Build

1. **`ChatV2Model.apply(line)` returns what it touched**: the item(s) changed or added, and for an add, the parent (null for the root). One small change.
2. **`ChatV2` keeps one element per item id** (a Map from id to element). On each new line, it changes only what the line touched:
   - a new root Prompt is appended at the end;
   - a new child is appended to its parent's nest (a root Question with `from` goes to that prompt's nest);
   - a change to an item re-renders only that item's own element, replacing it in place (or patching its text). Its siblings, its parent's other children and every other prompt keep their DOM objects.
   - The open "show raw" set still survives. The first load may still draw everything at once.
3. **The test** (extend `ChatV2.test.mjs`, keeping its 19 checks):
   - Load the live copy of the fixture, scroll to the middle, and store references to every `[data-id]` element on `window`.
   - Append one line of each kind: a paragraph append, a reply add, a child task state change, a question answer, a title set on the second prompt, a new child task, and a new root prompt.
   - After each one, assert three things. Every element not touched by that line is still the same object (`===`) and still connected. The touched element shows the new text. `scrollY` (and the chat scroller's `scrollTop`, if it has one) is unchanged.
   - Report the pass count.
4. **Write the design decision into `ext/Chat/v2/readme.md`** under Decisions, in two or three sentences: one element per id, what gets replaced on a change and why, and the alternative (a keyed diff of the whole tree) with when it would win.

## Rules

- `node --check` every JS file. From the main repo root, run `MSYS_NO_PATHCONV=1 node Server/smoke.mjs C:/Code/lew42/worktrees/chat-v2 /framework/ext/Chat/v2/`; it must show no FAIL.
- Never kill or restart the dev server or Servex, never drive the owner's tabs (headless only), follow the minion skill's never-list (no stashing; diff instead).
- Every spawned process sets `windowsHide: true`.
- Log progress as `log` lines in `session.jsonl` in this folder, using `node .claude/hooks/append.mjs <file> <lines.json>`.
- Don't merge: your parent reviews and merges.

## Deliverable

Committed on `worktree/chat-v2`. Your last message is one screen: what changed, the commit, the test pass count, and any decision with its alternative.
