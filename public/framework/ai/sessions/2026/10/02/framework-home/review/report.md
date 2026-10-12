verdict: fix
1. [fix] Icons are not yet read from one source (requirement 5): `ext/Mention/maps/refs.js` still hard-codes 35 `icon:` values (and now `class_card:` flags too). `live()` replaces them only for pages already loaded in this session, so a mention of a page nobody has opened yet still shows the old copied icon. The brief says "find any hard-coded copies and remove them" — diff, `refs.js` lines 27–64.
2. [note] On `/framework/` at 3440, the first column holds AI and UI as one-card sections inside a 60rem track: a 16rem card with about 40rem of grey beside it, under a heading that repeats the card's own name ("AI" over "AI"). It is balanced by height, as asked, but the top band reads as dead space — shots/…-framework/3440.png, left column.
3. [note] The dark class look reuses `page-surface-dark` and adds no new `.class-card` word. That is right by law 6 (one of everything), but the brief's "one CSS word" now has a name that doesn't say "class". Record the name chosen in `ext/Mention`'s or `core/Page`'s doc so the next agent finds it.
4. [note] `/framework/old/` shows two titles in a row: "Framework (old)" and then the old h1 — shots/…-framework-old/1200.png, top band. Its 3440 clock band is 86% empty, but this page is the untouched backup, so that is accepted.
5. [note] Requirement 3 (every class gets an icon) has no audit recorded in the task. A grep finds only `ext/Doc/overview/urls/page.js` among `new Doc(` pages with no `icon:`, and that is a sub-page, not a class. No blank icon shows in any shot.
6. [note] At 1920 the hero and the stats tiles take about 43% of the first screen, so only the AI and Core sections are above the fold — shots/…-framework/1920.png, bands 1–2.

Widths given: 400, 1200, 1920 and 3440 for each of the six pages (/framework/, /framework/old/, ext/, ext/Mention, ext/filesystem, ext/sprawl).

## Requirements
- 1 "move [the current one] to /framework/old, back up the old version" — yes — `old/page.js` is a declared child (`children: … old`) and renders the hero, clock and stats: shots/…-framework-old/sheet.png
- 2 "sections, like the sidebar sections, Core, and then the icon items" — yes — `home_sections(this)` walks `root.children` (the sidebar's own tree), in sidebar order: AI, Core, Styles, UI, UX… with icon + name + description cards — shots/…-framework/3440.png
- 3 "Each class should have an icon" — yes — no blank icon in any shot; only `ext/Doc/overview/urls` has no `icon:`, and it is not a class page (see note 5)
- 4 "dark-themed cards for classes… whether it's an inline reference or a card" — yes — View/Page/Router/App/Sidebar/Shell/Item/List are dark on /framework/ (1920.png, Core); dark inline chips appear on ext/Mention (1200.png); `Doc.nav().class_card` decides it
- 5 "navigation icons should render from the page's icon property, so when we edit a page's icon it updates everywhere" — no — `refs.js` still holds copies; they are only live for loaded pages (finding 1)
- 6 "don't limit the width… show a grid… responsive padding… three columns of about 1000px each" — yes — `.sprawl` is `auto-fit, minmax(min(100%, 60rem), 1fr)` with `var(--gap)`: three columns at 3440, one at 1200 and 1920; the module grid uses 16rem cards. Sprawl is named in design/layout/readme.md
- 7 (follow-up) "balanced placement… shortest column… on load and on resize only; record `columns:` as rejected" — yes — `sprawl.js` runs a greedy shortest-column pass, re-runs only when the column count changes, and records the rejected `columns:` in doc/algorithm.md

## Page structure
- page 1 — yes — 1200.png: the h1 "A no-build, native-ESM web framework"
- page 2 — no — the five stats tiles sit between the title and the concept cards (a note, carried over from the old page)
- page 3 — yes — the sections run in sidebar order
- page 4 — n/a
- page 5 — yes — `framework/page.js` children lists `old`; `ext/page.js` lists `sprawl`
- page 6 — yes — every card is a link to its page's URL
- page 7 — yes — the new `sprawl` word is recorded in /framework/design/layout/
- page 8 — yes — each card is icon, name and one line of description
- page 9 — no — a one-card section repeats its own heading (AI, UI): note 2
- page 10 — yes — a grid of cards, not prose
- page 11 — yes — each section is titled with its sidebar name
- page 12 — yes — /framework/old/ is reachable from the sidebar and from the footer link

## Navigation
- nav 1 — a sidebar (it becomes a drawer at 400)
- nav 5 — yes — the sidebar sits beside the main column at 3440 and folds into the bottom drawer at 400 (400.png)
- nav 6 — yes — sprawl re-places sections only when the column count changes, never while reading
- nav 7 — yes — at 400 the bottom drawer rail sits below the content (400.png)
- nav 2, 3, 4, 8, 9, 10 — n/a

## Layout
- layout 1 — yes — 3440.png: three section columns beside the sidebar
- layout 2 — yes — Rail + content, with sprawl recorded as a new word
- layout 3 — yes — cards are 16rem minimum, sections 60rem, one column at 400
- layout 4 — yes — cards take `.page-preview` framing; sections are unpadded
- layout 5 — yes — card text is inset from the dark grounds (1920.png)
- layout 6 — yes — `sprawl(...).ac("wide")`
- layout 7 — yes — layout.json: no `big_empty` band at any width
- layout 8 — no — balanced by height, but the AI/UI column is sparse in width (note 2)
- layout 9 — yes — no reading column is widened
- layout 10 — yes — card text is body size in every track
- layout 11 — yes — Core ends on a 5-of-6 row at 1920, which is balanced; no reserved tracks (auto-fit)
- layout 12 — yes — cards stand apart with a gap

## Sizing
- sizing 13 — yes — every box is auto height
- sizing 14 — yes — previews are content-height; descriptions truncate to two lines by the existing `.page-preview-desc` rule
- sizing 15 — yes — descriptions end in an ellipsis
- sizing 16 — yes — no surprise scrollers in any shot
- sizing 17 — n/a
- sizing 18 — yes — `min(100%, 60rem)`; layout.json `overflow_x` is false at every width on all six pages
- sizing 19 — yes — `60rem` and `16rem` floors

## Wrapping
- wrap 20 — yes — layout.json wraps on /framework/ list only the h1 (3 lines at 400, 2 above) and the existing drawer and mode buttons
- wrap 21 — yes — the h1 has 2 lines at 1200, 1920 and 3440 alike
- wrap 22 — n/a
- wrap 23 — yes — 400.png: cards are one per row
- wrap 24 — yes — the same two-line clamp everywhere

## Spacing and padding
- spacing 33 — yes — layout.json left_stack h1 24px at 400
- spacing 34 — yes — one layer (`default`) at every width
- spacing 35 — yes — `.page-preview` is the card; no `.pad` on cards
- spacing 36 — yes — every shot shows text inset
- spacing 37 — yes — `.sprawl { gap: var(--gap) }`; the `--gap: 1em` override is the existing page-wall rhythm
- spacing 38 — yes — no control sizes were changed
- spacing 39 — yes — cards have their own ground (white or dark)
- spacing 40 — n/a
- spacing 41 — yes — sprawl.css and the Mention css() rule are both inside `@layer theme`
- spacing 42 — yes — the change reuses `page-surface-dark` and adds only `.sprawl` and `.sprawl-column`

## Colour and contrast
- colour 1 — yes — #e8e8ea on #17161a is about 15:1; the dark-card title fix compounds the selector (Page.css)
- colour 2 — n/a
- colour 3 — yes — `--dark-bg` and `--dark-ink` are defined once and read back by Mention (the hex already lived in Page.css)
- colour 4 — yes — cards differ from the `--wash` page
- colour 5 — yes — the dark island is `color-scheme: dark` in both modes
- colour 6 — yes — dark and light cards mix in one grid on purpose (class vs content)
- colour 7 — yes — dark means "class" on cards and mentions alike
- colour 8 — n/a

## Flow
- flow 25 — yes — title, then the numbers, then sections in sidebar order
- flow 26 — yes — `overflow_x` is false at every width
- flow 27 — yes — the walls use `flex v gap`; the footer prose uses `.flow`
- flow 28 — yes — each section heading sits 1em above its own grid and 3em-plus from the previous section
- flow 29 — yes — no live items arrive; placement runs only on load and when the column count changes
- flow 30 — yes — widest_text is 643 at 3440
- flow 31 — n/a
- flow 32 — yes — one padding layer

## Words
- words 1 — yes — modules are shown as cards, not described
- words 2 — yes — the grouping is the layout
- words 3 — yes — the footer paragraphs are under 60 words
- words 4 — yes — "everything in the framework, by section" reads at a glance
- words 5 — yes — card titles are the module names
- words 6 — n/a
- words 7 — yes — the new word is "sprawl" everywhere it appears
- words 8 — yes — every card and section heading links to its page
- words 9 — yes — the sprawl readme sits beside its live demo page (ext/sprawl 3440.png)
- words 10 — yes — the sections lead after the title and numbers
- words 11 — yes — full sentences in the footer and the readme
