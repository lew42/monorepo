`is.obj(value) && value.constructor === Object` — an object *literal*
specifically: `{}`, not a class instance, not an array, not a `Date`.

## Bites

`is.pojo(Object.create(null))` is **false**. An object with no prototype has
no `constructor` at all, so the equality check never has a chance to run
truthy — a rare shape, and a known gap rather than a bug to fix.

## Used by

`View.append()` (named-children `div({ id: "x" }, …)`) and `Page.class.js`
(an inline `{ title, content }` child config).
