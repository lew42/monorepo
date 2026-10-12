verdict: pass
1. [note] The six mic rows read "#1 idle … #6 idle" with no word for which surface each is on (the ✦ sheet, the drawer, the demo), so a newcomer can't tell them apart (requirement 3, words 2). shots/…Dictate-live/1920.png, tree band. live/readme.md names this as an open gap.
2. [note] No shot reaches far enough down the Live tab to show the class cards' METHODS list. "The class view lists its methods" (requirement 3) is claimed by `inspect(Klass)` but not proven by a picture. The 1920 shot cuts off inside the Dictate card's PROPERTIES list.
3. [note] On the Overview tab, `whisper: answering` is earned by the health check (`/` returned ok), not by a real transcription. The owner's example asked for "answering only after a real reply". doc/status-signals.md states this choice plainly; the alternative is a word like "reachable" until the first `/inference` succeeds.
4. [note] floor.js → Floor.js changes only the letter case, and this checkout is Windows (case-insensitive). Confirm after the merge that `git ls-files` lists `Floor.js` and not `floor.js`, or every import breaks on the static host, which is case-sensitive. Comments in Servex/agents/Assistant.js:128 and Sessions.js:205 still name `floor.js`.
5. [note] At 400 the seven tabs wrap to two rows (layout.json tab_rows 2 at 400, on all three pages). live/readme.md records this as an ext/tabs trade-off.
6. [note] At 3440 the Live page uses a narrow strip and leaves 79% of the screen empty (sheet.png, 3440). The two columns sit together as intended, but the tree could take more of the width.

Widths given: 400, 1200, 1920, 3440 for /framework/ux/Dictate/, /demo/ and /live/.

## Requirements
- 1 "Every status word is earned" — yes — doc/status-signals.md has a table with every stage, each word and the event that earns it; `retrying N` reads the socket's own counter; `—` replaces any guess; the new Socket open/close events redraw the line live. shots/…Dictate/1920.png shows "mic: idle · socket: connected · whisper: answering · session: none · assistants: —" (see note 3 for "answering").
- 2 "Dictate as objects" — yes — the module object in floor.js became `class Floor` in Floor.js (same methods and default export); chat.js's loose state moved to `class ChatController` (ChatController.js); folder, file and class names match. All importers in the diff were updated (see note 4).
- 3 "A Live tab … nested icon items … key properties … updating live; class view lists its methods; reuse ext/Doc's piece; weights" — yes, with notes — it reuses `item()` and `inspect()` (law 6). The tree goes Dictate system → mics / floor / chat sessions; a `Klass.weights` order list sits on each class; it redraws every second and keeps open rows open. Methods are not visible in any shot (note 2). shots/…Dictate-live/1920.png.
- 4 "Prove: headless load → reload, screenshot of Live with real states; console trail matches" — yes — shots/live-tree-1920.png, overview-after-reload-1920.png and overview-status-line-1920.png; doc/status-signals.md lists the trail order and cites task.jsonl. I did not re-run the trail myself.
- 5 "Worktree → check_page → merge.mjs" — n/a — this review is the gate before the merge.

## Page structure
- page 1 (title says what it is) — yes — …Dictate-live/1920.png: "Live", then a lead sentence in bold: "What is actually running right now".
- page 2 (shown before told) — yes — the live tree sits in the first screen at 1920 and 400.
- page 3 (one takeaway) — yes — "these are the real running objects".
- page 4 (detail nested) — yes — instance properties sit inside closed rows (Floor is open by default); the readme is folded into a details block at the bottom.
- page 5 (reached from its parent) — yes — the LIVE tab and the sidebar entry "Live" under Dictate.

## Navigation
- nav 1 — tabs, a sidebar
- nav (tabs fit one row) — no at 400, yes at 1200 and up — layout.json tab_rows 2 at 400, 1 at 1200 (note 5).
- nav (current place marked) — yes — the LIVE tab is underlined and "Live" is highlighted in the sidebar (…live/1920.png).
- nav (routed) — yes — /framework/ux/Dictate/live/ is its own URL (layout.json url).

## Layout
- layout 1 (right kind for the content) — yes — "doc" layout; the tree and the class cards side by side on wide screens, stacked at 400 (…live/400.png).
- layout 2 (columns related, not drifting apart) — yes — both columns are `0 1` flex, so at 3440 they stay together (sheet.png).
- layout 3 (uses the screen) — partly — at 3440, 79% of the screen is empty (note 6).

## Sizing
- sizing 1 (text measure) — yes — widest line is 591–713px (layout.json widest_text).
- sizing 2 (no horizontal overflow) — yes — overflow_x false at every width, on all three pages.
- sizing 3 (bands sized to their weight) — yes — title 4–5%, intro 13–20%, tree band ("wide") 207–214% of the screen, which is the content (layout.json bands).

## Wrapping
- wrap 1 (nothing wraps that shouldn't) — mostly — tab_rows 2 at 400 (note 5). The other wraps (drawer-rail-ai 3.2 lines, chatbox-compose-more 2.4, mode-btn 1.7) are site chrome this diff does not touch.
- wrap 2 (columns stack instead of clipping) — yes — at 400 the class cards drop below the tree (…live/400.png).

## Spacing and padding
- spacing 1 (left edges line up) — yes — left_stack: h1 and p both 28 at 400 and 38 at 1200.
- spacing 2 (rhythm between bands) — yes — even gaps between the title, the intro and the tree (…live/1920.png).
- spacing 3 (tree indent readable) — yes — each nesting level indents about 20px (…live/1920.png).

## Colour and contrast
- colour 1 (text contrast) — yes — dark text on the light grey page; property names are in the accent orange, values in dark mono (…live/1920.png, Floor card).
- colour 2 (state not shown by colour alone) — yes — the states are words ("idle", "open").

## Flow
- flow 1 (most important first) — yes — the tree (instances) comes before the class cards, and the readme is last.
- flow 2 (reading order matches visual order) — yes — the tree is on the left, the classes on the right, and at 400 they stack in the same order.

## Words
- words 1 (plain, full sentences) — yes — the intro is two sentences a newcomer can follow.
- words 2 (names can't be misread) — partly — "#1 idle … #6 idle" can't be told apart (note 1); "API first" is jargon a new coder may not know.
- words 3 (no minimal speak) — yes — the status line words are spelled out ("not reachable", "retrying 1").
