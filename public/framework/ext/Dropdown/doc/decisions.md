# Decisions

Why this module exists, and what was rejected. Opened 2026-08-19 by the popover sweep of `ext/Panel` — the owner: *"do a sweep of all the popover menus, many get clipped"*.

## The top layer is the whole module

Measured on `/framework/ext/Panel/` before the sweep: **365 open popovers were cut off at 1280, 343 at 400** — every one of them a `.panel-pop` opening inside a panel, whose workspace, body and rail are all `overflow: hidden`. Absolute positioning cannot escape that box; `max-inline-size: 100%` (the old cap) only trades clipping for squeezing, and the measurement counted both.

A `[popover]` element is promoted to the **top layer** while open: painted above the whole document, outside every `overflow: hidden` ancestor, with no z-index war. That is the fix, and it is one attribute.

`popover="auto"` brings two more behaviours for free — **light dismiss** (a click anywhere else) and **Escape**. Neither is code in `dropdown.js`. The one thing the top layer costs is a containing block: a promoted box has none, so `place()` measures the trigger with `getBoundingClientRect()` and writes `position: fixed` `left`/`top` itself. CSS anchor positioning would do this declaratively; it is not in every browser this site targets yet, so it is a later simplification, not today's.

## Why not a native `<select>`

The owner offered it (*"or could be a native select element, i don't really care"*). Rejected for one reason that matters here: **an `<option>` cannot hold a picture.** The panel vocabulary is pictorial — a template ships an icon, a tone ships a colour swatch — and the sweep's whole point was that icons alone are unreadable, so the control has to show *icon **and** name*. A native select can show one or the other and not both. It also cannot be styled to match the rail's rows.

What a `<select>` would have given us free and this does not: the mobile OS picker, and typeahead. Neither is missed at three-to-thirty options in a desktop rail; if typeahead is ever wanted, it is a `keys()` override.

## Why a class, not a function

`ext/drawer` and `ext/grip` are plain factories, and this could have been one. It is a class because a dropdown has parts a caller may want to change without forking the file — what an option looks like (`face`, `option`), where the list lands (`place`), what the keyboard does (`keys`). `dropdown(…)` is the door and stays the only thing most callers see; `Dropdown` is there when one caller needs a different `place()`.

## The list stays a child

The list could have been appended to `document.body` (a common popover pattern). It is a child of `.dropdown` instead, so **the DOM that built it takes it away**. `ext/Panel`'s rail rebuilds itself on every `change` event — a body-appended list would have leaked one detached element per keystroke of a `pad` slider. The top layer is a painting concern, not a DOM one: a nested element is promoted just as well.

## Specificity, restated from the theme

`.dropdown > .dropdown-trigger:is(button, .btn)` looks over-written and is not. The theme styles every `button` as a small uppercase LABEL at 0-2-0 (`padding: 0.7em 1.4em`, `text-transform: uppercase`) — correct for READ GUIDE, four times too wide for a picture and a word. `:is()` takes the specificity of its most specific arm, so restating the theme's own selector shape lands this at 0-3-0 and reclaims the box. Only the box: the theme keeps its voice everywhere it is not overridden.

## Open

- **A trigger goes stale** if the value changes from somewhere else. The caller redraws. `ext/Panel`'s rail redraws wholesale on `change`, so it never notices — a caller that does not would want a `says()` seam, the way `ext/Panel`'s old bar popovers had one.
- **`place()` runs once per open.** Scroll the page with a list open and it stays where it was. A `scroll`/`resize` re-place is four lines and has not been needed.
