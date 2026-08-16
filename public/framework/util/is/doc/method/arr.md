`Array.isArray(value)` — nothing more. It exists for the same reason every check
here does: `View.append()`'s dispatch needs a *name* to branch on, not an inline
`Array.isArray(arg)`.

## Used by

`View.append()` — the flatten branch, for an array of children. `Page.class.js`
— normalizing a `children` config that may be a space-separated string or an
array.
