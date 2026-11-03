# Every new class ships a view of its state

"I want to see as much of the data as possible to start trying to understand the internal
workings" (the owner, 2026-09-29). Show the essential state in the simplest meaningful form, at
more than one size:

- **chip** — one glyph for the whole object, with small flags that light up for on/off state
  (recording, connected, muted)
- **row** — the icon, the name, and the one or two values that matter
- **panel** — everything, opened on demand

It applies to abstract classes too (an audio stream, a session, a queue), not just visible things.

## The default view

`view(thing)` (`ux/Content/Object/DefaultView.js`) gives any object a look: it checks
`thing.constructor.View` first — a plain static, so `Thing.View = class extends DefaultView {…}`
overrides it, and a subclass inherits its parent's automatically — else falls back to
`DefaultView`, a tree of `ui/item` rows, one per own property, opened lazily so a big object graph
costs nothing until clicked.

A class opts its own instances into being findable at all with `core/track/track.js`: `track(MyClass)`
once (in the module), then `MyClass.track(this)` once (in that class's own constructor) — most
classes should skip this; it's for objects the owner or an agent needs to look up later, not every
object that exists.

The default view is the fallback; a class with real state earns its own `View`.

## Objects the owner sees

Live example: `public/framework/ai/objects.js`, `AIObject` with `Skill`, `Ask`, `Task`.

- **Name the object first.** A thing the owner sees (an agent, a task, a skill, an ask, a card) is
  a class with a noun for a name, one file, one job.
- **The three views above are three METHODS**: `chip()` (icon + name, inline), `row()`, `panel()`.
  The base class draws them; a subclass says only what it is (`static icon`, `static kind`) and
  what it knows (`name()`, `fact()`, `facts()`, `href()`), and can replace one view without
  touching the others.
- **A page about an object renders a real instance from its real data**, never a description of
  it — this is the "show, don't tell" law applied to a class.

## render vs inspect

A class may have a `render()` — its own real template, whatever that looks like for this class,
or nothing at all if it has no UI of its own. `inspect()` (`ux/Content/Object/Inspect.js`) is a
SEPARATE method that every object gets, whether or not it has a `render()`: icon, instance name,
class name, and its properties — a property that is itself an object opens as its own nested
`inspect()` card, not a one-line description. `inspect()` never touches `render()` and `render()`
never touches `inspect()` — one is the thing's real face, the other is for seeing its structure.

A class itself can be inspected too (`inspect(SomeClass)`): the same icon, a heavier frame, and
its properties AND methods listed together, core API first — the visual form of this readme's own
`## Architecture` block. Live: the [`inspect()` demo](/framework/ux/Content/Object/) on the Object
page, beside `object()`/`view()`.
