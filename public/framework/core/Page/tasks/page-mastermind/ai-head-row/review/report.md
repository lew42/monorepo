verdict: fix
1. [fix] On the Tasks tab the head marks **Home** as the current tab, not Tasks (navigation: the current place is marked) — shots/tasks-1200.png, top band: HOME wears the active underline while the page below is the task filter. The Tasks url forwards to `/framework/ai/?…`, which the Home link's href matches; the reader cannot tell which tab they are on.
2. [note] About 45 px of empty grey sits between the head and the first dashboard card (spacing) — layout.json: head ends at 58, `ad-dash` starts at 88 at 1200 (97 → 125 at 400), plus the dashboard's own 1em top padding; shots/…/1200.png, band 2.
3. [note] At 400 the tab strip clips mid-word ("QUEUE" cut at the right edge) with no fade or arrow to say it swipes — shots/…/400.png, top band. That is the swipe the owner asked for, but nothing shows there is more.

Widths given: 400, 1200, 1920, 3440 for `/framework/ai/`; plus the builder's own proof shots (dashboard, tasks, sessions, session).

## Requirements
- 1 "the robot icon, the AI title and the top tabs sit in ONE flex row on every AI page" — yes — shots/…/1920.png, 1200.png, 400.png top band; tasks-1200.png, sessions-390.png, session-1920.png; layout.json tab_rows 1 at every width
- 2 "the tabs swipe sideways" — yes — shots/…/400.png: the strip runs off the right edge inside its own row, page has no horizontal overflow (layout.json overflow_x false)
- 3 "Nothing below may break" — no — the Tasks tab works again (tasks-1200.png shows the filter, not the dashboard), but its tab is not marked current (finding 1); dashboard content otherwise intact
- class page — n/a (no class added; `head()` is a method on the AI page)

## Page structure
- page title says what it is — yes — "AI" with the robot icon, every shot, top band
- one title, no duplicate — yes — core's big title and Folder link are hidden on the dashboard (diff, AIDashboard.css); shots/…/1920.png shows one "AI"
- most important first — yes — Needs you / the big things / what is running lead; More pages moved to the bottom (1920.png, band 3)

## Navigation
- techniques — tabs, a sidebar (site tree), a bottom rail at 400
- tabs in one row — yes — layout.json tab_rows 1 at 400/1200/1920/3440
- current tab marked — no — tasks-1200.png marks Home on the Tasks page (finding 1); sessions-390.png marks none in view
- same tabs on every page (stable navigation) — yes — dashboard, tasks, sessions and session shots show the same strip
- no duplicate links — yes — Sessions, Tasks, Queue and Merge pills dropped from the dashboard (diff, AIDashboard.js)
- sidebar — yes — unchanged, AI marked in the tree (1200.png)
- bottom rail — yes — unchanged at 400

## Layout
- the head is one flex row edge to edge — yes — layout.json band `inbox-head` at y 0, share 0.058 at 1200
- dashboard columns fit the width — yes — 1 column at 400, 2 at 1200, 3 at 1920/3440 (sheet.png)

## Sizing
- head band size right — yes — layout.json share 0.046 / 0.058 / 0.063 / 0.07 at 400 / 1200 / 1920 / 3440
- content uses the width — yes — narrow_share 1 at 1920 and 3440; empty 0.58 / 0.68 is the short dashboard, not this change

## Wrapping
- tab strip wraps — no (good) — tab_rows 1 at every width
- unwanted wraps — no new ones — layout.json wraps list only the drawer/chatbox/mode buttons outside this diff
- More pages pills — yes, one row — 1920.png, band 3

## Spacing and padding
- head padding — yes — left_stack h1 14 / 19 / 27 / 54 px, grows with width
- gap head → content — no, a little wide — finding 2
- dashboard side padding — yes — left_stack p 27 / 45 / 58 / 73 px

## Colour and contrast
- head tones — yes — grey head band, active tab light with orange top line, readable caps tabs (1920.png, top band)
- More pages pills — yes — same quiet pills as before (1920.png, band 3)

## Flow
- top to bottom order — yes — head, the three dashboard columns, Usage, More pages (1920.png)
- the swipe is discoverable — partly — finding 3

## Words
- "Home" for the first tab — yes — plain, and the requirements explain why not "Dashboard" (a tab already has that name)
- "More pages" heading — yes — says what the row is
- title tooltip "Back to the AI home" — yes — matches the tab name
