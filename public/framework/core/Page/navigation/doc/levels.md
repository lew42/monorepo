# The levels that stack, and why four is the ceiling

The owner named four, in order: **a header, a left sidebar, top tabs, and an inner left
sidebar.** Each one is simple by itself. Stacked, his own words: *"it gets pretty ridiculous
pretty quick."*

## What each level actually narrows

Read top to bottom, each level answers a smaller question than the one above it:

1. **Header** — the whole site. Logo, the ☰ drawer, sign-in. Never changes per page.
2. **Left sidebar** — the whole site's page tree (`core/Sidebar`, built on `ux/Tree`). One click
   anywhere on the site goes through it.
3. **Top tabs** — this one module's own sections (Overview, API, Docs, Files — `ext/Doc`'s
   `section()`). Scoped to whatever module the reader is currently inside.
4. **Inner left sidebar** — one section's own members. On the API tab, that is one property or
   method rail (`this.tabs().ac("vertical")` inside `section()` — see `ext/Doc/Doc.js` line ~83).
   Scoped to the one tab the reader is currently on.

Each level cuts the world down by exactly one step: site → module → module's section → that
section's own items. That is why four holds together instead of reading as four unrelated menus
— every one is a real subset of the one above it.

## Why not five

Nothing on this site has needed a fifth level yet, because nothing has needed to narrow scope
*again* past "one member of one tab of one module." A fifth level would have to answer an even
smaller question than that, and in practice the content itself (prose, a table, a demo) is
already specific enough by level four. If a real case needs a fifth level, treat it as a decision
to make deliberately (why the extra step is worth it, what it is), not a default to reach for.

## What to cut first, when a page feels like too many

Most real pages use one or two of the four, not all four:

- A one-off demo page: **just the header and the sidebar** (levels 1–2). No top tabs, no inner
  rail — `core/Page/layout/page.js` is an example.
- A module with a handful of concerns: **add top tabs** (level 3) — `ext/Doc`'s default shape.
- A module whose one section genuinely has many small members (a class with 30 methods): **add
  the inner rail** (level 4) only for that one section, not every tab — `ext/Doc`'s `api_section()`
  and `docs_section()` already do this conditionally (a `doc/` with only one note skips the rail
  and shows the note directly — see `Doc.js` `docs_section()`).

The screenshot on the main page (`/framework/core/Page/api/`) shows all four at once because
that module (`core/Page` itself) genuinely has that much — it is the deepest real example on the
site, not the typical one.
