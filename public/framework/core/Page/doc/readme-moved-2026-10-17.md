# Page readme — the sections the readme used to carry

Moved here from [`readme.md`](../readme.md) on 2026-10-17, byte-identical, so the readme stays an index. The readme has one line pointing at each heading below.

## Making a page: reuse a layout first

## Making a page: reuse a layout first

Load the `page` skill and let `create_page` make the files.

- **Match content first:** [content → layout](/framework/styles/layouts/catalog/doc/matching.md), [catalog](/framework/styles/layouts/catalog/).
- **Pick a layout** from [the audit](../audit/): most-used first. Doc pages (top tabs) and column pages cover most modules; a child starts from its parent's layout.
- **Don't drift:** no own tab strip or shell, no one-page CSS tweak on a shared layout. Propose a new layout first.
- **Check:** `node Server/layout-check.mjs --bands <url>`.


## Agents change pages; a thing has a page; content inside a page

**Agents change pages** — [`doc/architecture.md`](./architecture.md) (path + delta through `page_set`, `Servex/agents/page_tools.js`; tabs, layout words and session pages work live) · the ask: [`doc/page-tool-2026-10-09.md`](./page-tool-2026-10-09.md)

**A thing has a page** — [`doc/composition.md`](./composition.md) (the rule: a thing holds a page by reference; today `AITask` and `AISessionDetail` still extend `Page`; page CRUD/move is a known gap)

**Content inside a page** — icon items, sections, outlines: [ux/Content/structure](/framework/ux/Content/structure/)

## Query, asks, vision, notes

**Query (page/query)** — [`doc/query.md`](./query.md) (finding past work: the in-memory task query, every index and its verdict, task vs session, the pilot; the owner's open decisions)

**Asks** — [`doc/asks.md`](./asks.md) (the owner's repeated asks about the page system, merged, open first)

**Vision** — [`doc/vision.md`](./vision.md) (the page as the core data item, debug views of any instance; back-burner ideas kept)

- Notes (history and lessons moved out of the code comments): [doc/Frame-notes.md](./Frame-notes.md) · [doc/Page-notes.md](./Page-notes.md) · [doc/page-js-notes.md](./page-js-notes.md)
