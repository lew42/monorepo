The card's label: an icon, a title, and the card's only real link.

**Usage** — `preview_card()` (`Page.class.js:180`). Public so an override that builds its
own shell still ends with the same clickable label.

**Necessity** — small, and it earns its place twice. It is the one element in the card
that is an `<a>`, so it is the one element `Router.mark_links()` can mark; and its
`::after` is what makes the *whole* card clickable without nesting anchors.

**Simplicity** — three lines, no options. The icon appears only if the nav entry carries
one.

⚠ **`.active` / `.in-path` land here, not on the card.** `mark_links()` only touches
anchors, so `Page.css` asks `.page-preview:has(> a:is(.active, .in-path))` for the card
chrome. The child combinator is load-bearing: a live thumb can hold marked links of its
own, and `:has(a.active)` would light the card up for one of them.
