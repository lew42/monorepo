# board-declutter — the AI board loses its chrome: one quiet line on top, cards with a background, a rail on a border

Minion: Opus, effort high. Session id `53dfe850-82d6-4943-9866-6197b53b4049`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Load `layout` and
`css` before anything (this is a taste task: the five sizing questions, then the utility
vocabulary in `framework.css`), then `code`. Private port **8098**. You own
`/framework/ai/v/3/` and `/framework/ai/page.js` — take the reload hold; the owner is on this
page and watching.

## The owner's words (2026-09-22 17:30, verbatim — each numbered thing is a deliverable)

> this ai dashboard has way too much bullshit.
>
> 1) there's like... 200px of dead space at the top.
>
> 2) Todays' board? Everything? Process? Start here? V3? 103 left? days, now, grid, timeline,
> prompts, gallery, dashboard, LIVE, everyone, card width
>
> then under that,
>
> minion-alpha-writer - minion - idle, minion-beta-writer - minion - idle, .etc...
>
> then the rail has a bunch of padding on the top, and the rail's scrollbar is literally
> hovering. scrollbars should be at the edge of a clear border. in this case, it should be full
> height, spanning the entire workspace (minus the header).
>
> the ui cards don't have bgs. they should have lightened (but not white) bg, and the selected
> card should turn white.

## Deliverables — measure before and after, at 1280 and 400 and 1920

1. **The dead space.** Measure the distance from the top of the viewport to the first card's
   top edge on `/framework/ai/` today (headless, `getBoundingClientRect`); log it. After: the
   first card's top is within one rhythm unit of the head row's bottom. Find the cause (a
   `warm()` placeholder? a sticky strip reserving height? `ai/page.js` catalog padding? the
   double mount `servex-hardening` just fixed?) and fix the cause, not the symptom.
2. **One quiet line of chrome.** Today three rows: the AI head (Today's board · Everything ·
   Process · Start here · V3 ▾ · N left), the view switch (days now grid timeline prompts
   gallery dashboard · Live · everyone ▾ · card width), and the agents strip. After: **one**
   line — the view words (keep the five that exist: days, now, grid, timeline, prompts — drop
   the greyed `gallery` and `dashboard` unless they do something) and, at the right end, the
   things that must stay reachable folded behind one `More` (Everything, Process, Start here,
   the version picker, Live, everyone, card width, the "N left" count). Decide what is deleted
   outright vs folded; write the `decision` with the alternative. The previous fold work is
   `ai/2026-09-21/head-mobile/` — read it, do not undo it.
3. **Idle agents are not a list.** The strip (`v/3/agents.js`) shows a chip per agent; the owner
   saw five idle proof agents by name. After: only agents that are `working` show as chips;
   idle/stopped ones collapse into one count ("3 idle") at the end of the same chrome line,
   expanded on click. When nothing is working and nothing is idle, the strip is absent.
4. **The rail sits on a border, full height.** The left rail (`Sidebar` — find it in
   `core/`/`ui/`; it is the site's, not v/3's — say in a `decision` whether the fix is a v/3
   override or a one-line change in the rail's own CSS, and prefer the rail's own CSS if the
   change is right for every page; `ext/grip` is the one resize handle). After: no top padding
   above the first rail item beyond one rhythm unit; the rail's scrollbar sits against a
   visible 1px border at the rail's right edge; the rail spans the full workspace height below
   the site header (measure: rail height = viewport height − header height).
5. **Cards have a background.** Every card on the board gets a lightened background (not
   white — pick from the design system's surface tokens in `framework.css`; the `lighten`
   utilities from `ai/2026-09-17/`'s layout-browser work exist); the selected/open card turns
   white. Hover does not change the background. Prove with a screenshot of the grid with one
   card selected.

## Proof

Before/after screenshots at 1280 (full page), 400, 1920 into `shots/`; the five measurements
in a table in the log (dead space px, chrome rows, chips shown, rail top padding px + rail
height vs viewport, card bg colour + selected bg). Zero console errors. Days still the default,
the Prompts tab's box still on top (`talk-to-assistant`), Approve/Improve still on cards. Then
`ai/2026-09-22/board-declutter/page.js`: the before and after side by side and the five numbers.

## Fence

`public/framework/ai/v/3/**` (not `board.jsonl`), `public/framework/ai/page.js`, the rail's own
CSS file (one file, named in your `decision`), your task dir. Append-only to `.jsonl`.
No new CSS class without `new-css-class`; no `framework.css` edits. Not `Servex/`, not `Server/`.

## Length

Fewer lines after than before is the goal. Landing report: six sentences and the two screenshots.

## Owner addendum (17:33, verbatim)

> the timeline, prompts, grid, now, and days, don't even have a route... a live reload would
> navigate me away from this page...

6. **Every view is a URL.** `/framework/ai/days/`, `/framework/ai/now/`, `/framework/ai/grid/`,
   `/framework/ai/timeline/`, `/framework/ai/prompts/` (and the same under `/framework/ai/v/3/`)
   each open that view, the view words are real links, and a live reload — or a paste of the
   URL — lands on the same view with the same open card. The `?view=` param and the saved
   preference keep working as fallbacks. Routing is the `Page` router's `route(name)` (see
   `ai/2026-09-22/page.js` for the pattern and `core/Page` for the docs) — the day's `page.js`
   already routes task dirs live. Prove: load each of the five URLs headless, assert the view
   is the one named; reload one with a card open and assert the card is still open.

## Owner addendum (17:37, verbatim)

> the "days", "now", "timeline" tabs seem to use some sort of localstorage or something to
> persist the current tab... but that's literally what routes are for...

So for deliverable 6 the order of truth is: **the URL decides the view, always.** The stored
preference (`prefs.get({view})` in `v/3/page.js`) is consulted only when the URL names no view
(`/framework/ai/` bare) — and even then, consider whether the bare URL should simply redirect
to `/framework/ai/days/` (the default) so there is one truth; write the `decision`. Clicking a
view word is a navigation (`history.pushState` or a real link — the router's way), the back
button works, and `?view=` is accepted once and rewritten to the path.

## Owner addendum (18:03, verbatim) — two more, both small

> I don't like the grid. It doesn't make any sense. It's just this huge thing. Maybe we just
> hide the grid for now. Also the layout on the grid has a word, it says sorted by importance.
> That word is nudged against the left side of the page with zero padding. This is the law of
> padding that should never be broken. Move the text off the rail, give it some padding.

8. **Hide the grid view** — the word leaves the chrome line, `/framework/ai/grid/` redirects to
   `/days/`; the code stays (one flag to bring it back), say so in a `decision`.
9. **Nothing touches the rail.** Every view's content — the "sorted by …" line, the chrome
   line, the first card, the Prompts thread — sits at the page's gutter (`--gutter-x`, the same
   inset the cards already have), never at 0px from the rail. Measure the left edge of the
   first text node in each view at 1280 and 400 against the rail's right border: ≥ one rhythm
   unit, in the log as a table, before and after.
