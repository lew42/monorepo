# Parts: class architecture and decisions

The task and its brief: `ai/2026-10-12/page-slice/` ([requirements](/framework/ai/2026-10-12/page-slice/requirements.md)).
The owner's idea: a page's body is a list of views loaded from the page's own JSONL and drawn in a loop, not only a markdown string. This slice proves it with nothing new in `core/Page`.

## The classes

| Class | File | Job | Relation |
|---|---|---|---|
| `PartsPage` | `Parts.js` | The orchestrator: draws the page's `content` list one part at a time, redraws on list events, offers `add_part` / `move_part` / `remove_part`. | extends `Page` |
| `Part` | `Part.js` | One piece of the body, plain data in a log line; `draw()` says how it looks. Registers wire names as `part-<kind>`. | extends `Item` |
| `HeadingPart` | `HeadingPart.js` | `part-heading`, one big line. | extends `Part` |
| `TextPart` | `TextPart.js` | `part-text`, markdown (`ext/markdown`, imported lazily). | extends `Part` |
| `CardPart` | `CardPart.js` | `part-card`, a boxed title and a line. | extends `Part` |
| `MdToParts` | `MdToParts.mjs` | Script: markdown file to parts lines (so no AI retypes a page). | standalone |

`PartsPage` composes `Page`'s own `content` `List` (made by `ensure_content()`); its `Part` items are hydrated from the `type` on each `add` line by `Item.hydrate`. Storage, the live tail, and a second tab are all the existing `Page.Reader` / `Item.Store`: nothing was added there.

## Decisions
- **`page.jsonl` with a class line, not `page.js`.** Today most pages are code; here the page is data, and the only code is one shared class. Alternative kept: `page.js` calling `content()`.
- **All deltas, no snapshot line.** Line 1 is the page's settings, then one `add` per part. The reader replays it all, so a log is also its own history. A snapshot line (`{"content":[...]}`) would hydrate too, but hides the history; use it only if a log grows large.
- **Add beside, don't change `core/Page`.** `Page.render_content_list()` already draws `title`/`text` rows with card chrome. `PartsPage` overrides only `render_content()`.
- **Reuse the content list verbs.** `add`, `move` (`after`), `remove`, `order` already exist on `List` and in `page_set`; the slice invented no verbs. Alternative: a new `views` list, rejected (a second version of the same system).
- **Wire name `part-<kind>`.** `ext/editor` registers `Text` and `Card` globally.

## Need from core (not done)
- Templates (toolbar, header, sidebar) as parts: needs a `part-slot` kind that draws another page's parts; not built.
- `Page.render_content_list()` could call `item.draw()` when present, making `PartsPage` unnecessary; left alone per the brief's fence.
