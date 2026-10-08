verdict: fix
1. [fix] At 3440 the grid stretches: Name takes 1fr and Cost sits far right, so the Name→Cost gap is huge and the page is 77% empty (layout.json empty 0.768, ink 0.229) — shots/.../3440.png, table band. Cap the Name column or the grid's max width (layout 5).
2. [fix] At 400 the table is wider than the screen (widest_text 443 vs 400 wide, wide grid with 8 columns, min widths sum >400) so Cost/Updated sit off-screen or need sideways scroll; the first thing a phone reader needs (name + cost) should fit — shots/.../400.png, bottom band; the owner flagged mobile as already slow.
3. [fix] This diff shows only page edits (page.js, SessionView.js, sessions.css). Deliverables 1, 2, 4, 5 (findings.md, Session.js + node test, Server/session-summary.mjs, doc note) and the before/after bytes-and-requests measurement (ask 4) are not in the diff, so they could not be checked; confirm they landed in the same branch.
4. [note] The default sort now weights cost by recency (halves every 3 days). It is a ranking the owner did not ask for in the brief and is not named anywhere on the page — say so in a title on the Cost header or in doc/.
5. [note] The "updated HH:MM" header text replaces "live — polls every 20s" but polling still happens (poll loop remains); the page is a poll, not the stream the brief says to use (live-not-polling).
6. [note] Page-shell rail buttons wrap to 3.2 lines at 400 (layout.json wraps drawer-rail-ai/menu) — not caused by this diff, left as is.
7. [note] Four stat tiles and a chip row sit above the table; at 1200 the table starts roughly mid-screen. Fine, but the cost-breakdown link text is small — shots/.../1200.png, band 2.

## Requirements
- 1 "Account for every message and tool call; Claude and OpenRouter kept separate" — not shown in this diff; the table now says "Claude $…" only and drops the OpenRouter tile/summary, so OpenRouter is no longer visible on the page
- 2 "A Session class on server and client" — not measured, not in diff (the page reads IX from the session index, which implies it exists)
- 3 "Preview row + detailed view on the Sessions page" — yes — the row shows cost/tree/updated/duration (shots/.../1920.png); detail view in SessionView.js was not changed here and not shown in the shots
- 4 "Never reprocess raw file; page loads small cached data; measure bytes/requests before and after" — not measured; no figures in what I was given
- 5 "Per-session folder with session.jsonl" — not in diff
- Addendum "tags/alerts filter, needs-attention filter" — yes — "Needs attention" checkbox and tag filter are in the filters row (shots/.../1200.png)
## Page structure
- one clear title and purpose — yes — shots/.../1920.png: "Sessions" with four tiles
- level 1 above the fold, detail one click down — yes — cache breakdown is now behind a link
- one component per surface (no second version) — yes — same Panel2 and tile helper reused
## Navigation
- techniques used — AI tabs (Index, Dashboard, Log, System, Sessions, Tests), left sidebar tree, filter chips
- tabs one row — yes — layout.json tab_rows 1 at all four widths
- role/trigger filter is reachable and reversible — yes — a chip click again shows all
- every view has a URL — n/a (no new views)
## Layout
- main content leads, nothing wasted — no — 3440: empty 0.768 (finding 1)
- bands sensible — yes — bar 1–2%, one big row 83–93% (layout.json bands)
- overflow — yes — overflow_x false at every width
## Sizing
- columns sized by content — no — Name 1fr balloons at 3440; Cost 8–12rem fine (finding 1)
- touch targets — yes — chips and checkboxes are readable at 400 (shots/.../400.png)
## Wrapping
- nothing wraps that shouldn't — no — 400: grid exceeds viewport (finding 2); rail buttons 3.2 lines at 400 (note 6)
## Spacing and padding
- consistent gaps — yes — controls column uses .5rem gaps, margin-block-end 1rem (sessions.css)
- left stack — yes — layout.json left_stack h1 14/19/33/54 scales by width
## Colour and contrast
- chips and flags readable — yes — chip-on uses tint plus border plus weight, not colour alone
- muted small text — note: tiny muted cost-breakdown link at 400 (not measured)
## Flow
- reading order top → bottom — yes — tiles, filters, chips, table
- stale data never shown as live — no — "updated" label is honest but data still polls (note 5)
## Words
- plain sentences, no jargon — yes — "Claude cost shown", "Plan used this week" are clear
- every number explained — yes — titles give the source (ai/usage.json, session files)
- defect line — yes — now "N spawned agents have no recorded parent", detail in title
- file paths in tile titles are not links — note: "ai/usage.json" is plain text, not a mention link
