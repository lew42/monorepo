# Dropdown architecture — a trigger that shows its choice, and a list the top layer lifts out of every clip

`Dropdown` is one choice out of a short list: a button that shows the current option's picture and name, and a `[popover]` list that opens above the page. It is a class tree of one: `dropdown(…)` is the door, `class Dropdown` in [`dropdown.js`](../dropdown.js) holds every part as a method, and [`dropdown.css`](../dropdown.css) styles it. It imports only `core/View`.

## The top layer is the whole clipping fix

**Decided:** the list is a `[popover="auto"]` element, so an open list is promoted to the top layer.
**Why:** panels, their workspaces and rails are all `overflow: hidden`; absolute positioning cannot escape them, and measured on `/framework/ext/Panel/` most open menus were cut off.
**Instead:** `position: absolute` (clipped) or capping the width (squeezes instead). CSS anchor positioning would be declarative, but is not in every target browser yet.
**Detail:** [decisions.md](./decisions.md#the-top-layer-is-the-whole-module)

## Light dismiss is the browser's, Escape is ours

**Decided:** outside click closes the list through `popover="auto"`; Escape is handled in `keys()`, which closes, stops the event and returns focus to the trigger.
**Why:** `ext/Panel`'s focus code drops the panel selection on Escape, so a browser-dismissed list took the selection with it.
**Instead:** a hand-written outside-click listener, which the popover already provides for free.
**Detail:** [decisions.md](./decisions.md#the-top-layer-is-the-whole-module)

⚠ The readme's "Watch out" line says Escape is the browser's too. The code stops that: see `keys()`. The readme line is stale and is not fixed here (outside this module's fence).

## Positioning is measured once, in viewport coordinates

**Decided:** `place()` reads `getBoundingClientRect()` of the trigger and list, writes `position: fixed` `left`/`top`, and runs once per open. It goes below the trigger when it fits, else above, clamped to the viewport.
**Why:** a top-layer box has no containing block to inherit from.
**Instead:** anchor positioning (not yet universal). A scroll or resize re-place is not implemented; a list left open while the page scrolls stays put.
**Detail:** [decisions.md](./decisions.md#the-top-layer-is-the-whole-module)

## The list stays a child of the dropdown

**Decided:** the list is appended inside `.dropdown`, not to `document.body`.
**Why:** the rail that hosts it rebuilds on every `change`; a body-appended list would leak one detached element per change.
**Instead:** a body-appended list, which leaks unless the caller removes it by hand.
**Detail:** [decisions.md](./decisions.md#the-list-stays-a-child)

## A class, not a factory

**Decided:** `dropdown(…)` is `new Dropdown(…).draw()`, and each part (`face`, `option`, `place`, `keys`) is a method a caller can override.
**Why:** a caller sometimes needs a different `place()` or keyboard without forking the file.
**Instead:** a plain factory like `ext/drawer` or `ext/grip`, which cannot be changed in part.
**Detail:** [decisions.md](./decisions.md#why-a-class-not-a-function)

## A picture is an icon or a function, never a bare `<option>`

**Decided:** `face(o)` draws `o.icon` as a Material ligature, or calls it when it is a function, then the name.
**Why:** the panel vocabulary is pictorial, and a native `<select>` cannot show an icon and a name together.
**Instead:** a native `<select>`, which is free on mobile and typeahead but cannot hold a picture.
**Detail:** [decisions.md](./decisions.md#why-not-a-native-select)

## The control grammar sets the box, the theme keeps its voice

**Decided:** the trigger and options use `:is(button, .btn)` in their selectors, restating the theme's own shape, so they clear its uppercase label box. Only size and fit are reclaimed here.
**Why:** the theme sizes every `button` as a wide label, which is four times too wide for a picture and a word.
**Instead:** a plain `.dropdown-trigger` selector, which loses to the theme's 0-2-0 rule.
**Detail:** [decisions.md](./decisions.md#specificity-restated-from-the-theme)
