# Badge architecture — the class list is the component

`badge` is a pill label made from classes, not a function. The whole component is `ui-badge ui-pill h4` plus one tone class. Its only code is [`badge.js`](../badge.js), which holds four tones and a dot. The live examples are on [the badge page](/framework/ui/badge/).

## There is no `ui.badge()`

**Decided:** a badge is written as a `span` with classes; no helper function exists.
**Why:** the old helper's body was one `span.c()`, so the function only spelled the same three words a second way.
**Instead:** a `ui.badge()` helper, which would be a second way to build the same thing.
**Detail:** [the page's note](/framework/ui/badge/)

## Four tones only

**Decided:** the tones are `accent`, `dark`, `outline`, and plain. No green or amber tone exists.
**Why:** the token set has one accent and no `--ok` or `--warn`, so any "passing" or "warning" colour would invent a token.
**Instead:** a success or warning tone with its own colour, which means adding tokens to the theme first.
**Detail:** [`badge.js`](../badge.js) header comment

## The dot is `currentColor`

**Decided:** `.dot` draws its circle with `::before` and `background: currentColor`.
**Why:** the dot takes whatever colour the tone already sets, so no tone needs a second dot rule.
**Instead:** one dot colour rule per tone, which would repeat three colours in CSS.
**Detail:** [the page's note](/framework/ui/badge/)

## The pill is owned by `ui-pill` and `h4`

**Decided:** size, case and tracking come from `h4`; the wash background and `999px` radius come from `ui-pill`. `.ui-badge` only holds the tones.
**Why:** `h4` is already a small, tracked, uppercase label, so badge needs no size rules of its own.
**Instead:** a badge-owned font and padding, which would drift from the rest of the headings.
**Detail:** [the page's note](/framework/ui/badge/)

---

Code check: the four tone rules and the dot rule in `badge.js` match this page. `ui-pill` and `h4` are defined outside this module and were not checked here. No `⚠` mismatches.
