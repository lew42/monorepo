# Minion brief: `ux/Hotkeys` — a tiny, site-wide hotkey manager

Load the `minion` skill first. Worktree: `C:\Code\lew42\worktrees\push-to-talk`
(branch `worktree/push-to-talk`, server already running at `http://push-to-talk.localhost/`).
Work ONLY inside that worktree, not the main tree.

Parent task (read it for the whole picture, don't re-ask the owner anything —
decide and move): `public/framework/ai/sessions/2026/10/03/push-to-talk/push-to-talk/requirements.md`.

## The owner's words this serves (verbatim, from the parent brief)

> We need a key detection system for setting hotkeys, so it isn't hard-coded: just
> make a quick rudimentary UI for it. Really a hotkey manager: one place to manage
> every hotkey in the app, filterable, rebindable. (Nested per-panel scopes, like
> Blender, can confuse; keep a few go-to hotkeys.)

## What this is

A brand-new module, `public/framework/ux/Hotkeys/`. One flat list of named actions
(no nested scopes — the owner explicitly doesn't want Blender-style panel scopes).
Each action has a label, a default binding, and the binding the owner has actually
set, remembered per browser (reuse `ext/Saver/LocalStorageSaver.js` — law 6, don't
hand-roll a second localStorage reader).

A binding is EITHER a keyboard key OR a mouse button — mouse back/forward buttons
(`button` 3 and 4) are a first-class binding, because the owner's own hotkey is his
mouse's thumb button. Catch `mousedown`/`mouseup`/`auxclick` for those and
`preventDefault()` them so the browser doesn't try to navigate back/forward.

## Files to write

- `ux/Hotkeys/Hotkeys.js` — the class. Shape (adjust names only if something reads
  better, but keep it this small):
  - `Hotkeys.register(name, { label, default })` — called once, at import time, by
    whatever module owns the action (so `ux/Dictate` registers `"dictate.push"`
    itself; this module doesn't know about Dictate at all — one of everything,
    no upward imports).
  - `Hotkeys.bind(name, binding)` — binding = `{ type: "key", code }` (a
    `KeyboardEvent.code`, e.g. `"AltRight"`) or `{ type: "button", button }`
    (a `MouseEvent.button` number, e.g. `4`). Saves it.
  - `Hotkeys.binding(name)` — the current binding (saved, or the default).
  - `Hotkeys.on(name, "down" | "up", fn)` — subscribe. The module owns ONE
    document-level `keydown`/`keyup`/`mousedown`/`mouseup`/`auxclick` listener
    (added once, lazily, on first `register` or first `on`), matches the event
    against every action's current binding, and calls every matching
    subscriber's `fn`. A key or button HELD DOWN must fire `"down"` once, not
    repeatedly (watch for key-repeat `keydown` events — ignore `e.repeat`).
  - `Hotkeys.all()` — every registered action with its label, default, current
    binding, and a human string for the binding (e.g. "Mouse button 4", "Alt
    (right)") — for the settings UI below.
  - `Hotkeys.capture(cb)` — starts listening for the NEXT key or mouse-button
    press anywhere on the page, calls `cb(binding)` once with it, then stops
    (used by the "press a key or button…" capture button). Don't let this one
    click also register as a bound hotkey's own down/up.
- `ux/Hotkeys/row.js` — one exported function, `hotkeys_section()`, that draws the
  settings UI: for each registered action, one row — its label, the current
  binding as readable text, and a "press a key or button…" button that, while
  armed, shows "press anything…" and on the next key/button calls `Hotkeys.bind`
  and redraws. A plain text filter input above the rows (CLAUDE.md: "filterable") —
  typing narrows the rows to those whose label contains the text, case-insensitive.
  Use `dev/DevBar/parts.js`'s `section`/`row` helpers (read that file first) so it
  looks like every other settings section, not a one-off style.
- `ux/Hotkeys/readme.md` — the reader's index: what it is (one picture: a
  screenshot of the rows), how to register an action, where the UI lives, link to
  `doc/`.
- `ux/Hotkeys/doc/decisions.md` — why no nested scopes (the owner's own words,
  above), why mouse buttons are first-class, any trap you hit.
- `ux/Hotkeys/page.js` — a page.js so the module is browsable
  (`/framework/ux/Hotkeys/`): show the live `hotkeys_section()` running right there
  (demo first, words after — CLAUDE.md "show, don't tell"). Load the `new-page`
  skill before writing it. It does NOT need to be added to any `children:` list
  yet — the next minion (wiring it into the drawer Settings tab) will link it from
  there; name the exact url you picked in your own log so that minion can find it.

## Do NOT

- Do not touch `ux/Dictate/` or `dev/DevBar/settings.js` or
  `ext/drawer/tabs/settings.js` — a second minion does the wiring, right after you,
  in the SAME worktree. Leave those untouched so there's no file collision.
- Do not register `"dictate.push"` yourself — that's the next minion's job, in
  `ux/Dictate/`, importing `Hotkeys.register` from your module.
- No new npm dependency. No build step.

## Prove it

Load the page you built headless (`node Server/layout-check.mjs` or a quick
Playwright/`site` screenshot is NOT allowed per the parent fence — screenshot via
curl-free means: load `http://push-to-talk.localhost/framework/ux/Hotkeys/` and
check it returns 200 with no console errors is enough for your own commit; the
final screenshot proof is the last minion's job). Commit your work with a clear
message once it loads clean.

## When done

Log your result in THIS task's own log
(`public/framework/ai/sessions/2026/10/03/push-to-talk/push-to-talk/hotkeys-module/task.jsonl` — load
`new-task` if it's not open yet) including the exact page url, then end your turn.
Budget: $2.
