# Full sections moved out of readme.md (2026-10-12)

Trimmed to an index per CLAUDE.md; wording kept as it was.

## Architecture

```js
Page extends Item                     // ✅ page instanceof Item is true — no middle class (PageLog folded in, 2026-10-03)
  url, title, parent: Page
  pages: List                         // ✅ the real storage — sub-pages, keyed by id (= folder name)
  children                            // ✅ a Map-SHAPED VIEW over `pages` — ~215 existing callers unchanged (not List's old `children` field, now `items`)
  content: List<Item>                 // ✅ made lazily, the page's own blocks; render_content_list() draws each through its class's View (doc/content.md)
  store: Item.Store                   // ✅ attached by Page.jsonl() — one per page.jsonl, append + tail, written through FsFile.append
  prefs()                             // ✅ localStorage (was `store()` — renamed, `page.store` is the jsonl Store now)
  view: View
  set(line)                           // ✅ a thin page.jsonl wrapper over Item's apply()-based routing
  add(name, child), move(url)         // Page's OWN methods — composition, not inheritance, avoided the clash
  route(name) → Page                  // dynamic children (cards, md/, fs/)
  static use(Ext)                     // ✅ page extensions (ext/: Inbox first)
}
class Card extends Page { }           // ✅ a smaller page (card/, ai2/card.js) — its own data stays a separate task
// NOT BUILT YET: class System extends Page — design, code, ui, ux, ai sharing top tabs, readmes, an inbox
// sub-modules: card/ (the card rules), weight/ (weight = 1 by default), ext/ (Inbox), audit/, layout/
// design: ai/sessions/2026/09/30/proposal-flow/page-item-design.md (the "fourth pass" section rules)
// build log: ai/sessions/2026/10/02/page-extends-item/page-extends-item/
```

## The sub-systems

[layout](./layout/) — the layout system: navigation and the parent, the page's own room, inside the page, including [switcher](./layout/switcher/) (one list-switches-content pattern, three skins)
[navigation](./navigation/) — persistent vs switching, the levels that stack, the go-to pattern
[make](./make/) — making a page, five ways; agents use the `create_page` tool (Servex)
[storage](./jsonl/) — `page.jsonl`, a page as a log of lines; who writes it and when: [doc/jsonl.md](./doc/jsonl.md). The live list at [`/framework/core/Item/live/`](/framework/core/Item/live/) shows the same thing on `page.content`: add, drag, sort, reload — the list comes back. An agent writes a page the same small way, one nested line at a time (`page_call`, `page_add`, `page_set`, `page_log`, `page_read`, `page_note`) — [doc/jsonl.md, "Agent tools"](./doc/jsonl.md#agent-tools--writing-a-live-page-without-touching-the-file-2026-10-02), live at [`jsonl/live/`](./jsonl/live/).
[settings](./settings/) — tabs that manage themselves (a `tab` line on the parent) and a page's own nav switch (a `settings` line on the child)
[ext](./ext/) — extensions: a page.jsonl line (`{"ext": "Inbox"}`) or `Page.use(Ext)` turns a small piece of behavior on, by name. The first one, `Inbox`, lets any agent leave a `{"inbox": …}` message (`drop`, Servex) or a `{"note": …}` one (`page_note`, read with no Servex dependency) on any page's own log. Its readme also has the **path extensions** census — `md/` and `fs/` (built into every page, step 3 above) plus the per-page AI chat pair and the AI/AI 2 task-folder patterns: [`ext/doc/path-extensions.md`](./ext/doc/path-extensions.md).
[ai](./ai/) — the page-based AI system: dictation, the voice pair (fast and smart assistant), sessions and the SDK, plus `page_work()` — a page's own open tasks and agents, opt-in ([doc/work.md](./ai/doc/work.md))
[dynamic](./dynamic/) — a url with no `page.js` or `page.jsonl`, loaded by an ancestor's `route()`: data on disk plus one template
[weight](./weight/) — each page's weight: 1 by default, raised by the pages that reference it plus a manual adjustment; heaviest sorts first
[card](./card/) — the card system: four grounds, nesting that drops the box after level 3, header and menu patterns, cards as routed mini pages; plus [log](./card/log/), any object's own nested log
[generator](./generator/) — builds a whole page tree from a short spec string, so you can try layouts without making files
[overview](./overview/) — the wall of one picture card per page building block
[audit](./audit/) — every page layout in use, most-used first, with where each lives in code; the main pages and their layouts; a design pass at four widths
[old](./old/) — the first Page docs, kept as reference

This readme is the text version; the rendered page is designed from it ([how](./make/readme-page/)).

## Five ways to make a page

All five are on the **[Make a page](./make/)** tab, each with its code and its live result.

1. **`page.js`** — one file. The folder is the url, `children:` is the menu. [overview/page](./overview/page/)
2. **`page.jsonl`** — the same page, as a log; line 1 builds it, later lines call one method each. [jsonl](./jsonl/)
3. **`route(name)`** — a url nobody declared, resolved the moment it's asked for; no `children:` at all. [overview/route](./overview/route/)
4. **Folders, with no `children:` list** — a child built from a name read straight off disk. [overview/folders](./overview/folders/)
5. **A readme as the page** — the content is the module's own `readme.md`. [make/readme-page](./make/readme-page/)

Nothing crawls: a page exists once its parent's `children:` (or a `file` line, or `route()`/`child()`) names it.
