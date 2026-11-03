**Does this page have data of its own?** One word, three answers.

```js
data: true        // read the page.json in my own directory
data: { … }       // that object, right here — no fetch at all
                  // absent: no fetch, no probe, no 404
```

A page that says nothing costs exactly what it always cost. That is the whole reason the
key exists rather than core looking for a `page.json` beside every page — the owner,
2026-09-18: *"pages without it load nothing and are as efficient as before — no 404s, no
probing."* Measured: **317 / 369 / 281 network requests on `/framework/`,
`/framework/core/Page/` and `/notes/` before and after this landed.**

**Usage** — `/imagine/paging/make/` gives every page you make its own file as `data:`, and
`Page.load()`'s `page.json` rung uses the inline form for a directory that holds no
module. Read by `take_data()`, which the constructor calls when the key is set.

**Necessity** — the owner's own design (2026-09-18): *"a page.js could have a flag: if
true, the page automatically loads its own page.json… rather than `json: true` you could
pass a POJO and put all the data right in there."* The key is `data` and not `json`
because the second form is not a file.

**Simplicity** — the `true` form becomes a `child_source`, the seam a `children()`
function already uses, so the file is awaited by `load_all_children()` before the page
renders and no new waiting machinery exists. The POJO form is read synchronously in the
constructor, so a page built from data already knows its own title.

**After the load, `data` IS the object** — `read_data()` assigns it, so `page.data` is the
file, whole. Anything core does not read (`blocks`, a realm's own words) is still there
for the page that does.

⚠ `data` is a **reserved page key** now. A page using it for its own state is read once as
a page file; harmless when the object has none of the keys core looks for, but pick
another name.

The whole feature, with the directory rung and the `directory.json` census:
[`doc/data.md`](/framework/core/Page/doc/data/).
