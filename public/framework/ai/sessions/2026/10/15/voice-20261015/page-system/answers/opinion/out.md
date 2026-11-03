# core/Page: three opinions (class split, storage, delta log)

---

## Q3: The Page class `core/Page/Page.class.js`

**The file is 721 lines, not thousands.** It was 2,270 lines until 2026-10-12; seven steps of [split-plan.md](/framework/core/Page/doc/split-plan.md) moved the rest into `Jsonl.js` (297), `Columns.js` (162), `Links.js` (110), `Previews.js` (85), `Reader.js`, `Listing.js` and others. About 90 of the 721 lines are one-line facades that only forward to those parts. So the owner's instinct was right once, and has already been acted on.

```js
class Page extends Item {                        // Page.class.js:32; Item is core/Item/Item.js:21
  // identity           naming() 247, words() 262, chain() 342, nearest(role) 349, topic(), document(), link(), crumbs(), slug()
  // children           get pages 112, get children 114, declare() 280, add() 319, move() 334, child() 360, load_all_children() 686
  // loading            static of() 431, file() 436, load() 453, props() 485, jsonl() 198, listing() 201, source_children() 355
  // rendering          container() 505, activate() 517, deactivate() 544, render() 561, render_content() 599, content_at() 604
  // links and nav      nav() 664, nav_for() 666, open_link() 422, swap_link() 423, columns() 641, previews() 673, preview_card() 678
  // persistence        set() 66, file()/tab()/place()/overlay()/gone() 136-146, tab_state() 176, log_view() 182 (all facades to Page.Jsonl)
}
```

- **`pages` is not an alias of Item's items.** It is its own `List` named `"pages"`, owned by the page (`Page.class.js:112`). Item keeps its generic `items`; a page's children live only in `pages`.
- **`page.children` is a Map-shaped view over `page.pages`** (`Page.class.js:114`, class `PageChildren extends Map`, `Children.js:2`). `get(name)` answers a page, `null` for a declared-but-unloaded stub, `undefined` if absent. Assigning `children = [...]` only stages the config; `declare()` (280) reads it.
- So the tree really is one list, `pages`, with a Map costume for the callers who like `.get(name)`.

### Proposal only: what could still leave the file

| Group | Lines | Becomes | Callers (files mentioning it) | Risk |
|---|---|---|---|---|
| `naming`, `words`, `word_classes`, `words_said` (247-278) | ~35 | `Page.Words` | few; `words()` is read inside page.js declarations | low |
| `render`, `activate`, `deactivate`, `container`, content render (505-625) | ~120 | `Page.Render` | `render()` has hundreds; subclasses `Template`, `PartsPage` override it | high |
| The ~90 one-line facades (136-196, 422-428, 652-662, 673-680) | ~90 | one `Page.delegate(Part, {method: "part_method"})` install line each | `previews`/`preview_card` 375 files, `.columns(` 50, `open_link`/`swap_link` 9, `tab_state`/`tab(` 14 | low if names stay |

What it buys: the class body shrinks to roughly 450 lines, and the facade block stops being 90 lines of the same `new this.constructor.X({ page: this }).y()` shape. What it risks: subclass overrides (pages override `preview*`, `file`, `tab`, `place` on purpose, per split-plan), and the Jsonl.js cycle that already needed `Page.Jsonl.Page` set by hand.

**Order:** (1) the facade install helper, behaviour identical, check three pages; (2) `Words`; (3) stop. Leave `set/get/add/child/render/activate` alone, as split-plan says.

**The alternative is to leave it.** It wins now: 721 lines with the parts already named is readable, the facade lines keep `page.columns()` working for every caller, and each further move costs a `check_page` sweep for little new clarity. Move more only if a reader still cannot find things.

---

## Q4: Storage permutations

Counts from `git ls-files` today.

| Form | Good for | How it is found | Count |
|---|---|---|---|
| `page.js` | code-driven pages, demos, anything with behaviour | parent's `children:` names the folder; the router imports `child/page.js` | 1503 |
| `page.json` | static data, no replay | same folder rule, read as one object | 12 |
| `page.jsonl` | live, edited pages with history (cards, sessions, agent-written pages) | the `Page.jsonl` loader (`Jsonl.js`) reads the lines; listing says a page exists | 921 |
| a subpage inside a parent's jsonl (a `tab` line) | a small child that needs no folder | the parent replays the `{"tab": …}` line | 3 files hold a `tab` line, 7 lines in all |
| `route(name)` pages | children made on demand (`Page.class.js:378`) | the parent asks `this.route(name)` when the child is unknown | about 177 `page.js` files mention route |
| `generator/` or `dynamic/` folders | pages produced by code, not files | a `child_source` function (`Page.class.js:355`, `children: "… auto"`) | 24 and 17 tracked files |

20 folders hold both a `page.js` and a `page.jsonl`: the `.js` is the code, the `.jsonl` the data.

**Opinion.** The file name is already the declaration, and that is right: `page.js` means code, `page.jsonl` means a delta log, with no field to keep in sync with the file beside it. A `store`/`backend` field on each page would be a second place to say the same thing, and it could disagree with the file. The one case that needs a word is where a page is kept in production, and `doc/storage.md` already designs it as a single `home` line (`files`, `room`, `table`, `archive`) that defaults to files and is mostly never written. So the current setup is right; add nothing per page until a visitor-written page exists. Dynamic pages are the weak spot only for discoverability (they have no file to see), which a listing page, not a field, fixes.

---

## Q2: The delta log, verdict

**Keep the deltas.** A `page.jsonl` is bigger than a snapshot, but an append is safe with many writers (a read-modify-write lost 98% of updates when measured, `doc/storage.md` section 3), a new line reaches an open tab in about 100 ms, and history and undo come free. Those three are what this site is for.

The two costs that really bite:
1. **Replay time and file growth.** Reading a page replays every line; the largest `page.jsonl` is 9,760 lines (`ai/sessions/2026/10/02/cards/page.jsonl`) and storage.md says 10 files pass 1 MB, the largest 7.2 MB.
2. **Compaction.** Nothing does it yet, because a node replay that equals the browser's `Page.set()` does not exist.

Already designed in `doc/storage.md`, not built: a snapshot line written only at compaction, at archive and on request, `page.1.jsonl` kept beside the live file, and an archive pointer. Slice 2 (`FileJournal` plus the node replay) is the step that unblocks it; slice 1 (the backend seam) is not built either. Until then the cost is small (most logs are far under 1,000 lines), so the verdict is: keep deltas, build the snapshot only when a log you actually open feels slow.
