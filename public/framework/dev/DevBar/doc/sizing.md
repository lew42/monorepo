# Sizing the page by sizing the rail

```js
const width = innerWidth - target;   // tools.js — the rail IS the difference
```

The rail is the only thing between the window and the page (see
[docking](/framework/dev/DevBar/doc/docking/)), so aiming the *page* at a
width is one subtraction: how wide the rail has to be for the page to be
`target` px, at whatever size the window actually is. Four presets —
`390 810 1920 3440` — mobile through mega, matching the sizes named
throughout the framework's layout docs.

## A target the window can't hold disables itself

`width < MIN` (200px, `settings.js`) means the window is too small to hold
that page width *and* a usable rail. That button greys out and its title says
which window it needs, rather than clamping to the nearest reachable width
and silently landing somewhere else. A 3440 target on a 1920 screen has no
honest answer, so it says so.

## Lit off the setting, not a measurement

```js
$size.rc("on").ac(settings.width === innerWidth - target && "on");
```

`.app` eases its push over `0.18s` (`--rail-ease`, cleared only while
dragging — see the grip in `doc/file/grip.js.md`). Reading `innerWidth` right
after a click would catch the page mid-transition and light nothing, or the
wrong button. `settings.width` is the number that was *asked for*, set the
instant the click handler runs, so it reads correctly whether the CSS
transition has finished or not.

## The floor a preset has to clear

```js
html.style.setProperty("--rail-floor", "0px");   // settings.js, rail()
```

`.app` normally stops its own push above a 26rem reading column — a *default*
guard so an unconfigured rail can never crush the page below something
legible. A width you explicitly asked for (a preset, or a drag) needs no such
guarding, so `rail()` clears the floor to 0 every time it's called. The
one-time cost: after any deliberate resize, a *later* drag can also squeeze
the page below 26rem, because the floor that would have stopped it is gone
for the rest of the session. `MIN` (200px) is what still stops both sides
from vanishing.

## What stays unfixed on purpose

Resizing the window after clicking a preset leaves the rail at the old
absolute width — no preset re-lights, because `settings.width` is still the
number you asked for and nothing re-derives it from the new `innerWidth`.
Honest (nothing pretends to still be aimed at 1920 once the window changed
under it) rather than automatically clever. Re-click to re-fit.
