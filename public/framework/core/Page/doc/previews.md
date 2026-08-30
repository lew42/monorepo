# Borrowing a page

You can `import` any `page.js` from anywhere and draw its card. Nothing stops you, and
nothing crawls — a path in an array is the whole registration. This is how a gallery,
an index or an alternate navigation is built out of pages that live somewhere else.

Everything below was measured, 2026-08-29, and each answer has a demo you can open:
**[/imagine/gallery/answers/](/imagine/gallery/answers/)**.

## 1 · Import it

```js
const page = (await import("/framework/core/Page/overview/columns/page.js")).default;
page.preview(page.nav());          // its card, drawn here
```

The object you get back is the **same one** the Router uses — the module cache holds one
copy per url — so you are looking at the real page, not at a copy of it.

What that costs, measured on a cold load of one page with five children:

| | |
| --- | --- |
| JavaScript modules fetched | **19**, not 1 |
| Stylesheets appended to `<head>` | **3**, permanently |
| Milliseconds | 21 |
| `page.parent` | `undefined` |
| `page.app` | `undefined` |

Two things to know from that table.

**One import is `depth` levels of subtree.** Importing a page does not fetch
anything by itself, but the moment a parent resolves it, it pulls the pages it
declares and the ones *those* declare — two levels by default (`../declaring.md`).
Each `View.stylesheet()` along the way adds a real `<link>` to the document, and it
stays there, cascading on every page you visit afterwards. Say `depth: 1` (or `0`)
rather than pulling levels nobody draws into one page's `content()`.

**What comes back is an orphan.** It knows its own url, because `import.meta` told it,
but nothing has adopted it. That is enough for `preview()`, `nav()`, `link()` and
`crumbs()`. It is not enough for `activate()`, whose `container()` reads
`this.app.$pages` and throws on `undefined`.

## 2 · Do not adopt it

The tempting next line is `this.add("borrowed", page)`. Don't.

`add()` calls `move()`, which **rewrites the page's url and every resolved
descendant's**. Measured: adding `/framework/styles/layouts/mail/` to another page
renamed it `/framework/borrowed/`, reassigned its `parent`, and its real address stopped
working for everyone. A page is in exactly one tree, and adoption moves it there.

Borrow the preview. Never the page.

## 3 · The card goes home

`preview()` builds its link from `nav()`, and `nav()` returns the page's **own** url.
Click a borrowed card and you land on the original — your gallery is gone, its rail is
gone, and you are wherever that page actually lives.

Nothing intervened. The card is an ordinary `<a href>` pointing at a real address and
the Router did what the href said. **A wall of borrowed cards is a directory, not a
navigation system.**

## 4 · Take the click away

`preview(nav)` takes the nav as an **argument**. It does not have to be the page's own,
and that one field is the whole seam:

```js
page.preview({ ...page.nav(), url: "/my/own/url/" });        // nav for MY arrangement
page.preview_card({ ...page.nav(), url: undefined });        // an inert picture
```

With no url, `preview_link()` writes an `<a>` with no `href`, and `Router.link_clicked()`
opens with `closest("a[href]")` — so the Router never claims it and a `click()` of your
own is the only handler. No override, no second card shape, no fight with the Router.

⚠ `preview_card()` for the url-less one, not `preview()`. A page may override `preview()`
with a live render, and `ext/demo`'s does `.href(nav.url).attr(…)` — `View.href(undefined)`
falls into its **getter** branch and returns `null`, so the chain dies with *Cannot read
properties of null*. The base card takes a url-less nav; an override may not.

## 5 · An arrangement of your own

The real answer to *"the Router would intervene"* is that it does not have to: give the
borrowed pages **urls of your own** and the Router serves them, because they are real
urls. `route(name)` claims an undeclared name and returns a page spec:

```js
const ARRANGE = {
	"the-leaf": "/framework/core/Page/overview/prose/",
	"one-link": "/framework/core/Page/overview/list/",
};

route(name){
	const path = ARRANGE[name];
	if (!path) return;

	return { title: name, content(){ return borrow(path); } };
}
```

…where `borrow()` imports the page and calls **its own `content()` with it as `this`**,
the same move `ext/catalog` makes when it turns a page's content into a child:

```js
function borrow(path){
	const $box = div.c("borrowed");                       // ⚠ built synchronously

	import(path + "page.js").then(m => $box.empty(() => m.default.content.call(m.default)));

	return $box;
}
```

The foreign page is read, never moved: its url, its parent and its cached `view` are
untouched, so the original still works. Live at
[/imagine/gallery/answers/arrange/](/imagine/gallery/answers/arrange/).

Three traps in that shape:

- ⚠ **Never `render()` the foreign page.** `render()` caches `this.view`, so the original
  would find its own body parented inside yours the next time anyone navigated to it.
  Call `content()`; leave `view` alone.
- ⚠ **Do not declare the dynamic names in `children:`.** A declared name sits in the map
  as `null`, and `child()` only offers an **undeclared** name to `route()` — a declared
  one falls straight through to a `page.js` fetch that 404s. Dynamic children are not
  enumerable, so the page draws its own index from the same object `route()` reads.
- ⚠ **No DOM after an `await`.** `content()` has already returned by the time the import
  lands. Build the box now, fill it in the callback.

## 6 · Does everything converge on "a page"?

Partly, and the gap is worth naming.

**Already true.** A demo, a doc section, a column, a card and a whole layout are all
`Page`s today: a url, a `content()`, a `link()`, a `preview()`. `ext/Doc`, `ext/catalog`
and `ext/tabs` add behaviour by patching the prototype, so any page can opt into them
with one line. A page's body can be borrowed and drawn anywhere, at any url.

**Not yet.** `render()` caches one `view`, so a page can be in exactly **one** place at a
time — two viewers of the same page fight over one DOM node, which is why `ext/demo`
passes a *function* that builds a fresh tree rather than a `Page`. Adoption mutates
identity, so a page cannot belong to two trees at once. Panels and playgrounds are
`Item`s with their own storage and no url, so they are not pages at all yet. And the
"plugin system" is prototype patching — global, not per-page.

The short version: **a page is already a universal renderable; it is not yet a
universal instance.** Making one page appear twice is the next real problem.
