verdict: pass
1. [note] /framework/ai/classes/ holds one card, and that card stretches across the whole column. At 3440 the page is 90% empty, and the card's one line of text runs 928px (sizing, measure) — shots/127-0-0-1-61721-framework-ai-classes/sheet.png. Cap the card's width, or lay the cards out in a grid now, so the page does not change shape when the second class arrives.
2. [note] /framework/ai/classes/Session/ is 84% empty at 3440. The rendered row and the debug tree sit far apart, with a wide gap between them (layout, fill) — shots/127-0-0-1-61721-framework-ai-classes-Session/sheet.png, band 3.
3. [note] The /framework/ai/system/ shots date from 16:03, which is before this diff. They still show the heading "Servex" and a gist paragraph between the heading and the cards. Addendum 4 asks for no paragraph there; the new code still has a one-line gist ("Servex is the one always-on process; each card is one of its classes."). That passes as the one-line answer to "why is it titled Servex", but it needs a fresh shot to confirm — shots/aisysdocs-localhost-framework-ai-system/sheet.png.
4. [note] The self-monitoring classes (Heartbeat, TaskLoop, Worktrees, Monitor, Assistant) still sit inside a `details` block. Addendum 3 asks for them to be de-emphasised, which this does. Addendum 5 says not to hide a large body of data behind an expander. Five cards is borderline; this is the owner's call (overview.js).
5. [note] review.mjs also shot many unrelated dated task pages (2026-10-02, 2026-10-03-*, ai2-*), probably because `children:` in ai/page.js changed. They do not bear on this diff.

Widths given: 400, 1200, 1920 and 3440 for /framework/ai/, /framework/ai/classes/, /framework/ai/classes/Session/ and /framework/ai/system/ (the last one shot before this diff).

## Requirements
- 1 "restructured /framework/ai/system/ … mostly cards of classes and live instances" — yes — system sheet: a grid of 14 class cards; this diff adds a link to the live debug view (overview.js)
- 1b "class card … and show live instances where they exist" — yes — classes-Session sheet: the Session card, then session.render() beside inspect(session), both redrawn by session.on()
- 1c "find the existing mechanism … do not build a second" — yes — the card reuses class_card/find from system-classes.js and inspect() from ux/Content; no new card system
- 2 "Readmes + architecture.md … linking the others" — yes, for this slice — ai/readme.md gains a one-line Class cards entry; the architecture docs are outside this diff
- 3 "findings.md" — n/a
- 4 "Reuse the other agents' outputs" — n/a
- A4 "link to the ai/ subdirectory system" — n/a
- A5 "Link the readme system from /framework/ai/system/" — yes — overview.js section "Documentation and readmes" (context lines)

## Page structure
- page 1 (title says what it is) — yes — classes-Session 1920: "Session" with the card directly beneath
- page 2 (one takeaway) — yes — the class, then its live object
- page 3 (reachable by a visible link) — yes — ai/page.js children "classes", the readme entry and the system section link
- page 4 (route) — yes — /framework/ai/classes/Session/ has its own URL

## Navigation
- navigation 1 — tabs (the AI band), sidebar tree
- tab rows — yes — layout.json tab_rows 1 at every width, on every page shot

## Layout
- fills the width — no (note) — classes page 3440: empty 0.90; Session page 3440: empty 0.84
- side by side when there is room — yes — Session 1200+: the view and the tree are columns; at 400 they stack
- overflow — yes — overflow_x false at all widths

## Sizing
- measure — no (note) — classes 3440 widest_text 928
- card size suits its content — yes on Session (card about 600px at 1920); no on the class index (the card is full width)

## Wrapping
- unwanted wraps — yes (only chrome) — wraps lists only the drawer-rail buttons at 400 and mode-btn at 1200, which come from the shared shell, not this diff

## Spacing and padding
- left stack — yes — h1 14/19px from doc-well; consistent with sibling pages
- gaps — yes — gap-100 between the columns; the bands show no big_empty

## Colour and contrast
- dark class card on a light page — yes — the same card as the system page; the code text is readable in the shots
- muted loading note — n/a

## Flow
- order — yes — card, then the rendered view, then the debug tree
- loading state — yes — "Loading the live session index…", replaced by "No sessions found." or the demo

## Words
- content 1 (gist in one line) — yes — "A class, its core API, and a live instance you can watch change."
- content 2 (no filler) — yes — labels are the call names ("Rendered: session.render()", "Debug tree: inspect(session)")
- content 3 (link every mention) — yes — readme entry and system-section link point at /framework/ai/classes/
