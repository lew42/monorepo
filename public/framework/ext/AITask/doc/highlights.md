# The highlight — the wall on `/framework/ai/`

A **highlight** is the one thing a task says about itself to someone who was
not there. It is a single line the task appends to its own `task.jsonl`:

```json
{"assign": {"highlight": {
  "icon": "explore",
  "title": "The layouts encyclopedia",
  "line": "Thirteen named layouts, defined, drawn and tagged to point at.",
  "url": "/layouts/"
}}}
```

`assign` replays onto the manifest (`ext/JSONL`), so it arrives as
`m.highlight` with no reader change and no schema migration. That is the whole
mechanism: **the task record stays the one source of truth.** There is no
curated list, no separate file, nothing to keep in step. A task that never
marks itself simply is not on the wall — it is still on
[the log](/framework/ai/log/), which holds every task of every day.

To un-mark something, delete its `highlight` line. To change a card, append a
new one — later `assign` lines win.

## Why the front needed it

The owner opened `/framework/ai/` looking for a controls study they had asked
for weeks earlier and could not find it. The page was every task of every day
on one spine — 572 rows, newest first. That is an archive, and an archive is
not an answer.

So the front is now: what is running right now, the usage windows, then the
**highlights wall**, then one line naming the log. The whole spine moved to
[`/framework/ai/log/`](/framework/ai/log/), forty rows at a time. Nothing was
deleted; one page became two, each answering one question.

## The four fields

| field   | what it is |
| ------- | ---------- |
| `icon`  | a Material Icons ligature name — see the six below |
| `title` | **five words or fewer**, the name of the thing |
| `line`  | one plain sentence a newcomer follows, no jargon |
| `url`   | **the thing itself**, never the task page |

`url` is the field people get wrong. The reader is looking for the work, not
for the log line about the work — so `/layouts/`, not
`/framework/ai/2026-09-08/layouts-standard/`. The small `log` link in the
card's corner is the way back to the record.

A card carries no date of its own: the **day heading** above its group is the
date, and it links to that day's board.

## The six icons — one per kind of thing

One icon per KIND, used consistently, so the wall reads at a glance before a
single word is:

| icon | kind | example |
| ---- | ---- | ------- |
| `layers` | a framework tier you can browse | [`/framework/ux/`](/framework/ux/) |
| `explore` | a place — a realm, a world, a corpus | [`/imagine/scenes/`](/imagine/scenes/) |
| `science` | a study, measured, with a page | [`/framework/styles/system/studies/color/`](/framework/styles/system/studies/color/) |
| `article` | a written post | [`/blog/ai/playwright/`](/blog/ai/playwright/) |
| `build` | a tool you operate | [`/framework/dev/DevBar/`](/framework/dev/DevBar/) |
| `straighten` | a standard the whole site follows | [`/framework/ui/controls/`](/framework/ui/controls/) |

A seventh kind is a proposal, not a commit: seven icons is a legend nobody
reads, and the point of the icon is that it needs no legend.

## What earns one

Something the owner would go and open later: a tier, a realm, a system, a
class, a standard, a post, a tool, a study with a page.

**Not** fixes, audits, scouts, critics, or a slice of something bigger — a
thing is marked once, on the task that landed it. **Not** a run either: a
mastermind run is a container, so its *products* get the cards.

When in doubt, leave it out. The log has everything.

## Paging, and why it does not persist

The wall draws 100 cards, then a `Show more` for the next 100; the log draws
40, then 40 more. Both counts live in a closure and nowhere else, so a refresh
starts the reader at the top again. That is deliberate: a demo does not
persist, and neither does a reading position nobody asked to keep.

## Traps

- **A task with only a `session.json` cannot be marked.** `manifest()` prefers
  `task.jsonl` and returns it the moment it loads, so creating one beside a
  legacy `session.json` would *hide* that task's outcome, state and links.
  `2026-08-13/panel` is the one that hit this; the Panel card lives on
  `2026-08-16/panel-swiss-army` instead.
- **Append with a script, never by hand.** Build the line with
  `JSON.stringify`, keep it pure ASCII (a Windows append turns an em dash into
  an invalid byte and the viewer drops the whole line), and re-parse every line
  of the file afterwards — an unparsed line is silent except for a warning
  count. [`doc/decisions.md`](/framework/ext/AITask/doc/decisions.md)
- **The wall counts only what is visible.** Opening `/framework/ai/log/` routes
  a child, and `ai.css` answers by hiding the index rail with `display: none` —
  the rail's cards are still in the DOM. Any measurement of either page has to
  filter on `offsetParent !== null` or it reads the front's wall everywhere.
