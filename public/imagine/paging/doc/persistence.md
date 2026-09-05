# Persistence — what remembers you, how you can tell, and how to put it back

Some pages on this site remember what you did on them. That is right for a board you
are keeping and wrong for a demo you are reading, and until 2026-09-05 nothing told you
which one you were looking at. You could press three chips on a demo, come back a week
later, and be reading a page that no longer showed the example it shipped with — with
nothing on screen saying so.

This file is the record: **the rule**, **the audit** of every page under `/imagine/` that
persists, **the store made pages use** (real files, in dev), and **what a page written as
pure JSON can and cannot say**.

---

## The rule

> **Demos never persist silently.**
>
> A page may remember what you changed. It may not do so without telling you, and it must
> always offer the way back. Three states, and a reader can always tell which one they are in:
>
> | state | what it means | what is on screen |
> |---|---|---|
> | **baseline** | nothing is saved; this is the page as it shipped | nothing — the page *is* the example |
> | **modified** | you changed something and it was remembered | an amber dot by the title: *"Modified — this is no longer the example this page shipped with"*, and a **Reset** |
> | **saved** | you deliberately kept something (a board, a run, a page you made) | a green dot naming the store: *"Saved to disk — `…/made/notes/page.json`"* or *"Saved in this browser"* |
>
> **One namespace rule:** a realm keys everything it saves under **one prefix** —
> `lew42:<realm>:<the page's url>` — so one control can forget exactly that realm and
> nothing else. `lew42:` is core's (`Page.Store`); the middle word is the realm's.

### Applying it — two lines

The mark is one shared piece, [`baseline.js`](/imagine/paging/baseline.js), and it works on
any `Page`, in any realm:

```js
import { baseline } from "/imagine/paging/baseline.js";

content(){
    baseline(this);          // draws nothing at baseline; the mark + Reset once something is saved
    …
}
```

By default **"modified" means `store()` has a record and "baseline" means it does not** —
which is true of every page audited below, because they all start from an empty store.
A page whose baseline is not "empty" says so:

```js
baseline(this, {
    modified: () => this.spec() !== BASELINE,        // when a saved record can still BE the baseline
    restore:  () => { this.save(BASELINE); },        // default: store().clear() + reload
    saved:    () => "Saved to disk — " + this.file,  // a string turns the mark green: kept on purpose
    what:     "the pages you made",                  // named in the confirm line
});
```

⚠ **The mark is the first thing in `content()`, not beside the `<h1>`.** Core draws the
column head and this task may not edit `core/`, so "by the title" is *the first line of the
page body* — which is directly under the title in every column on the site. The real fix is
a head slot on `Page` and it is [proposed, not built](#proposals-for-core).

⚠ **The mark refreshes itself only if the page tells it to.** It hooks `page.watch(fn)` when
the page has one (`/imagine/team/`, `/imagine/game/`, `/imagine/mag/contents/`,
`/imagine/platform/topic/` all do), and `Paging.pick()` calls `this.$baseline?.check()`. A
page with neither shows the mark on the next render, which is a reload late — the exact
lateness the rule exists to remove, so wire one of the two.

---

## The audit — every page under `/imagine/` that persists

Nine writers, all through core's `store()` ([`store()`](/framework/core/Page/doc/method/store/));
no page under `/imagine/` touches `localStorage` directly except the realm reset. Read on
2026-09-05.

| page | key | what it keeps | could you tell? | reset? | verdict |
|---|---|---|---|---|---|
| [`/imagine/team/`](/imagine/team/) | `lew42:/imagine/team/` | which lane each task is in, row density, sort | **no** | **none** | **keep** — a board you are keeping is the point of the page. Mark + reset added |
| [`/imagine/game/`](/imagine/game/) | `lew42:/imagine/game/` | rooms found, what is in the pack, what was traded, the journal | partly — the HUD shows the run, but never that it is *saved* | only "start over", at the finale you may never reach | **keep** — a save file. Mark + reset added |
| [`/imagine/mag/contents/`](/imagine/mag/contents/) | `lew42:/imagine/mag/contents/` | which articles you have read | yes — read rows are ticked | yes — a **Reset** appears once anything is read | **keep** — already compliant; mark added so it says *where* it is kept |
| [`/imagine/cms/edit/`](/imagine/cms/edit/) | `lew42:/imagine/cms/edit/` | an unsaved draft, between pauses in typing | **yes** — a draft note and a **Discard**, and it only appears when the draft differs from disk | yes | **keep** — the model the rest copied. Untouched |
| [`/imagine/platform/topic/`](/imagine/platform/topic/) | `lew42:/imagine/platform/topic/` | the actions you "earned" in the topic demo | partly — the level line moves | yes — "Erase this run" | **demote** — a doc demo. Mark added |
| [`/imagine/platform/topic/async/`](/imagine/platform/topic/async/) | `lew42:/imagine/platform/topic/async/` | the same, for the async twin | partly | yes — "Erase" | **demote** — same. Mark added |
| every page under [`/imagine/paging/`](/imagine/paging/) | *(nothing — 2026-09-05: demos do not persist)* | its mode words, when it still kept them | **no** | realm-wide, on the hub only | **demote** — the chips are the demo. Mark added on every one at once, in `Paging.content()`'s `lede()` |
| [`/imagine/paging/rightnav/`](/imagine/paging/rightnav/) | `lew42:paging:/imagine/paging/rightnav/` | that demo's own four variants | **no** | realm-wide only | **demote** — same, and it gets the same mark |
| [`/imagine/paging/make/`](/imagine/paging/make/) | files under `made/`, or `lew42:paging:/imagine/paging/make/` | the pages you made | yes — the list *is* the page | yes — "Back to the baseline five" | **keep**, and **moved to disk** — see below |

**Counts: keep 4 · keep-and-move 1 · demote 4 · remove 0.** Nothing was removed: every one
of these saves something a reader either wanted (a board, a run, a draft) or can now see and
undo (a demo's mode). Removing the paging modes would have removed the demo.

Not persistence, listed because a search finds them: `/imagine/design/themes/` only *writes
about* `store_key` in prose, and `/imagine/platform/existing/` and `/imagine/platform/prior/`
only survey `ext/Saver`. Neither writes anything.

**Outside this audit, and outside this task's fence:** `ext/Panel`, `ext/Playground`,
`ext/DesignTool` and `ext/editor` all persist through `ext/Saver`, and several are embedded in
`/imagine/` pages. They follow the same rule the moment `baseline()` is added to them — one
import each — which is [proposed below](#proposals-for-core).

---

## Made pages live on disk

[Make](/imagine/paging/make/) is the CRUD tool: you type a name, get a real page with a real
url, and change it with chips. Until now that tree lived in `localStorage`, so it existed only
in the browser that made it and vanished on Reset.

**Now the default store is the filesystem.** One directory per page, one `page.json` inside it,
exactly like the `page.js` directories everywhere else on the site:

```
public/imagine/paging/made/notes/page.json      ← the page
public/imagine/paging/made/notes/today/page.json  ← its child
public/imagine/paging/made/page.json            ← the root: which pages exist at the top
```

A page.json is the whole declaration:

```json
{
	"title": "Notes",
	"icon": "description",
	"mode": { "navigation": "tabs", "content": "docs", "room": "reading",
	          "arrangement": "plain", "surface": "card", "background": "plain", "type": "regular" },
	"children": ["today", "later"]
}
```

`children` is an **array of directory names** — the same "nothing crawls, a parent names its
children" rule the rest of the site follows, so loading the tree is: fetch the root, fetch what
it names, repeat. That works on a static host with no server at all, which is why it is an array
of names and not one giant nested file.

### The two stores, and how a page says which one it is on

| | when | writer | where |
|---|---|---|---|
| **files — the default** | the dev socket is connected (localhost) | [`ext/Saver`](/framework/ext/Saver/)'s `FileSaver` → `rpc:write` / `rpc:rm` | `public/imagine/paging/made/` |
| **this browser — the fallback** | no socket: production, or the dev server is down | core's `store()` | `lew42:paging:/imagine/paging/make/` |

Both are writers that already existed; this task added none. The page says which one it is on,
in its own green **saved** mark.

**The fallback still READS the files.** A `page.json` is a static asset — a browser with no dev
server can fetch it perfectly well, it just cannot write one. So `LocalStore` extends
`FileStore` and overrides only the writing half, and a production visitor sees the real
committed pages rather than a hardcoded seed. Only their own edits live in the browser, and the
label says which of those two situations they are in.

**If the dev server dies mid-session** the page does not hang and does not lose the edit: every
write is raced against a 2.5s probe (`Socket.send()` awaits a `ready` promise that only resolves
on a successful connect, so an unanswered rpc never settles at all), a miss swaps the file store
for the browser store, and the line under the list changes on the same repaint.

### Proved — `ui-test`, 2026-09-05, 1280 and 3440

- ~~**The mark appears on the first press, not the next reload.**~~ **Superseded 2026-09-05:
  a demo does not persist at all any more, so it can never reach the mark.** `Paging` writes
  nothing to storage and `lede()` draws no mark; a refresh puts every demo back to the page it
  is. Re-proved by ui-test the same day: two colours changed on a preset, reload, and the box
  is back to `paging-surface-card` with no nest. The mark now only appears in the two editors,
  and it is a dot and four words on one line rather than a bordered strip
  ([decisions](/imagine/paging/doc/decisions/)).
- **Make writes real files.** Adding *"Probe page"* created
  `public/imagine/paging/made/probe-page/page.json` on disk and rewrote `made/page.json`'s
  `children` to name it. Reload → still there. **×** → the row went (6 → 5) and the directory
  was gone from disk.
- **A cold deep url works.** `/imagine/paging/make/notes/today/` pasted into a fresh tab opens
  six columns with **Today** active — the Router walked JSON files.
- **The fallback.** Loaded through a hostname that is not localhost (so `dev/Socket` disables
  itself exactly as on a static host): `app.socket.disabled === true`, the same six pages read
  from the files, and an edit made there lands under `lew42:paging:/imagine/paging/make/` with
  the files untouched.
- **The site-wide reset.** Five `lew42:` keys across four realms → *"…or every demo on the
  site"* → zero.
- **Zero console errors** on all eleven touched pages at both 1280 and 3440.

⚠ **One error this found, and it was not new.** An async `load_all_children()` override throws
*"Chaining cycle detected for promise"* from the microtask queue unless it keeps core's own
`levels <= this.loaded` guard: core returns `this` **unchanged** in that case without touching
`this.loading`, so the second call reads back the very promise being assigned and
`p.then(() => p)` is a cycle. `make/page.js` now carries the guard.
[`cms/json/page.js`](/imagine/cms/json/) has the same override **without** it and throws the same
error today — the fix is that four-line block, and it belongs in that file too. Not applied here:
it is another realm, outside this task's fence.

⚠ **A missing file answers `200` with `index.html`.** The SPA fallback means `res.ok` is not
"the file is there" — every fetch of a `page.json` checks the content-type, the guard
`cms/json`'s `Source.read()` already had.

⚠ **Last writer wins, and a stale tab can resurrect a deleted page.** `save()` compares the
tree the page is holding with the one it loaded, so a second tab that loaded the tree BEFORE a
delete will write its own copy back on its next edit and the page comes back. Seen for real on
2026-09-05, with two agents editing at once. It is the same trade-off `rpc:write` has everywhere
(the whole file, not a delta) and the fix is the one `cms/json` already ships: append deltas
rather than rewrite the snapshot. Not worth it for a page tree three people will ever edit —
but `made/` is **user data in the repo**, so stray test pages want pruning before a commit.

⚠ **Deleting a page deletes its directory**, `rpc:rm` with `recursive: true`, so a child goes
with its parent. The parent's `page.json` is rewritten first, so a half-finished delete leaves
an orphan directory nothing names rather than a name pointing at nothing.

---

## Pages as pure JSON — what the format can and cannot say

This is the seam the page builder needs: how far can a page go with **no code at all**?

**What `Page` reads straight from JSON today** — because `declare()` has always taken a plain
object and built a real page from it, recursively:

| field | example | what you get |
|---|---|---|
| `title` | `"Notes"` | the head, the crumb, the card, the rail row |
| `description` | `"…"` | the card's line, the preview |
| `icon` | `"description"` | the material icon everywhere the page appears |
| `width` | `"large"` `"full"` | its column track — `full` **is** takeover |
| `children` | `["today", "later"]` | real child pages with real urls, at any depth |
| `index` | `false` | whether core lists the children under the content |

**What JSON cannot say, and never will without a renderer:** a `content()` body. Data can
*choose* a renderer; only js can *supply* one — the line
[`cms/json`](/imagine/cms/json/readme/) already drew and this file does not move. So the
honest bound is: **a page made of JSON can say anything a registered renderer can draw.**

### From "new page" to each page we already have

The column on the right is what the builder has to add. Anything marked **one JSON line**
already works today with no new code.

| the page you want | how it is built | JSON alone? |
|---|---|---|
| A page with a title and a paragraph | `title` + a `md` block | **yes** — one line |
| A page with children in the rail | `children: [...]` | **yes** — core draws the rail |
| A **card wall** | `index: true` + a `cards` block (`previews()`) | **yes** — the renderer exists in `json.js` |
| A **column page** (launch — a child opens to the right) | nothing at all: children of a columns host already do this | **yes** — it is the default |
| A **takeover** page | `width: "full"` | **yes** — one field |
| A **tabs** page | **one word in the JSON**: `"mode": { "kids": "tabs" }` — the strip itself is an `items()` override supplied by `make/tabs.js` | **yes, as of 2026-09-05** — and it is the exact shape every "no" below wants: data chooses, js supplies |
| A **swap** page (tabs without the tab bar) | `Paging`'s `swap()` — page state plus a repaint | **no** — needs a class; a renderer could host it |
| A **mag front** | a hand-laid grid of feature/standard/brief cards | **no** — needs its own `content()`, and its cards read a manifest |
| A **blog section** | a list built from `/blog/posts.js` | **no** — the data comes from a module, not from the node |
| A page with any **live control** (chips, a form, a drag) | its own state, its own handlers | **no**, and it should not be — this is what `page.js` is for |

**The shortest path to "the builder can make any of our pages":** four renderers —
`md`, `cards` (both already written), `tabs`, and `list` — cover every structural page on the
site. Everything left over is a page with *behaviour*, and behaviour is code.

**The pattern to copy is the `navigation` word**, added to Make on 2026-09-05 and already live: the
JSON says `"kids": "tabs"` and js supplies the `items()` that draws a strip. Nothing about the
node got more complicated — one more word beside the three it had — and nothing in the store
had to learn what a tab is. Every row marked **no** above becomes a **yes** the same way: name
the presentation in the node, register the function that draws it. Ten lines each, and the file
format does not change.

---

## RESET

**Per realm.** One prefix, one button: `reset()` in [`words.js`](/imagine/paging/words.js)
removes every `lew42:paging:` key and nothing else, and `Paging.Reset` on the
[hub](/imagine/paging/) is the control. **Two presses** — the first arms and says what it is
about to do, the second does it. It reloads afterwards on purpose: a page already on screen
holds its mode in memory (`this.picked`), so clearing storage alone would leave the row looking
unchanged until you navigated.

⚠ Collect the keys **first**. `localStorage.key(i)` re-indexes on every removal, so removing
inside the walk skips every other match.

**Site-wide.** *"Forget every demo on the site"* is `forget_all()` in
[`baseline.js`](/imagine/paging/baseline.js): every `lew42:` key, which is every page that uses
core's `store()` — nine writers today, and any future one for free. It does **not** live on a
page of its own. It lives **inside the mark**, so it is offered exactly where a reader has just
discovered that something remembered them: arm the Reset and the second line is *"…or forget
every demo on the site."* Twelve lines, no new page, no new route, reachable from every realm
that persists.

---

## Proposals for `core/` and `ext/` — the diffs this task may not apply

1. **A head slot on `Page`.** The mark wants to be *beside the title*, and today it can only be
   the first thing in the body. `Page.column()` builds the head; one optional `this.stamp?.()`
   call in it, drawn after the `<h1>`, would let any page hang a badge there —
   `active-page` marking, a "modified" dot, a draft count, `ext/Panel`'s own state.
   One line in core, zero callers broken.
2. **`baseline()` on the four `ext/` modules that persist.** `ext/Panel`, `ext/Playground`,
   `ext/DesignTool`, `ext/editor` each save through `ext/Saver` and none of them shows a mark.
   One import and one call each, the same two lines every realm below took.
3. **`Saver` should own the mark.** Longer term the honest home for "this is modified / this is
   saved to `<where>`" is `ext/Saver` itself — it already knows which backend it is on and
   whether a write is in flight (`saving()`). `baseline.js` is deliberately small enough to be
   deleted when that lands.

## What it still cannot do

- **A private-mode session is kept in memory only.** `Page.Store` falls back to a module-level
  `Map` when `localStorage` throws, and neither reset can reach that map — so in a browser that
  blocks storage the *reload* is what puts the demos back, not the clear.
- **A page you delete under Make while its column is open stays on screen until you navigate.**
  The row is gone from the tree and from disk; core does not unmount a column it was not asked to.
- **A mode is not shareable.** It is `localStorage` per url, which is honest — nothing in the
  address can be stale on another machine — but a look you like is not a link you can send. A
  query string would fix it and would be the first state this site puts in a url. The owner decides.

---

## Reading this file

It is linked from [Make](/imagine/paging/make/) and from the
[paging hub](/imagine/paging/), as `doc/persistence.md` — a **raw markdown link**, which is
how `decisions.md` and `mechanisms.md` beside it are linked too. The server serves it at
`text/markdown` and the browser shows it as plain text.

⚠ **`/imagine/paging/doc/` is not a page and 404s**, so this realm has no rendered Docs tab.
It is not a missing `children:` line: a declared child whose directory has no `page.js`
404s the whole probe (core tries `doc/page.js`, then `doc.md`, and gives up). The fix is a
small `doc/page.js` that declares its `.md` files, the way `/framework/` modules do — one
file, and every doc in the realm renders. Left to the realm's owner: `paging/page.js` and
`paging/readme.md` are another task's fence tonight, and a half-made `doc/` page would
collide with it.
