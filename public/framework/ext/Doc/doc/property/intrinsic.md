```js
Doc.intrinsic = /^(name|length|prototype|caller|arguments)$/
```

The five names **every function already owns**, and the reason
[`declaration()`](/framework/ext/Doc/api/declaration/) has a static fallback it
sometimes has to refuse.

`core/View` documents an instance property called `name`. Looking it up found
nothing on `View.prototype`, fell back to the constructor, and got `Function.name`
— so the page printed `name = "View"` as though that were the declared default. It
read as perfectly good documentation. Nothing threw, nothing logged, and it was
wrong on the one page most likely to be read first.

These five skip the fallback entirely. The page is then the prose alone, which is
the honest answer.

It is a shared regex rather than an inline literal because
[`overrides()`](/framework/ext/Doc/api/) needs the same list for the same reason —
a member matching one of these is never *only* a static, so the Overrides line
still applies.
