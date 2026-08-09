**Usage** — called from `append()`'s promise branch (`View.js:72`) and directly by
`load()` (`View.js:281`). Every `content(){ return md.file(…) }` on this site goes
through it — that is the shape that lets a page return markdown with no support
from `Page`.

**Necessity** — yes. It is the only asynchronous member, and the reason async
content needs no framework mechanism: the view was placed synchronously, so
whatever arrives later lands where it was always going to.

**Simplicity** — right-sized at five lines. Note what it deliberately does **not**
do: it never sets the captor. It appends to `this` explicitly, because by the time
the promise settles the ambient captor is meaningless. `lazy()` is the member that
does the other thing, and it is the one with the sharp edge.

