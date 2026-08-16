**Usage** — 10 live call sites, and the standard shape for *replace this region's
contents*: `framework/core/App/App.js:86`, `framework/core/App/mode.js:24`,
`framework/ext/demo/demo.js:91`, `framework/ext/files/files.js:40`,
`framework/ui/page.js:28`, `framework/ui/parts.js:40,41`,
`framework/styles/sections/tone.js:20`, `framework/faq/page.js:64`,
`michael/previews/page.js:54`.

```js
$list.empty(() => names.forEach(name => p(name)));
```

**Necessity** — yes, and more than it looks. It is the blessed cure for the
capturing trap: passing a function routes through `append`, which makes `$list`
the captor while the function runs, so the code inside is written exactly as you
would write it at module scope.

**Simplicity** — right-sized. Four lines, and it inherits the whole of `append`'s
dispatch by calling it. `innerHTML = ""` is the fastest clear and drops listeners
with the nodes — deliberate, since `View` keeps no listener registry to clean up.

⚠ **It also bumps `this.epoch`**, which is how `append_promise` knows its
resolution belongs to content that is gone. Without it, switching a lazily-imported
region twice inside one cold-cache import window rendered *both* — the abandoned
one landing last, on top. See `append_promise` in `doc/method/append.md`.

