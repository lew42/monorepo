The one method everything else routes through. It dispatches on the **type** of
each argument rather than asking you to say which kind you're passing:

| you pass | what happens |
|---|---|
| a View | `el.append(arg.el)` |
| a function | **capture** — `append_fn` makes this view the captor, runs it, pops |
| a plain object | `append_pojo` — each child view is assigned to a named property |
| an array | flattened, each item dispatched again |
| a promise | `append_promise` — awaited, then appended to *this* |
| anything else | straight to `el.append()` — strings, numbers, DOM nodes |

That table is the whole reason `p("2 + 2 = ", 2 + 2, ". A ", a("link"), " inline.")`
works with no ceremony.

## The trap

**`append_fn` restores the captor the instant your function returns** — and an
`async` function returns at its *first `await`*, not its last line. Every factory
call after that point appends to whatever the captor has since become.

```js
// WRONG — the div is built after the await, so it lands in $app
async previews(){
    const children = await Promise.all(names.map(n => this.child(n)));
    return div.c("page-previews", () => children.forEach(c => c.preview()));
}

// RIGHT — container captured NOW, filled inside a callback
previews(){
    return div.c("page-previews", async ($previews) => {
        const children = await Promise.all(names.map(n => this.child(n)));
        $previews.append(() => children.forEach(c => c.preview()));
    });
}
```

Nothing throws. The elements simply appear somewhere else in the document.

The mechanical check: **a factory call that appears after an `await` is wrong.**
No judgment needed — scan for it.

## The fix uses this method against itself

Look at what the corrected version does: it passes a **function** to `append`. Row
two of the table above is the whole answer — `append_fn` sets the captor, runs your
function, and restores it. So a callback **re-establishes the captor**, and the code
inside is written exactly the way you'd write it anywhere else:

```js
$list.empty(() => names.forEach(name => p(name)));   // captor is $list again
```

`empty(fn)` is the same door (it calls `append` after clearing), which makes it the
natural shape for "replace a placeholder with the real thing".

That is better than prefixing every call with `$list.append(...)`: one wrapper
instead of N prefixes, and nothing to forget halfway down a loop.

Returning a **promise** is the other blessed shape, since `append_promise` awaits
it and appends to a view that was placed synchronously. That is why
`content(){ return md.file(import.meta, "readme.md") }` needs no support from
`Page`.
