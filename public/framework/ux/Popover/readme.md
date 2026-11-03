# Popover — one popup, anchored to a trigger, that never fights a z-index

The owner asked for two things to be built and compared: a popup kept `position:
absolute` near its own content, and the `popover` attribute's top layer. The top
layer won — see it happen on the page, not just read about it: [the comparison,
live](/framework/ux/Popover/). `Popover` is what the winner became.

## Use
```js
import Popover, { tooltip, menu } from "/framework/ux/Popover/Popover.js";

new Popover({
	anchor: el,             // a DOM element — a View's own `.el`
	content(){ … },          // draws whatever goes inside; `this` is the Popover
	place: "bottom",         // "bottom" | "top" | "left" | "right" — flips at the edge
	trigger: "click",        // "click" | "hover" | "manual"
}).draw();

tooltip(el, "text");                                  // hover + focus, role="tooltip"
menu(el, [{ text: "Rename", pick(){ … } }]);           // arrow keys, place: "right" for the side
```
Any UI can go inside `content()` — a filter box, buttons, a [`Tree`](/framework/ux/Tree/).

## Watch out
- **`anchor` is a plain DOM element**, not a View — pass `$trigger.el`, never `$trigger`.
- **It closes on outside-click and Escape because `popover="auto"` does that**, not
  code here — same call `ext/Dropdown`'s list already made. Don't add your own.
- **Focus returns to the anchor on close, but only if the keyboard actually moved
  focus into the box.** A hover-only tooltip never steals it, and never gives back
  what it never took.
- **Placement is CSS anchor positioning where the browser has it**, and
  `getBoundingClientRect()`, once per open, where it does not — checked live on the
  comparison page. [`doc/decisions.md`](./doc/decisions.md) has the version.
- **`anchor-name` collides if you don't give each Popover its own** — `draw()` mints
  one per instance (`--ux-popover-N`), so two Popovers never fight over the same name.

## More
- [Overview](/framework/ux/Popover/) — the comparison, live: option A clipped, option B whole; a tooltip, a side menu, a tree menu
- [`doc/decisions.md`](./doc/decisions.md) — why the top layer won, the Chromium version checked, what should migrate onto this later and the z-index count it would retire
- Consumer: [`/framework/ai/`](/framework/ai/)'s version picker — a hugging trigger, a `Popover`, a `Tree` inside it
- Files: `Popover.js` (the class, plus `tooltip()` and `menu()` — no parts, no dependency)
