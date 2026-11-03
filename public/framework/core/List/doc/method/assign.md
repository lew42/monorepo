`Object.assign(this, ...args)` — identical one-liner to
[`Item.assign`](/framework/core/Item/api/assign/), called by the constructor so
`new List({ owner })` works. The two classes don't share it; see that page for
why duplicating two lines cost less than introducing a shared base for it.
