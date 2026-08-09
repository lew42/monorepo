A one-sentence subtitle for the page.

**Usage** — declared on ~30 pages. **`Page` itself never reads it.** The only
consumer in `public/` is `ext/classdoc`, which copies it onto the overview child
(`framework/ext/classdoc/classdoc.js:126`) — where nothing reads it either.

**Necessity** — no, as currently wired. It is framework-shaped API with no
framework behaviour behind it: a page declares a description, and nothing at all
happens.

**Simplicity** — the property is a string; the problem is that it is *unowned*.
Three ways out, and the choice is a design decision rather than a cleanup:

| | |
|---|---|
| `render()` emits it under the `h1` | every page that declared one gets a subtitle, and 130 that didn't look bare |
| `nav_for()` carries it, and cards show it | the card wall becomes a summary — but `.page-preview` is a 60px row |
| delete it | 30 pages lose a line that was never rendered |

**Recommendation: pick one and write it down.** A property this widely declared and
never read is the kind of thing that gets "fixed" by three different people in three
different ways. Proposed in `readme.md`.

