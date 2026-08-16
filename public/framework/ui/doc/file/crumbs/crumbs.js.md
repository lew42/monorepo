One rule: `.ui-crumbs a { text-decoration: none }` — a descendant selector,
which is the one thing the markup on `page.js` cannot say about itself, since
`framework.css` has no rule for `a` at all.

## Improvements

Nothing ranked: one selector, one declaration, and the reason it can't be a
utility class is stated in the comment above it.
