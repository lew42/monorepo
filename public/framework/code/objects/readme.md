# Objects — object-oriented design: every class ships a view of its state

"I want to see as much of the data as possible to start trying to understand the internal
workings" (the owner, 2026-09-29). A class here isn't done until it can show what an instance
knows, at three sizes.

## Index

- The default view: `view(thing)`
- The three sizes — chip, row, panel
- The debug view: `inspect(thing)` — the fourth size, separate from `render()`
- Objects the owner sees (`AIObject`, `Skill`, `Ask`, `Task`)

## The one default view

`view(thing)` (`ux/Content/Object/DefaultView.js`) is the survivor: every class renders itself
with it, and `Thing.View = class extends DefaultView` overrides it. The class chooses what matters:
`static shown = ["title","state"]` lists those first, in order; `static hidden = ["_timer"]` drops
internal state. `ObjectCard` (`object()`, the small API card) and `inspect()` (the recursive
debug card) are older siblings, kept until their callers move to `view()`.

## Use

```js
Thing.View = class extends DefaultView { … };   // overrides the default for every Thing
track(MyClass);          // once, in the module
MyClass.track(this);     // once, in the constructor — makes instances findable at all
static icon = "material-symbol-name";           // any class may carry one — inspect() reads it
inspect(myThing)                                // the debug view — icon, name, properties, nested
```
Live: [the Object demo](/framework/ux/Content/Object/).

## Watch out

- Most classes should skip `track()` — it's for objects the owner or an agent needs to find later,
  not every object that exists.
- The default view is the fallback. A class with real state earns its own `View` — don't write one
  for a class that has nothing worth showing yet.

## More

- [doc/views.md](doc/views.md) — the full explanation, with the `AIObject` example, and
  "render vs inspect" — why they're two separate methods
- [patterns](../patterns/) — parts as static subclasses, the mechanism `Thing.View = …` relies on

## Notes from your asks

- Class names and hierarchy get careful choice, because a wrong name becomes the base that later code builds on. ([your words](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p2689), 2026-10-09)
- A class that orchestrates several other classes takes a system or manager name, so its job reads from its name. ([your words](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p2689), 2026-10-09)
- A module's class hierarchy is its first documentation: class names, children, when each is created, what data it gets, and what it talks to. ([your words](/framework/ai/sessions/7efd07d5-7a58-434d-8847-1a1d7b640390/?tab=coverage#p603), 2026-10-09)
- Make things object-oriented whenever possible. ([your words](/framework/ai/sessions/730e8a7b-4cbf-4d09-90bd-d61d2bf9384a/?tab=coverage#p1184), 2026-10-13)
