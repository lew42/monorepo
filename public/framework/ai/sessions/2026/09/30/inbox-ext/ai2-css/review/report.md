verdict: fix
1. [fix] The diff carries a feature the brief never asked for: `card.js` gains `chat()` and `refinements()`, a new `chat` verb, and a redraw key; `page.js` changes how it calls `log_view`; and `doc/cards.md` and the readme describe "chat refines INTO the card". None of this is in the CSS move, and none of it is covered by the before/after proof (requirement 3, "AI 2 must not regress"). Either land it as its own reviewed task, or say in the task log where it came from — diff.patch lines 1604–1700 and 1803–1810.
2. [fix] `Card.css` is not self-contained. Two of its rules (`.ai2-state.live`, `.ai2-ol-row.live`) animate with `@keyframes ai2-pulse`, and that keyframe stayed in `ai2.css`. To work around it, the `ux/Card` demo loads `/framework/ai2/ai2.css`, so a ux block now depends on the app above it (imports flow down; code/css 42). Also, `card.js` no longer loads `ai2.css`, so the readme's claim that "both `ai2/card.js` and `ai2/page.js` load both files" is false. The fix is to move the 3-line keyframe into `Card.css` and drop the ai2.css load from `ux/Card/page.js`. That also brings ai2.css closer to the owner's "kept really minimal".
3. [note] Each new or rewritten file (`Card.css`, `processes.css`, `ai2.css`) restates `@layer base, theme, site, util;` at its top. The order is meant to live once, in framework.css (code/css 41). The order is the same, so nothing breaks — diff.patch lines 6, 320, 396.
4. [note] The proof holds up. Every removed CSS line reappears among the added lines (I computed the line sets: only JS and markdown lines differ). The fingerprint matches on 16 of 17 selectors; the one difference is `.ai2-clear`, which is drawn only when the live data allows it. The six before/after page sets are in the worktree's `ai2-css/shots/before|after/`, not in this folder, which holds just 3 pages.
5. [note] `/framework/ai2/log/` throws a Page Load Error (rail.js:440) both before and after the change. It was there already, and it is flagged to the parent in task.jsonl — it still needs an owner.
6. [note] The `ux/Card/readme.md` "Use" paragraph runs about 110 words (content 3), and the module has no `doc/` folder. `files.jsonl` also logs page.js and readme.md as gone and then re-added.

Widths: all four (400, 1200, 1920, 3440), because the change touches the AI 2 page shell and adds a new page.

## Requirements
- 1 "create `ux/Card/` shaped like `ux/Inbox/`; Generic ranges moved verbatim, inside their `@layer`" — yes — Card.css, readme, page.js and files.jsonl exist; ux children and readme index updated; removed-vs-added line sets match exactly
- 2 "Processes section moves verbatim to `ai2/processes.css`, loaded by processes.js" — yes — diff.patch 2018–2027 `View.stylesheet(import.meta, "processes.css")`
- 3 "What stays in ai2.css is only the v1 screens, about 450 lines" — yes — 1993 → 465 lines (task.jsonl)
- 4 "card.js and page.js load Card.css; ai2.css only where v1 screens are drawn" — yes, with a gap — the keyframe coupling forces ux/Card to load ai2.css (finding 2)
- "Proof: before/after shots of six pages and a fingerprint; they match except named differences" — yes — worktree shots/before|after hold six pages each; fingerprint 16/17 identical, the 17th explained
- "grep shows every moved class defined exactly once" — yes — task.jsonl grep-proof line
- "the owner: we probably shouldn't even have an ai2.css… kept really minimal" — partly — 465 lines remain and are documented as v1-only; the keyframe should leave too (finding 2)
- "AI 2 must not regress" — partly — the CSS move shows no regression, but the extra card.js behaviour is not covered by the proof (finding 1)
## Page structure
- page 1 — yes — shots/…ux-Card/1200.png: the intro line says what a card page is
- page 2 — n/a
- page 3 — yes — the demo card comes first, then where each piece comes from, then the readme
- page 4 — n/a
- page 5 — yes — ux/page.js children now ends with "Card"
- page 6 — n/a
- page 7 — yes — the demo uses the standard layout
- page 8 — yes — the demo labels read plainly
- page 9 — yes
- page 10 — yes — the demo is a live outline, not a description
- page 11 — yes
- page 12 — yes — the AI 2 v1 screens are kept, not removed
## Navigation
- navigation 1 — /framework/ai2/: tabs (Inbox, Log, Overview), a sidebar (the rail); ux/Card: the site sidebar
- navigation 2 — yes — layout.json tab_rows 1 at every width (ai2)
- navigation 3 — yes — the ai2 tabs are routed (needs/, log/, overview/)
- navigation 4 — yes
- navigation 5 — yes — shots/…ai2/3440.png: the rail sits beside the content; at 400 it stacks
- navigation 6 — yes — no layout change from this diff
- navigation 7 — n/a
- navigation 8 — n/a
- navigation 9 — n/a
- navigation 10 — yes — a card opens in its own column (unchanged)
## Layout
- layout 1 — yes — ai2 at 3440 shows Live in three columns; ux/Card is a standard doc page in its reading column
- layout 2 — yes — Standard (ux/Card), Rail + content (ai2)
- layout 3 — yes — ux-Card/400.png: the demo card fills the column with no overflow (overflow_x false at all widths)
- layout 4 — yes — the demo uses `.card`
- layout 5 — yes
- layout 6 — yes
- layout 7 — yes — no band has big_empty set in any layout.json
- layout 8 — yes — ai2/1920.png: the Live columns are uneven but the move did not change them (before = after)
- layout 9 — yes
- layout 10 — yes
- layout 11 — n/a
- layout 12 — yes
## Sizing
- layout 13 — yes — the demo dropped the shell-height grid on purpose and is auto height (task.jsonl)
- layout 14 — n/a
- layout 15 — n/a
- layout 16 — yes
- layout 17 — n/a
- layout 18 — yes — overflow_x false at 400–3440, on all three pages
- layout 19 — yes — the moved rules are verbatim
## Wrapping
- layout 20 — yes — wraps list only the site chrome buttons (drawer-rail, mode-btn), which come from the site itself, not this diff
- layout 21 — yes
- layout 22 — yes — ux-Card 400: the h3 "A Live-card row, the same style" wraps to 2 lines as prose, which is fine
- layout 23 — yes — ux-Card/400.png: the outline rows stack cleanly
- layout 24 — n/a
## Spacing and padding
- layout 33 — yes — left_stack h1 28px at 400 (ux-Card), 14px (ai2)
- layout 34 — yes
- layout 35 — yes
- layout 36 — yes
- layout 37 — yes — no new spacing values; the rules are verbatim
- layout 38 — yes
- layout 39 — yes — the demo `.card` has its own ground (ux-Card/1920.png)
- layout 40 — n/a
- layout 41 — yes, with a note — every rule is inside its layer; the layer order is restated in three files (finding 3)
- layout 42 — yes — no new rules, only moves
## Colour and contrast
- colour 1 — yes — the moved rules are unchanged; the shots match before
- colour 2 — yes — the orange "Reviewed ✓" and "working" read as before
- colour 3 — yes — no new colours
- colour 4 — yes
- colour 5 — not measured — light mode only in the shots; the rules are verbatim
- colour 6 — yes
- colour 7 — yes
- colour 8 — yes
## Flow
- layout 25 — yes
- layout 26 — yes
- layout 27 — yes
- layout 28 — yes
- layout 29 — yes — unchanged
- layout 30 — yes — widest_text 692px at 3440 (ux-Card), 601px (ai2), both within the measure
- layout 31 — n/a
- layout 32 — yes
## Words
- content 1 — yes — the demo shows a live card shape before the words
- content 2 — yes
- content 3 — no — ux/Card readme "Use" is about 110 words (finding 6)
- content 4 — yes — ux/Card's first line says what it is
- content 5 — yes
- content 6 — n/a
- content 7 — yes — "card", "outline" and "Live card" are used consistently
- content 8 — yes — the readme links ai2/card.js, ux/Inbox and the docs
- content 9 — yes — the readme folds under the live demo
- content 10 — yes
- content 11 — yes — full sentences throughout
