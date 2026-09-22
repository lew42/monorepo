# Children that live in data — two seams, one applied

**Seam 1 was applied on 2026-09-17**, on the owner's own sentence that day — *"pages are
everything and they don't have to be real paths… even if they don't have a real path slash
page.js, they can still use this if they can pretend as if they did"* — which is the
reaffirmation this page had been waiting for since it was written on **2026-09-13**.
**Seam 2 stays refuted** and was not written.

What landed, in numbers: **33 lines into `Page.class.js`, 8 of them code** (820 → 845), and
**87 lines out of the two callers with 35 written back — 52 fewer** ([Make](/imagine/paging/make/)
636 → 615, [JSON pages](/imagine/cms/json/) 93 → 62). The 18 urls named below answered
identically before and after — same titles, same link sets, same page counts — and a cold
deep url into each tree, cache disabled, drew with no *"Chaining cycle detected for promise"*.
The change is additive, so it is one revert away. Task: `ai/2026-09-17/core-data-children/`.

Everything below is the proposal as it was written, kept as the reasoning.

## The problem, in five sentences

A page normally names its children in a string — `children: "intro guide api"` — and core
does the rest. A page whose children live in *data* cannot do that, because the data has to
be fetched first and a constructor may not fetch. So such a page writes two overrides
itself: `child()`, because the Router asks the **parent** for each url segment, and
`load_all_children()`, because landing on the parent has no segment to walk. Two pages on
this site have written them — [JSON pages](/imagine/cms/json/) on 2026-08-31 and
[Make](/imagine/paging/make/) on 2026-09-13 — independently, in almost the same words, and
**both carried the same bug** until 2026-09-05: core's own guard has to be restated inside
the override or a second call reads back the promise being assigned on the next line and
throws *"Chaining cycle detected for promise"* from the microtask queue, with no file, no
line and no stack. **A guard a caller must copy is not a seam.**

## The two answers

**Seam 1 — `children` may be a function that returns a promise. Proposed.** It removes both
overrides, and the copied guard goes with them.

**Seam 2 — a core `Page.redraw()` that rebuilds a page's view in place. Refuted.** Three
reasons below, and the three data-backed pages on this site already agree on something
narrower.

**The numbers.** ~22 lines added to `Page.class.js` — 8 of them code. 79 lines deleted from
the two callers and 16 written back: **net 63 fewer.** **18 urls** would run the new path
today — Make and its 9 made pages, JSON pages and its 6 data nodes plus the editor.

The cost the owner is actually being asked to approve is **two new names on `Page`** —
`child_source` and `source_children()` — per the house rule in
[`doc/decisions.md`](/framework/core/Page/doc/decisions/) that a new name on `Page` is
proposed before it is written.

---

## Seam 1 — `children` as a data source

### What a page writes

```js
export default new Page({
    meta: import.meta,
    title: "JSON pages",

    // Called ONCE, on the first ask. Answer with anything `children:` already takes —
    // a string of names, an array, a POJO, real Page objects, or a mix.
    children(){
        return source.load().then(() => Object.entries(source.state.children ?? {})
            .map(([name, node]) => ({ name, ...config(node, name) })));
    },
});
```

A url subtree needs no extra form, because `Page.from()` already answers with a built page:

```js
children(){ return Page.from("/imagine/paging/made/").then(page => [...page.children.values()]); }
```

**Why a function and not also a url string.** `children:` is already a string of *names*, and
giving the most-used key in the framework a second string meaning separated only by a leading
slash is a trap, not a feature. Neither caller could use the url form anyway: Make holds its
tree in memory on purpose (its own ⚠ says swapping `grow()` for `Page.from()` would re-fetch
every file and drop the three editor hooks it hangs on each node), and JSON pages builds its
tree from a snapshot plus a delta log, not from one `page.json` per directory.

### The diff — `Page.class.js`

**`declare()` takes the list as an argument, so a second call adds instead of replacing.**

```js
	// ⚠ `list` IS THE DECLARATION — the config's own `children` when the constructor
	//   calls this, and whatever a data source answered with later, so a SECOND call
	//   ADDS and children declared by name keep their places. A FUNCTION is a data
	//   source: it declares nothing now and is called on the first ask. doc/data-children.md.
	declare(list = this.children ?? []){
		if (is.fn(list)) { this.child_source = list; list = []; }

		const entries = is.str(list) ? list.trim().split(/\s+/)
		              : is.arr(list) ? list
		              : Object.entries(list);

		if (!(this.children instanceof Map)) this.children = new Map();

		entries.forEach(child => {          // ← body unchanged
```

**One loader, memoised, and nothing at import.**

```js
	// ⚠ ONE LOAD, AND NOT IN THE CONSTRUCTOR. The function is called the first time
	//   anyone asks for a child — by child(), for the Router's walk, and by
	//   load_all_children(), for a landing with no segment to walk — so a page with a
	//   data source still costs nothing until it is visited.
	source_children(){
		return this.sourcing ??= Promise.resolve(this.child_source.call(this))
			.then(list => this.declare(list ?? []));
	}
```

**`child()` waits for it.**

```js
	async child(name, levels){
		if (this.child_source) await this.source_children();

		const known = this.children.get(name);   // ← body unchanged
```

**`load_all_children()` waits for it — with the guard already above the await.**

```js
	load_all_children(levels = this.depth){
		if (levels <= this.loaded) return this;
		this.loaded = levels;

		// ⚠ THE GUARD ABOVE IS WHY THIS BELONGS IN CORE. A page that wrote this override
		//   itself had to restate the guard or read back the promise being assigned on the
		//   next line — `p.then(() => p)`, "Chaining cycle detected for promise", from the
		//   microtask queue with no file and no stack. Both callers shipped that bug.
		const walk = () => Promise.all([...this.children.keys()].map(name =>
			this.child(name, 0).then(child => child?.load_all_children(child.leaf ? 0 : levels - 1).loading)));

		this.loading = this.child_source ? this.source_children().then(walk) : walk();

		return this;
	}
```

### What the two callers delete

**`imagine/cms/json/page.js` — 46 out, 10 back, 36 fewer (93 → 57).** The header note
explaining the two overrides (8), `ready()` and its comment (3), `mount()` (14), `child()`
(4), `load_all_children()` and its 6-line guard comment (17). Back: a `children()` function
and a one-line `ready()`, which the page still needs because its `content()` reads the same
snapshot.

**`imagine/paging/make/page.js` — 33 out, 6 back, 27 fewer (626 → 599).** The ⚠ "NOT
`initialize()`" note (3), `ready()` (7), `child()` (4), `load_all_children()` and its 6-line
guard comment (16), the blank lines between them (3). Back: a `children()` function.

`regrow()` in Make stays — it rebuilds the tree after every edit, which is seam 2's
territory — but shrinks from 5 lines to 2, because `declare(list)` is now re-entrant.

**One behaviour changes.** Data children are appended to the Map after children the page
declared by name, so JSON pages keeps its two-line *"the editor reads last"* reorder inside
its own `children()` function rather than dropping it.

---

## Seam 2 — `redraw()`, refuted

The ask was: *rebuild a page's view in place from new data*, so that a changed title, a new
child or a deleted page is not next-load. Reading the code, a core method that rebuilds
`this.view` cannot be written safely, for three reasons:

1. **`content()` is where pages subscribe.** [Importance](/imagine/importance/) starts a
   store subscription and adds a `popstate` listener inside `content()`. Re-running it
   double-subscribes, silently, every time.
2. **The Router holds the element, not the page.** `Router.mark()` keeps a list of *views*
   and stamps `.active-page` / `.active-ancestor` on them. A page that swaps `this.view`
   leaves the Router marking a detached element and the new one unmarked — and an unmarked
   `.page` is `display: none` by the arrangement contract, with nothing thrown.
3. **A rebuilt view orphans every child.** `container()` mounts a child in its parent's
   `regions` or `$pages`, both of which live *inside* the parent's view. Rebuilding a parent
   that has children on screen throws away the boxes they are standing in.

And the three data-backed pages on the site already agree on something narrower, without
core's help: **own a box, `empty()` it, refill it.** JSON pages redraws `$body`; Make redraws
`$tree` / `$centre` / `$settings` and then re-runs `mark_links()`; Importance redraws `$live`
and deliberately keeps its text fields *outside* it, because a control redrawn under a caret
loses the caret. None of them would use a whole-view `redraw()` if it existed.

**Recommendation: no method. Two lines of doc instead** — the pattern above, plus the one
thing a late render really does owe, which `doc/declaring.md` already names and only Make
does: *anything that renders links late must re-run `mark_links()`.* JSON pages' `redraw()`
does not, so a `cards` block redrawn after an edit comes back unmarked.

**One finding on the way past.** Importance overrides `activate()` in 5 lines to redraw on
every visit, because core caches the view. Core already calls `this.activated?.()` at the end
of `activate()` — so that is `activated(){ this.draw(); }`, one line, and no seam is needed
at all. (Not fixed here; this task may not touch `/imagine/`.)

---

## What this does not do

- **No crawling.** A page still exists only because its parent names it. A data source *is*
  the parent naming them — in data instead of in a string — and `/directory.json` stays
  unbuilt ([`doc/declaring.md`](/framework/core/Page/doc/declaring/)).
- **No third fetch on a would-be-404 child.** `child()`'s probe chain — `route()`, then
  `Page.load()`, then `Page.file()` — is untouched, and `Page.from()` stays out of it. The
  new `await` runs only on a page that declared a function, so every `.md` child on the site
  pays nothing, which is exactly what the ⚠ on `Page.from()` asks for.
- **No server change.** Both stores already read over `fetch` and write over the existing dev
  socket; core gains no network code and production stays static.

## Risk

- `children` as a function is a **new meaning for the most-used key in the framework**. It is
  additive today — `Object.entries(fn)` is `[]`, so a function there currently declares
  nothing, silently — but a `children(){ … }` typed as a method now has an effect where it
  had none.
- `declare()` becomes re-entrant. Every existing call passes no argument and behaves exactly
  as before.
- `child()` gains one property read per url segment per navigation, site-wide.

## The one test

A **cold deep url into a data tree** — paste `/imagine/paging/make/notes/today/` into a new
tab — draws the page with no *"Chaining cycle detected for promise"* in the console, and
`/imagine/cms/json/format/snapshot/shape/` does the same. That single url is what both
overrides exist for, and it is the only thing that has ever caught this bug.
