verdict: fix
1. [fix] Requirement 1 is still not met: /live/demos/ has no `part-link` card for the demo. Worktree `public/live/demos/page.jsonl` line 29 adds it and line 30 (`mastermind-page-design`) removes it. The removal's reason ("dangling /live/demos/ plugins link removed until merge") is only in the mastermind's commit 5cf15b706, not in this task folder, and nothing says the card goes back after the merge. shots/…-live-demos/1200.png: no Plugins card in the first screen; the page is reached only through the automatic PAGES list (line 46, `{"file":"plugins/page.js","nav":…}`).
2. [fix] A fresh agent can't continue from this task folder. `task.jsonl` is still 4 lines, and its last log still says "Nothing left undone against the brief". No line records the fix commits `fb30d424b` (Count persists, box first) and `d9a402e06` (readme matches save()), the card removal (finding 1), that rounds 2–3 had no real shots, or what is still open. Add one log line for each.
3. [note] This is the first round with real shots, and they confirm the round-2 fixes: at 400 the box comes first and the panel stacks under it (shots/…-plugins/400.png). But the stack point is about 530px, not the brief's "about 700px": both halves are `flex: 1 1 16em` in a `flex wrap`, with no breakpoint set on purpose (page.js, the `div.c("flex wrap gap")` block).
4. [note] The code block is untidy. At 400 its comments wrap mid-phrase ("// this / instance only", shots/…-plugins/400.png, band 5). At 1920 the first comment starts one column left of the other two (shots/…-plugins/1920.png, `pre` band). Put each comment on its own line above its call, or shorten them.
5. [note] The panel's rhythm is uneven. The rows sit about 3em apart (each row is its own `div.c("flow")` inside a `flow`), yet Reset touches the Wide row with no gap (shots/…-plugins/1920.png, the panel). Use one `flex v gap` for the rows and the button.
6. [note] The badge's white "1" on `--prime` orange, at .75em, is about 2.2:1, below 4.5:1 (shots/…-plugins/1920.png, badge corner). `Badge.js` also uses the literal colours `#fff` and `#6366f1` in inline styles.
7. [note] At 1200 and above the demo sits in the standard ~640px column on a mostly empty screen (`layout.json` empty 0.83 at 1200, 0.85 at 3440; the `flex` band is `big_empty: true` at 1200 and 1920). The box is small, so `Wide` ("full width") changes little. Fine for a toy demo; a `wide` row would show the plugins better.
8. [note] Still open from round 1: `files.jsonl` lists the temp file `DemoPage.test.mjs.tmp.48704…` and its `gone` line. `page.jsonl` holds two headless test lines stamped `"by":"owner"`, though the owner never made those switches. `save()` itself doesn't pass `by: "owner"`.
9. [note] The test still sets `count_row.up = badge_row` by hand before it checks that `active` is false, so it checks a patched state, not the draw path. It passes: `node public/live/demos/plugins/DemoPage.test.mjs` gives 4 tests, 13 checks, 0.08 s.

Widths given: 400, 1200, 1920, 3440, for both /live/demos/ and /live/demos/plugins/.

## Requirements
- 1 "/live/demos/plugins/, a sub-page of /live/demos/ (add a part-link card there)" — no — the page exists, but its card was added at line 29 and removed at line 30 of `live/demos/page.jsonl`; only the PAGES nav list reaches it
- 2 "A small host class DemoPage extends Plugin, owns one box element; do not make Page pluggable" — yes — `DemoPage.js`, 10 lines; Page.class.js untouched
- 3 "Three toy plugins, Border, Badge with sub-plugin Count, Wide off by default; attach/detach undo cleanly" — yes — `DemoPage.use(Border, Badge).available(Wide)`, `Badge.use(Count)`; the test checks clean detach; 400.png shows the badge "1"
- 4 "The tree panel beside the box: a row per plugin, sub nested, greyed while parent off, a Reset button" — yes — 1920.png: Border, Badge, Count (indented), Wide, Reset; `sub_row` sets opacity .5 and disabled from `row.up.active`
- 5 "A switch saves one line in page.jsonl; reload keeps it; the item tool's line also switches it" — yes — `save()` posts `{overrides, sub}` through RecordWriter (Outbox fallback); `jsonl.live()` reapplies a line from any writer
- 6 "Under the panel, the JS a reader would type, one short code block, JS not JSON" — yes — "What you just did" block with `page.plugins.set`, `page.overrides`, `page.reset_plugins()` (all widths)
- 7 "A one-line takeaway at the top" — yes — 400.png band 2, the exact sentence
- "Mobile first: the panel stacks under the box below about 700px" — yes, at about 530px — 400.png: box, then panel (finding 3)
- "DemoPage.test.mjs, under 1 s" — yes — 4 tests, 13 checks, 0.08 s
- "readme.md: what it shows, the files, where a switch is saved; linked from core/Plugin readme More" — yes — readme now gives the real line shape `{"overrides", "sub"}` and the Outbox fallback; the link line is in `core/Plugin/readme.md`
- Can you open a page that shows the class's live instances and their properties? — no — but the demo page itself is DemoPage's one live instance, with its plugin rows shown: a note, not a fix
- Task folder: could a fresh agent continue from it alone? — no — finding 2
- Modules touched, readme and doc current? — mostly — `core/Plugin/readme.md` has the link; the plugins readme matches the code; `files.jsonl` indexes a temp file (finding 8)

## Page structure
- page 1 — yes — 400.png band 2: "This page is a tree of plugins. Flip a switch…"
- page 2 — n/a
- page 3 — yes — takeaway, then the live demo, then the code, then the readme
- page 4 — n/a
- page 5 — no — reached only through the PAGES nav list on /live/demos/, no card (finding 1)
- page 6 — n/a
- page 7 — yes — a standard page (`layout.json` layout "standard")
- page 8 — yes — checkbox labels are the plugin names; Reset is plain
- page 9 — yes — nothing repeats
- page 10 — yes — the plugin tree is shown as nested checkboxes, not described
- page 11 — no — the demo row has no heading ("Live result" labels only the box); a note
- page 12 — n/a

## Navigation
- navigation 1 — none of its own; the site's bottom rail at 400 and the AI drawer at 1920 and 3440
- navigation 7 — yes — 400.png: the Readme button clears the bottom rail

## Layout
- layout 1 — no — 3440.png: one ~640px column, `empty` 0.85 (finding 7)
- layout 2 — yes — Standard
- layout 3 — yes — the box and panel fit their content at every width; stacked at 400
- layout 4 — yes — box in `surface pad`, panel in `card pad`
- layout 5 — yes
- layout 6 — no — two side-by-side columns stay in the reading column at 1200+; a note (finding 7)
- layout 7 — no — the `flex` band is `big_empty: true` at 1200 and 1920 (share 0.265, ink 0.109 at 1200)
- layout 8 — no — the panel is about twice the box's height at 1920; the hole under the box is not filled; a note
- layout 9 — yes — accepted as a gutter
- layout 10 — yes
- layout 11 — n/a
- layout 12 — yes — the box and panel stand apart with a gap

## Sizing
- sizing 13 — yes — `minHeight: 6em` only; all else auto
- sizing 14 — n/a
- sizing 15 — n/a
- sizing 16 — yes — no scrollbars in any shot
- sizing 17 — n/a
- sizing 18 — yes — `overflow_x` false at every width
- sizing 19 — yes — em throughout

## Wrapping
- wrapping 20 — yes — `wraps` lists only the site's own drawer-rail buttons, not this page
- wrapping 21 — yes — no wrap only under 1920
- wrapping 22 — yes — the demo row is `flex wrap` and stacks cleanly at 400
- wrapping 23 — yes — 400.png: box and panel each full width
- wrapping 24 — n/a

## Flow
- flow 25 — yes — the takeaway, then the box the eye lands on
- flow 26 — yes — nothing off-screen at any width
- flow 27 — no — panel rows sit about 3em apart, Reset at 0 (finding 5)
- flow 28 — yes — "Live result" sits right on its box
- flow 29 — n/a
- flow 30 — yes — `widest_text` 505 at 1920, 568 at 3440
- flow 31 — n/a
- flow 32 — yes — `left_stack` 16px at 400, one `page` layer

## Spacing and padding
- spacing 33 — yes — `left_stack` h1 16px at 400
- spacing 34 — yes — box: `surface pad` > `card` (the box), two levels
- spacing 35 — no — `div.c("card pad flow")` puts `.pad` on a card; a note
- spacing 36 — yes
- spacing 37 — no — inline `marginLeft: 1.6em` and Badge's inline offsets are constants; a note
- spacing 38 — yes — Reset is `btn prim`
- spacing 39 — yes — box and panel each paint their own ground
- spacing 40 — n/a
- spacing 41 — n/a — no CSS file
- spacing 42 — no — static inline styles in page.js and every plugin (they are the plugins' effect, so expected for Border/Wide; the panel's are not); a note

## Colour and contrast
- colour 1 — yes — body text and labels are dark on white
- colour 2 — no — the badge's white "1" on orange is about 2.2:1 (finding 6)
- colour 3 — no — `#fff` and `#6366f1` literals in `Badge.js` (finding 6)
- colour 4 — yes — the box and panel are white on the grey page
- colour 5 — not checked — no dark-mode shot
- colour 6 — yes
- colour 7 — yes — the orange accent repeats on border, badge, checkboxes and Reset
- colour 8 — yes — "Live result" uses `.muted`

## Words
- words 1 — yes — the plugin tree is shown as live checkboxes beside the box they change
- words 2 — yes — nesting shows Count belongs to Badge
- words 3 — yes — the takeaway is 18 words
- words 4 — yes
- words 5 — no — "What you just did" heads a fixed block that doesn't follow what the reader did; "The same in code" would be exact; a note
- words 6 — n/a
- words 7 — yes — "plugin" and "sub-plugin" used the same way throughout
- words 8 — no — the page text names no link to core/Plugin or the plan; only the folded Readme does; a note
- words 9 — yes — the readme sits under the live widget
- words 10 — yes
- words 11 — yes — the readme is full sentences
