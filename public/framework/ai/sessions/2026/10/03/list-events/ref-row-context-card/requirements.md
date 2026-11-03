# The ask (verbatim, from the owner via vscode-mastermind, correcting the same-day `ref-content-rows` build)

> a ref row is the inline #Page link UPGRADED to a full-width card. (1) The whole row is DARK
> (the class-card look), not a white card. (2) Its header is the same icon + name chip as the
> inline mention (it links to the page); the card body itself does NOT link through. (3) The
> row's text/sections sit inside the dark card under that header, readable on dark.

## Prior state (landed this same day as `ref-content-rows`, commit range ending `aefe7c04`)

- The whole row only turned dark when `entry.class_card` was true — not unconditionally dark.
- The whole card — header AND body — linked through as one `<a>` (because `ui/item/item.js`'s
  `item({href})` makes the whole row a single link, no partial-link mode).
- The item's own title/text rendered as siblings OUTSIDE the dark card, not nested inside it.

## Fix

`core/Page/Page.class.js`'s `render_content_list()`'s `draw_row`: the ref branch now always
applies `page-surface-dark` (combined with `.card` for the standard `--pad-card` padding, same
`@layer theme` load-order trick `ext/Mention/Mention.js` already documents), appends the header
chip (`ext/Mention`'s `build_row`) explicitly as the first child, then runs a new shared
`draw_body()` closure (title/text) as a second child inside the same dark card — never as a
sibling outside it, and never part of the header's own `<a>`.
