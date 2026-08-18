# is — fifteen one-line type checks, all booleans, so `View.append()` and `Page`'s child normalization branch on one answer

## Use

```js
import { is } from "/app.js";   // or: import is from "/framework/util/is/is.js";

if (is.pojo(arg))          // named children
else if (is.arr(arg))      // flatten
else if (is.fn(arg))       // capture
else if (is.promise(arg))  // append when it resolves
```

## Watch out

- `is.class` tests for a `.prototype`, not the `class` keyword — `is.class(function(){})` is `true`; only arrows fail. `Doc.is_class` is the strict one: [`doc/method/class.md`](./doc/method/class.md)
- `is.num(NaN)` is `true` — `NaN` is `typeof "number"`: [`doc/method/num.md`](./doc/method/num.md)
- `is.proto(Array.prototype)` is `false` — the most obvious input fails, on purpose: [`doc/method/proto.md`](./doc/method/proto.md)
- `is.mobile()` is a user-agent sniff — it and `is.proto` are the two recommended for deletion, not applied: [`doc/decisions.md`](./doc/decisions.md)
- Seven checks have no framework callers; they stay because the table's value is completeness: [`doc/decisions.md`](./doc/decisions.md)

## More

- [Overview](/framework/util/is/) · [API tab](/framework/util/is/api/) — one page per check: real source, callers, whether it earns its place
- [`doc/decisions.md`](./doc/decisions.md) — why fifteen in one file, the caller census, the delete-two recommendation, the open `is.class` rename
- Files that matter: `is.js` (the fifteen checks), `page.js` (the Doc index), `doc/method/*.md` (one note per check)
