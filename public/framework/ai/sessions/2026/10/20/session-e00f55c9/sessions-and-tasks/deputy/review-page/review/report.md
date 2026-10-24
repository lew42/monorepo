verdict: fix
1. [fix] A row still shows a folder slug as its title: the first child reads "deputy" (requirements 2, "plain title") — shots/work-flat-400.png, first row; shots/work-1920.png, first row.
2. [fix] The parent link was patched around, not fixed at its source (requirements 1, "fix the generator, don't patch around it"). The diff never touches the `session-tree.json` generator. SessionWork nests by folder instead, and the head still says "10 tasks ran in sessions filed under another day: their cost and Approve are not shown here yet" (33 at 1200) — shots/work-1920.png, head card.
3. [note] The review run shot the wrong page. It shot `/framework/ai/AITask/` (a Doc page this diff barely changes) and not the session page's Work tab, which is the deliverable. So everything below about the Work tab is judged from the builder's own shots: work-400, work-flat-400, work-1200, work-1920 and work-flat-1920.
4. [note] The AITask shot still logs one 404 at every width (layout.json `errors`, 4 of 4), and that 404 is what the new `/api/folder-names` listing was meant to remove. It is likely the dev server had not restarted onto the plugin (Server/README.md says so), but nobody confirmed it.
5. [note] At 400 the session's title shows three times (the breadcrumb, the panel head, the Work card), and the six tab chips wrap to 2 rows with "Related" alone — shots/work-flat-400.png, top three bands.
6. [note] A "waiting" row's dot is grey, while the waiting total is amber and mobile-cards.md asks for amber — shots/work-1920.png, the Figma row. Only `live` is coloured amber in SessionWork.css.
7. [note] The brief said "log a `show:` line, and stop for the look". The `show:` line came at 20:01, but the builder went on to `ready:` at 20:12 without the look (session.jsonl lines 39, 53).
8. [note] Five new classes have no page that shows their live instances: SessionWork, Approvals, Review, FilterPill and TimeFilter. Approvals holds the approvals the owner would want to watch; today the session page itself is the only place to see them.

Widths given: 400, 1200, 1920 and 3440 of `/framework/ai/AITask/` (with layout.json). The Work tab is judged from the builder's shots at 400, 1200 and 1920 (no layout.json).

## Requirements
- 1 "Children nested, never flat" — yes, in part — shots/work-1920.png: the rows fold (▸ deputy, ▸ Figma) with their children inside; but no generator was fixed, and the head admits 10 tasks are missing their cost (finding 2)
- 2 "plain title, cost (own and rolled up), duration, tasks created, tasks completed, what still needs doing" — mostly — every figure is on each row ("$10.95 own · $15.07 with 4 below · 58 min · 0 of 4 tasks complete", "Open: …"); the "deputy" title is a slug (finding 1)
- 3 "Completion is honest" — yes — rows read "no tasks recorded" (work-1920, the "day page" row); counted by Task.progress_of, the same code Session.progress() uses (Session.js:46); only `complete` counts
- 4 "Approve per row and Approve all, leaks in red, the Today ▾ pill; each class where it belongs" — yes — Approve buttons and "Approve all" (work-1920); leak rows red; Approvals/Review/SessionWork in ai/AISession, FilterPill/TimeFilter in ux/Filter
- 5 "a first tab 'Work', open by default; the other tabs stay; shoot at 400, 1200, 1920; show: line; stop for the look" — yes, except the stop — the Work chip is first and on; all five other tabs stay; shots at 3 widths; show: at session.jsonl line 39; no stop (finding 7)
- live instances of a new class — no — finding 8

## Page structure
- page 1 (title says what it is) — yes — work-flat-400.png: "Session and task systems documentation"
- page 2 (one takeaway, first) — yes — the head card: cost, three totals, Approve all
- page 3 (most important first) — yes — the Work tab opens first; the head sits above the rows
- page 4 (no repeated chrome) — no — the title appears 3 times at 400 (finding 5)

## Navigation
- page 13 identify — tabs (chips), a sidebar (1200+), a side panel (detail beside the list), folds (details)
- tabs: one row — no at 400 (2 rows, "Related" alone, work-flat-400); yes at 1200/1920
- tabs: state in the url — yes — `?tab=` is dropped for work, kept for the others (AISessionDetail.js diff)
- tabs: current one marked — yes — Work chip outlined
- folds: the affordance shows — yes — ▸/▾ before the name
- filter pill: choice in the url — yes — `?when=` (TimeFilter.js)

## Layout
- columns fit their content — yes — work-1920.png: list, detail and chat side by side, no squeeze
- no overflow — yes — AITask layout.json `overflow_x` false at all four widths; the Work shots show no clipping
- left edges align — yes — work-flat-400.png: head card and rows share one left edge

## Sizing
- line length readable — yes — the AITask widest text is 448 at 400 / 709 at 3440 (layout.json); Work rows run ~600 px at 1920
- buttons a fair target — yes — Approve ~60×24 px, Approve all full pill (work-flat-400)
- the screen is used — yes at 1920; at 3440 the AITask page is 71% empty (layout.json), but that page is out of this diff's scope

## Wrapping
- nothing wraps that shouldn't — no at 400: the tab chips wrap (finding 5); the facts lines wrap to 2–3 lines, which is fine
- titles wrap cleanly — yes — "Figma: mobile cards for sessions, projects, tasks and processes" wraps to 2 lines without breaking a word (work-flat-400)
- AITask wraps — the h2s wrap to 2–3 lines and the drawer-rail buttons by 3.2 lines at 400 (layout.json `wraps`): these come from before this diff

## Spacing and padding
- even rhythm between rows — yes — work-flat-400: flat rows, one rule between each, one indent
- no dead band — no, small — work-flat-400.png: about 40 px of empty space between the panel head and the tab chips (band 3)
- padding consistent — yes — the head card's padding matches the stat tiles

## Colour and contrast
- status colours mean one thing — no, small — the waiting dot is grey while the waiting total is amber (finding 6)
- red only for leaks — yes — the leaking total and the leak rows only
- contrast — yes — white on green for Approve all, red on white for leak names; both read clearly at 400

## Flow
- reading order top-down — yes — title, pill, figures, totals, Approve all, then the rows
- the action sits next to its subject — yes — Approve at each row's right edge
- feedback after the action — yes — Approvals shows the change at once and puts it back if the write is refused; the note says "Not saved: …" (SessionWork.js)

## Words
- plain words — mostly — "$691.79 with 71 below" is terse; "with its 71 tasks" would be plainer
- no slugs as titles — no — "deputy" (finding 1)
- notes say what to do — no, small — "10 tasks ran in sessions filed under another day … not shown here yet" explains a limit of the tool, and gives the owner nothing to do
- labels match the owner's words — yes — "Approve", "Approve all", "leaking", "Today ▾"
