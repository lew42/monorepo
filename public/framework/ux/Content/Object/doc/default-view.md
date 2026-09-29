# DefaultView — what the tree reads, and when

Unlike `ObjectCard` (`object()`, `shape.md`), which draws one small card and stops,
`DefaultView` (`view()`) draws a **tree**: a header row, then one row per own
property, and a property that is itself an object can be opened to show ITS own
properties, as deep as you keep clicking.

## What each row shows

- `Object.keys(subject)` → the property list, same source `ObjectCard` reads.
- A function, or a value with `.el` (a `View`) or that is a DOM `Node` → skipped
  entirely, same as `ObjectCard`. Nothing useful to draw for either.
- A primitive (`string`, `number`, `boolean`, `null`, `undefined`) → shown inline,
  right after the name, in the row's own `end` slot (`ui/item`'s).
- An object, an array, a `Map` or a `Set` → an **expandable** row. It shows a
  one-line summary only (`Array(3)`, `Map(12)`, `{…}`) — its own contents are not
  read, or drawn, until the row is actually opened.

## Why "until opened" matters

A `Page`'s `.children` is a `Map` of more `Page`s, and each of THOSE has a
`.parent` pointing straight back up. Read the whole thing eagerly and you either
loop forever or build a wall of rows nobody asked to see. `DefaultView` instead
wires a plain `"toggle"` listener onto the row's own `<details>` element and only
calls `entries()` the first time it actually opens — so a `Page`, an `App`, or
anything else with a big graph behind it costs nothing to show until you go
looking, and a value already open somewhere above the row you're opening (a
cycle) shows "↺ already open above" instead of opening into itself.

## The override: `Thing.View`

`view(thing)` is the one call most code should use:

```js
import { view } from "/framework/ux/Content/Object/DefaultView.js";

view(somePage)          // DefaultView, unless Page (or something it extends) says otherwise
```

It checks `thing.constructor.View` — a plain JS static, so a class that never
declared its own `View` still finds one declared by a class it extends, the same
way any other inherited member works. When nothing declares one, `view()` falls
back to `new DefaultView({ subject: thing })`.

```js
class Widget { … }
Widget.View = class extends DefaultView {
	render(){ /* draw whatever makes sense for a Widget */ }
};
```

The demo page shows one class both ways, side by side, so the difference between
"the automatic guess" and "a class's own view" is something you can see, not just
read about.

## `track()` — how a `Page` ends up trackable at all

`DefaultView` only ever draws an instance it's HANDED — it has no idea which
instances exist. `core/track/track.js`'s `track(Klass)` is the separate, opt-in
piece that answers "which ones exist": call it once per class
(`Page.class.js` does this for `Page`), then `Klass.track(instance)` — one line,
in that class's own constructor — remembers every instance built from then on,
and `Klass.instances()` reads them back. `Page`'s own constructor has that one
line now; most classes have neither, and show up in `Klass.instances()` nowhere,
which is the point — tracking is for the classes where "see every one of these"
is actually useful, not a default every class pays for.

## Files

The class is [`DefaultView.js`](/framework/ux/Content/Object/DefaultView.js);
the tracking piece is
[`core/track/track.js`](/framework/core/track/track.js); the two live examples
are [the Page object](/framework/ux/Content/Object/page/) and
[the App object](/framework/ux/Content/Object/app/).
