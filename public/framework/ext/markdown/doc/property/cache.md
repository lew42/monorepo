`md.cache` — a plain object, `url → Promise<string>`, populated by
[`md.file`](/framework/ext/markdown/api/file/). No declaration renders on this
page because it holds an object, not a primitive — the prose here is the
whole answer, same as any instance-style property.

## Why a cache at all

`md.file()` can be called more than once for the same url — a `Doc` member
page and a Files-tab "about" pane can both fetch the same
`doc/file/md.js.md`, for instance — and the cache collapses those into one
fetch, keyed by the resolved absolute `href`.

## It never evicts on success

Fine for a docs site made of static files that don't change while a tab is
open; revisit if a page ever fetches something large or long-lived.

## It's deleted on failure

`delete md.cache[href]` in the `catch` — a failed fetch is not cached, so a
page that returns "Not written yet" now reads the real file on the very next
visit once someone writes it, rather than being stuck on the old error until
a hard reload clears memory.
