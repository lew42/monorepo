# Omnibox — moved into core on 2026-09-06; this directory is a pointer

The search box is [`core/Search`](/framework/core/Search/) now: `Search` is the corpus and the
ranking, `Search/Omnibox.js` is the box, and `app.js` mounts **one** of it for the whole site.
Press `/` or Ctrl/Cmd K on any page.

## Use

Nothing here. If you are writing a page, you do not import a search box — there already is one.
`Omnibox.js` remains only so an older import does not break; constructing it draws a line saying
where the box went.

## Watch out

- **Do not name a `View` subclass `Omnibox`** — `classify()` mints `.omnibox` from the class name,
  which is `position: fixed`, bottom-centre. The shim class here is `OmniboxMoved` for that reason.
- `/imagine/platform/omnibox/` still describes the 2026-09-04 prototype and its stats line reads
  "indexing…" forever. It wants a rewrite; nothing there is broken.

## More

- [/framework/core/Search/](/framework/core/Search/) — the module, live
- [core/Search/doc/decisions.md](/framework/core/Search/doc/decisions/) — what graduated from this
  prototype, and what was dropped, with the reason for each
- [doc/decisions.md](/framework/ext/Omnibox/doc/decisions/) — the 2026-09-04 prototype's own verdicts, kept as the record
