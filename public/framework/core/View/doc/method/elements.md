**Usage** — called exactly once, on the last line of the class file
(`View.js:460`), and its result is destructured into ~60 named exports. Every
`div()`, `p()`, `h2()`, `a()` in `public/` is one of them. `castin/framework/page.js:70`
calls it a second time, to list the tags.

**Necessity** — yes. This is the framework's surface: a tag is a function, and
`.c()` on that function takes classes first.

```js
div.c("flex gap", () => { button.c("prim", "Save"); button("Cancel"); });
```

**Simplicity** — right-sized, and the boring long tag list is the point.

> **Why a `const` destructure and not a Proxy?** A Proxy would give every tag for
> free, including future ones. It was rejected because a named export is
> greppable and fails **loudly** on a typo: `dvi("x")` is a `ReferenceError` at
> import, where through a Proxy it is a silent `<dvi>` element.

Two factories are not built by a loop and each earns its exception: `el` takes the
tag name as an argument, and `style` appends itself to `document.head`. The prose
tags — `p` and `h1`–`h6` — have their own loop, routing through `backtick_append`
so inline code works. Everything else is `new View({ tag })`.

`const View = this` at the top is what makes a subclass's `elements()` build views
of the subclass.

## The two module exports that are not members

`View.js` also exports `icon(name)` — `el.c("span", "material-icons icon", name)`,
17 call sites — and re-exports `is`. Neither is a class member, so neither can have
a rail entry of its own. `icon()` is documented where its real constraints live
(`framework/styles/elements/media/page.js:67`: Material Icons is a ligature font, so
an unloaded font shows the *word*, and an inherited `text-transform` breaks the
match). `is` is documented at `framework/util/`.

