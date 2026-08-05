# View — design record

A chainable wrapper over one DOM element. `new View()` → `div`, and every HTML tag
is a function that makes one.

The only idea in the file is **capturing**. Everything else is a method.

---

## 1. Capturing, and the bug it has shipped most

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

---

## 2. `append()` dispatches on type, and that is the whole API

| you pass | what happens |
|---|---|
| a View | `el.append(arg.el)` |
| a function | capture |
| a plain object | `append_pojo` — child views assigned to named properties |
| an array | flattened, dispatched again |
| a promise | awaited, then appended to `this` |
| anything else | `el.append()` — strings, numbers, DOM nodes |

**Options were considered and rejected.** `append(x, { mode: "prepend" })` and
similar all lose to the fact that the *type* already says what you meant.
`p("2 + 2 = ", 2 + 2, ". A ", a("link"), " inline.")` works with no ceremony
precisely because nobody had to say which argument was which.

---

## 3. Why factories are a `const` destructure and not a Proxy

```js
export const { el, div, p, h1, … } = View.elements();
```

A `Proxy` would give every tag for free, including future ones. It was rejected:
a named export is greppable, tree-shakeable by a reader (not a bundler — there
isn't one), and it fails **loudly** on a typo. `dvi("x")` is a `ReferenceError` at
import; through a Proxy it is a silent `<dvi>` element.

The list is long and boring, and boring is the point.

---

## 4. `classify()` runs inside `super()`, before class fields exist

```js
class DocsPager extends ColumnPager {}    // → .docs-pager.column-pager.pager
class Foo extends View { classes = "docs"; }   // ✗ arrives too late
```

`prerender()` is called from the constructor, so a subclass's class *fields* have
not initialised yet. Name the subclass instead — the class-name chain is
kebab-cased into CSS classes, which is why a `View` subclass needs no CSS
declaration to be styleable.

---

## 5. `stylesheet()` — the import is the loading edge

Static, called at module scope. Because of that, **a module that styles classes it
doesn't emit must import the module that does**, or its rules apply to nothing:

```js
/* css: .page, .page-title, .page-previews, .page-preview */
import "../Page/Page.class.js";
```

Comment it or someone deletes it as unused. It does not detect renames — nothing
without a build step will — it makes the dependency greppable, which is the win.

**It resolves the promise on `error` as well as `load`.** A 404'd stylesheet used
to leave a promise that never settled, so `inject()` never ran and you got a blank
page with a clean console. Now the page renders unstyled and the console names the
file.

**Resolve module-relative urls against `import.meta`, never the document.** The SPA
fallback makes the document url the *route*, not the file's location — so a
document-relative path is wrong on *every* load, not just deep ones. That's what
makes it easy to miss: the one page you tested was the one at the right depth.

---

## 6. `style()` and the custom-property branch

`el.style["--x"] = v` **silently does nothing.** Custom properties are not
reflected as camelCase keys on `CSSStyleDeclaration`, so the assignment lands on a
plain JS property no browser reads. Only `setProperty` works, which is why
`startsWith("--")` is checked in both the get and set paths.

This is what lets a page retune a component token with no stylesheet:

```js
sidebar().style({ "--sidebar-bg": "#1f1f1f", "--sidebar-ink": "#e6e6e6" });
```

---

## 7. `on()` binds `this` to the **view**, not the element

```js
p("Click me").on("click", function(){ this.text("Clicked."); });
```

The whole chainable API inside a handler with no lookup and no closure over a
variable you had to name first. **Use `function`, not an arrow**, when you want
that — this is the one place in the framework where the distinction carries
meaning.

**`View` keeps no listener registry**, deliberately: a registry is memory that
must be invalidated, and nothing has needed it. The costs are real and worth
knowing — `off()` needs the same function reference (the DOM's rule, so an inline
arrow is unremovable), and a listener on a view that gets discarded during
`ext/highlight`'s block-unwrapping is lost with nothing in the console.

---

## 8. Open

- **`html_unsafe` is patched by `ext/highlight`.** Two exts patching one method
  would silently compose in import order. Fine at one; there is no registry and no
  plan for two.
- **No `View` readme existed until now**, while `new/1/readme.md` held 26KB of
  record for exactly this design. See `framework/readme.md` on why that happened.
