# App — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

Boot, and the one container pages mount into.

```
new App()  →  div.app
constructor → config() → render() → await load() → initialize() → inject() → ready.resolve()
```

That is the whole mental model, and it is worth defending as literally as it
reads: `App` is an element with a lifecycle attached, not a coordinator.

Each verdict below is the short form. The long reasoning lives in `./`, one
file per question, and the same files render as note pages under
`/framework/core/App/`. **Every member also has its own file** —
`./method/<name>.md` and `./property/<name>.md`, three concerns each
(usage, necessity, simplicity). The two sibling modules in this directory are
covered as notes: `./fonts.md` is `Font.js`, `./mode.md` is `mode.js`.

## Who uses this

Framework-wide grep, 2026-08-15. **Exactly one production caller**, plus two
teaching copies that import the same live file:

- **`/app.js`** (site root) — the only production boot:
  `import App, { View, div, a } from "./framework/core/App/App.js"` and
  `import mode from "./framework/core/App/mode.js"`, then `App.stylesheet(…)`
  and `new App({ config(), render(), … })`. Every page on the site runs through
  this one construction.
- **[`Sidebar`](/framework/core/Sidebar/)** (`Sidebar.js:4`) —
  `import mode from "../App/mode.js"`, used once in `footer()` to render the
  colour-scheme toggle.
- **[`/framework/start/`](/framework/start/)**'s worked example
  (`start/example/app.js`) — a second, real `import App from ".../App.js"; new
  App();`, fetched and shown as the minimal two-line boot.

Nothing else imports `App.js`, `Font.js`, `mode.js` or `mode.css` directly.
`core/new/0/`, `core/new/1/` and `core/new/starter/` each vendor their **own**
`App.js` — a different file, not this one — and every other mention found
(`core/page.js`, `core/Page/old/shell/page.js`, sandbox pages, other modules' docs)
quotes `new App()` inside a code example rather than importing it live. **Not
"no callers," but as close as a core class gets**: one real boot, exercised by
every page, and no second API surface anywhere to drift out of sync with.

## Decisions

**What did App stop doing?** Url resolution — all of it moved to `Router` and
`Page`. The line: the moment resolving a segment can `await` an import, it
stopped being boot logic. `config()` and `initialize()` are empty on purpose.
See ./doc/boot.md.

**Why is `instantiate()` an unawaited async call in the constructor?** So
`window.app = new App()` reads well; `app.ready` covers the wait. The cost — a
throw outside `load()`'s own try became a silent unhandled rejection *and* left
`ready` pending forever — is fixed: `instantiate()`'s body now runs inside its own
try/catch, `catch` calls `error()` (logs and renders the error page), and
`ready.resolve()` runs unconditionally after, so `await app.ready` always settles.
See ./doc/constructor.md.

**Where does the error page render?** Into `$pages`, never `$app` — emptying
`$app` deletes the chrome, and the one page that most needs navigation would be
the one page without it. See ./doc/error-page.md.

**Why two loader lists?** `loaded()` (both, once, at boot) vs `styles_loaded()`
(stylesheets only, `allSettled`, every navigation). The Router must never await
`loaders`: that list only grows, so one rejected loader would kill every later
navigation — measured, and silently. And `loaded()` is a method, not a getter:
it allocates a fresh `Promise.all` per call. See ./doc/loaders.md.

**How does a page get `.app`?** Adoption, on the walk — a Page is built in
userland at module scope, so there is no constructor to inject into. Never read
`window.app` inside `framework/`; it is `undefined` during boot. **The one gap is
a child rendered without being routed to** — a default tab — and `ext/tabs` closes
it by handing `app` down itself; anything else that renders a child directly owes
the same line. See ./doc/adoption.md.

**Why do fonts live in `Font.js`, and why isn't it in `util/`?** `Font` is a
class with a registry, and `util/`'s pitch is plain functions. The CDN urls are
the one unvendored dependency — stated, not settled. See ./doc/fonts.md.

**Why does `mode.js` live beside App rather than under `styles/layers/theme/`?**
Because a theme is CSS, and this is theme-**agnostic** behaviour: any theme that
ships both modes wants it, and core's `Sidebar` renders it in its footer. Under
`theme/` it was the one thing core imported from outside `core/`, across a directory
that had just proved it can move — and the import took the whole site down for
exactly as long as it took to notice. (`lew42.js` stays where it is; *that*
behaviour belongs to one theme.) It sets `color-scheme` inline on `.app` — the same
property the theme set, at the same element, so no token learns anything new — and
`auto` **clears** the override rather than storing a resolved value, because the OS
can change while the tab is open. See ./doc/mode.md.

**Why do `app.stylesheet()` and `App.path_to_page_url()` exist?** Compatibility,
not API — the rewrite dropped them and took four sandbox sections down. Rename
freely inside `framework/`, alias on the way out. See ./doc/aliases.md.

## Proposed

Not applied. Each is a change to a core class, so it wants a critique first.

**Should `initialize()` go?** Empty hook, called once (`App.js:27`), **overridden
by nobody** — five sandboxes and the whole framework. The standing test written
here was *"if a year passes with only `config()` ever overridden, `initialize()`
should go"*, and that year has passed.
*Options:* (a) keep; (b) delete; (c) keep but document it as the "after the first
page rendered, before it is in the document" moment.
*Weighing:* its moment is genuinely narrow — you can measure nothing and see
nothing. `app.ready` covers *after*, `config()` covers *before*, and both compose
better. A hook is API surface forever.
**Recommendation: (b).** One line out, and `app.ready` named as the replacement.

**Should `log_label()` go, or be wired up?** Zero callers anywhere.
`Page.log_label()` has three; this copy has none, and `Page.container()` logs the
string `"app.$pages"` as a hardcoded literal one line from where it would be used.
*Options:* (a) delete; (b) use it — `this.mounts_in(this.app.$pages,
this.app.log_label() + ".$pages")`.
*Weighing:* (b) turns a hardcoded string into the convention the method was written
for, and costs nothing. (a) is smaller.
**Recommendation: (b)**, and if that is refused, (a). Leaving a never-called method
in place is the only wrong answer — it is a claim nothing can check.

**Should `App.path_to_page_url()` move to `arya/lib/`?** It encodes a url
convention (`/a/b` → `/a/b.page.js`) this framework no longer has, and its one real
caller is `arya/lib/Router.js:86`.
*Options:* (a) keep as a frozen alias; (b) move it to `arya/lib/` and delete it
here; (c) delete it outright.
*Weighing:* (c) breaks `arya/` — the exact mistake ./doc/aliases.md exists to
record. (a) leaves a reachable, wrong answer to *"how does a url become a module?"*
on a core class. (b) puts the function in the package that actually owns it; a
dev's `lib/` is a downstream package that happens to share a repo.
**Recommendation: (b)**, coordinated with arya, not merged unilaterally.

**Should `ready` stop being a promise that carries its own resolver?**
`Object.assign(promise, { resolve })` makes one object that is both the value and
its control — a shape nothing else in the framework uses.
*Options:* (a) keep; (b) two properties, `ready` and a private resolver.
*Weighing:* (b) is one line longer and stops `app.ready.resolve()` being callable
by anyone who has the app. Nobody has called it.
**Recommendation: (a)**, recorded — the convenience is real and the risk is
theoretical. Revisit if anything outside `instantiate()` ever resolves it.

**Should `styles_loaded()` be renamed?** It reads like a boolean and it resolves
whether or not the sheets arrived (`allSettled`). `styles_settled()` is truer.
*Weighing:* one caller (`Router.js:58`), inside `framework/`. Cheap.
**Recommendation: rename**, low priority, bundled with any other Router work.

## Open

- **Nothing paints until the whole walk finishes.** The chrome could paint
  immediately and fill in. Kept because an empty tab bar is worse, but it is a
  real cost (1765ms on a measured 5-deep cold link) and is often described as if
  it were free.
- **`$body` exists mostly because the `render()` override template shows it.** One
  write, one read, never used by a site for anything. Not worth removing; worth not
  teaching.
