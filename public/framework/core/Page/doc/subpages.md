# Subpages: a page.jsonl line, never a page.js edit

A subpage is made by **appending a line to its parent's `page.jsonl`**. No agent edits a `page.js`, and the old `children: "a b c"` string is not touched (it still reads fine on pages that have one; no mass rewrite).

## Two ways a child can be stored

| | **(a) embedded** | **(b) referenced** |
|---|---|---|
| where the child lives | as items inside the parent's `page.jsonl` | in its own folder: `<parent>/<name>/page.js` and/or `page.jsonl` |
| the parent's line | `{"tab":{"name":"notes","title":"Notes"}}`, then items addressed to it | `{"file":"notes/page.jsonl"}` (exists); `{"file":"notes/page.jsonl","gone":true}` (removed) |
| made by | `page_set` with `tab` | `page_set({pages:{add:{name,title,icon,description}}})` or `create_page` |
| use it for | a view of this page | a page that stands on its own, with its own url and files |

Both are allowed. `pages.add` is variant (b): `Servex/agents/Subpages.js` makes the folder and its `page.jsonl` (line 1 = labels), then appends the `file` line to the parent's `page.jsonl`, creating that file if the parent only has a `page.js` (such as `/live/`). `rename` writes a `gone` line for the old name and a `file` line for the new one; `remove` moves the folder to `_removed/<name>-<time>/` and writes `gone`. Nothing is deleted.

## Does a `page.js` parent route a child named only in its `page.jsonl`?

It did not (404). `Page.child()` only knew a folder's listing if something else had already fetched it. Fixed 2026-10-15 (one `await Page.listing(this.url)` in `Page.child()`): the listing is `files.jsonl` (kept by the dev server) else `page.jsonl`, so the child now routes and renders. Checked headlessly with a scratch parent.

## Open questions (not built)

- **Navigation.** Does a jsonl-declared child appear in the parent's sidebar/tabs, and in what order next to `children:` names? The route works; the nav was not checked.

## Deep deltas: pass exactly what changed

**The rule:** a line carries only what changed, at any depth. A key that names an item id walks into that item; a key that names a nested plain object merges into it key by key; arrays and scalars replace.

**What already works.** In the browser, `Item.apply` already walks by id one level per key (`{"k2":{"answers":{"add":{…}}}}`), so nesting is the path. The caller never needs a path string.

**The gap.** Two places merged only the top level: a nested *plain-data* object inside an item was replaced whole by `put`, and the tools' own replay behind `page_read` (`replay()` in `Servex/agents/page_tools.js`) did `{...old, ...delta}`, so `page_read` disagreed with a line that changed one nested key.

**Built (smallest slice):** `deep_merge()` in `page_tools.js`, used by the replay, so `page_read` shows the same state as the deep delta describes. Ids are unchanged (`stamp_ids` stamps every `add` at any depth).

**Proposed, not built:** the same plain-object merge in `Item.set_one` (browser), so a live page also keeps untouched nested keys. It touches the core class every page uses, so it waits for a decision rather than riding on this task.

Related: [ai-api.md](ai-api.md) (the tool and its table), [jsonl-pages.md](jsonl-pages.md) (how a page.jsonl names its children), [composition.md](composition.md).

## A child that uses its parent as a template

**What came of the past `page.clone` request** ([owner notes](/framework/ai/sessions/2026/10/12/session-87bec773/page-templates/owner-notes-3.md)): it was built on `Template` only, not on `Page`. `core/Page/Template/Template.js` has `clone(data)` (`Object.create(this)`: reads through to the template, writes only to the clone, so a base change flows to every clone) and `copy(data)` (a hard copy, no link). `Page.class.js` has no `clone`.

**So, can a child use its parent?** Yes when the parent is a `Template` (a Template is a Page): `parent.clone({...})` is the child, as a page.js page. Not yet from a jsonl line: a line like `{"template":"../"}` in the child's `page.jsonl` would need the loader to find the parent's Template and call `clone`. **Not built**; it is a separate decision because it makes a child's content depend on its parent's code, and the two storage variants above already cover pages that stand alone.

## A folder with only a `readme.md` is a page

When the parent's listing shows `name` is a folder with no `page.js` or `page.jsonl`, and that folder's own listing has a `readme.md`, `child()` calls `child_readme()`, which opens the folder as a page showing its readme. It runs before the `page.js` probe, because the listing has already ruled `page.js` out, so the probe would only be a 404. A folder without a readme makes no extra request, and a `page.js` or `page.jsonl` added later wins once the listing names it (until the listing is rewritten, the readme shows; measured 2026-10-24: 0 of 310 page folders with a readme were misread).

The page's title is the readme's first heading. Its sidebar `label` is the part of that heading before an em or en dash, with backticks stripped, so `# Events — on / off …` shows as Events; a readme with no heading is labelled with the folder name. Such a page is a plain `Page`, not a `Doc`, so it has no tab strip and no `md` tab (`md_tab()` belongs to `Doc`). Instead, when the folder holds other `.md` files (beside the readme or in `doc/`), one link under the readme, "Every .md file in this folder", opens `<url>md/`.
