# card — the one card page

## What

The one card page for the site: [`/framework/ui/card/`](/framework/ui/card/). A card
is one class, `.card`, from `framework.css` — background, ink, padding, child
spacing, radius and shadow, all in one rule. Nothing here is this module's own CSS.

## Use

```js
import { div, h3, p } from "/app.js";
div.c("card", () => {
	h3("View");
	p("A DOM element with a chainable API.");
});
```

That's it — no `pad`, no `flex v gap`, no `--gap` override. `.card` already does
all three. Variants on the page: `linked` (a CTA), `media` (an image bled to the
edge), `action` (a button row), `list` (a repeated row).

## Watch out

- **A card nested inside a card steps one shade darker automatically** —
  `:where(.card) .card` in `framework.css`, no class needed. See the "Grounds" row
  on the page.
- **A ground class (`bg-white` / `bg-light` / `bg-prime` / `bg-dark`) sets the ink
  too**, not just the background — a card painted on a dark or accent ground still
  reads, by design.
- `.card` and `.surface` share one selector on purpose; see
  [`architecture.md` §3](/framework/styles/doc/architecture.md).

## More

- [`styles/doc/architecture.md`](/framework/styles/doc/architecture.md) — tokens,
  grounds, card and section, the whole system on one screen.
- Other card pages, linked from the page itself and never deleted:
  [`core/Page/card/`](/framework/core/Page/card/) (the earlier lab),
  [`ux/Card/`](/framework/ux/Card/) (a different thing, same word).
