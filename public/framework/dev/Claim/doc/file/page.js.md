## What this file is

The Doc page for a module nothing imports — the first code block shows the
real call site (`Server/plugins/MCP.js`'s `claim` tool, via an `eval`)
because there is no in-app usage to demonstrate otherwise. `demo()` is the
only place `claim()`, `release()` and `claimed()` run inside the framework at
all.

## The demo rings its own tab

Clicking "Claim this tab" here does exactly what the skill does — puts a ring
around the browser window currently showing this page. It is the honest demo
(nothing imports the module, so there is nothing else to show it doing), but
it means trying the buttons while reading this page briefly makes the ring
say "you" instead of naming a real session.

## `button(...).click(function(){ this.text(...) })`

The third demo button uses a plain `function`, not an arrow, so `this`
inside the handler is the clicked button's own `View` — the one way to
toggle a button's own label from its own click handler without capturing a
separate reference to it first.

## Improvements

1. **Nothing ranked.** The page is a title, one demo and a link to the
   readme — there's no decision or trap here beyond the two named above.
