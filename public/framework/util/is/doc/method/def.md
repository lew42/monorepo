`typeof value !== "undefined"`. `null` counts as defined — this asks *"is
there an argument at all,"* not *"is there a non-empty value."*

## Bites

`is.def(null)` is `true`. A caller that means "not null and not undefined" has
the wrong check.

## Used by

`View.js`, across eight call sites — every getter/setter that has to tell
*"no argument, read the current value"* from *"an argument, possibly empty
or null, write it"*: `text()`, `html()`, `attr()`, `append_prop()`, and the
`url()` loader reading a resolved module's default export.
