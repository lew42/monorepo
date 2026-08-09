**Usage** — 3 live call sites, all of them cleanup rather than UI:
`framework/ext/highlight/highlight.js:126` (dropping a `<pre>` already captured
into an ancestor), `framework/ext/markdown/md.js:76`, and
`framework/ext/toc/toc.js:41` (a table of contents with nothing to list).

**Necessity** — yes. Detaching is not something a class can express.

**Simplicity** — right-sized; `parentNode?.` makes it safe on a view that was
never appended. It removes the **element**, not the View — `this.parent` still
points at the old parent, and the parent has no child list to update, so nothing
goes stale. That is a property of View having no tree of its own, and it is why
there is no `detach`/`destroy` pair.

