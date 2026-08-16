The whole module, as one `Page.prototype` patch. `this.tabs("guide api")` builds the
`.tabs` view **synchronously** — the captor is still the caller's when it returns —
then fills the bar and the default panel once `this.loading` (or a stand-in app's
equivalent) resolves.

**Guarantees:**

- **The first tab owns the parent's url.** A second `tabs()` call on the same page
  cannot also be default — only the first set's link equals `this.url`.
- **Every set renders its first child**, so no panel is ever blank; which one shows
  is read entirely off the url, and clicking produces byte-identical output to
  reloading.
- **A label is never wrong for the entry point you arrived at.** Declared children
  are awaited (`this.loading`) before the bar paints, so `label` is real on every
  nav rather than guessed from whichever tab happened to render first.

**⚠ Traps, none of which throw:**

- Two `tabs()` calls **sharing a child name** collide in `this.regions`; the second
  call's panel silently wins.
- A **default** child is rendered without ever being routed to, so `Page.child()`
  never runs on it — a *nested* set built on a default child gets no `app` handed
  down, and its own `mark_links()` call becomes a permanent no-op.
- Anything else that builds links **after** `mark()` has already run needs its own
  `mark_links()` call, the same way this method makes one at the end of its fill.
- The scrollbar that keeps the selected tab reachable (`reveal()`, not exported) only
  runs after `this.app?.ready` — a rail revealed before the page is actually visible
  measures a zero-width box and scrolls nowhere.
- A throwing child `content()` during the fill still leaves that set's bar unfilled —
  `.catch()` reports it (`console.error`, tagged with `this.log_label()`) rather than
  recovering it. Without that `.catch()` the rejection either replaces the whole app
  with an error page (a cold load — `App.loaded()` awaits `loaders` once, at boot) or
  vanishes as a genuinely unhandled rejection (any later navigation — `loaders` is
  never awaited again, `App/doc/loaders.md`).

Full trap list, and the bug report each one traces to: the design record linked
at the bottom of the [Overview](/framework/ext/tabs/).
