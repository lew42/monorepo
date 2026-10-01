verdict: fix
1. [fix] Every shot of the AI 2 card sidebar and the AI tab (`after-card-400.png`, `after-card-1920.png`, `after-drawer-ai-3440.png`, `after-surfaces-*.png`) was taken 2026-09-30 between 5:40pm and 10:30pm — before the Widget.css "round 2" composer fix dated 2026-10-01 in the diff itself. They still show the OLD single-row composer (box, mic, Send side by side), not the new full-width-buffer-over-controls layout. Only the Dictate page's own demo has a shot taken after the fix (`127-0-0-1-51812-framework-ux-Dictate/`, 10/1 12:48am) and it does look right. Since all six surfaces share the same `Widget.Composer`/`Widget.css`, the fix very likely reached them too — but nothing proves it. Take one fresh 400px + 1920px shot of each surface in item 6's own audit table before calling this done.
2. [note] Requirement 5 (the sidebar should use the site's Montserrat font) isn't touched by this diff and isn't provable from a screenshot. Likely already fixed in the earlier `one-dictation-chat-everywhere` task — worth a one-line confirmation in the doc, not a re-fix.
3. [note] Requirement 4 ("chat and card are one content model") is explicitly left to `inbox-ext/requirements.md` item 9 and correctly untouched here — flagging only so it doesn't get lost, not because anything is wrong.

## Requirements
- 1 "Retire the second and third paths" — yes — `before-drawer-ai-3440.png` shows the old model picker + "Leave a note" sidebar; `after-drawer-ai-3440.png` shows it gone, replaced by the one ✦ AI panel; `ai2/card.js` (read) now calls `mount_chat` (`ux/Dictate/chat.js`), not a private assistant; `minion-workbench/audit.md` lists every live surface as already on `chat()` → `Widget`.
- 2 "Responsive: full height on desktop, resizable/collapsible sheet on mobile, single column, minimal" — yes for "single column": `Widget.Composer` is now `flex v` (buffer on top, controls below), proven on the Dictate demo (`127-0-0-1-51812-.../400.png` and `1920.png`, one line of controls at both widths). Desktop full height — `after-card-1920.png`: the sidebar panel runs the full column height. Mobile resizable sheet collapsing to one line is unchanged by this diff (built earlier) and not re-shot — not measured.
- 3 "Sessions stay global; invisible nav/pause events; refinement to the selected card" — yes, by source read: `chat.js`'s `create_controller`/`GLOBAL` keeps one shared controller for every `keep: true` mount (the default, used by every real surface); `report_nav`, `Session.report_quiet/report_pause` are still wired once, globally.
- 4 "Chat and card are one content model" — n/a — explicitly out of this diff's fence, deferred to `inbox-ext/requirements.md` item 9.
- 5 "The font is the site's (Montserrat)" — not measured — no screenshot proves a font; not touched by this diff.
- 6 "Document it: one page showing the live widget on each surface" — yes — `ux/Dictate/surfaces/` shows all 5 boxes side by side with the code line that built each (`shots/.../127-0-0-1-62912-framework-ux-Dictate-surfaces/sheet.png`), plus `minion-workbench/audit.md`'s full site-wide call audit linked from the readme.
- 7 "Next, not now: threaded replies, routable sheet" — yes — neither is built; correctly deferred.

## Page structure
- page 1 (Dictate Overview) — yes — title "Dictate", first line says what it is (`127-0-0-1-51812-.../1920.png`)
- page 2 (Surfaces) — yes — title "Surfaces", subtitle states the one-function/five-places point in one sentence
- page 3 (old v1 Overview) — yes — kept one click away ("VARIANTS"/doc table), satisfying "never destroy a viable version"
- Every view routed — yes — tabs (Overview, Send modes, Playground, Variants, Surfaces, Docs, Files) are each their own URL

## Navigation
- Identify: tabs, a rail (left page nav), a sheet (the ✦ mobile rail, unchanged by this diff) — the rest n/a
- Tabs fit 1 row at 1920/1200, ≤3 at 400 — yes — `layout.json` tab_rows: 1 at 1200/1920/3440, 2 at 400 (all three page sets)
- Tabs have their own URL — yes — Overview/Docs/Files etc. are routed tabs on the Doc page
- Sheet has its own URL / closes back to where the reader was — not shown in this diff's shots, unchanged behavior, not re-verified — n/a

## Layout
- 3440 fills the width with nav + centred main, not one narrow column — yes — all three page shots at 3440 show rail + wide tab-panel
- Approved layout — yes — "doc" layout (the standard Docs three-region shape)
- Region widths right at every size — yes, for the composer card — `127-0-0-1-51812-.../400.png` and `1920.png`: the card's own width tracks the column at both sizes, no fixed px
- Band share matches importance, no big-empty band — yes — `layout.json` `big_empty: false` on every band, every width, every page set
- Dead space — no `big_empty` flags; `empty` runs 38–82% at 3440 across these pages, typical for a text-first Docs page, not flagged by the tool

## Sizing
- Composer box is auto-height, growing with content — yes, by source: `Widget.js`'s `autosize()` sets `scrollHeight` on input and after send; `min-block-size: 2.4em` floors the empty state
- No fixed height where content should grow — yes — composer `.ux-dictate-widget-input` has no `max-block-size`
- Scrollbars meant — yes — `resize: none` plus `overflow: hidden` on the textarea means no stray scrollbar on it

## Wrapping
- Composer controls row stays on one line at 400 and 1920 — yes — `127-0-0-1-51812-.../layout.json` `wraps` lists only the unrelated `drawer-rail-ai`/`drawer-menu`/`mode-btn` buttons, nothing from `.ux-dictate-widget-controls`, at any width
- No wrap that appears only under 1920 — yes, for the composer — same `wraps` list is identical in shape at 400/1200/1920/3440
- 400px full-row items stack, not crush — yes — the typed buffer and controls row both read as full-width single columns at 400 (`127-0-0-1-51812-.../400.png`)

## Spacing and padding
- Padding at the left edge ≤3em at 400 — yes — `layout.json` `left_stack`: h1 28px, p 28px (all three page sets), well under 48px
- No box nested in a padded box in a padded box — not measured beyond `left_stack` not flagging extra layers (single `doc-well`/`page` layer each)
- Spacing from the clamp, not a constant — yes, by source — `Widget.css`'s new rules use `em` (`0.3em`, `0.4em !important`, `2.4em`) for control-scale spacing, matching the "a control keeps its own em" rule; no new `vw`/px constants added

## Colour and contrast
- Body text vs ground — not measured (no contrast tool run); by eye in every shot, dark text on a light card reads cleanly — yes
- Tokens, not literal colours — n/a, no new colour rule in this diff (CSS changes are layout-only: `position`, `flex`, `display`, `gap`)
- Dark mode — not shown; no shot taken in dark mode — not measured

## Flow
- Priority order top to bottom — yes — demo/composer first, then "How it works", matching "show, don't tell"
- Nothing hidden off-screen — yes — `overflow_x: false` on every width, every page set
- One rhythm per box — yes — composer uses `flex v gap`, matches the layout skill's UI rhythm
- No prose line past measure — yes — `widest_text` tops out at 709px at 3440, well inside a normal reading measure

## Words
- Each paragraph ≤60 words — yes — "This demo has its own session. It starts fresh when you leave the page." and similar lines are one short sentence
- Ten-second point — yes — "The same widget as the ✦ sheet, now actually answered" states the takeaway in one line
- Titles say what they are — yes — "Dictate", "Surfaces", "New session"
- Concepts named once, same way — yes — "the ✦ sheet", "the ☰ drawer", "chat.js" used consistently across readme.md, doc/chat.md and page.js
- Full plain sentences, no jargon left unexplained — yes — readme/doc additions read as full sentences with the owner's own words quoted for context
