The file over the page, and the file's children back.

```js
read_data(data){
	this.data_taken = true;
	if (!data) return [];

	const props = this.constructor.props(data, data.mode ?? {});
	for (const key in props) if (props[key] !== undefined) this[key] ??= props[key];

	this.data = data;
	this.naming();

	const kids = data.children ?? [];
	const list = is.str(kids) ? kids.trim().split(/\s+/) : kids;

	return is.arr(list) ? list.map(kid => is.str(kid) ? { name: kid, data: true } : kid) : list;
}
```

**Usage** — `take_data()` calls it, both ways: with the POJO for `data: { … }`, and inside
the fetch for `data: true`. Nothing else calls it.

**Necessity** — three things have to happen in one place, or they drift apart:

1. **The file's keys become the page's.** `this.constructor.props()` is the same static
   `Page.from()` has read a `page.json` with since 2026-09-06 — one reader, two doors —
   and a subclass narrows it by overriding that one method (`/imagine/paging/make/`'s
   `MadePage` answers with the three labels and no words).
2. **`??=`, so a key the `page.js` set wins.** The file is the page's *data*; the `page.js`
   is the page's *decision*. A generated file must never quietly overwrite a typed line.
3. **`naming()` runs again.** It holds the derived title back while `data` is pending (a
   data page's title is the one thing the file may still be about to say), so this is where
   the fallback to the directory name finally happens.

**A name in the file's `children` becomes another data page** — `{ name, data: true }` —
and that one line is what makes a `page.json` a **directory listing** rather than a hint.
The child is never probed for a `page.js` the parent has already said is not there, so a
`page.json` tree costs one fetch per page and no 404s at all. A POJO of whole nodes and a
real `Page` are passed through untouched.

**Simplicity** — the whole object is kept on `this.data` instead of being spread over new
fields. Core reads the keys it already knew and invents no reserved name on `Page` for
each key a file might carry.

[`doc/data.md`](/framework/core/Page/doc/data/) is the feature.
