verdict: pass
1. [note] shots/390.png is stale: it shows the cards first and no count above the fold. The diff drops `.tq-side { order: 2 }` (TaskQueueView.css), so the side column, with the count, now comes first in the DOM on a phone. Re-shoot 390 to prove it.
2. [note] None of the 8 cards in shots/1920.png shows a "one-line why", which the owner asked for (ask 2.2). `own_why()` (TaskQueueView.js) hides the "serves priority N" note, and every top task has only that note. This follows the mastermind's card fix, but the owner's list still names a why. A short source line, for example the `why_url` ask, would fill it.
3. [note] The "sidebar rail under AI" link went into the AI rail's footer words (ai/rail/rail.js:127). That rail shows only on day and card pages, not on the site sidebar the owner meant, so ask 3 is only partly met there. Un-leafing AI in the site sidebar is the owner's call.
4. [note] A click on a card opens the task's own page (`href(r.url)`) at every width. There is no detail beside the list when the screen is wide. The brief allowed that ("if the navigation rule allows it"), so the simple choice is fine.
5. [note] The claim that a second QueryClient steals pushes holds: `Socket.prototype.query_stale` routes to the single static `QueryClient.current` (ext/Query/QueryClient.js:35). The links carrying no count is therefore justified.
6. [note] shots/cold-reading.png still shows the old side heading "What is in the queue"; the code now says "Queued tasks". The shot was taken before the final commit. Its message, "Reading…" with no 0, still matches the code.
7. [note] On a fully cold or broken server, the error appears only after 5 tries × a 30 s timeout plus backoff, about 2.6 minutes. Until then it keeps saying "Reading…". That is acceptable, but a shorter timeout on the retries would surface a real fault sooner.

## Requirements
Widths given: 390, 1920, 3440 (flat in shots/, no layout.json).
- 1 "Never a false 0" — yes — `ask()` sets `loaded` only on a successful answer and `paint()` draws no count until then; cold-reading.png shows "Reading…", cold-ready.png shows the count; the log has page 142 = --check 142.
- 2 "A design that reads at a glance, one screen at 1920" — yes — shots/1920.png: big 142, the split by big thing, 8 cards, no scroll. The why line is missing (finding 2).
- 2.3 "Everything else one click down" — yes — "All 142 ranked →" and "How the ranking works →" (?view=all, ?view=ranking).
- 3 "Linked where the owner looks" — partly — the day page (AIDay.js:54) and the session tab row (AISessionDetail.js:196) are done; the rail link is in the AI rail footer, not the site sidebar (finding 3); there is no live count (finding 5).
- Done list (readme current, Watch out line) — yes — readme.md updated with a cold-start line.
- Live instances of a changed class — n/a — TaskQueueView is the live view itself.
## Page structure
- one clear title and purpose — yes — 1920.png top: "Task queue", then the count first.
## Navigation
- techniques — the AI tabs, the site sidebar, links to sub-views by query string.
- queue reachable — yes — the QUEUE tab, plus three new links.
## Layout
- side column + main column at ≥1000px — yes — 1920.png; one column at 390.
## Sizing
- the count is the biggest thing — yes — 4.5em in 1920.png. At 3440.png the cards span the width, which is fine, but the bottom ~55% is empty (not measured).
## Wrapping
- titles clamp to 2 lines — yes — 1920.png cards; the big-thing name "#2 Every ask becomes…" wraps to 2 lines in the side column, which is acceptable.
## Spacing and padding
- even card gaps and padding — yes — 1920.png card grid.
## Colour and contrast
- the muted chips are readable — yes — 1920.png card bottoms; the state shows in ok colour only when running.
## Flow
- count → top 8 → one click to all — yes — 1920.png reading order.
## Words
- plain words, no jargon — yes — "Next up: the top 8, best score first", "All 142 ranked →"; error messages say what is wrong.
