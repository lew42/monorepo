# Hotkeys — decisions

Built 2026-10-03, task log:
[`ai/2026-10-03/push-to-talk/hotkeys-module/`](/framework/ai/2026-10-03/push-to-talk/hotkeys-module/).
Parent task: [`ai/2026-10-03/push-to-talk/`](/framework/ai/2026-10-03/push-to-talk/).

## Why no nested scopes — the owner's own words

> Really a hotkey manager: one place to manage every hotkey in the app, filterable, rebindable.
> (Nested per-panel scopes, like Blender, can confuse; keep a few go-to hotkeys.)

So `Hotkeys.actions` is one flat `Map`, site-wide, never a tree of scopes a panel opens and
closes. A module registers a name like `"dictate.push"` — a plain string, not a path into some
scope object — and that's the whole addressing scheme. If two unrelated modules ever need the
*same physical key* for *different* things on different pages, that is a real collision this
version does not resolve (last registration standing wins whichever `fire()` loop order gives
it) — not built, because nothing today needs it, and it's cheap to add a `when()` guard per
subscriber later if it ever does.

## Why a mouse button is first-class, not a special case

The owner's own push-to-talk hotkey is his mouse's thumb (back/forward) button. A binding is
`{ type: "key", code }` or `{ type: "button", button }` — literally one `if` apart in
`Hotkeys.matches()`, `Hotkeys.text()` and `Hotkeys.capture()`. Nothing in this module treats a
key as the "real" case and a button as an afterthought.

### The browser's own back/forward has to be stopped

Mouse buttons 3 and 4 (`MouseEvent.button`) are the browser's own Back/Forward buttons on most
mice. Left unhandled, pressing the owner's push-to-talk button would also navigate the page away
mid-recording. `Hotkeys.button()` calls `e.preventDefault()` on buttons 3/4 on **every** related
event (`mousedown`, `mouseup`, and `auxclick`) — not just the one bound to an action — because:

- Which event actually triggers navigation differs by browser/OS, and this module would rather
  over-prevent on two harmless buttons than under-prevent and let the page jump away once.
- The button might not be bound to anything YET (the owner is mid-way through the "press a key
  or button…" capture flow) and the page still shouldn't navigate while he's pressing it to find
  out what it is.

`auxclick` only ever reaches `Hotkeys.button(e, null)` — `phase: null` means "prevent default
only," never a subscriber call, because `mousedown`/`mouseup` already fired "down"/"up" for the
exact same physical click; firing again from `auxclick` would double every button hotkey.

## Held-down key: one "down", not a flood

A keyboard fires repeat `keydown` events for as long as a key is held (typically after an OS-set
delay, then repeatedly). The brief: "A key or button HELD DOWN must fire 'down' once, not
repeatedly." `Hotkeys.key()` drops every `keydown` where `e.repeat` is true, so push-to-talk
starts recording exactly once per real press, however long it's held. Mouse buttons need no such
guard — `mousedown` never auto-repeats.

## Why `LocalStorageSaver`, not `Page.Prefs` directly

`Page.Prefs.read_raw`/`write_raw` (in `core/Page/Page.class.js`) are the lower-level guarded
touch and would have worked too — they're what `LocalStorageSaver` itself calls underneath. The
brief named `LocalStorageSaver` directly (law 6: there is already a Saver here, don't build a
second reader), and `dev/DevBar/settings.js` is the live precedent for exactly this shape — one
`LocalStorageSaver` per module, one key, loaded once at import time. `Hotkeys` copies that
pattern (`new LocalStorageSaver({ key: "lew42-hotkeys" })`) rather than inventing a different one.

`load()` returns a promise, but the thing it resolves (`Page.Prefs.read_raw`) never actually
waits on anything — it's synchronous work wrapped in `Promise.resolve()`. Microtasks drain
before the first paint (the same note `settings.js`'s own `restore()` makes), so by the time any
real key or mouse button reaches `Hotkeys.fire()`, the saved overrides are already loaded. No
loading state was built for the settings UI because there's nothing a user could do fast enough
to see "no data yet."

## Rudimentary key names, on purpose

`key_text()` turns a `KeyboardEvent.code` into something readable ("AltRight" → "Alt (right)",
"KeyA" → "A") with one small regex, not a lookup table for every one of the ~100 codes the
Keyboard spec defines. The owner asked for "a quick rudimentary UI," and an unrecognised code
still prints something sane (its own camel-case split with a space) rather than nothing — good
enough until a real gap is found.

## `hotkeys_section()` does not wrap itself in `section()`

First draft had `hotkeys_section()` call `parts.js`'s own `section("Hotkeys", () => {…})`
around its filter and rows, matching `dev/DevBar/tools.js`'s own sections (`route()`,
`server()`, …), which each draw exactly one titled block.

But `ext/drawer/tabs/settings.js` — built by the sibling minion wiring this into the
drawer, already landed in this same worktree by the time this was checked — calls it as
`section("hotkeys", () => hotkeys_section())`: the CALLER supplies the section and title,
and hands `hotkeys_section()` only the inside. Self-wrapping here would have stacked two
titles on that page ("hotkeys", then "Hotkeys" again, from this file). Fixed by dropping
the `section()` call from `hotkeys_section()` — it now only draws the filter input and the
row list, and whoever places it decides whether that needs a heading around it (the
drawer's settings tab wants one; this module's own demo page does not, since the page
already has its own "Hotkeys" title above it).

## Modifiers, added after the first landing (follow-up, 2026-10-03)

The owner queued a second hotkey while this was mid-build: an open-mic TOGGLE, default
Ctrl+Shift+M. The bare `{ type: "key", code }` shape could not express "M, but only with
Ctrl+Shift held," so a key binding grew three optional flags:

```js
{ type: "key", code: "KeyM", ctrlKey: true, shiftKey: true }   // Ctrl+Shift+M
```

**The semantics decision: omitted means UP, not "don't care."** `Hotkeys.matches()` compares
every one of `ctrlKey`/`shiftKey`/`altKey`/`metaKey` against the real event, reading a missing
binding flag as `false`. The alternative — a missing flag means "ignore this modifier" — was
rejected: under that reading, a bare `"KeyM"` binding would ALSO fire every time Ctrl+Shift+M
was pressed (plain M's modifiers are "don't care," so Ctrl and Shift being down wouldn't stop
it), meaning the plain-M action and the toggle action would BOTH fire off one keypress whenever
they happened to share the same letter. Exact matching makes every binding unambiguous: a key
plus its exact modifier state is one combination, full stop.

`Hotkeys.capture()` records the modifiers actually held at the moment of the captured
`keydown` (`e.ctrlKey`/`e.shiftKey`/`e.altKey`/`e.metaKey`, read once, synchronously, because
by the time a subscriber runs the real event is gone) — so pressing Ctrl+Shift+M into the
"press a key or button…" button saves exactly that combination, not just `M`.

`Hotkeys.text()` now prefixes the modifiers in a fixed order — Ctrl, Alt, Shift, Meta — so the
same combination always reads the same way regardless of which key physically went down first:
`"Ctrl+Shift+M"`. Mouse-button bindings are unchanged; modifiers were only asked for on keys.

## What's left for the next minion (not this task's job)

- Registering `"dictate.push"` itself, in `ux/Dictate/` — explicitly out of this brief's fence.
- Wiring `hotkeys_section()` into the drawer's Settings tab / DevBar — same reason.
- A key or button bound to TWO actions at once is allowed and silently fires both; no UI warns
  about it yet. Parked, not hit by anything built so far.
