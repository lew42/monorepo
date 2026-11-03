Decide how this page's `data:` arrives — right now, or on the first ask.

```js
take_data(){
	if (is.pojo(this.data)) return this.read_data(this.data);

	this.child_source = () => Page.read_json(this.url + "page.json").then(data => this.read_data(data));
	return [];
}
```

**Usage** — one caller: the constructor, and only when `data` is set. It answers with the
children to declare, which is the file's own `children` for the inline form and nothing at
all for the fetched one (they arrive with the file).

**Necessity** — the two forms of `data:` need two different moments. `data: { … }` is
already in memory, so waiting for it would be a lie; `data: true` is a fetch, and **a
constructor may not fetch** — a `page.js` runs when its module loads, so a page that
fetched at construction would pull data down from every url on the site.

**Simplicity** — four lines, because the fetched form reuses machinery that already
exists. `child_source` and `source_children()` were built on 2026-09-17 for `children` as
a function ([`../data-children.md`](/framework/core/Page/doc/data-children/)), and
`load_all_children()` already awaits them — which is exactly what "the file is read before
the page renders and before its children are declared" needs. Nothing new waits.

⚠ **It replaces a `children()` function.** `data:` and a `children()` function are two ways
to say the same thing and `data:` wins. A page says one or the other.

[`doc/data.md`](/framework/core/Page/doc/data/) is the feature.
