verdict: fix
1. [fix] The `flow` demo's note says the fix made `framework.css`'s flow rule read `:is(p, .card, …)`. The diff actually adds `:not(.card)` to the outer flow rule, which changes the space *inside* a `.card.flow` and does nothing *between* blocks (Requirement C, content 1). Evidence: `ui/text/page.js` flow note vs the `framework.css` hunk at 1234. Rewrite the note to say what changed.
2. [fix] Requirement C was not met as written. The reported ~7 px h2-after-card gap did not reproduce (logged: h2 margin-top 63 px after a card). Instead, a different, unasked change landed: every `PageCard` (`part-card card flow`) sitewide now gets `--gap` between title and body instead of `--flow` (logged: 28 → 14 px). That restyles cards on every page with no shot of any page outside `ui/`. Also, the `flow` demo never puts an h2 after a `p`, so it can't show "the same space whether a card or a p is before it". Evidence: `shots/text-flow-400.png`, the only h2-after-block is the one after the card. The mastermind should either accept the card change on purpose (and shoot a page full of PageCards, e.g. /live/session/ at 400) or revert it. Either way, add an h2 after a p in `flow`.
3. [fix] "No page CSS (no `style()`)" is broken: the `li` demo calls `.style("--gap", "calc(var(--gap) * 0.8)")`. Evidence: `ui/text/page.js`, `items`.
4. [fix] `ui/readme.md` Cards line: "— the options as cards, the chosen one marked; used by every task page's Decisions tab" now sits after `alert`, so it reads as describing alert. It describes `decision`. Evidence: the diff, readme "More" section.
5. [fix] `ui/doc/decisions.md` still describes "four bands", "5 · 5 · 5 · 4" and "the sizes are load-bearing", and the new readme bullet about the five bands links to it for the reason. Stale: add the 2026-11-09 tree decision there. Evidence: decisions.md lines 5, 16, 28, 35.
6. [fix] `ui/readme.md` contradicts itself. The new Index line says four functions (`table`, `kbd`, `timeline`, `item`), but the untouched lines still say "The other seventeen have nothing to import" (line 47) and "`ui.js` (three exports…)" (line 82). Pick the true count and use it in all three places.
7. [fix] `ui/readme.md` Index is not "in the new order" (Requirement B): only `text` and `icon` were pushed to the top; the rest is still alphabetical. The tree order exists only in the "More" section.
8. [note] Requirement A lists `h1` as a variant. It is the specimen only, with no `demo.page("h1")` child. This is defensible (the specimen is the h1), but the brief asked for it.
9. [note] Requirement D: `.library-thumb` went into `ext/DesignTool/probe.js`'s IGNORE (the real skip point that LayoutCheck uses). The log reads "BROKEN 29 (27 thumbs, 2 real) → 0", but no component file changed, so the 2 "real" findings vanished without a fix and nobody said why. Tap targets under 24 px are left, logged as a `ui-kit gap`. No test case was added (logged reason: the test never reaches probe()). `ext/DesignTool`'s readme was not checked for the new IGNORE member.
10. [note] Comments in the new code point at the brief: "see B below" and "see C below" in `ui/text/page.js`, and "item C of this step" in the flow note. The `framework.css` comment is 14 lines of story. A fresh reader has no B or C, so cut these to the rule and the date.
11. [note] On the 1920 wall (`shots/library-wall-1920.png`), the bands draw as one continuous grid: Avatar shares a row with Row, Item and Tree, and no band label shows. So the "uneven band = wider cards" caveat added in `page.js` and the readme doesn't match what renders. The Icon tile's preview is mostly empty, with its label clipped at the bottom. That is likely pre-existing.

Widths given: 400, 1200, 1920, 3440 for `/framework/ui/` and `/framework/ui/text/`, plus the minion's own `text-flow-400/1200.png` and `library-wall-1920.png`.

## Requirements
- A "an elements page: ui/text … h1, h2, h3, h4, p, li, link, flow … no page CSS" — no — the page exists (shots/…-ui-text/sheet.png), but `h1` is not a variant and the `li` demo uses `.style()` (findings 3, 8)
- A "if a page for headings already exists, extend it and say why" — yes — the log explains why ui/text and styles/elements/text are separate; they link both ways
- B "regroup it as the tree, elements first" — yes — `BANDS` is Elements/Parts/Cards/Menus/Data; item/icon/datagrid/row moved in and words moved out, logged
- B "make the wall and ?at=ui still work" — yes — shots/library-wall-1920.png renders the tree order (Text, Icon, Badges, Keys, Avatar, Row…)
- B "update ui/readme.md's index to the new order" — no — only the More section is reordered (finding 7)
- C "the flow variant shows the same space above an h2 whether a card or a p is before it" — no — the demo has no h2 after a p, and the bug didn't reproduce; a different sitewide card change landed (finding 2)
- C "measure the gap before and after and log both numbers" — yes — logged: 63 px h2-after-card; card h3→p 28 → 14 px
- D "BROKEN at 400 before and after, under 10" — yes — logged 29 → 0 (finding 9 on how)
- D "teach LayoutCheck to skip scaled previews; add a test case if one exists" — no — the skip is done via probe.js IGNORE; no test case, with the reason logged
- D "tap targets under 24 px … fix what is real" — no — not fixed, logged as a `ui-kit gap`
- Proof "shots … ?at=ui/text/flow at 400 and 1200, wall at 1920" — yes — shots/text-flow-400.png, text-flow-1200.png, library-wall-1920.png
- Proof "smoke must show no FAIL" — yes — the logged FAILs are all gitignored shots/, 200 on compliance/dev
- Docs "update ui/readme.md, ui/text/readme.md, library/readme.md" — no — ui/readme has stale counts and a misplaced description, decisions.md is stale (findings 4–6); library/readme still true ("related = its BANDS group")
- Class with live instances — n/a — no class added or changed
- Fresh agent from the task folder — yes — requirements.md plus session.jsonl hold every number and decision; the open items are findings 2 and 9

## Page structure
- page 1 (title says what it is) — yes — shots/…-ui-text/1200.png: "Text"
- page 2 (one-line description) — yes — "The element the kit's tree starts from…"
- page 3 (specimen first) — yes — shots/…-ui-text/400.png, band 2 "bleed" share 0.364
- page 4 (detail below) — yes — "Variants" grid, then two short md sections

## Navigation
- navigation 1 — tabs (Overview·API·Docs·Files·Tasks·Inbox), a sidebar, a bottom rail at 400, crumbs on demo pages
- tabs on one row — yes — layout.json tab_rows 1 at every width
- bottom rail at 400 — yes — shots/text-flow-400.png bottom band; layout.json wraps `drawer-rail-ai` at 3.2 lines (icon + label stacked by design; pre-existing)
- crumbs — yes — text-flow-400.png, "/ framework/ ui/ text/ flow/"

## Layout
- layout 1 (fits the content) — yes — doc layout, one column; overflow_x false at all widths
- layout 2 (wide screens used) — no — empty 0.74 at 3440 (sheet.png): the variant grid sits in a narrow well. That is the doc layout, pre-existing
- layout 3 (wall grid) — yes — library-wall-1920.png, 4 even columns

## Sizing
- sizing 1 (text measure) — yes — widest_text 583 at 1200, 703 at 3440
- sizing 2 (specimen size) — yes — the h1 specimen fills the stage at every width (sheet.png)
- sizing 3 (variant tiles readable) — no — at 1200/1920 the variant tiles are ~150 px and the h4/p text in them is tiny (sheet.png, Variants row); a note, it is the standard page-previews

## Wrapping
- wrapping 1 (nothing wraps that shouldn't) — no — layout.json 400: h2 "Elements, not a component" wraps to 2 lines; acceptable at 400
- wrapping 2 (ui page) — yes — /framework/ui/ 1200: h2 "A component's variants are its" 2 lines, pre-existing

## Spacing and padding
- spacing 1 (left edges align) — yes — left_stack h1 = p = 16 at 400, 38 at 1200
- spacing 2 (rhythm in flow) — yes — text-flow-400.png: the h2 sits closer to its paragraph than to the card above it
- spacing 3 (card inner padding) — yes — text-flow-400.png, the card's h3 and p are padded evenly
- spacing 4 (wasted space) — no — text-flow-400.png: ~80 px of empty space between the card and "A second section" (63 px margin plus the card's shadow). Consistent with the h2 rule, but it reads loose at 400

## Colour and contrast
- colour 1 (text contrast) — yes — dark on white throughout the shots
- colour 2 (accent use) — yes — the selected ui/wall pills are the only accent fills (library-wall-1920.png)

## Flow
- flow 1 (reading order) — yes — specimen, variants, why, reference, next link (Icon)
- flow 2 (next step offered) — yes — "Next: Icon — the next element up the tree"

## Words
- content 1 (says what it means, true) — no — the flow note describes a CSS change that wasn't made (finding 1)
- content 2 (plain, short) — no — the comments in page.js/framework.css are long and point at the brief's letters (finding 10)
- content 3 (consistent counts) — no — ui/readme function counts disagree (finding 6)
- content 4 (no undefined jargon) — yes — the text page explains "flow" and links styles/elements/text
