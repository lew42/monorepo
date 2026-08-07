# `Page.child_label(name)` — copy-ready

For `Page.class.js`, which only Master Mike writes. Two edits: one new method, one
changed line. Everything below is in the file's own voice — drop it in as-is.

---

## 1. The method

Goes directly **above `previews()`**, because that is its first caller and the
comment block there already explains half of it.

```js
	/* What a link to my child `name` should SAY, before that child is imported.
	 *
	 *   labels: { dynamic: "route()" }     declared by ME, the parent
	 *   "getting-started"                  else the name, made readable
	 *
	 * Never the child's own `title`. A title belongs to a page and arrives with
	 * its import; a label belongs to this list and is here from the start. And
	 * WHICH children are imported depends on the url you arrived at — so a nav
	 * built from titles reads differently per entry point, which is the bug
	 * tabs() already refused. This is deterministic: same answer, every time,
	 * from everywhere, loaded or not.
	 */
	child_label(name){
		return this.labels?.[name] ?? name.replace(/[-_]/g, " ").replace(/^./, c => c.toUpperCase());
	}
```

`labels` needs no support: the constructor is `assign`-based, so it arrives as
inert data exactly like `col` and `classes` do. Nothing else in `Page` reads it.

## 2. The one-line change to `previews()`

```js
	previews(){
		return div.c("page-previews", () => this.children.forEach((page, name) =>
-			page ? page.preview() : a.c("page-preview", name).href(this.url + name + "/")));
+			page ? page.preview() : a.c("page-preview", this.child_label(name)).href(this.url + name + "/")));
	}
```

The comment block above `previews()` says *"the card says `columns` until you
visit it and then says `Columns`"*. With this change the first half of that
sentence is no longer true, so the block needs one word fixed:

```
-	 * segment, and the url it must have. The card says "columns" until you visit
-	 * it and then says "Columns". That is the honest cost, and it is visible.
+	 * label, and the url the name implies. The card says what child_label() says
+	 * until you visit it, and then says the page's own title. That is the honest
+	 * cost, and it is visible.
```

**Resolved children still use `page.preview()`, and that is deliberate** — see
the dissent in `page.js`. A card is transient and per-page; a nav is persistent
and builds spatial memory. The nav must be deterministic; a card may be accurate.

## 3. Why it is worth a method rather than three lines in a nav

It is already written twice in this repo — `site/chrome/chrome.js` and
`site/kit/kit.js` — and both copies delete themselves the day this lands. The
second copy is what made the case: two files that must agree about what a link
says is exactly the drift a shared method exists to stop.

---

## The name

Said out loud before writing it, per CLAUDE.md.

| candidate | why not |
|---|---|
| `label(name)` | reads as *this page's own label*. `label` is contested — `log_label()` is the precedent for spending a prefix when the bare word already means something else. |
| `label_for(name)` | `for` is filler. It reads fine in isolation but says nothing about *whose* label, and it sorts away from `child()` and `children`. |
| `name_of(name)` | takes a name and returns not-a-name. Says the wrong thing twice. |
| `title_for(name)` | worst of all: the entire point is that this is **not** a title. |
| **`child_label(name)`** | **pairs with `child(name)`** — one gets the page, the other gets what to call it *without* getting it. The pairing is the whole argument, and the prefix earns its characters by naming the relationship that makes the method possible: only a parent has a labels list. |

## Failure modes

**A name with no label.** The common case. `labels` may be absent entirely —
`this.labels?.[name]` is `undefined`, and `??` falls through to the readable
name. Measured across this site's root: 11 of 27 come out right from the name
alone; the other 16 are editorial (`a11y` → "Access", `perf` → "Cost",
`urls` → "URL design"). Nothing warns, and nothing should — a name that reads
fine is the *expected* case, not a missing declaration.

**A label for a child that does not exist.** `labels: { colums: "Columns" }`
with the name misspelled is silently dead: nothing ever asks for `colums`, so
nothing ever reports it. Real, and I recommend accepting it. The one-line dev
check is `declare()` comparing `Object.keys(this.labels ?? {})` against
`this.children.keys()` and warning on the difference — **do not add it.** It is
an option and a console message forever, in a base class, for a typo that is
visible in the same object literal three lines above.

**A name that is already readable.** `columns` → `Columns`. Idempotent on
already-capitalized names (`API` → `API`), and correct on hyphenated ones
(`getting-started` → `Getting started`). Wrong on initialisms (`api` → `Api`)
and on names with digits (`v2` → `V2`) — both of which are what `labels` is for.

**A name that collides with `Object.prototype`.** A child directory called
`toString`, `constructor` or `valueOf` makes `this.labels?.[name]` return an
inherited **function**, which `View.append` then treats as a capture callback
and renders as nonsense. The hardening is one line:

```js
	child_label(name){
		const label = this.labels?.[name];
		return typeof label === "string" ? label : name.replace(/[-_]/g, " ").replace(/^./, c => c.toUpperCase());
	}
```

**I recommend the unhardened one-liner.** `alias()` already reaches through the
prototype chain on purpose (`if (!(key in this))`), so the posture is consistent;
a page directory named `toString` is a naming problem, not a framework problem;
and the guard reads as defensive-for-no-reason to anyone who does not already
know the hole. This paragraph is the record that it was considered and declined —
if it ever bites, the fix is one line and it is written above.

## Optional follow-up, deliberately not bundled

`tabs()` labels its non-first tabs with the raw declared name:

```js
	const label = (name, i) => {
		const page = this.children.get(name);
		return (this.loading || i === 0) && page?.title ? page.title : name;
	};
```

That last `name` could be `this.child_label(name)` — strictly better, same
determinism, nicer bar. It is a third call site and a separate decision, so it is
not in the diff above.
