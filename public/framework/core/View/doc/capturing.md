# Capturing, and the bug it has shipped most

`View.captor` is one global with a push/pop stack. An element factory appends its
result to the captor; passing a function to `append()` makes the new view the
captor while that function runs.

**`append_fn` restores the captor the instant your function returns — and an
`async` function returns at its first `await`, not its last line.** Every factory
call after that point lands wherever the captor has since drifted, usually `$app`.
Nothing throws.

```js
// WRONG — the div is built after the await
async previews(){
    const children = await Promise.all(names.map(n => this.child(n)));
    return div.c("page-previews", () => children.forEach(c => c.preview()));
}

// RIGHT — container captured NOW, filled later, target named explicitly
previews(){
    return div.c("page-previews", async ($previews) => {
        const children = await Promise.all(names.map(n => this.child(n)));
        children.forEach(c => $previews.append(c.preview()));
    });
}
```

**The mechanical check: a factory call textually after an `await` is wrong.** No
judgement required — scan for it.

**Verdict: do not try to make async capture work.** A per-async-context captor
would need `AsyncLocalStorage`, which the browser doesn't have. Sync-render-then-
async-append covers every case and is WYSIWYG at the call site. Returning a
**promise** is the other blessed shape, since `append_promise` awaits it and
appends to a view that was placed synchronously — that is why
`content(){ return md.file(import.meta, "readme.md") }` needs no support from
`Page`.
