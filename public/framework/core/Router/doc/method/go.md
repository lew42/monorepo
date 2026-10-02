**Load first, push second.** A failed navigation leaves no history entry, which is
what makes Back reliable after a 404.

## Usage

- `Router.js:23` — `click()`.
- Site code, as `app.router.go(url)` — the one programmatic entry point. `Page.go()`
  was a one-line wrapper over it, with no callers, and is deleted.

`popstate` deliberately does **not** come through here: the browser has already
moved history, so it calls `load()` directly (`Router.js:12`).

## Necessity

Essential. It is the only place `history.pushState` is called, and the only place
that decides a url is not ours after all.

There is no synchronous *"is this a real page"* gate and there cannot be one — see
[registry gate](/framework/core/Router/doc/registry-gate/). `location.assign(url)` is the honest fallback:
a full page load, which is what would have happened without the framework.

## Simplicity

Right-sized. One decision, spelled as an `if`:

```js
if (await this.load(new URL(url, location.origin).pathname)){
    history.pushState({}, "", url);
    this.app.navigated?.(this.active, this._nav_from);
} else location.assign(url);
```

The `new URL(...).pathname` is the seam worth knowing: **the walk resolves the
path, history keeps the whole url**, so `?q=` and `#section` survive a navigation
that never looked at them.

`navigated()` fires HERE now, not inside `activate()` (nav-before-push,
one-dictation, 2026-10-01) — after `pushState`, not before. `activate()` (inside
`load()`, above) runs and finishes before this line, so a site's own `navigated()`
hook that reads `location.pathname` (or `drawer.page()`, which falls back to it —
`ext/drawer/rail.js`'s ✦ sheet) used to see the page this call is LEAVING, every
time, because `pushState` hadn't run yet. Proven: a session message sent right
after navigating used to log the OLD page's path; now it logs the new one.
`popped()` calls `navigated()` right after its own `load()` instead, because a
Back/Forward move already updated `location` before `popped()` ever runs — there
is no url to push there, so no ordering bug to fix.
