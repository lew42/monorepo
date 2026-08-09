# View — design record

A chainable wrapper over one DOM element. `new View()` → `div`, and every HTML tag
is a function that makes one. The only idea in the file is **capturing** —
everything else is a method.

Every member has a page of its own under `page.js`'s rail, carrying who calls it,
whether it is necessary, and whether it is over-built. The two cross-cutting notes
are `./doc/capturing.md` (the model, and the bug it has shipped most) and
`./doc/lifecycle.md` (assign → prerender → initialize → render, and the three
class-field traps in it).

## Decisions

**Can capture survive an `await`?** No, and don't try — `append_fn` restores the
captor the instant your function returns, which for an async function is its first
`await`. Capture synchronously, fill in a callback, or return a promise.
`./doc/capturing.md`.

**How does `append()` know what you meant?** By type — a View, a renderable, a
pojo, an array, a function, a promise, anything else. An `append(x, { mode })`
option was rejected: the type already says it. `./doc/method/append.md`.

**Why a `const` destructure of factories, not a Proxy?** A named export is
greppable and fails loudly on a typo; through a Proxy, `dvi("x")` is a silent
`<dvi>` element. `./doc/method/elements.md`.

**Why doesn't `classes = "docs"` work on a subclass?** `classify()` runs inside
`super()`, before class fields initialize — name the subclass instead.
`./doc/method/classify.md`.

**Why must a stylesheet's promise always settle, and why does importing View load
framework.css?** A 404'd `<link>` fires `error`, not `load`, and an unsettled
promise was a permanently blank page; and the import is the loading edge, so
View's own `<link>` is always first and fixes the layer order for the document.
`./doc/method/stylesheet.md`.

**Why does `style()` special-case `--x`?** `el.style["--x"] = v` silently does
nothing — custom properties only respond to `setProperty`. `./doc/method/style.md`.

**Why is `this` the view inside `on()` handlers?** Bound on purpose — use
`function`, not an arrow. There is no listener registry, deliberately: a registry
is memory that must be invalidated. `./doc/method/on.md`.

**Why do `html`/`text`/`attr` switch on whether a value was passed, never on
whether it differs from what's there?** They used to test both, so setting a value
equal to the current one fell into the getter branch and returned a STRING
mid-chain — `field().text("").attr(…)` on an empty `<textarea>` threw "attr is not
a function". The skip-the-write optimization wanted the comparison; the return
never did.

**Why does `prepend()` take less than `append()`?** Because the two branches that
claimed more called `prepend_pojo` and `prepend_fn`, and neither was ever written —
so `prepend(fn)` threw `TypeError` for as long as the method has existed, and
nothing noticed. **Prepending a *capture* has no sensible meaning anyway**: the
captor fills in document order, so "build these, at the front" is `append()` into a
container you placed first.

**What was deleted for having no callers.** `View.register`/`lookup`/`registry`,
the module-level `append()` and `load()` exports, `buffer()`/`flush()`, `insert()`
and `index()` — about 65 lines, none of it reachable from anywhere in `public/`.
The rule that found them: **grep the sandboxes too, they are downstream consumers**
— and the rule that kept the rest is the same one.

## Traps

- **Never build DOM after an `await`.** The mechanical check: a factory call
  textually after an `await` is wrong.
- **`prerender()` reads `capture`, `classes` and `classify` inside `super()`** —
  class fields have not initialized. Constructor argument or prototype, never a
  field.
- **`off()` can never remove a listener `on()` added** — `on()` registers a wrapper
  arrow, and the DOM removes by reference. Silent no-op, always.
- **`repeat()` throws away every clone it makes.** It relies on an ambient captor
  that does not catch them.

## Proposed

Findings from the every-member audit. **None of these are applied** — they are for
Mike and other agents to shoot at.

### 1. Delete the members with no callers

`compute()`, `off()`, `replace()`, `repeat()`, `prepend()`, `prepend_to()`,
`meta_path()` — zero call sites in `public/`, sandboxes included. `clone()` has one
caller, `repeat()`, and goes with it.

| | keep | delete |
|---|---|---|
| someone might want it | true of any method ever written | — |
| three sandbox pages document `load`/`lazy`/`repeat` as API | deleting makes them lie | alias on the way out, then delete |
| `off()` **cannot work** — `on()` registers a wrapper | — | keeping a no-op is worse than having nothing |
| `repeat()` **discards its output** | — | same |

**Recommendation: delete `compute`, `replace`, `prepend`, `prepend_to`,
`meta_path` now** (nothing documents them as API except the two sandbox lines
already stale). **Delete `off`, `repeat`, `clone` in the same edit that fixes the
three sandbox View pages** — they are the ones that would start lying. `load()` and
`lazy()` are the only judgement call: the *idea* (import a module, append its
default, without being async) is good and nothing has needed it in a year.

### 2. `View.body()`'s `init()` has never run

The constructor calls `initialize()`. The `init(){ View.set_captor(this); … }` key
in `View.body()` is dead, and both callers set the captor explicitly on the next
line — which is why nothing noticed.

Options: **(a)** delete the key; **(b)** rename it to `initialize`. (b) is wrong:
it would make `<body>` the captor and then have it replaced one line later, pushing
a stale entry onto `previous_captors` for the life of the document.
**Recommendation: (a), delete.**

### 3. Fold the long class-name twins into the short ones

`has_class()` is called only by `hc()` and `toggle_class()`; `toggle_class()` is
called only by `tc()`. Two members whose entire job is to be called by a
two-letter member.

**Recommendation: inline both, keep `ac` / `rc` / `tc` / `hc`.** They are not
aliases — `tc` splits on spaces and `toggle_class` does not — so the fold must
keep the splitting in `tc`. Blocked on the same three sandbox pages as §1.

### 4. `ctrl()` belongs in `ext/demo`

18 lines — longer than `append()` — one caller (a sandbox page), and it emits
`.class-ctrls`, which **no stylesheet on this site styles**. It is a demo widget
living in the file every reader opens first.

**Recommendation: move to `ext/demo`, with its CSS.** Core keeps nothing that
builds a multi-element UI.

### 5. `html()` silently degrades to text

Without `Element.setHTML`, `html(v)` warns and writes `v` as **text** — the same
call renders markup on one browser and prints angle brackets on another. It also
has no caller in `framework/`; everything that sets markup uses `html_unsafe`.

Options: throw; fall through to `html_unsafe` and say so in the name; or delete
`html()` and `supports_sanitizer` together and let `text()` / `html_unsafe()` be
the pair. **Recommendation: delete both.** Two honest methods beat three, one of
which is conditionally a third thing.

### 6. `append_pojo` / `append_prop` — the branch nothing uses

No file in `public/` passes a POJO to `append()`. `append_prop`'s collision guard
is `if (!this[prop])`, truthiness **against the prototype chain** — so
`append({ text: … })` sees `View.prototype.text`, warns, and drops the assignment,
while `append({ note: … })` succeeds. The rule that killed `Page.alias()` applies
verbatim: *a convenience that needs a deny-list is not a convenience.*

**Recommendation: delete the branch and both methods.** This is the one `append()`
row with no consumer.

### 7. `View.lazy` and `View.prototype.lazy` are one word for two things

A static promise chain and an instance method. If `lazy()` survives §1, the chain
needs a different name — `View.lazy_queue`. **Recommendation: moot if §1 deletes
`lazy()`; otherwise rename the static.**

### 8. `View.parent` is written and never read

`append()` and `prepend()` set it; nothing in `framework/` reads it back. Every
`.parent` read in the framework is `Page.parent`, a different property on a
different class — and a Page's view is a View, so `page.view.parent` and
`page.parent` sit one dot apart and answer different questions.

**Recommendation: delete it.** `view.el.parentNode` is the honest answer and does
not go stale when `remove()` runs.

### 9. `hide` / `show` / `toggle` write inline styles

Inline `display` is the top rung of the escalation ratchet: nothing downstream can
override it. And `toggle()` reads the **computed** style, so a view already hidden
by CSS toggles to hidden on the first call.

**Recommendation: a `.hidden` utility class**, toggled with `tc("hidden")`. That
deletes three methods, keeps the behaviour, and makes the state visible as a class
in the inspector. One caller (`Sidebar`) to change.

## Open

- **`html_unsafe` is patched by `ext/highlight`.** Two exts patching one method
  would silently compose in import order. Fine at one; there is no registry and no
  plan for two. The same is true of `append` and `prerender`.
- **No `View` readme existed until mid-2026**, while `new/1/readme.md` held 26KB of
  record for exactly this design. See `framework/readme.md` on why that happened.
