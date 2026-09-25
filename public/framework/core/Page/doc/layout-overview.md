# Layout — where each part lives

Page layout is five ideas. Each has one home; this page only points.

- **The page grid.** Every page is one grid with three tracks: `main` (prose, 40em), `wide` (all the leftover room) and `bleed` (edge to edge). [`/framework/styles/doc/layout-system.md`](/framework/styles/doc/layout-system.md)
- **Columns.** `columns()` turns a page's subtree into a row of full-height columns, one per open page. [`doc/columns.md`](./columns.md)
- **Containers.** A page or column is a *container*: its children size against it, not against the screen. The container is what `container()` finds. [`doc/method/container.md`](./method/container.md)
- **Container queries.** A column's padding and rhythm are `cqi` clamps, so they follow the column's own width. The numbers: [`/imagine/design/size/`](/imagine/design/size/)
- **Padding and rhythm.** `--gutter-x`, `--pad-y`, `--flow` and the column pads. The rules, with the traps that bit: [`doc/css.md`](./css.md)
- **Nested or full.** Whether a child renders inside its parent or takes the screen, and why switching between them is tricky: [`doc/layout.md`](./layout.md)
