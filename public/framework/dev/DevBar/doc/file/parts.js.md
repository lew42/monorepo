Three small view builders — `section()`, `row()`, `check()` — shared by
`tools.js`, `ask.js` and `layout.js`. Its entire reason to exist is avoiding an
import cycle: these three were private to `tools.js` until `ask.js` needed
`section()`, and `tools.js` already imports `ask.js` to put it in the
`sections` array. `ask.js` importing `tools.js` back would be the
mutual-parent-child import `CLAUDE.md` warns breaks only on deep reloads.
Pulling the three into their own file with no imports of their own restores
the one-way flow.

## `row()` returns the half that changes

```js
export function row(key, value, cls){
    let $val;
    div.c("dev-row", () => {
        span.c("dev-key", key);
        $val = span.c("dev-val " + (cls || ""), value);
    });
    return $val;
}
```

Every caller that wants to update a row later (`tools.js`'s `server()`
section, updating "connecting…" to "connected" once `socket.ready` settles)
needs the value span, not the row. Returning the whole row would make every
live update reach in with a child selector instead of holding a reference.

## `check()` reads state from the DOM, not from a parameter

```js
const on = document.documentElement.classList.contains(cls);
```

Consistent with [docking](/framework/dev/DevBar/doc/docking/)'s rule that a
knob's class *is* the state: a redraw asks `<html>` rather than being told,
so there's nothing here that can go stale relative to what's actually
applied.

## `check()`'s third argument

```js
.on("change", function(){ knob(cls, this.el.checked); changed?.(); });
```

`dev-outline` needs nothing after the class flips — the CSS *is* the effect.
`dev-layout-live` does: the section reads the class at render time and has to
rebuild to obey it, and nothing else redraws the rail until the next navigation
or resize. `changed` is optional and unused by `xray()`, so the knob that needs
no callback still reads as one line.

Calling `devbar.refresh()` instead would have been the obvious alternative and
is the reason this parameter exists: `DevBar.js` imports `tools.js`, so a
section importing `DevBar.js` back is the mutual import this file was created
to avoid.

## Improvements

*None found.* Three functions, eighteen lines total, each with one caller class
and no branching beyond what's shown above.
