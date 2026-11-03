verdict: fix
1. [fix] `ext/Chat/doc/Composer-notes.md` lists every composer hook (`on_live`, `on_send_start`, …) but not the new `on_out`, and `ext/Chat/doc/mic-notes.md`'s `## post_held` section doesn't mention `take_out()` or the `at` that the send now carries. A fresh agent reading the Chat docs won't learn how sent words reach the screen (readme/doc gap: Composer.js and Mic.js both changed).
2. [fix] `ext/Chat/doc/notes.md:69` says `patch_piece()` "redraw[s] its bubble". After this diff it swaps only that piece's node, and redraws the whole bubble only when the bubble is refined or the node is missing. The doc is stale on exactly the behaviour the fix depends on.
3. [note] Polish item 3 asked for the `.catch` in `post_held` to be removed. The minion kept it, because `ChatPanel`'s own deliver can throw, and removed only the duplicate Sent-row write. The reason is given in the code and in commit f4c0d7eec. This is a justified departure (law 4), not a miss.
4. [note] The fix covers the dictation `Widget` only. `ext/Chat/ChatPanel.js` uses the same composer without `on_out`, so its chat can still flicker. This is recorded in `doc/flicker.md` under "Not covered yet", but no task or ask was filed for it.
5. [note] The sent words are drawn in the faded "raw" look: grey text on the peach bubble, `shots/after-clean-030.png`, roughly 3:1. They are readable, but fainter than settled text.
6. [note] Polish items 4 and 5 in `polish/requirements.md` are the same ask written twice. It was done once, which is correct.

Widths given: 400, 1200, 1920 and 3440 for `/framework/ux/Dictate/surfaces/` (the only page shot), plus the minion's own burst at 400 and Debug shots at 390 and 1920.

## Requirements
- 1 "Reproduce the flicker first… Find which step removes text… Record each step's timing on the Debug tab rows" — yes — `doc/flicker.md` "What was wrong" names three steps (`send_screen` empties the draft and then waits; `submit_entry` drops the live draft; a redraw puts the draft first). `shots/before-clean-030.png` shows the empty chat. The timings are on the Sent row ("on screen at once, sent 1.1 s later…, Servex took it in 3.0 s", `after-clean.json` `sent_row`) and on the AI row ("2.3 s after the send", `polish-debug-390.png`).
- 2 "each word appears in place in the chat bubble, as if already sent… never by clearing and redrawing the bubble" — yes — `take_out` → `on_out` → `show_out` draws the piece in the draft's spot in the same tick, and `patch_piece` now swaps one node (`Chat.js:226`). `shots/after-clean-030.png` shows the same moment with the words in place.
- 3 "a burst of shots… two numbers that must agree" — yes — `after-clean.json`: 100 frames, 2 gone = 2 explained, 0 moved. `after-plain.json`: 0 = 0, 0 moved. Before the fix: 22/3/4 and 7/0/2. The frames are in `shots/clean/` and `shots/plain/`.
- 4 "Then the polish list (items 1–4)" — yes — 1: `polish-debug-390.png` shows all five rows at 390×844, asserted in `debug-tab.mjs`. 2: one `ALIASES` map in `AIPage.old_link`, with the other three mappings removed and the old links tested at 390 and 1920. 3: kept with a reason (note 3). 4: the surfaces row shows `drawer-debug-1920.png`, and the wire line is a full sentence (`chat.js:322`).
- Out of scope "chunking… if the fix shows chunking is the cause, say so" — yes — task.jsonl: "Chunking is not the cause (the gap was the send path)".
- Check "stall, deltas, debug-tab must pass" — yes — the task.jsonl evidence says they pass on :50158 (also anchor and in-place), with smoke showing no FAIL. This is not re-run here, since the reviewer does not run the work.
- Report "one screen as outcome" — yes — task.jsonl `assign.outcome` has the cause, the fix, the numbers, the tests and the polish items.
- New class with live instances — n/a — no class was added, only methods (`take_out`, `show_out`, `stamp`).

## Page structure
- page 1 (the title says what it is) — yes — `sheet.png`, every width: "Voice and chat surfaces"
- page 2 (one takeaway, the intro states it) — yes — `1920.png`, band 2: "Nine places talk, show or record…"
- rest of the section — n/a — the diff only changed one row's shot on this page

## Navigation
- techniques — tabs (the Dictate page tab row), a sidebar (the left tree), the drawer (right) and the phone sheet (Debug)
- tabs fit one row — yes — layout.json `tab_rows 1` at every width
- old links still land — yes — `debug-tab.mjs` checks `?drawer=dictation` and `/ai/dictation/` → `/ai/debug/` at 390 and 1920
- picked tab is marked — yes — `polish-debug-390.png`: the "Debug ▾" title

## Layout
- the page uses its layout word — yes — layout.json `layout doc` at every width
- the phone sheet gives the picked tab the room — yes — `polish-debug-390.png`: the chat keeps its last bubble, and all five rows sit above the fold

## Sizing
- no horizontal overflow — yes — layout.json `overflow_x false` at 400, 1200, 1920 and 3440
- line length — yes — `widest_text` is 358, 594, 637 and 716 px
- empty share — yes — 24% to 69% empty, which is the doc column on a wide screen with the drawer docked at 1920 and 3440 (`sheet.png`)

## Wrapping
- title wraps — yes, acceptable — the h1 takes 2 lines at 400 (layout.json `wraps`)
- rail buttons wrap — yes, existing — `drawer-rail-ai` and `drawer-rail-menu` take 3.2 lines at 400; not from this diff
- burst bubble — yes — `after-clean-030.png`: the bubble wraps at its words, with no broken word

## Spacing and padding
- left edge stack — yes — layout.json `left_stack`: 16, 38, 54 and 90 px, rising with width
- Debug rows — yes — `polish-debug-390.png`: even gaps between the five rows

## Colour and contrast
- body text — yes — `1920.png`: dark on light
- sent piece — no (note) — the faded raw look, about 3:1, `after-clean-030.png` (finding 5)
- status dots — yes — `polish-debug-390.png`: green dots, each with a text label

## Flow
- nothing jumps while you dictate — yes — `words_moved 0` in both after runs
- the chat ends with every sentence once, in order — yes — `after-clean.json` `final_words`

## Words
- full sentences — yes — the wire line now ends "It reconnects by itself." (`chat.js:322`)
- `doc/flicker.md` explains the basics first — yes — the rule, then what was wrong (3 numbered steps), the fix, and the proof table
- the readme indexes the new doc and test — yes — `ux/Dictate/readme.md` has "Words vanished and came back?" → `doc/flicker.md` and `test/flicker.mjs`
- module docs current — no — findings 1 and 2 (`Composer-notes.md`, `mic-notes.md` and `notes.md` in ext/Chat)
- can a fresh agent continue from the task folder — yes — `task.jsonl` has the branch, 6 commits, the cause, the numbers and the open ChatPanel gap; `doc/flicker.md` has the rest
