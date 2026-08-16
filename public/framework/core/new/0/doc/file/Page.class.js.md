# `Page.class.js`

A node: url, content, and children that are **direct imports** — by the time
`new Page(...)` runs, every child already exists, so `child(name)` is a plain
array lookup and `adopt(app)` is one recursive pass reaching every page there
is. Nothing here is lazy; that's the whole simplification this tier makes to
prove App↔Page before a Router complicates it.

## `activate()` is the verb

```js
activate(){
	this.mount();                    // me and my ancestors, ancestors first
	if (this.title) document.title = this.title;
	this.app.mark(this);
}
```

Nothing overrides it — there is no `enter()` hook, because with `mode` as data
there is nothing left for a page to *do* on entry. Overriding `activate()`
elsewhere in this tree silently unmounts the page; this design sidesteps the
trap by giving nothing a reason to override it.

## Retention falls out of the structure

`render()` holds `this.view` forever and `mount()` refuses to re-append an
attached node — so scroll position and focus survive navigation with nothing
written to preserve them. Measured in the readme: same DOM node, same
`scrollTop`, across two navigations away and back.

## What's deliberately absent

`declare()`, `add()`, `alias()`, `route()`, `container()`, `deactivate()`,
`go()` — everything a Router or lazy children would need. Listed in full in
the readme's "What is deliberately absent".

## Improvements

1. **None ranked.** Superseded by `new/starter`'s lazy-loading `Page.class.js`
   and then `new/1`'s, which is what shipped to `core/Page/`.
