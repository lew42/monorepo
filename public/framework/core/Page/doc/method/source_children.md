Call the `children()` function once, and declare what it answers with.

A page can write `children` as a **function** instead of a list. Core does not call it at
construction — a `page.js` runs when its module loads, so a constructor that fetched would
pull the data down from every url on the site. This method is the one place it is called,
and it is called the first time anyone actually asks for a child.

```js
source_children(){
	return this.sourcing ??= Promise.resolve(this.child_source.call(this))
		.then(list => this.declare(list ?? []));
}
```

**Usage** — two callers, both in this class. `child()` awaits it before it looks a name up,
which is what makes the Router's walk into a deep url work. `load_all_children()` awaits it
before it walks, which is what makes *landing* on the page work — there is no segment to
walk then, so nothing else would ever ask.

**Necessity** — yes, and the reason is a bug rather than an abstraction. Two pages wrote
this themselves, as `child()` and `load_all_children()` overrides, and both had to restate
core's own `levels <= this.loaded` guard inside the override. Both forgot, and both threw
*"Chaining cycle detected for promise"* from the microtask queue — no file, no line, no
stack. **A guard a caller must copy is not a seam.** `../data-children.md` is the record.

**Simplicity** — four lines. `this.sourcing` is the memo: the second ask reuses the first
one's promise rather than fetching again, and it is a plain field, not a lock, because
everything here runs on one thread.

## What the function may answer with

Anything `children:` itself takes — a string of names, an array, a POJO, real `Page`
objects, or a mix — and either the value or a promise of it. `Promise.resolve()` wraps a
plain return, so a function that answers synchronously is still legal.

```js
// a tree that lives in data
children(){ return fetch("/my/tree.json").then(r => r.json()).then(tree => tree.pages); }

// another page's subtree — Page.from() already answers with a built page
children(){ return Page.from("/imagine/paging/made/").then(page => [...page.children.values()]); }
```

## What it costs a page that never uses it

Nothing. `child()` and `load_all_children()` both test `this.child_source` first, and it is
`undefined` on every page that declared its children the ordinary way — one property read
per url segment, and no new fetch anywhere on the site.
