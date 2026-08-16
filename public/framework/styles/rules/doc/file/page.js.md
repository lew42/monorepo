## What this file is

The index for the five rule pages (Cascade, Proportion, Nesting, Robust,
Reuse). Each child is built by the local `doc()` helper, which fetches the
sibling `.md` by the same name and, for two of them, appends a live demo
after the prose finishes rendering.

## The `doc()` helper is the whole mechanism

```js
const doc = (title, file, description, after) => [title, {
	description,
	content(){
		const text = md.file(import.meta, file);
		return after ? text.then(() => { h2("Live"); after(); }) : text;
	},
}];
```

Five lines produce five real pages with real urls. `md.file(...).then(...)`
is the blessed shape for "content, then more content after an await" —
capturing stays synchronous because the callback re-establishes the captor,
not because the outer function does.

## Became a `Doc` in this pass

Only `files:` was added — the five children keep rendering exactly as
before via `doc()`, not through `Doc`'s own `notes:` mechanism (their `.md`
source files live directly in `rules/`, not in `rules/doc/`, and moving them
was out of this audit's fence). `files:` gives the module a Files tab over
its own JS/CSS and the five rule `.md` files, without touching how any of
them render.

## Improvements

1. **`this.previews()` after the prose duplicates the children rail Doc's
   Files tab would also show** — minor, cosmetic, and pre-existing; not
   introduced by this pass. *(simple, speculative)*
2. Nothing else ranked. This file is five lines of real mechanism plus
   config; there is very little surface for a bug to hide in.
