This module's own page, and the reader's introduction to `Page` — every tab you can
click here is produced by the `Doc` config at the top of this file, `subject: Page`
included.

## `children: "old"`, and an `overview_section()` override (2026-08-19)

The six guide pages and the fifteen demo trees moved under `old/` — a `.tabs.vertical`
left rail over `nav children previews shell flow overview`, one top tab beside
Overview/API/Docs/Files. `../old/readme.md` is the record.

With no `overview:` left to hand `Doc.overview_section()` a rail, it would draw a
catalog holding nothing but the intro card — a rail of one. `page.js` overrides
`overview_section()` to skip `catalog()` and render `content()` plain; smallest
override that works, same `render()` shape the base method uses.

## Improvements

1. **`files:` was never declared** — the Files tab did not exist before this
   pass, for a module with 70 files. *(simple, important — done in this pass.)*
