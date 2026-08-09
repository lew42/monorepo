A single card for *this* page, built by whoever is listing it.

**Usage** — no caller in `framework/`. Five in the sandboxes:
`alex/examples/subpage/page.js:14`, `alex/examples/subpage/nested/page.js:22`,
`path-2/page.js:18,20,24`, `path-2/a/page.js:22`.

**Necessity** — doubtful in this form. `previews()` — the method that would obviously
use it — does not: it builds its own card so it can lead with an icon and wrap the
label in `.page-preview-title`.

**Simplicity** — the method is one line and correct. The *pair* is the problem:
`.page-preview` now has two markup shapes, and `Page.css` styles the flex one. A
card built by this method has no `.page-preview-title` child, so any rule that
selects it silently misses.

**Two ways out:** have `previews()` call `preview()` (one shape, and `preview()`
grows the icon), or delete `preview()` and let a caller write `page.link()`. See
`readme.md` §Proposed.

