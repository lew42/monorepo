**Usage** — the method everything else routes through. `initialize()` calls
`this.append(this.render)` (`View.js:15`), every element factory ends in
`.append(...)` (`View.js:388-421`), and `empty()`, `append_to()`, `append_fn()`,
`append_promise()`, `append_pojo()` and `load()` all funnel back into it. Roughly
100 direct call sites across `public/`, plus one replacement: `ext/highlight`
swaps the whole method at import (`framework/ext/highlight/highlight.js:108`), so
what the source pane above shows **is** the patch.

It dispatches on the **type** of each argument. First match wins:

| you pass | what happens |
|---|---|
| a View (anything with `.el`) | `el.appendChild(arg.el)`, and `arg.parent = this` |
| an object with a `render()` | `append_fn(() => arg.render(this))` — captured |
| a plain object | `append_pojo` — each child view assigned to a named property |
| an array | flattened, each item dispatched again |
| a function | **capture** — makes this view the captor, runs it, pops |
| a promise | `append_promise` — awaited, then appended to *this* |
| anything else | straight to `el.append()` — strings, numbers, DOM nodes |

**Necessity** — the class. Nothing here is removable.

**Simplicity** — right-sized, and the dispatch is why
`p("2 + 2 = ", 2 + 2, ". A ", a("link"), " inline.")` needs no ceremony. An
`append(x, { mode })` option was weighed and rejected: the argument's type already
says what you meant. One wart worth knowing: the `render()` row is tested
**before** the plain-object row, so `{ render(){ … }, title: "x" }` is treated as
a renderable and its other keys are silently ignored.

## The trap

**`append_fn` restores the captor the instant your function returns** — and an
`async` function returns at its *first* `await`. Every factory call after that
appends to whatever the captor has since become. Nothing throws.

```js
// WRONG — the div is built after the await, so it lands in $app
async previews(){
    const children = await Promise.all(names.map(n => this.child(n)));
    return div.c("page-previews", () => children.forEach(c => c.preview()));
}

// RIGHT — container captured NOW, filled inside a callback that re-captures
previews(){
    return div.c("page-previews", async ($previews) => {
        const children = await Promise.all(names.map(n => this.child(n)));
        $previews.append(() => children.forEach(c => c.preview()));
    });
}
```

The mechanical check: **a factory call that appears after an `await` is wrong.**

The fix uses this method against itself — it passes a *function*, so `append_fn`
re-establishes the captor and the code inside reads like ordinary page code:

```js
$list.empty(() => names.forEach(name => p(name)));   // captor is $list again
```

Returning a **promise** is the other blessed shape, which is why
`content(){ return md.file(import.meta, "readme.md") }` needs no support from `Page`.

