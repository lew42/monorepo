# page.jsonl pages: how they load, how they name children, one real example

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

These are three answers, each with the verbatim source and its file:line, read on 2026-10-15. The full lookup order (`md/`, `fs/`, `inbox/`, bare `.md` files) is in [loading.md](loading.md), and the line format is in [jsonl.md](jsonl.md). The classes are in [class-block.md](class-block.md).

## 1. From a url to a Page: page.js versus page.jsonl

The Router walks the url one folder name at a time and asks the current page for the next one:

```js
// core/Router/Router.js:100-108
async load_segments(url){
	let page = this.app.root;

	for (const name of url.split("/").filter(Boolean)){
		page = await page.child(name);
		if (!page) return null;
	}

	return page;
}
```

`child(name)` decides which kind of file the name is. The two jsonl branches come first; `page.js` is the fallback:

```js
// core/Page/Page.class.js:360-397 (the md/, fs/, inbox/ and route() branches cut)
async child(name, levels){
	const known = this.children.get(name);
	if (known) return known.assign({ app: this.app }).load_all_children(levels);   // already loaded

	if (this.child_kinds?.get(name) === "jsonl") {                    // a {"file":"name/page.jsonl"} line said so
		const page = await Page.jsonl(this.url + name + "/");
		return page && this.add(name, page).load_all_children(levels);
	}
	…
	const [listing, docs] = [Page.loaded_listing(this.url), Page.loaded_listing(this.md_dir())];
	const kind = listing?.pages.get(name);
	if (kind === "jsonl") {                                            // the folder's files.jsonl, IF already loaded
		const page = await Page.jsonl(this.url + name + "/");
		if (page) return this.add(name, page).load_all_children(levels);
	}
	…
	const page = await Page.load(this.url + name + "/", 0);            // otherwise: try page.js
	if (page) return this.add(name, page).load_all_children(levels);
}
```

**Where a page.js Page is instantiated:** inside the child's own file, at import time. `Page.load` only imports it:

```js
// core/Page/Page.class.js:453-456
static async load(url, levels){
	try {
		const page = (await import(url + "page.js")).default ?? null;
		return page instanceof Page ? page.load_all_children(levels) : page;
```
```js
// <folder>/page.js: the `new` is here
export default new Page({ meta: import.meta, title: "Hello", children: "a b" });
```

**Where a page.jsonl Page is instantiated:** in `PageJsonl.load`, from line 1 of the file:

```js
// core/Page/Page.class.js:198
static jsonl(url){ return this.Jsonl.load(this, url); }

// core/Page/Jsonl.js:40-45
const Class = first.class ? await host.log_class(first.class, url) : host;   // line 1's "class", or Page
const { class: _, ...line } = first;
const page = new Class(line, { url, jsonl_url: reader.url });                // THE new
if (!page.has_content()) page.content.fallback(page.log_view);
reader.attach(page);                                                          // replays lines 2..n onto it
```

In both cases the parent then calls `this.add(name, page)` (`Page.class.js:319`). That sets the child's `name`, `parent` and `url`, and puts it into `parent.pages`.

## 2. How a page.jsonl declares its children

There is one `file` line per child, naming the child's own `page.jsonl` (or `page.js`):

```jsonl
{"file":"notes/page.jsonl"}
```

When the log replays, each `file` line is checked against one pattern:

```js
// core/Page/Listing.js:4
static CHILD = /^([^/]+)\/page\.(jsonl|js)$/;

// core/Page/Jsonl.js:60-64, inside file(name), while replaying
(page.listed ??= new Map()).set(page.last_file = key_of(name), name);
CHILD.test(name) ? page.link_child(name) : page.unlink_child(key_of(name));

// core/Page/Jsonl.js:79-90
child_file(entry){
	const [, dir, kind] = entry.match(CHILD) ?? [];
	if (!kind) return entry;
	(this.page.child_kinds ??= new Map()).set(dir, kind);   // "notes" → "jsonl": child() reads this
	return dir;
}
link_child(name){
	const dir = this.page.child_file(name);
	if (!this.page.children.has(dir)) this.page.children.set(dir, null);   // a stub; loaded when the url reaches it
}
```

So `{"file":"notes/page.jsonl"}` leaves a `notes` stub in `children` and marks it as jsonl; the child loads only when someone visits it. A `file` line that does not match the pattern (`{"file":"promoted.jsonl"}`) is just a file the folder holds, not a child.

- **Not used by any page.jsonl:** a `"children":"a b"` string. No file does this (0 of 921); it would work on line 1, because line 1 goes through the Page constructor and `declare()`.
- **The other way:** a `{"tab":{"name":"notes",…}}` line makes a child Page with no folder of its own (`Jsonl.js:100-124`).
- **Who writes `file` lines:** the page tools (`create_page`, `page_set({pages:{add}})`) append them for you (`Servex/agents/Subpages.js`).

## 3. A real page.jsonl, line by line

[`core/Page/jsonl/part-link-demo/page.jsonl`](/framework/core/Page/jsonl/part-link-demo/) is quoted whole, with one comment per line added (a real file has no comments):

```jsonl
{"title":"part-link demo","icon":"link","description":"Three cards…","class":"../../parts/Parts.js"}  // line 1 builds the page: new PartsPage({title, icon, description})
{"content":{"add":{"type":"part-card","id":"c1","title":"Cache","text":"Hit rate 92%."}}}       // add card c1 to page.content
{"content":{"add":{"type":"part-card","id":"c2","title":"Notes worth a page","text":"This card grew…"}}} // add card c2
{"content":{"add":{"type":"part-card","id":"c3","title":"Queue","text":"Depth 4."}}}            // add card c3
{"file":"notes/page.jsonl"}                                                                    // a child page: a "notes" stub in children, kind jsonl
{"content":{"remove":"c2"}}                                                                    // remove card c2 by id (it became the page above)
{"content":{"add":{"type":"part-link","id":"c2","path":"./notes/","title":"Notes worth a page","after":"c1"}}} // in its place, a link to ./notes/, placed after c1
{"file":"promoted.jsonl"}                                                                      // a plain file in the folder, not a child (no /page.)
```

The lines replay top to bottom. Order matters only where a line refers to something an earlier line made: the `remove` needs `c2` to exist, and `"after":"c1"` needs `c1`. Moving the `file` line anywhere after line 1 changes nothing.
