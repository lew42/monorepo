# Alex's Page + Router — archived for reference

**These files do not run.** Nothing imports them, and `Page.js` / `ErrorPage.js`
import `../View/View.js`, which does not exist at this path. They were written to
live in the real `public/framework/core/`, where that import resolves; commit
`efb345a` ("move page and router concepts to dev directory") moved them here for
review and the relative imports broke in the move.

Restored from `b4c1c8e` on the `alex/router-page` branch. Alex deleted them in
`de38de6` ("migrate pages after fw update") and moved his pages onto the core
`Page`, so on that branch's tip they exist only as history. Kept here so the
ideas stay readable.

## What's interesting about it

A **completely different loading model** from ours — worth understanding before
changing our own.

| | ours | alex's |
|---|---|---|
| what a Page is | plain data, renders on demand | a `View` subclass that persists |
| imports per navigation | target + an ancestor climb | exactly one, for that path |
| the tree | `children` / `parent` / `chain` | none at all |
| revisiting a page | re-imported (cached) and **re-rendered** | cached instance, **re-activated** |
| who owns the lifecycle | App (`load_page`) | Router (`show`) |
| page state across visits | lost | preserved |

His `Router.pages` is a `Map(path → Page)`. First visit imports and renders;
every later visit calls `activate()` on the same instance, and `render()` is
guarded by `this.rendered` so it never runs twice. `deactivate()` removes the
element and detaches the page's stylesheets; `activate()` puts both back.

That's the trade in one line: **he keeps instances alive, we rebuild.** Keeping
them alive is why he needs `activate`/`deactivate` at all — and why his `Page`
has to be a `View`.

Two more pieces we don't have:

- **`Page.from(def)`** — normalizes any default export (Page, Page subclass,
  function, view, `{render}`) into a Page. Our equivalent logic is duck-typed
  and scattered across `App.load_page`; his is one function with the policy in
  one place.
- **Legacy fallback** — a module with no default export renders itself at import
  time and therefore can't re-render. He detects that (`Page.from` returns null),
  marks the path `LEGACY`, and falls back to a full browser navigation instead of
  a broken SPA swap. `adopt_legacy()` handles the case where the *initial* page
  was legacy, wrapping the already-rendered DOM in a Page so the next navigation
  can remove it.

## Scroll restoration

The part most worth stealing, and the part with the most edge cases:

```js
history.replaceState({ scroll: window.scrollY }, "");         // seed the entry

window.addEventListener("scroll", () => {                      // debounced write
    clearTimeout(this.scroll_timeout);
    this.scroll_timeout = setTimeout(() => {
        history.replaceState({ ...(history.state || {}), scroll: window.scrollY }, "");
    }, 100);
}, { passive: true });

on_popstate(e){ return this.show(location.pathname)
    .then(() => window.scrollTo(0, (e.state && e.state.scroll) || 0)); }

navigate(url){ history.pushState({ scroll: 0 }, "", url);      // forward = top
    return this.show(location.pathname).then(() => window.scrollTo(0, 0)); }
```

Scroll position is written into the **current** history entry as you scroll, so
Back can read it off `e.state`. Forward navigation always starts at the top.

Before adopting it, three things to check:

1. **`history.scrollRestoration` is left at `"auto"`.** The browser also tries to
   restore scroll on same-document popstate, so two mechanisms are competing.
   Anyone using this should set `history.scrollRestoration = "manual"` first.
2. **`scrollTo` runs as soon as `show()` resolves** — the DOM is appended, but
   images and fonts may not have loaded, so the document can still be shorter
   than the target offset and the scroll silently clamps.
3. **The debounce drops the last scroll** if you navigate within 100ms of
   scrolling. `navigate()` could flush it first.
