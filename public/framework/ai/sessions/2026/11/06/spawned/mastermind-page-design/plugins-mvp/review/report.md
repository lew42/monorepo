verdict: fix
1. [fix] The Count switch does not survive a reload (requirement 5). Its checkbox flips the class-level row (`Badge.enable/disable`), which `PluginEntry.js:75` writes to `Plugin.store`, an in-memory `Map` (`Plugin.js:123`). `save()` only posts `demo.overrides`, which never holds Count. So a reload brings Count back on. The readme's "Watch out" admits the switch is class-level but not that it is lost. Either save Count's state in the same line (for example `{"overrides": …, "sub": {"Badge.Count": false}}`) or write the gap as a `log` line for live-page (per-instance sub-plugin overrides) and say in the readme that this one switch doesn't persist.
2. [fix] Below ~700px the panel stacks **above** the box, not under it (brief: "the panel stacks under the box"). See shots/…-plugins/400.png: the checkbox card comes first and "Live result" second. Also, the wrap comes from `flex: 1 1 16em` ×2, so it happens near 530px, not 700px. Put the box first in source order (or `order`) and set the breakpoint on purpose.
3. [fix] The part-link card on /live/demos/ is not in the diff. It was written straight to the main tree's `public/live/demos/page.jsonl` (line 29, by the item tool), and it points at `./plugins/`, a folder that only exists on `worktree/plugins-mvp`. Until the merge, the main site shows a link that 404s. In the worktree shot (…-live-demos/1200.png), "Plugins" only appears through the automatic PAGES list. Say this in the task log, so the merger knows the card is already live and must not be added twice.
4. [fix] A fresh agent could not tell from the task folder alone that the Count limit (finding 1) and the main-tree card (finding 3) are open. `task.jsonl` has one log line saying "Nothing left undone against the brief". Add both as log lines.
5. [note] `files.jsonl` commits a temp-file entry and its matching `gone` line (`DemoPage.test.mjs.tmp.48704…`). That is noise in an index.
6. [note] The committed `page.jsonl` holds two lines from the minion's headless round trip, stamped `"by":"owner"`. The final state is `{}` so it does no harm, but the owner never made those switches.
7. [note] At 400 the code block wraps its comments mid-phrase ("// this / instance only", shots/…-plugins/400.png, band 5). Shorter comments, or one comment line above each call, would keep each line whole.
8. [note] At 1200 and above, the demo row sits in the standard ~600px column with lots of empty space (`layout.json` empty 0.84 at 1200 and 3440; the `flex` band is `big_empty: true` at both). The "Live result" box is narrow, so `Wide` ("full width") only widens it to its half column, a small change. No shot shows Wide on.
9. [note] A console 404 appears at every width (`layout.json` errors). The resource isn't named; worth one check.
10. [note] The test sets `count_row.up = badge_row` by hand to make `active` read false. That tests a patched state, not the real draw path.

Widths given: 400, 1200, 1920, 3440 for /live/demos/plugins/ and /live/demos/.

## Requirements
- 1 "/live/demos/plugins/, a sub-page of /live/demos/ (add a part-link card)" — partly — the page exists on the worktree; the card is on the main tree only (finding 3)
- 2 "DemoPage extends Plugin, owns one box; don't make Page pluggable" — yes — DemoPage.js is 10 lines; Page.class.js is untouched
- 3 "Border, Badge with sub-plugin Count, Wide off by default; attach/detach undo cleanly" — yes — files in the diff; `DemoPage.use(Border, Badge).available(Wide)`; the test checks each detach
- 4 "Tree panel, nested sub-plugin, greyed while parent is off, Reset" — yes — 400.png and 1200.png show nested Count under Badge and the Reset button; `opacity .5` and `disabled` when `!row.up.active` (page.js); no shot shows Badge off
- 5 "A switch saves one line in the page's own page.jsonl; a reload keeps it; the item tool's line also switches it" — partly — Border/Badge/Wide yes (RecordWriter, falling back to Outbox; `jsonl.live`); Count no (finding 1)
- 6 "Under the panel, the JS a reader would type" — yes — the "What you just did" code block, JS not JSON
- 7 "One-line takeaway at the top" — yes — the bold line under the title, every width
- Mobile first: the panel stacks under the box below ~700px — no — it stacks above, and at ~530px (finding 2)
- Test under 1 s; readme; link from core/Plugin readme — yes — 4 tests, 13 checks (task log); readme.md says where the switch is saved; one "More" line added
- page.js or part-view, say which — yes — page.js, copied from ref/ (the readme says so)
- Live instances of the new class are visible — yes — the demo page itself shows the DemoPage instance and each plugin's state
## Page structure
- page title says what it is — yes — "Plugins", all widths, top band
- one takeaway, first — yes — band 2 (share 0.05)
- detail nested — yes — Readme is folded in a `details`
## Navigation
- techniques — none on the page itself (the site drawer rail at 400, the AI button at 1200+)
- reached from its parent — partly — finding 3
## Layout
- the arrangement fits the content — yes — two cards side by side at 1200+, stacked at 400
- the order fits the task — no — at 400 the result sits under the controls, against the brief (finding 2)
## Sizing
- the main band is sized to its content — partly — 400 `flex` band share 0.444, ink 0.15; at 1200 and 3440 it is `big_empty` (finding 8)
- no horizontal overflow — yes — `overflow_x false` at every width
## Wrapping
- nothing wraps that shouldn't — no — code comments wrap at 400 (finding 7); the rail wraps (`drawer-rail-*` 3.2 lines) belong to site chrome, not this diff
- tab_rows — n/a
## Spacing and padding
- left edge consistent — yes — `left_stack` h1 = p at every width (16/48/65/90)
- card padding even — yes — 1200.png: panel and result cards pad alike
- the box sits loose in its surface — note — 1200.png: the result card is mostly padding around a small box
## Colour and contrast
- text contrast — yes — dark text on white or light grey; light text on the dark code block
- the badge reads — yes — white "1" on the prime colour, 1200.png top-right of the box; small (.75em) but legible
- the greyed state can be told apart — not shot (no Badge-off shot); `opacity .5` is enough by rule
## Flow
- top to bottom reads as a story: claim, then try it, then the code, then the readme — yes — bands 2→5
- the reader sees the effect of a switch without scrolling — 1200 yes; at 400 the box is under the panel, just inside the first screen (box at ~y 510–620)
## Words
- the takeaway is plain and the owner's own — yes — matches brief item 7 word for word
- labels are clear — yes — "Live result", plugin names, "Reset"
- code comments explain — yes — "this instance only", "back to the class defaults"
- the readme is complete and current — partly — it says how the switch is saved but not that Count's is lost (finding 1)
