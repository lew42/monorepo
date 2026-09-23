# Tooltip — a hover bubble; three plain spans and a stylesheet, no JS at all

## Use

```js
span.c("ui-tooltip", () => {
	span.c("ui-tooltip-word", "the word");
	span.c("ui-tooltip-bubble", "what the bubble says");
}).attr("tabindex", "0")   // tabindex is what makes the keyboard path work
```

## Watch out

- There is no `ui.tooltip()` — everything interesting about it (position relative to an ancestor, the `:hover`/`:focus-visible` state) is a CSS relationship a class list can't express, so it stays a stylesheet.
- The bubble is out of flow: an ancestor with `overflow: hidden` (a stage, a `.demo` box) clips it. Wrap the example in padding so the bubble has room.
- If the design doesn't insist on a styled bubble, the native `title` attribute is a real tooltip for free — see the "native" variant on the demo page.

## More

- [Overview](/framework/ui/tooltip/) — the hover demo, the held-open `.shown` demo, the native `title` variant
- Files: `tooltip.js` (the whole component, as CSS), `page.js` (show, don't tell)
