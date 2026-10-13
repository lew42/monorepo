# v3-page.js notes and design decisions

## Module-level

AI dashboard v3: the board of idea cards (now, timeline, grid, days, prompts); the notes behind this file are in doc/notes.md

## Constants and simple utilities

Verdicts_url (doc/notes.md#verdicts_url)
Inbox zero (doc/notes.md#inbox-zero)
Eligible for a verdict (doc/notes.md#eligible-for-a-verdict)
Whether the owner can speak on a card at all (doc/notes.md#whether-the-owner-can-speak-on-a-card-at-all)
Today's own day-dir name (doc/notes.md#todays-own-day-dir-name)

ISO stamp: carries THIS machine's own offset — copied from day-audit's page.js, the same reason it gives: `toISOString()` would move it to UTC.

One whole line into a .jsonl under public/, through (doc/notes.md#one-whole-line-into-a-jsonl-under-public-through)
One line onto verdicts.jsonl (doc/notes.md#one-line-onto-verdictsjsonl)

## Mastermind integration

Improve must reach the mastermind the same way the owner's (doc/notes.md#improve-must-reach-the-mastermind-the-same-way-the-owners)
True once the note reached the mastermind's inbox; false (doc/notes.md#true-once-the-note-reached-the-masterminds-inbox-false)

## Page and route definitions

Ai dashboard, version 3 (doc/notes.md#ai-dashboard-version-3)
The same guard /framework/ai/'s own page has carried since (doc/notes.md#the-same-guard-frameworkais-own-page-has-carried-since)
Two routes under this board, and board_route() below owns (doc/notes.md#two-routes-under-this-board-and-board_route-below-owns)
a real file (favicon.ico &c), not a card
Every view is a url (doc/notes.md#every-view-is-a-url)
The one flag that hides a view (doc/notes.md#the-one-flag-that-hides-a-view)

## Board rendering

The board root draws itself exactly once, and only when it (doc/notes.md#the-board-root-draws-itself-exactly-once-and-only-when-it)
Inside content() the captor is already this page's own (doc/notes.md#inside-content-the-captor-is-already-this-pages-own)
The last way a board goes blank, and the only one a handoff (doc/notes.md#the-last-way-a-board-goes-blank-and-the-only-one-a-handoff)
Defer_board, not draw_board (doc/notes.md#defer_board-not-draw_board)
A hidden view's url still resolves, and lands on the (doc/notes.md#a-hidden-views-url-still-resolves-and-lands-on-the)
Coming back to this view from a card under it.
Shared by the bare /v/3/ page and every route(id) page (doc/notes.md#shared-by-the-bare-v3-page-and-every-routeid-page)
Root is the board's own address (doc/notes.md#root-is-the-boards-own-address)
?log=/?verdicts= (doc/notes.md#logverdicts)
Live (doc/notes.md#live)

## View state and live button

Set_live() is the one place that ever changes live (doc/notes.md#set_live-is-the-one-place-that-ever-changes-live)
Live-select, 2026-09-21 (doc/notes.md#live-select-2026-09-21)
Author filter (doc/notes.md#author-filter)
Head-mobile (doc/notes.md#head-mobile)
The url decides the view, always (doc/notes.md#the-url-decides-the-view-always)
A hidden view falls back like a misspelt one (doc/notes.md#a-hidden-view-falls-back-like-a-misspelt-one)
A card's own url always shows that card (doc/notes.md#a-cards-own-url-always-shows-that-card)
One truth, and it is the url (doc/notes.md#one-truth-and-it-is-the-url)

## View rendering

The timeline and now views' own instances survive across a (doc/notes.md#the-timeline-and-now-views-own-instances-survive-across-a)
Usage footer (doc/notes.md#usage-footer)
Days (doc/notes.md#days)
Prompts (doc/notes.md#prompts)
Tab highlight follows view (doc/notes.md#tab-highlight-follows-view)
The count is the point (doc/notes.md#the-count-is-the-point)
The view words, and they are the only chrome left on the (doc/notes.md#the-view-words-and-they-are-the-only-chrome-left-on-the)
Talk (doc/notes.md#talk)

## More panel

More (doc/notes.md#more)
THE COUNT — still the point, still one press away (`paint_count()`).
Live 2 (doc/notes.md#live-2)
AUTHOR FILTER — see the `let author_filter` declaration above for its scope (the timeline view's own axis).

## Layout and header

Full bleed (doc/notes.md#full-bleed)
One quiet line of chrome (doc/notes.md#one-quiet-line-of-chrome)
The title is the way home (the owner, 2026-09-21: "I want you to make the AI title on the V3 page link back to framework AI").
Agents strip (doc/notes.md#agents-strip)
Its own line inside the same flex row (doc/notes.md#its-own-line-inside-the-same-flex-row)
Usage footer 2 (doc/notes.md#usage-footer-2)

## Card updates

A landed minion/task-mastermind's own last words become a (doc/notes.md#a-landed-miniontask-masterminds-own-last-words-become-a)
Every card the fast assistant makes of your words lands on (doc/notes.md#every-card-the-fast-assistant-makes-of-your-words-lands-on)

## Days view

Days 2 (doc/notes.md#days-2)
One day's own log — `{at, task, msg}` per line, never merged, never cached: this file is history the moment the day rolls over.
Unlanded tasks of today only (doc/notes.md#unlanded-tasks-of-today-only)
One finished task, collapsed to the one-line headline it (doc/notes.md#one-finished-task-collapsed-to-the-one-line-headline-it)
A task that opened today and has not landed yet (doc/notes.md#a-task-that-opened-today-and-has-not-landed-yet)

## Timeline view

The default view (doc/notes.md#the-default-view)
Newest first, top-level only (doc/notes.md#newest-first-top-level-only)
newest date first
newest run first — say.mjs's own tiebreak
Built from day.name/run.name, never run.full/run.path (doc/notes.md#built-from-daynamerunname-never-runfullrunpath)

## Master-detail split

Live-select, 2026-09-21 2 (doc/notes.md#live-select-2026-09-21-2)
Live-select, 2026-09-21 3 (doc/notes.md#live-select-2026-09-21-3)
The verdict toast (doc/notes.md#the-verdict-toast)
.v3-mobile-back is css-hidden except under the <40em media (doc/notes.md#v3-mobile-back-is-css-hidden-except-under-the-40em-media)
Live-select, 2026-09-21 4 (doc/notes.md#live-select-2026-09-21-4)
A click anywhere in the open card's own detail (doc/notes.md#a-click-anywhere-in-the-open-cards-own-detail)
Selected (doc/notes.md#selected)
Fix 3 (doc/notes.md#fix-3)
Fix 1b (doc/notes.md#fix-1b)

## Card rows and styling

Timeline (doc/notes.md#timeline)
The owner's own title is only ever the first 90 characters (doc/notes.md#the-owners-own-title-is-only-ever-the-first-90-characters)
Timeline 2 (doc/notes.md#timeline-2)
Rescaled 2026-09-21, measured (doc/notes.md#rescaled-2026-09-21-measured)
The divider above one card (doc/notes.md#the-divider-above-one-card)
One card's own row plus its axis decoration, built together (doc/notes.md#one-cards-own-row-plus-its-axis-decoration-built-together)
The brief highlight a resurfaced row gets (doc/notes.md#the-brief-highlight-a-resurfaced-row-gets)
Full rebuild only on first draw; every later call patches (doc/notes.md#full-rebuild-only-on-first-draw-every-later-call-patches)
Placed correctly below, in the reconciliation step (doc/notes.md#placed-correctly-below-in-the-reconciliation-step)
Resurfacing (doc/notes.md#resurfacing)
A card that vanished (approved and hidden, or the file was reset) loses its row.

## Navigation and selection

The jump key (doc/notes.md#the-jump-key)
The undecided queue (doc/notes.md#the-undecided-queue)
Called right after a verdict is posted on the card (doc/notes.md#called-right-after-a-verdict-is-posted-on-the-card)
Read the decided card's own title before it can disappear (doc/notes.md#read-the-decided-cards-own-title-before-it-can-disappear)
A plain reopen (doc/notes.md#a-plain-reopen)
Re-check against the freshly reloaded rail (doc/notes.md#re-check-against-the-freshly-reloaded-rail)

## Toast notifications

The verdict toast 2 (doc/notes.md#the-verdict-toast-2)
Mirror the append into the local verdicts model by hand, (doc/notes.md#mirror-the-append-into-the-local-verdicts-model-by-hand)

## Selection and routing

Fix 2 (doc/notes.md#fix-2)
a no-op above the <40em breakpoint
Card_url() is built from the board root this page was (doc/notes.md#card_url-is-built-from-the-board-root-this-page-was)
The last path segment is the card id on any of the three (doc/notes.md#the-last-path-segment-is-the-card-id-on-any-of-the-three)
Landing on a real card's own url (doc/notes.md#landing-on-a-real-cards-own-url)

## Keyboard shortcuts

One at a time, by keyboard (doc/notes.md#one-at-a-time-by-keyboard)

## Layout and splitting

── the drag handle (doc/notes.md#the-drag-handle)
First layout tick (doc/notes.md#first-layout-tick)

## Update and deselect

Fix 2 2 (doc/notes.md#fix-2-2)
The card the owner had open can vanish the instant its own (doc/notes.md#the-card-the-owner-had-open-can-vanish-the-instant-its-own)
Fix 2 3 (doc/notes.md#fix-2-3)

## Now view

The now view (doc/notes.md#the-now-view)
Stale (doc/notes.md#stale)
A real link, not a button (doc/notes.md#a-real-link-not-a-button)
An answer (doc/notes.md#an-answer)

## Streaming

── streaming (doc/notes.md#streaming)
still streaming — leave the growing body alone
The idle timeout can fire with no further board tick to (doc/notes.md#the-idle-timeout-can-fire-with-no-further-board-tick-to)
already replaced by a newer sync

## Weighting and ranking

Raw hit counts and per-id history, over timeline's own (doc/notes.md#raw-hit-counts-and-per-id-history-over-timelines-own)
How much a card matters, right now (doc/notes.md#how-much-a-card-matters-right-now)
The one card currently in focus (doc/notes.md#the-one-card-currently-in-focus)

## Card helpers

.card's own status edge (doc/notes.md#cards-own-status-edge)
The owner's own card that this one answers (doc/notes.md#the-owners-own-card-that-this-one-answers)
Text up to its first full stop (doc/notes.md#text-up-to-its-first-full-stop)
The first non-empty line, not split(\n)[0] (doc/notes.md#the-first-non-empty-line-not-splitn0)

## Importance wall

The owner's own words are the log's business, not an idea (doc/notes.md#the-owners-own-words-are-the-logs-business-not-an-idea)

## Detail panel

The right column's content (doc/notes.md#the-right-columns-content)
Not a regex trim of c.id off page.url (doc/notes.md#not-a-regex-trim-of-cid-off-pageurl)
The owner's own words this card answers (doc/notes.md#the-owners-own-words-this-card-answers)
Same rule as the inbox row (doc/notes.md#same-rule-as-the-inbox-row)
Full markdown, not one p() per line (doc/notes.md#full-markdown-not-one-p-per-line)
Resurfacing's other half (doc/notes.md#resurfacings-other-half)
Prompt cards (doc/notes.md#prompt-cards)
Inbox zero 2 (doc/notes.md#inbox-zero-2)

## Verdict controls

Approve / improve, right on the card's own detail (doc/notes.md#approve-improve-right-on-the-cards-own-detail)
Say what the button will do (doc/notes.md#say-what-the-button-will-do)
Improve with no sentence tells nobody anything (doc/notes.md#improve-with-no-sentence-tells-nobody-anything)
Not a bare owner literal (doc/notes.md#not-a-bare-owner-literal)
