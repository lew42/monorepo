My own menu entry: `{ url, label, icon, card }`.

**Usage** — `nav_for()` spreads it (`Page.class.js:159`) and `preview_card()` defaults to
it (`Page.class.js:177`).

**Necessity** — yes, for one reason: **`preview()` has to work with no argument.**
`previews()` always passes a nav entry, but five sandbox pages call `page.preview()` bare
and a page rendering its own card has no parent to ask. This is the answer, and it costs
one line.

**Simplicity** — one line, four keys, all `??` defaults already documented on the
properties they read. Adding it also removed the duplicate `icon` / `card` reads from
`nav_for()`, which now spreads this and overrides only the two things a *list* decides:
the url the entry appears at, and the label when the child is not there to say.

The asymmetry is deliberate and recorded in `nav_for.md`: **an entry belongs to the list
it appears in**, so a parent still builds the url. `nav()` is what a page says about
itself; `nav_for(name)` is what a list says about one of its own.
