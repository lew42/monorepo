Truthy, `typeof === "object"`, and not an array — the base every other
object-ish check narrows. `is.pojo` and `is.proto` both call this first.

## Bites

`is.obj(new Date())` is **true**. Anything non-null and non-array that reports
`typeof "object"` qualifies — a `Date`, a `Map`, a class instance, a DOM node.
This is not "plain object" — that's `is.pojo`.

## Used by

`View.append()`, for the named-children branch (`div({ id: "x" }, …)`).
