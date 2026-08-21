Every rule the columns arrangement needs, all in `@layer theme`. Two declarations carry it:
`.page.column, .page-column-pages { display: contents }` (the tree's boxes leave the layout)
and the body's `flex: 1 1 0` between `--page-column-min` (12em) and `--page-column-max`
(24em). One container query, `page-columns (width < 30em)`, makes the body `min-width: 100%`
— one column at a time. `scroll-snap-type: x proximity`, not `mandatory` (a mandatory row
re-snaps and undoes the reveal).

⚠ Names: `.page.columns` / `.page.column` are page-shape words like `.page.solo`; the parts
are `page-column-*`. Never `.page-columns` — `render()` stamps `page-<name>`, and this demo's
own doc page is a directory called `columns/`. Record: [`doc/columns.md`](/framework/core/Page/doc/columns/).
