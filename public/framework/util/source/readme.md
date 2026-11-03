# source — a function's body as readable text, for every example and method page on the site

## Use

```js
import { source, member, patched, dedent } from "/framework/util/source/source.js";

code.js(source(example));   // body only: wrapper stripped, dedented
member(subject, "name");    // the real running function, no getter ever called
```

## Watch out

- `source()` finds the body at the first depth-zero arrow — a naive `indexOf("=>")` once sliced inside a function: [doc/method/source.md](./doc/method/source.md)
- `member()` reads the property descriptor, never `subject[name]` — reading a getter runs it: [doc/method/member.md](./doc/method/member.md)
- `patched()` can't tell "ext replaced a method" from "ext added one" — name the added function: [doc/method/patched.md](./doc/method/patched.md)
- `dedent()` normalises CRLF first and skips a flush-left first line — both were real bugs: [doc/method/dedent.md](./doc/method/dedent.md)

## More

- [Overview](/framework/util/source/) · [API](/framework/util/source/api/) — one page per function: real source, who calls it, what bites
- [doc/decisions.md](./doc/decisions.md) — why `util/`, two entry points not a flag, the used-by table, the record
- [doc/functions-not-strings.md](./doc/functions-not-strings.md) — why every demo takes a callback, and when a string is right
- Files that matter: `source.js` (all four functions), `page.js` (the Doc index), `doc/method/*.md` (one per function)
