# What this realm remembers, where it keeps it, and how RESET puts it back

Everything a reader changes under `/imagine/paging/` is remembered **in their own browser**,
in `localStorage`. Nothing is written to disk, nothing is sent anywhere, and one button on the
[hub](/imagine/paging/) forgets all of it at once without touching anything else on the site.

## The one rule

**One key per page, all of them under one prefix.**

```
lew42:paging:<the page's own url>
```

`lew42:` is core's own namespace (`Page.Store`, `core/Page/doc/method/store.md`) and is not
ours to change. `paging:` is the part this realm owns. Core keys a page's storage on its url;
`store_key` is core's documented seam for saying otherwise, and `Paging.store()` uses it:

```js
// paging.js
store(){
    this.store_key = NS + this.url;      // NS = "paging:" (words.js)
    return super.store();
}
```

That is the whole mechanism. Every page in the realm lands under the prefix with nothing
configured, and a RESET that clears the prefix therefore clears the realm — exactly the realm,
and nothing outside it.

## What is under a key

| key | what is in it | written by |
|---|---|---|
| `lew42:paging:/imagine/paging/sizes/` | that page's mode — `{ style, content, layout, mech, toolbar }` | every chip click, via `pick()` |
| `lew42:paging:/imagine/paging/make/` | the same mode record, **plus** `spec` — the pages you made, as text | `Make`'s `save()` |
| `lew42:paging:/imagine/paging/rightnav/` | `{ width, side, placement, open }` — that demo's own variants | its own chips |

⚠ **`patch`, never `set`, when a page writes a second thing.** `Make` keeps its `spec` under
the same key as its mode, because one key per page is the rule that makes RESET simple. A
`set()` would replace the whole record and drop the other field; `patch()` merges. The two
have never collided and this note is why.

## RESET

`words.js`:

```js
export function reset(){
    // ⚠ Collect FIRST: localStorage.key(i) re-indexes on every removal, so removing
    //   inside the walk skips every other match.
    const keys = [...];                       // every key starting with "lew42:paging:"
    keys.forEach(key => localStorage.removeItem(key));
    return keys.length;
}
```

The button is `Paging.Reset`, on the hub. **Two presses, not one** — the first arms it and says
what it is about to do, the second does it. A one-click control that throws away everything a
reader changed is the wrong shape however clearly it is labelled.

**It reloads afterwards, on purpose.** Pages already on screen hold their mode in memory
(`this.picked`), so clearing storage alone would leave the row looking unchanged until you
navigated somewhere. A reload is one line and cannot be wrong.

### Proved

Measured with `ui-test` at 1920, 2026-09-04
(`/framework/ai/2026-09-04/paging-clarity/`):

- Three changes on three pages — `sizes/` content → `xl`, `styles/` style → `dark`, a sixth
  page added under `make/`. Three keys under `lew42:paging:`.
- Arm, confirm. **Zero** keys under `lew42:paging:` afterwards.
- `make/` back to its baseline five (Notes · Today · Later · Ideas · Archive); `sizes/` back to
  content `m` and a 412px box; `styles/` back to `plain`.
- A second run first wrote two foreign keys — `lew42:/imagine/team/` and `lew42:/notes/`.
  Both **survived** the reset; only the `paging:` one was removed.

## What it cannot do

- **A private-mode session is kept in memory only.** `Page.Store` falls back to a module-level
  `Map` when `localStorage` throws, and that map is not reachable from here — so in a browser
  that blocks storage, RESET's reload is what puts the demos back, not the clear.
- **A page you delete under `make/` while its column is open stays on screen until you
  navigate.** The row is gone from the tree and from the text; core does not unmount a column
  it was not asked to.

## Open — the owner decides

**Should a mode be shareable?** It is `localStorage` per url today, which is honest — nothing in
the address can be stale or wrong on another machine — but it means a look you like is not a
link you can send. A query string would fix it, and would be the first thing on this site to put
state in a url.
