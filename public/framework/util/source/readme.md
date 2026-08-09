# source — design record

`source(fn)`, `member(Class, name)`, `patched(fn, name)`, `dedent(src)`. The
verdicts; the traps live as comments beside the code they bite, because each one
is a *why* for the line under it rather than a decision anyone re-litigates.

---

## 1. Why `util/`, and not inside `ext/demo`

`demo(fn)` was the first caller and would have been a fine home. The test that
moved it is the same one `markup` passes (`util/markup/readme.md` §2): **two
callers that must agree.** `demo(fn)` prints a function's body above its result;
`code.fn(fn)` prints the same body on its own. If those two disagreed about where
a body starts or how far to dedent, **the same function would print two ways on
one page** — which is exactly the drift the "show real source" idea exists to
prevent.

**Verdict: one copy, in `util/`, imported by both.** A helper with one caller
belongs in that caller. `source` is the precedent `markup` was later measured
against.

---

## 2. Why examples are functions and not strings

The reason every `demo()` on this site takes a callback:

```js
demo(() => { div.c("card", () => p("hi")); }, "the caption");
```

A string is dead text in the editor. A function body gets highlighting,
completion, formatting and syntax errors from the IDE for free — and then
`fn.toString()` hands the page **the exact text the IDE checked**. There is no
build step to desynchronise the two, which is the whole reason this works here
and does not work in a bundled framework.

**The cost, accepted:** the example must be valid JS in the surrounding scope. An
example that *shouldn't* run, or that needs an import the page doesn't have, is a
`code.js()` string instead — see `ext/tabs/page.js`, whose demo box says so out
loud rather than faking a render.

---

## 3. `source(fn)` strips the signature; `member()` must not

Two callers wanted "this function as text" and wanted **different** text.

| caller | subject | wants |
|---|---|---|
| `demo(fn)` / `code.fn(fn)` | an anonymous example | the body — `() => {` is noise |
| `classdoc` | `View.append` | the body **and** `append(...args)` |

`source()` slices from the first `{`, which is right for the first row and throws
away the one line a reader navigating *"View → append"* needs to confirm they are
in the right place.

**Verdict: two entry points, not an option.** `source(fn)` for an example;
`dedent(String(fn))` for a member. An `{ signature: true }` flag would have been
one function with a flag inside a year, and the two subjects are genuinely
different — which is the same call `Router`'s record makes about `navigated` vs
`entered`.

---

## 4. `member()` reads a descriptor because reading a property *runs* it

`Class.prototype[name]` **executes a getter.** `App.loaded` was a getter that
built a `Promise.all`; read off a bare prototype, where the instance state it
expects does not exist, it threw *"undefined is not iterable"* before `toString()`
was ever reached.

**Verdict: `getOwnPropertyDescriptor`, always.** It is the only way to hold an
accessor's *function* rather than its result. Prototype is searched before the
constructor, because that is what a reader means by "a method".

This is also the concrete argument behind the no-magic-getters rule in
`CLAUDE.md`: a getter that allocates is invisible at the call site, and the first
thing to discover it was a documentation tool.

---

## 5. `patched()` is one line of trivia, kept deliberately

JS infers a function's name from assignment to an **identifier**, never to a
member expression. So `append(...args){}` carries `fn.name === "append"` and
`View.prototype.append = function(…){}` carries `""`.

**Verdict: surface it, don't hide it.** `ext/highlight` really does replace
`View.append`, and on this site the running `View.append` *is* the patch — a doc
page that quietly showed the original would be lying about what runs. `classdoc`
prints a banner instead.

**The sharp edge:** it cannot distinguish *"an ext replaced a core method"* from
*"an ext added a method core never had"*. `Page.prototype.tabs` is the second kind
and is assigned anonymously, so `patched()` would call it a replacement. Nothing
asks it today (`ext/tabs` has no classdoc page); if one is ever added, name the
function — `= function tabs(names){` — rather than teach `patched()` a second
concept.

---

## 6. Open

- **`dedent()` normalises CRLF and that is load-bearing.** `fn.toString()` returns
  whatever line endings the file was checked out with, while the same text through
  `innerHTML` comes back `\n` — the DOM normalises, the string does not. Rendered
  output was fine either way; two callers *comparing* results were not.
- **The first line is only evidence if it begins a line.** `String(fn)` for a
  shorthand method starts at the name, so its indent was left behind in the file
  and it measures zero — and zero pinned the common indent at zero, putting the
  signature at the root with the body still three tabs deep. A first line with no
  leading whitespace knows nothing about the indent, so it is not asked.
- **`arrow_at()` tracks depth and quotes rather than using `indexOf("=>")`.** The
  naive version sliced any ordinary function containing an arrow at the *inner*
  arrow: `function(){ const f = () => 1; return f; }` printed `1; return f; }`.
  Silent, because a fragment of valid code renders as perfectly good code that
  simply is not what you wrote. It reached `demo()` and `code.fn()` alike. Two
  personas once reached opposite conclusions about these four lines by reading
  them; running it settled it in thirty seconds (`framework/readme.md` §6).
