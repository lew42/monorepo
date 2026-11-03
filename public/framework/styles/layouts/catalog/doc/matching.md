# Content → layout: read this before you build a page

Pick the row that sounds like your content. Every layout is shown, ranked and counted on the [layout catalog](../page.js) (`/framework/styles/layouts/catalog/`). A page that fits no row is a **reading page**: do nothing special.

| Your content | Use | Class / module | Count rule |
|---|---|---|---|
| One topic, prose and a few cards | Reading page | `page`, no class | any |
| 20+ pages the reader jumps between | Left-nav site | `Sidebar` | tree depth ≤ 3 |
| One long article with headings | Menu, article, contents | `rail` + `toc` | 5+ headings |
| 10–300 things to find by looking | Filter rail beside a wall | `browse()` | picture + title each |
| Items that arrive over time, each needing triage | **Inbox: rail → preview → detail** | `Inbox.Rail` | 20–500 |
| A short list where each row opens a detail | List and detail | `flex wrap` + `basis` | 10–50 |
| Records to sort, filter and compare | **Data grid** | `ext/DataGrid` | 50–10,000 rows, 4–12 fields |
| Headline numbers and panels to glance at | Number strip over panels | `wall` | 4–8 numbers |
| A tree you drill down, keeping your place | Columns | `cols` words | depth 2–3 |
| A fixed order the reader walks once | **Steps** | `ux/Wizard` | 3–10 steps |
| One selected item to inspect, edit, **chat about** | **Properties rail** | `ext/drawer` | 5–20 fields |
| A message log | Chat | `flex v`, composer pinned | growing |
| A front door that persuades | Landing bands | `hero` + full-bleed | 5–10 bands |
| One idea at a time, calm showcase | Big white card (Figma palette) | one full-width `.card` | 1 idea per card |

## Rules of thumb

- **Count first.** Few items want a card each; hundreds want a grid or a rail. If you cannot say "N items, this much info each", you do not know the layout yet.
- **What the reader does decides it**: read → reading page; jump → left-nav; find by eye → wall; triage → inbox; compare → data grid; walk once → steps; inspect → properties rail.
- **Reuse before you build.** The inbox, grid, steps and drawer are already classes: extend them, never write a second one.
- **The big white card is one to document, not to use everywhere**: it wastes the screen on dense content.
- Colours inside a layout: [colour schemes](../../../doc/colour-schemes.md).
