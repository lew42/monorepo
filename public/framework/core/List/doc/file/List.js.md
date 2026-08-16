The class, entire — 57 lines, zero imports, headless. Ten methods and one
getter over one array (`children`), plus `owner` for the adoption trick that
lets `Item` treat `parent` as always-an-Item. See
[doc/adoption](/framework/core/List/docs/adoption/) for why that indirection
exists.

## What's genuinely here versus what's a wrapper

`length`, `[Symbol.iterator]`, `each`, `find`, `index_of`, `toJSON` are all
one-line pass-throughs to `Array.prototype` equivalents or close to it. The
class earns its existence on exactly three lines: `adopt()` (writes `parent`
to the owner), and the `notify()` call inside `append()`/`remove()` (bubbles a
mutation to the owner's `emit`). Every other method exists to give those three
lines somewhere to live, next to an array they can safely wrap.

## `[Symbol.iterator]` has no doc/method page

The `methods:` list in `page.js` is hand-typed strings, and `Symbol.iterator`
is not a plain string property name — `for (const kid of item.items)` works
(verified: `List.js:12`), but the Doc system's member lookup has no slot for a
well-known symbol. It's shown in the class overview code block in the Overview
instead. See this pair's audit Recommendations and Skill feedback for the
gap.

## Improvements

1. **`Symbol.iterator` is invisible to the API tab** — see above. Not fixable
   inside this file (it's a `Doc`/`ext/doc` limitation), but worth flagging so
   whoever tightens `Doc.member()` next has a real example to test against.
   *(medium, useful — belongs to `ext/doc`, not this module.)*
2. **`assign()` is a byte-for-byte duplicate of `Item.assign()`.** Both are
   `Object.assign(this, ...args)`. Not worth a shared base for two lines today,
   but if a third persistence class appears wanting the same constructor
   shape, that's the trigger to extract it. *(simple, speculative.)*
