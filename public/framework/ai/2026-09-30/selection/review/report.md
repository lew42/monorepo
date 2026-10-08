verdict: fix
1. [fix] At 400 there are two ◎ Inspect buttons on one screen, one at the top right beside the ☰ and one on the bottom rail (page 9, necessary). shots/…-drawer/400.png, top band and bottom rail. The desktop `.drawer-inspect` should hide wherever the phone rail shows.
2. [fix] doc/select.md's first paragraph runs about 110 words, and its "Shared with a chat" paragraph about 85 (content 3, 60 words or fewer). The readme's Inspect paragraph runs about 90. Split each into short sentences or a list.
3. [note] No shot shows a selection: not the drill-down, not the phone rail's selection strip, not the Element tab's five actions. Asks 1 and 2 are met in code but have not been seen working (content 1). A forced-state shot at 400 with the outer card selected would prove ask 1.
4. [note] Ask 4 is met for the selection: `?select=` restores it on reload. Nested cards have no URLs of their own, so a selection is the only way to link to one. The restore only runs on a full page load, and the code says so.
5. [note] At 3440 the page is 78% empty: one narrow doc column beside the site nav, nothing on the right (layout 1). The cause is the doc layout, which this diff did not change.
6. [note] `restore()` calls `querySelector` on the raw `?select=` value. A hand-edited bad selector throws and is not caught.

## Requirements
- 0 "Inspect MODE, never automatic" — yes — select.js `active()` needs the `inspect-mode` knob, so with it off clicks pass through untouched. The ◎ button appears on desktop and the phone rail (400.png, 1200.png top right).
- 1 "Selection works on mobile" (inspector button, tap highlights, first tap the whole card, then drill down, rail shows the name and a scrollable action menu) — yes in code, no shot — the rail ◎ is in 400.png's bottom rail. `pick()` does outermost card then drill-down. `selection_strip()` has the name and an `overflow-x: auto` action row.
- 2 "It's part of dictation… the selection travels with the prompt" — yes — ux/Dictate/chat.js listens for `selection-change`, keeps it on `ctl.selection`, sends `Session.select`, and stamps it on each `say()` (chat.js:168, :256).
- 3 "Build on what exists; don't rebuild it" — yes — select.js is extended, `tabs.chip` is reused, and one `actions()` list feeds both the Element tab and the rail strip.
- 4 "Everything is routed: nested content and the selection have URLs" — partly — the selection is `?select=<path>`. Nested cards get no URL of their own (finding 4).

## Page structure
- page 1 — yes — 400.png: the title "Drawer", then "The ☰ and its tabs"
- page 2 — yes — the tab buttons (AI, Sessions, Dictation, Settings, Admin) sit right under the first heading
- page 3 — yes
- page 4 — n/a
- page 5 — yes — the page is unchanged in the tree
- page 6 — yes — a selection is `?select=`, and the drawer tab is `?drawer=`
- page 7 — yes — the doc layout
- page 8 — yes — ◎ has a title and an aria-label, and the rail shows "Inspect"
- page 9 — no — two ◎ buttons at 400 (finding 1)
- page 10 — yes — a live card-in-card demo instead of a description
- page 11 — yes — "Try it: a card inside a card"
- page 12 — n/a

## Navigation
- navigation 1 — tabs, a bottom rail, a sidebar (the site nav), the side drawer
- navigation 2 — yes — layout.json tab_rows 2 at 400, 1 at 1200, 1920 and 3440
- navigation 3 — yes — the tabs are routed (existing)
- navigation 4 — yes
- navigation 5 — no — at 3440 the sidebar sits beside a left-aligned column, not a centred one (finding 5, not this diff)
- navigation 6 — yes — the selection is a box-shadow ring that never moves the layout, and on a phone the drawer stays shut on select
- navigation 7 — yes — 400.png: the bottom rail sits below the content
- navigation 8 — n/a
- navigation 9 — n/a
- navigation 10 — yes — details open in the drawer's Element tab, never in place

## Layout
- layout 1 — no — 3440 empty 0.781 (finding 5)
- layout 2 — yes — doc
- layout 3 — yes — widest_text 339, 590, 633 and 712
- layout 4 — yes — the demo uses `card pad` (a card, not `.pad` on a card)
- layout 5 — yes
- layout 6 — n/a
- layout 7 — yes — no band has big_empty
- layout 8 — n/a
- layout 9 — yes
- layout 10 — yes
- layout 11 — n/a
- layout 12 — yes — the nested card sits inside the outer card with padding

## Sizing
- sizing 13 — yes — fixed sizes only on the 2.2rem icon button
- sizing 14 — n/a
- sizing 15 — yes — the rail strip's name truncates with an ellipsis, and its actions scroll
- sizing 16 — yes — the one new scroller is the rail action row, on purpose
- sizing 17 — yes
- sizing 18 — yes — overflow_x false at every width
- sizing 19 — yes — the rail and strip use em, with floors in rem

## Wrapping
- wrapping 20 — yes — the wraps are a 2-line h2 at 400 (a normal heading wrap) and icon buttons whose 1.8 "lines" are their square box, not wrapped text
- wrapping 21 — yes — no row is one line at 1920 and two at 1200
- wrapping 22 — yes — `.drawer-props-actions` is `flex wrap` on purpose
- wrapping 23 — yes — 400.png stacks
- wrapping 24 — n/a

## Spacing and padding
- spacing 33 — yes — left_stack 28px at 400
- spacing 34 — yes — one layer each
- spacing 35 — yes
- spacing 36 — yes
- spacing 37 — yes — only controls carry constants
- spacing 38 — yes — rail actions use em padding
- spacing 39 — yes — the cards sit on `--surface`
- spacing 40 — n/a
- spacing 41 — yes — the new rules sit inside the existing layer blocks
- spacing 42 — yes — the selectors are long but every class is used

## Colour and contrast
- colour 1 — not measured — `--subtle` ◎ on `--surface` looks above 3:1 in 1200.png
- colour 2 — not measured — the pressed state uses `--prim`
- colour 3 — yes — tokens only
- colour 4 — yes
- colour 5 — yes — light-dark tokens, no literals
- colour 6 — n/a
- colour 7 — yes — the same `--prim` "on" state on desktop and the rail
- colour 8 — yes

## Flow
- flow 25 — yes
- flow 26 — yes — overflow_x false
- flow 27 — yes
- flow 28 — yes
- flow 29 — n/a
- flow 30 — yes — widest_text 712 at 3440
- flow 31 — yes — ◎ is placed by `--devbar` and `--drawer` tokens
- flow 32 — yes — left_stack has a single layer

## Words
- content 1 — no — the selection states are not shown in any picture (finding 3)
- content 2 — yes
- content 3 — no — doc/select.md paragraphs of about 110 and 85 words (finding 2)
- content 4 — yes — the page's bold "Turn on ◎ Inspect…" line says it
- content 5 — yes
- content 6 — n/a
- content 7 — yes — "Inspect" and "selection" are used every time
- content 8 — no — select.md names `select.js`, `inspect.js` and `ux/Dictate` as code spans, not links (note)
- content 9 — yes — select.png sits beside it, but it shows the old state
- content 10 — yes
- content 11 — yes
