Four variant classes (`accent`, `dark`, `outline`, `count`) plus a `.dot`
pseudo-element indicator. No exported function — the class list *is* the
component, `.ui-badge.ui-pill.h4` is the whole pill, and the five variants are
selectors rather than an option map.

## The status-axis gap

Only one accent color exists in the token set (`--prim`), so a badge can offer
neutral / accent / dark / outline but never a semantic "passing" green — the
`--ok`/`--warn` proposal in `doc/record.md` §5 would unblock this and every
other component wanting a status color, not just badges.

## Improvements

1. **`--ok`/`--warn` tokens, proposed but not applied** — full case in
   `doc/record.md`, not repeated here since it's a token-set decision, not a
   badge one. *(medium, important — cross-component, needs one worked example
   first per the existing verdict)*
