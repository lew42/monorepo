# Objects — object-oriented design: every class ships a view of its state

"I want to see as much of the data as possible to start trying to understand the internal
workings" (the owner, 2026-09-29). A class here isn't done until it can show what an instance
knows, at three sizes.

## Index

- The default view: `view(thing)`
- The three sizes — chip, row, panel
- The debug view: `inspect(thing)` — the fourth size, separate from `render()`
- Objects the owner sees (`AIObject`, `Skill`, `Ask`, `Task`)

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
