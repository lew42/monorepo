# The control vocabulary

`layout.words` is a `word → builder` map (`words.js`): one word names one control
over a target view. A bar or a panel group is just a space-separated list of
words — `"mode gap column"` — and `draw($el, list)` (`words.js`) looks each one up
and skips what it does not recognise, so half a bar beats no bar.

## Why a registry, not a parameter list

The bar's controls used to be literals inside `layout.bar`, and the panel's were a
*second* set of literals in `panel.js` — "add a knob" meant editing this module,
and the two files already disagreed about which words existed. A config object
per call was rejected (an option is API surface forever, and every call site
would restate the default); so was subclassing (there is no class to subclass).
The map won because it turns the bar's second argument into a sentence a reader
can parse at the call site, and because a consumer adding a word — `layout.words.radius
= $el => knob($el, "--radius", 0.25, 2, 0.05)` — writes one line and never opens
this folder. [`ext/editor`](/framework/ext/editor/) and
[`ext/Panel`](/framework/ext/Panel/) both lean on this: neither imports a second
control library, they extend `layout.words` or call `controls.js` directly.

## One toolbar for three targets

`layout.bar(target, list)` used to be two near-identical functions — one for a
container, one (`layout.page()`) for a live `Page` — because a page's element does
not exist until `content()` returns. They were merged: `view_of()` (`layout.js`)
is the whole difference between a `View`, a bare `Element` and a `Page`, and the
page case is solved once, for every target, by filling the bar in a **microtask**
(see [Traps](/framework/ext/layout/) in the readme) rather than by keeping a
second code path. `layout.page()` is gone; it had one call site.

## Two knobs cover both layout modes

`.flex.auto > *` reads `--column` as a flex-basis and `.grid.auto` reads the same
token as its `minmax()` floor, and both read `--gap` the same way — so one pair of
knobs covers *gap, wrap, columns, basis and minmax* on either side of the
`mode` switch. `--pad` is panel-only, for the same reason the bar stays small: a
bar that has to be read is a bar in the way.

## Chips or a menu?

Both, picked by length. Two modes (`flex`/`grid`) are a segmented pair you can hit
without reading (`pick()`, `controls.js`); the page shapes (`standard`/`sheet`/`full`)
are a `<select>` (`menu()`), because three chips plus two flags would be a row of
noise in a bar that is supposed to disappear when you are not pointing at it.
