# Framework — design record

The cross-cutting one: calls that touch more than one class. Per-class records live
next to their code (`core/*/readme.md`, `ext/*/readme.md`,
`styles/layers/theme/*/readme.md`); Pager-era records are in `michael/pager/legacy/`.

Format: **question → options → weighing → verdict.** A verdict of *keep* is as
valuable as a change — it stops the same idea being re-litigated.

Long form: `./doc/injection.md` (why nothing under `framework/` reads `window.app`),
`./doc/theme-behaviour.md` (can a theme carry behaviour?), `./doc/docs-system.md`
(what a doc page is made of), `./doc/reachability.md` (the crawl + audit method, and
the ~40 orphaned sandbox pages).

## Decisions

**Should `p()` parse inline markdown, now that `md()` ships in `/app.js`?** No. The
factories are created once by `View.elements()` and exported as `const` bindings — an
ext can patch `View.prototype`, but it cannot reassign another module's `const p`, and
a second `p` export from `md.js` would be an ambiguity error through `app.js`'s
`export *`. Changing it would also silently re-render every page in the repo. **Docs
use `md()`.** Recorded so it isn't rediscovered a third time.

**How do you build a view for later, inside a capture?** `new View({ capture: false })`
— what `md.file` does. The generalisation is a five-line `detached(fn)` helper (it
works because `prerender` already guards on `View.captor` being truthy), and
`capture: false` becomes its single-view case. **Verdict: add it when something needs
it.** `md.file` is still the only detached construction in the codebase.

**How does a class get the App?** Injected — `new Router(this.router, { app: this })`,
read `this.app`. Both `window.app` and an `App.current` static encode *"there is
exactly one App per document"*, which is a real constraint to accept in the substrate
in exchange for saving one constructor argument. `window.app` stays as a **console
convenience only**; nothing under `framework/` may read it. `./doc/injection.md`.

**Can a theme carry behaviour?** **The theme is CSS. Behaviour is a plain exported
function the SITE calls** — never a class, and never triggered by the class appearing.
The decisive argument is small and hard to argue with: **a theme is designed to appear
more than once on a page**, and behaviour does not survive duplication. If a function
isn't enough, the escalation is `ext/` or `app.navigated?.()` — not a `Theme` registry
with lifecycle hooks. `./doc/theme-behaviour.md`.

**What is a doc page made of?** Four pieces, each replacing something worse:
`ext/files` (a tree of real files) for a wall of `code.html()` literals; `ext/toc` for
scrolling to find a section; `demo()`'s third pane (the real DOM, read back) for "and
this renders…"; `classdoc.page()`'s vertical rail for a grid of cards you had to leave
the page to use. **The organising principle: a doc page should answer *"where do I
click to see X"* in one glance** — the site sidebar is *which module*, the rail is
*which member*, the toc is *which section*. `./doc/docs-system.md`.

## Traps that cross files

- **`instanceof` across `core/` and `core/new/`.** Both directories ship — `public/`
  *is* the deploy artifact — so a typo'd `../new/0/Page.class.js` resolves
  successfully, to a real file, and yields a *different class with the same name*.
  Nothing throws. `Page.add()` does the one internal `instanceof` to watch.
- **A POJO default export whose key collides with a `Page` method shadows it.**
  `{ render(){ … } }` in capture style returns nothing, and `activate()` then reads
  `.el` of `undefined`. `content()` is the seam that shape wants.
- **`instantiate()` is an unawaited async call in the constructor.** That is what makes
  `window.app = new App()` read well, and `app.ready` covers the wait — but a throw
  outside `load()`'s own try becomes a silent unhandled rejection. One
  `.catch(e => this.error(e))` fixes it. Not done.
- **Three aliases for one function** — `View.stylesheet`, `App.stylesheet`,
  `app.stylesheet`. They look like noise; **don't delete them.** `arya/lib/Page.js`
  calls the instance one at module scope. The App rewrite dropped four public APIs and
  took four sandbox sections down, which is where the rule comes from: **rename freely
  inside `framework/`, alias on the way out.** A dev's `lib/` is a downstream package
  that happens to share a repo.

## Lessons about this process

- **Trace less, execute more.** Two council seats reached *opposite* conclusions about
  four lines of string-slicing in `util/source`. Running it took thirty seconds and
  settled it — the one who had "traced it carefully" was wrong. Any claim about what
  code *does* is cheaper to test than to argue.
- **The best answer was nobody's.** `classdoc` needed one seat's
  `dedent(String(fn))`, another's `getOwnPropertyDescriptor`, and a third's one-call
  shape. Each found one; none found all three. That is the argument for a council —
  not that any member is smarter, but that they *look in different places*.
- **A note in a design record is not a constraint.** This file spent months asserting
  `mark_links` belonged on `App`, with "recorded so it doesn't drift to the Router
  later" written next to it. It is on `Router` now, defensibly. Only a test or a
  structural impossibility keeps a decision.
- **A stale TODO is worse than a stale fact**, because it actively recruits someone to
  redo finished work. Four sections of this file once described finished work as open
  questions.
- **A record must not be wrong in the alarming direction.** §"orphaned pages" once
  claimed all four sandboxes declared no children, from a `grep` truncated by a `head`.
  Re-measure per directory before writing a number.
