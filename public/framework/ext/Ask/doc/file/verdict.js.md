Approve / Improve for the whole page — the same verdict `/layouts/browse/`
gives its 102 catalogued items, on ANY page. Two exports that matter:
`verdict_mark(url)` (the check/pen — build it immediately, visible without
opening anything) and `verdict_acts({ url, m, about })` (the two buttons —
build it lazily, once a panel opens). `mount()` (`chat.js`) wires both in
automatically when it is given a `url`.

It imports `/layouts/browse/verdicts.js` — the SAME store `/layouts/browse/`
itself writes to, so an approval is one library, not two. Full argument for
that, and the alternative it beats: [`doc/decisions.md`](../decisions/).

## `url` must be `this.url`, never `location.pathname`

`Router.js` loads a page first and pushes its url to `history` — and to
`router.active` — only afterwards. Reading either one while a page's own
`content()` / `render()` / `column()` is still running silently names the
PREVIOUS page. `Page.url` is set once, when the page is declared, so it has
no such window; every caller of `mount()`/`verdict_mark()`/`verdict_acts()`
passes `this.url`.

## The first draw skips the `isConnected` guard on purpose

`live()` (this file's own small version of `browse/page.js`'s helper) draws
UNCONDITIONALLY the first time — no `$box.el.isConnected` check. A page's own
`content()` builds this box before core inserts that page's view into the
document, so a fast-resolving `verdicts.load()` can beat the mount; a guard
on that first call quietly skipped the draw every time, even when a real,
existing verdict should have shown at once. The guard is where it belongs
instead: inside the shared `verdicts.watch()` callback, which only fires
again later — by which point the owner may have navigated elsewhere, and
THAT redraw is the one that needs to check the box is still on screen. Caught
by a headless proof run, not by reading the code.

## Improve's note usually just IS the verdict's own note

`verdict_acts()` takes an optional task manifest, `m`. Without one — true for
every page this module is mounted on today, since a layout demo owns no task
log — an Improve press writes a plain `note` field, read back everywhere a
verdict already is. With one, `Verdict.thread()` mounts `reply.js`'s
`reply()` right under the saved note, so the same words also reach Claude the
way a reply to an ask card does.
