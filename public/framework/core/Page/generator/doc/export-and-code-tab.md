# generator — export and the code tab (moved from the readme)

<!-- moved verbatim from readme.md lines 36-88, 2026-10-12 readme audit -->
## Export — the tree, as files

The button under the spec box writes the tree you are reading to disk: **one directory per
page**, each with an ordinary `page.js`, under
[`/imagine/generated/<name>/`](/imagine/generated/). Nothing in there imports anything from
here — it is a module like any other, and you edit it like one.

```js
// /imagine/generated/seed-7/vtabs/wall/page.js
import { Page } from "/app.js";

// A wall of cards; picking one opens a column to the right.

export default new Page({
	meta: import.meta,
	title: "Queue",
	index: true,

	children: "prose list",

	content(){ return this.previews(); },
});
```

Each word writes what the next section writes by hand: `wall` is `previews()`, `list` is
**nothing at all** (core's column already draws children as rows, which is what an inbox is),
`prose` is a line of `md()`, and `tabs` / `vtabs` are `ext/tabs`. `cols=` and `gap=` become
`--column` and `--gap`; `flow=` has no page.js form and is dropped.

**Dev only, by design.** The writer is the dev server's `rpc:write`, so on the static site the
button is disabled and says why — the rest of the page is untouched. A name that already exists
is **refused**, never overwritten: an export is a scaffold you are meant to edit, and deleting
the directory is how you say you meant it.

## The `code` tab — every generated page has one

A small icon in a column's own head opens `.../code/` — a real url, never a directory
(`route("code")`, tried before the filesystem for every UNDECLARED name — `Page.child()`'s own
order). It shows three things, and prints only two of them: `export.js`'s `content_line()` /
`width_line()` write both the exported `page.js` **and** the calls transcript below, so the tab
can never say something the Export button would not.

1. **the spec** — this page's own line (and any nested lines), `spec.js`'s `serialize()`;
2. **the `page.js`** `export.js` would write for it, right now;
3. **the calls** — as this page's kind, width, or (on a wall/list) its arrangement is switched,
   the matching line is appended, live — a session transcript kept in the generator's own
   `calls` (keyed by `page.at`, the same stable address `swap()` already edits through, so it
   survives every regrow a click causes).

Try it: [the generator](/framework/core/Page/generator/), switch a page's kind or width a
couple of times, open its code tab. [`doc/decisions.md`](/framework/core/Page/generator/doc/decisions.md)
has the mechanism.

