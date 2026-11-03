# Doc architecture — a module is a page with four fixed tabs

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

`Doc` turns a module into a browsable page: Overview, API, Docs, Files, plus any declared children. It is a class, [`Doc.js`](../Doc.js), that extends `Page` and is set up by the module's own `page.js` (the call site lists members and notes, never tabs). Its main seams are `sections()`, `section()`, `api()`, `docs()`, `bar()`, `wall()` and `render()`.

## Four section names, fixed

**Decided:** the derived sections are always `overview`, `api`, `doc`, `files` and `inbox`, and a module overrides `sections()` to add a fifth.
**Why:** a call site that says "tab" would grow an option for every page shape, and every module has the same shape.
**Instead:** a named `sections:` option, rejected as API surface forever for one page shape.
**Detail:** [doc/decisions.md](./decisions.md) (the `sections` note under Decisions)

## Declared children stay top-level tabs

**Decided:** a declared child (`children:`) is a peer tab resolved from `<module>/<name>/page.js`; `overview:` is the sub page inside the Overview tab.
**Why:** a child lives in its own directory, so moving it under a section would mean moving the directory.
**Instead:** nesting children under a section, which breaks existing URLs.
**Detail:** [doc/decisions.md](./decisions.md) (Declared `children` stay top-level tabs)

## Sections are children, so the wall subtracts them

**Decided:** `sections()` adds the sections to `this.children` so each has a URL and a back button, and `wall()` drops `Doc.SECTIONS` from the preview wall.
**Why:** without the subtraction, `/framework/ui/`'s Overview wall drew the four section tabs as extra cards.
**Instead:** an inert marker flag, or swapping `this.children` around a render; both rejected.
**Detail:** [doc/decisions.md](./decisions.md) (A Doc's sections are children)

## An empty section has no tab

**Decided:** a section with nothing in it is never added. No members means no API; no notes means no Docs; no files means no Files.
**Why:** a bar of one tab is noise, so a module with only an Overview renders as a plain page.
**Instead:** always-present tabs with empty bodies.
**Detail:** [doc/decisions.md](./decisions.md) (An empty section has no tab)

## No class fields in Doc.js

**Decided:** `Doc.js` uses prototype methods and statics only. Setup runs in `initialize()`.
**Why:** a class field is set after `super()` returns, but `initialize()` runs inside `super()`, so the field would arrive after the sections it configures.
**Instead:** class fields, which fail silently here.
**Detail:** [doc/decisions.md](./decisions.md) (No class fields in `Doc.js`)

## A nested Doc renders as a left rail

**Decided:** `render()` checks `nested_in_doc()` and draws a vertical tab rail with no second well.
**Why:** two stacked well shadows read as broken alternating bands inside a parent Doc.
**Instead:** a manual override per page, which is what `ext/Panel/Workspace` used to hand-write.
**Detail:** [doc/decisions.md](./decisions.md) (A Doc nested in a Doc renders vertical)

## Member and note lists are typed by hand

**Decided:** `methods:`, `properties:`, `notes:` and `files:` are lists written by the author, never crawled from the module.
**Why:** the prose beside each name is the point, and a crawl cannot say which members are worth reading. Crawling also needs a server, and production is static.
**Instead:** reflection (keeps the list in sync but cannot say what has prose) and `directory.json` (gitignored, breaks static production).
**Detail:** [doc/reflection.md](./reflection.md) · [doc/files.md](./files.md)

## Overview is a catalog, not a wall of previews

**Decided:** the Overview tab is `catalog()`: the demos as a persistent rail of live cards.
**Why:** a rail beats a wall of preview cards for finding one demo among many.
**Instead:** a preview wall of cards, one per demo.
**Detail:** [doc/rail.md](./rail.md)

## Patched methods show the patch, labelled

**Decided:** when an ext has replaced a class method at runtime, the member page shows the replacement with a "Replaced at runtime" line, and the declared source is never run to find out.
**Why:** a doc page that reads a live object documents the running program. Reading a getter would execute it, so declarations come from property descriptors.
**Instead:** showing only the class-body source, which hides what actually runs.
**Detail:** [doc/decisions.md](./decisions.md) (A patched method shows the patch, labelled)

## Decision menus come from one shared index

**Decided:** a method or property page shows a ⋯ menu only when a design collaboration named it, read from `public/framework/ai/collab/decisions.jsonl`; with no record it adds nothing.
**Why:** the record is written by code when a vote closes and found by code at render, so no agent has to remember to link it.
**Instead:** a skill that asks agents to add a link by hand, or a hook that searches collab runs by name; both rejected as easy to forget.
**Detail:** [`decisions.js`](../decisions.js) · [doc/decisions.md](./decisions.md)

## More
- [`doc/decisions.md`](./decisions.md) the full record, including the traps and open items
- [`doc/Doc-notes.md`](./Doc-notes.md) implementation details
