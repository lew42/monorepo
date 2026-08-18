`typeof value === "function" && value.prototype !== undefined`.

## Bites

This is **not** "was this declared with the `class` keyword." Every ordinary
function has a `.prototype` too, so `is.class(function(){})` is `true`. Only
an **arrow** function returns `false`, because arrows alone have no
`.prototype`.

`ext/Doc` needed the stricter question — *"is this really a `class …`
declaration"* — for its Overrides line, and answering it with this check
would have been wrong on every plain function. `Doc.is_class` tests the
source text instead (`/^class[\s{]/.test(String(subject))`). If a caller
ever needs "really a class," that is the function to reach for, not this
one — see [`ext/Doc`](/framework/ext/Doc/api/is_class/).

## Used by

Nothing today.
