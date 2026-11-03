# Report: Essentials (condensed view)

Figma file `QYN0G2URSBHYH5I06MOjxU`. Brief: [brief-essentials.md](brief-essentials.md). Template used: [templates.md](templates.md) (section rows).

## What landed
- New page `Essentials` (`296:107438`), placed as page 3 (right after `Index · full size`). Its `Page · Essentials` component is `296:109702` (1920 wide), built as section rows: title, one sentence and a link left; content right.
- Rows, most important first: Type (5 styles with roles), Buttons (4 kinds plus a button row), Cards (8 styles, 2 rows of 4, equal heights, one caption each), Inputs (6), Lists (3), Status (3), then Colour last (3 cards on the dark ground, Text mode only).
- Every item except the type samples is an instance. Each row links to its full DS page with a text hyperlink.

## New card components (top level, right of the page, x 2300+)
| Component | Id | Use for |
|---|---|---|
| `Card / Plain` (Content slot) | `296:107439` | one short topic |
| `Card / Header + actions` (Content slot) | `296:107443` | a card with actions |
| `Card / Stat` | `296:107462` | one number |
| `Card / List` (Row instances, edge to edge) | `296:107468` | rows |
| `Card / Media` | `296:107499` | content with a picture |
| `Card / Feature` | `296:107508` | one capability |
| `Card / Callout` | `296:107515` | a note to notice |

The quote / launch-arrow card is the existing `Context` set, `Form=Card` (`222:27975`), instanced as is (one of everything). Cards fill `surface`, pad 24, 1 px black 8% edge, radius token; a card's main width (320) is display only.

## Not done (the Figma MCP call limit stopped the session)
- The last fix pass ran but was not screenshotted: cards at fixed heights 232 / 264 so the second row no longer clips, real labels on buttons, segments, toggle and checkbox. Take one screenshot of `296:109702` and check the Cards row and the Colour row.
- Not linked yet from `Index · full size` or the Overview card; add the page there.
- Cards use a fixed row height (named in the layer) because a FILL-height card collapses in a hug row.
