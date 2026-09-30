# How navigation looks and moves

The navigation questions check that every view has an address. This page covers the other half: what the reader sees while moving around.

## How links look

- A link in running text looks like a link: it is coloured and underlined, so the reader never has to hover to find it.
- The rail and the tabs mark where the reader is. The current page or tab is highlighted, so a glance answers "where am I?".

## Persistent or switching

- **Persistent** navigation stays on screen while the view beside it changes. A rail, a tab row and a sidebar are persistent.
- **Switching** navigation replaces the whole screen, like a plain link to another page or a full-screen view.
- Persistent navigation stays exactly where it was after a click. It does not move, resize or scroll back to the top. See [layout](/framework/design/layout/): the layout never jumps.

## Transitions

- A transition is optional; no animation is always acceptable.
- If a view does animate in, the animation is short. It never moves the navigation or the thing the reader was looking at.
