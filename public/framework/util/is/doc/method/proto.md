`is.obj(value) && !!value.constructor && value.constructor.prototype === value`
— true when `value` **is** some constructor's `.prototype` object.

## Bites

`is.proto(Array.prototype)` is **false**, on the single most obvious input
anyone would try it on. `Array.prototype` is itself an exotic array
(`Array.isArray(Array.prototype)` is `true`), so `is.obj()` — which excludes
anything `is.arr` accepts — rejects it before the prototype-equality check
ever runs. A known gap, recorded rather than fixed, because fixing it means
`is.obj` special-casing arrays for the sake of this one caller.

## Used by

Nothing today.
