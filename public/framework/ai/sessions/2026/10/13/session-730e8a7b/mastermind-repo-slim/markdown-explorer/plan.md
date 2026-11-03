# Markdown Explorer: plan

**Ask:** `<module>/md/` shows the readme in the pane and every markdown file of the module in a list beside it. Brief: [requirements.md](requirements.md); the 10-06 ask: `ai/sessions/2026/10/06/markdown-explorer-and-class-cards/requirements.md`.

## Classes

```
Browse                       ux/Browse/Browse.js          the list-and-detail shell (exists, not edited)
  PageMarkdown.Explorer      core/Page/Markdown.js        NEW, ~30 lines: the list (draw_list) + the readme as the empty pane
PageMarkdown extends Page    core/Page/Markdown.js        exists: the md/ page, one per folder; the ROOT mounts an Explorer
```

- **Root `md/`** (its parent is not a `PageMarkdown`): `content()` mounts `new PageMarkdown.Explorer({ page: this }).mount()`.
- **Sub-folder pages** (`md/doc/`): keep today's plain list, drawn in the pane. The root's list already links every file, so they are rarely visited.
- **File pages** (`md/doc/binding/`): the same `Page.file()` pages as today, now with `classes: "inbox-page"` so the pane scrolls them. They mount in the root's `$pages` = Browse's detail pane (the Router does this; no new routing).

## URLs

| url | shows |
|---|---|
| `/<module>/md/` | readme in the pane, list beside it (phone: the list only) |
| `/<module>/md/readme/` | the readme, as a clicked row |
| `/<module>/md/doc/<name>/` | that file in the pane, same list, back button returns |

Links inside a rendered file already become `<module>/md/…/` (`md.route()`), so they open in the explorer. Nothing to add.

## The `md` tab

The tab bar of a module page is `Doc.bar()` in `ext/Doc/Doc.js`. `md` is always in the strip list; whether it shows is `tabs_state.md.nav`, set by `md_tab()`: true when `Doc.names(notes)` has entries or the folder's listing has a `readme.md`. The listing loads after the first draw, so `md_tab()` asks for it once and redraws the strip (`nav_redraw()`) when a readme turns up. A page with neither never shows it.

**Trap found:** do not `this.tab({name:"md"})`. The placeholder sets `children.md = null`, so `Page.child()` no longer sees `known === undefined` and the `md/` route 404s.

## Decisions

- **decision: `Explorer extends Browse`, nested in `Markdown.js`**; alternative was making `PageMarkdown` itself the Browse (it is already a `Page`, and `Page` cannot extend `Browse`). Law 6: Browse is the one list-and-detail.
- **decision: keep both `doc` and `md` tabs.** `doc` shows the notes a module's `page.js` *declares* (curated, nested names); `md` shows *every* `.md` file in the folder. Different things, so not two tabs for one thing.
- **decision: the tab rule lives in `Doc.bar()`**, one place for every module, not per page. This edits one line outside the fence.
- Production has no file list, so the list column says so and the readme still shows.
- **decision: the Page module's own `bar()` in `core/Page/page.js` does NOT get `md`.** It already has 14 tabs; a 15th wraps the strip to a third row holding only "Files" at 1280 (a widow), and `merge.mjs`'s smoke flags the wrapped tabs as "element above the title". Its explorer is still at `/framework/core/Page/md/`, linked from `core/Page/readme.md` and `doc/markdown.md`. Alternative: shorten other tab labels; not this task's fence. Every other module gets the tab through `Doc.bar()`.
