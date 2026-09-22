The **Asks** tab: everything the owner asked for in a session, as preview
cards, each linked back to the sentence they said it in — and, one click
down and in place, what was discussed and decided about it.

Full design record, including the data shape and what is deliberately small:
[asks](/framework/ext/AITask/doc/asks/).

## The wall is level 1 and stays that way

`card()` renders a ▸ title, one two-line summary, a picture, a status chip,
the `n of m tasks landed` count and two or three links. `detail()` renders the
verbatim quote and, per serving task, one headline, its deliverables and the
lines that read as a decision — with the full report behind one more fold.
The click changes no url: `open()` toggles `.active` on the card and refills
one `.ai-ask-detail` box.

⚠ That box is a **member of the wall**, not a sibling after it. `row_end()`
finds the last card sharing the clicked card's `offsetTop` and puts the sheet
after it, and `.ai-ask-detail` spans `grid-column: 1 / -1`. Before that, the
card you clicked was 29 to 1,029px above the viewport on all 13 cards at 1280
— you clicked a thing and arrived somewhere with no sight of it.

## `serving()` reads the day, not the card

A card cannot know whether its task landed without that task's own log, so
`serving()` fetches every named slug's `task.jsonl` once when the tab builds,
skipping any dir the day's `directory.json` listing says has none. That
listing is the same one `dashboard.js`'s `warm()` has already started, so on a
click from a day page it is usually free.

## Improvements

1. **A `links` entry can still be a repo path, not a url.** `pill_label()` now
   cuts a path from the front (`minion/SKILL.md`) and `deliverable()` refuses a
   url the browser cannot go to, so a card never offers a pill that 404s — but
   the sheet below still lists what the task wrote. The real fix is upstream: a
   `links` entry should be a site url with a label a human reads.
   *(the writer's job)*
2. **The decision filter is a regex.** It accents lines, never hides them, so
   the failure mode is only a missed highlight — but a task that writes its
   reasoning without any of the keywords gets no accent at all. *(medium; an
   explicit `{"log": {"decision": true}}` flag would be exact, and is a schema
   change nobody has asked for yet)*
