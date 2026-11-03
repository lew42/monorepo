# Template — a page that renders many times, each time from its own data

`Template extends Page`: `render()` draws a new view every call (`views`), `clone(data)` makes a new use of the layout that reads through to its source, `show(name)` draws a text span bound to a field, `set` / `unset` / `drop(view)` keep it live. Values live in a `Property.Map` ([core/Property](/framework/core/Property/)): plain until something binds, a `Property` after.

- `Template.js` — the class · `BigCard/BigCard.js` — the first template (the Figma palette's big card) · `TemplateDemo.js` — the demo class
- Design and decisions: [../doc/templates.md](../doc/templates.md)
- Watch out: never `Object.create` a template by hand, `clone()` gives the copy its own listeners and views. `core/Page` itself is unchanged.
