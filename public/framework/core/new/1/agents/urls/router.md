# Router — one reconciled diff

Merges the **url** seat's P1/P2/P4 with the **async** seat's PROPOSAL 2, PROPOSAL 3
and its Open #4 diagnosis. Five changes, one file, `Router.js`.

**Status: prototyped and measured.** All five are installed under `/urls/`
(`site/urls/proposals.js`) and verified against both seats' failing cases. The
prototype is the same code as below, so it cannot drift from this document.

`App.js` needs **no change**: on a cold load `first` is true and the browser's own
`location.search` / `location.hash` are the truth, so `App.load()` keeps passing
`location.pathname`. `Page.class.js` loses two lines (R4).

```
R1  carry the query and the hash          click()
R2  push the page's url, not yours        go()
R3  scroll to the hash after render       load() + scroll_to_hash()
R4  re-mark links when links appear       listen() + watch_links()
R5  one navigation wins                   go() + load() + one field
```

Dependencies: **R3 contains R1's and R2's changes to `load()`**, so those three are
one edit in practice. R4 and R5 are independent and can be dropped without
touching the others. `Page.aliases` (P3) is a separate `Page.class.js` change and
is gated on R2 — without it, an alias is two live urls instead of a redirect.

---

## The diff, copy-ready

### One class field

```js
export class Router {

	navigation = 0;   // R5 — the newest navigation's number; older ones must not land
```

### `listen()`

```js
	listen(){
		document.addEventListener("click", e => this.click(e));
		window.addEventListener("popstate", () => {
			console.log(`── POPSTATE ${location.pathname} ${"─".repeat(36)}`);
			this.load(location.pathname + location.search + location.hash);
		});
		this.watch_links();
	}
```

### `click()`

```js
	click(e){
		const link = this.link_clicked(e);
		if (!link) return;

		e.preventDefault();
		console.log(`── CLICK ${link.pathname} ${"─".repeat(39)}`);
		this.go(link.pathname + link.search + link.hash);
	}
```

### `go()`

```js
	/* Load first, push second: a failed navigation leaves no history entry.
	 *
	 * Pushes `this.active.url`, not the url asked for — /tabs, /tabs// and
	 * /tabs/ all resolve to one page, and one page may only have one url. The
	 * query and hash ride along untouched; the Router carries what it does not
	 * interpret.
	 */
	async go(url){
		console.log(`router.go("${url}")`);

		const to = new URL(url, location.origin);
		const token = ++this.navigation;
		const ok = await this.load(to.pathname + to.search + to.hash, token);

		if (token !== this.navigation) return console.log("  ↳ superseded by a newer navigation");
		if (!ok){
			console.log(`  ↳ load failed — handing "${url}" to the browser`);
			return location.assign(url);
		}

		const next = this.active.url + to.search + to.hash;

		// …and never a second entry for a url you are already on
		if (next !== location.pathname + location.search + location.hash){
			history.pushState({}, "", next);
			console.log(`  ↳ history.pushState("${next}")`);
		}
	}
```

### `load()`

```js
	async load(url, token = ++this.navigation){
		const to = new URL(url, location.origin);
		const first = !this.active;                     // nothing activated yet IS "the browser did this one"
		const hash = first ? location.hash : to.hash;   // …so the browser's hash is the one to honour
		const page = await this.load_segments(to.pathname);

		if (!page) return console.log(`router.load("${url}") — 404, nothing resolves it`), false;
		if (token !== this.navigation) return false;    // a newer navigation already won

		/* Carried, never read. A page cannot take the query from `location` at
		   render time: go() loads BEFORE it pushes, so mid-navigation the bar
		   still shows the url being left — the same reason mark_links() asks the
		   page for `here` instead of asking the browser. */
		this.search = first ? location.search : to.search;

		this.activate(page);
		if (first) history.replaceState({}, "", this.active.url + this.search + hash);
		this.app.ready.then(() => this.scroll_to_hash(hash));

		return true;
	}
```

`load_segments()` is **unchanged** and still takes a pathname. It has never
wanted anything else.

### Two new methods

```js
	/* $app is still detached while load() runs, and scrollIntoView on a
	   detached node does nothing — which is why this waits for app.ready
	   rather than running inline. */
	scroll_to_hash(hash){
		if (!hash) return;
		this.root().querySelector("#" + CSS.escape(hash.slice(1)))?.scrollIntoView({ block: "start" });
	}

	/* Links built after an await have missed the mark() that already ran. One
	   observer re-runs the pass when anchors appear, so nothing rendering late
	   has to remember. Batched to a microtask: a fill appending 40 links marks
	   once, and microtasks run BEFORE paint, so no frame shows an unmarked
	   link. No loop — mark_links() only toggles classes, and this watches
	   childList. */
	watch_links(){
		let queued = false;

		new MutationObserver(() => {
			if (queued) return;
			queued = true;
			queueMicrotask(() => { queued = false; this.mark_links(); });
		}).observe(this.root(), { childList: true, subtree: true });
	}
```

### `Page.class.js` — R4 deletes the manual call

```js
	// in tabs(), at the end of `filling`:
-		// these links were built after mark() ran, so they missed the pass
-		this.app?.router?.mark_links();
```

That call is the framework's own worked example of the debt R4 removes, and it
had to be found as a bug before it was written. Deleting it is the proof.

---

## Where the two seats disagreed

### D1 — how the path is separated from the rest. **url seat wins.**

| | |
|---|---|
| async | `load_segments(url){ url.split("?")[0].split("/") }` |
| url | parse once in `go()`/`load()` with `new URL`; `load_segments` unchanged |

Three reasons. `split("?")[0]` leaves the hash in, so `/a/#x` would try to
resolve a segment called `#x` — it fixes the query and creates the hash bug.
It puts parsing *inside* the walk, which is the one method in the class with a
single job. And `new URL` is the platform's own parser, so relative urls, `.`
segments and encoding are all handled the same way for free.

**Conceded to async:** they were right that `popstate → this.load(location.pathname)`
drops it too. My P4 only half-covered that — it added the hash and not the
search. `listen()` above carries both.

### D2 — search only, or search and hash. **url seat wins, trivially.**

Not a real disagreement: async's page was about the query, mine about both.
`link.pathname + link.search + link.hash` is a superset, and the hash half is
the one that also needs R3 to be worth anything.

### D3 — who fixes marking for links rendered late. **async seat wins, adopted whole.**

I had not proposed a fix here; my finding 7 was a different defect (a
hand-written non-canonical href gets `.in-path` instead of `.active`).

I resisted this one first, and the reason is worth recording: a
MutationObserver that re-marks on any DOM change reads like exactly the ambient
behaviour "no black magic" exists to forbid. What changed my mind is that the
rule's actual test is *"can someone read this file and know what happens?"* —
and `watch_links()` sits in `Router.listen()`, in the file that owns marking,
beside the click and popstate listeners. It is visible at the place that owns
the behaviour. The status quo is the ambient one: a call owed by files that have
no idea `Router` exists, which fails silently and cosmetically.

**One thing I checked that their write-up did not raise**, because it is the
obvious way this would break: whether the observer can fire mid-navigation and
mark against a stale `this.active`. It cannot. `activate()` appends the entering
pages, assigns `this.active` and calls `mark()` in one synchronous block, and
the observer's callback is a microtask — so it cannot run between the append and
the assignment. Verified, not reasoned: a late link inserted after `mark()` had
already run came back `class="active"`.

### D4 — the in-flight token. **Neither: a merge.**

async diagnosed it exactly and wrote no diff — *"`go()` and `load()` both need
the token, since `activate()` and `pushState()` sit on either side of an await."*
Their framing of it as the dual of the captor bug (a global you **read** across
an await vs a global you **write** across one) is the reason this is one field
and not a queue.

The thing their framing does not cover, and the only real design decision in the
diff: **"superseded" must not collapse into "did not resolve".** A single boolean
return would send a perfectly good url to `location.assign()` and reload the
page. So the token is checked twice, and the two checks mean different things —
in `load()` it means *do not touch the DOM*, in `go()` it means *do not touch
history, and do not fall back*.

---

## The combined test set

Both seats' failing cases. Chromium, 1400×800, against the live prototype.

| # | case | origin | before | after |
|---|---|---|---|---|
| 1 | click `href="/x/?page=2"` | async | `location.search` = `""` | `?page=2` |
| 2 | click `href="/x/?page=2#bottom"` | url | both dropped | both kept, and scrolled |
| 3 | cold load `/urls/slash` | url | bar keeps `/urls/slash` | `/urls/slash/` |
| 4 | cold load `/urls/slash//` | url | bar keeps `//` | `/urls/slash/` |
| 5 | 3 × `go()` to the current url | url | +3 history entries | **+1** |
| 6 | cold load `/urls/hash/long/#bottom` | url | `scrollTop` 0 | **1461** |
| 7 | click a cross-page `#bottom` | url | hash never reached the bar | bar + `scrollTop` 1461 |
| 8 | a link inserted after `mark()` ran | async | unmarked | `class="active"`, no manual call |
| 9 | slow first click, fast second | async | **the slow first click won** | the last click wins |
| 10 | `/urls/alias/intro/` (needs P3 + R2) | url | — | renders Start, bar reads `/urls/alias/start/`, Back skips it |

Case 9 reproduced here independently of the async seat's harness: `/columns/child/page.js`
delayed 900 ms, asked first; `/dynamic/42/` asked 60 ms later. Unpatched, the
router ended on `/columns/child/` — the first, slow click. With R5, on `/dynamic/42/`.

**Regression: 16 routes across nine other seats' sections** (`/replace/`,
`/columns/child/`, `/tabs/notes/`, `/tabs/standalone/`, `/dynamic/42/`,
`/full/left/deeper/`, `/nav/`, `/compound/`, `/deep/`, `/async/`, `/perf/`,
`/a11y/`, `/`), each navigated before and after all five patches, comparing
address bar, title, resolved page, visible page count, marked-link count and
horizontal overflow. **0 differing. No console errors either way.** That is the
safety argument for R4 in particular, which is the only always-on piece.

---

## What a reader must now remember

| | |
|---|---|
| R1 | nothing — `go()` takes a url instead of a path, which is what it looked like already |
| R2 | the address bar shows the page's canonical url, not what you typed |
| R3 | nothing |
| R4 | **less than before** — the `mark_links()` debt is deleted, not moved |
| R5 | one field, `navigation`, and that a superseded navigation returns `false` without being a 404 |

R5 is the only one that adds a concept. If the diff has to be cut, cut that one:
the race needs two clicks under a second on two *unresolved* urls, and it is the
one change whose absence is invisible rather than wrong.

---

## Deliberately not in this diff

| | why |
|---|---|
| **re-render on a query-only change** | The Router would be interpreting a string it has no business reading. `activate()` diffs two chains; a query-only change produces identical chains and correctly does nothing. The page that owns the lens owns the re-render — council position, `/urls/query/`. |
| **cross-tree short links** (`/x/` → `/a/deep/`) | needs a url rather than a name; letting `child()` return a page from elsewhere breaks `parent`, `chain()`, and *"the url is mine plus the name I'm giving it"*. `go(url, "replace")` is the honest shape if anyone ever really wants it. |
| **decoding url segments** | `decodeURIComponent` in `child()` would make the `children` key and the module path disagree, and a malformed `%` throws. The fix is a rule — *a `children` key is a url segment, so write it url-safe* — not a call. |
| **`.in-path` segment boundaries** | every href the framework builds comes from `page.url` and is canonical. Fixing the comparison would hide the real bug, which is a hand-typed href. |
| **`first_paint` rename** (async PROPOSAL 1) | `App.js`, not `Router.js`. Unrelated to navigation semantics and should not ride along in a diff about them. |
