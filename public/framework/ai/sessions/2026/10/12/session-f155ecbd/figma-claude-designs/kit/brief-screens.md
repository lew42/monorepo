# Brief: DS · 6 Screens — the system put together (2026-10-12, night)

Read [brief-ds.md](brief-ds.md) first. Every tier now exists in file `QYN0G2URSBHYH5I06MOjxU`: elements (`DS · 1`, `1.1 Icons`, `1.2 Dark grounds`), components (`2.1`–`2.7`), sections (`3`), layouts (`4`, `4.1 Foundational layouts`), diagrams (`5`). This page proves they compose: real screens built **only from instances** of kit components and the 4.1 layouts, no new one-off drawing. If something is missing, note it in the report instead of drawing it by hand.

## Screens (390 × auto, `Mobile` mode; one desktop 1440 version of the first two)
1. **Sessions list** (the site's AI sessions page, cleaned up): app bar, search + filter chips (categories with counts, no grey group rows), rows sorted newest/most costly first, tab bar.
2. **Session detail**: header band, stat strip, a vertical process flow (DS 5 pieces) of its steps, actions.
3. **Settings**: sidebar + content collapsed (4.1 §5), toggles, a dropdown, a radio group.
4. **Dashboard on near-black**: stats, bar chart + donut, a list.
5. **Article / docs page**: two columns title-left (4.1 §2) collapsing, media + text rows, footer band.

Wire a ▶ PROTOTYPE: list → detail (any row), detail → back, tab bar between Sessions / Settings / Dashboard. Big ▶ PROTOTYPE badge above the start frame; set the page's flow starting point.

## Page
`DS · 6 Screens` after `DS · 5 Diagrams & charts`, same shape as the other DS pages (nav row, h1, gist, sections, dark Rules box listing which components each screen used and anything missing). Report `kit/ds-screens.md`, committed by path.
