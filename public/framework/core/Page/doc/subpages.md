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
- **Deep deltas, step 3.** `page_set` merges shallowly by top-level id today. Proposal comes next in this file.
- **Parent as template, step 4.** Also next.

Related: [ai-api.md](ai-api.md) (the tool and its table), [jsonl-pages.md](jsonl-pages.md) (how a page.jsonl names its children), [composition.md](composition.md).
