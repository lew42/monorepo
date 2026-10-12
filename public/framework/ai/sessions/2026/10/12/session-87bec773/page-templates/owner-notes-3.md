# Owner notes 3 (2026-10-12): the binding system

Binding is "integral to everything" and the cure for the stale-data problem: rock-solid data structures you bind to and reliably get live updates from, so templates never get re-wired by hand. Document whatever the research finds in **`core/Page/doc/binding.md`**, a home for binding linked from the Page readme.

## Questions to answer, each with a recommendation
1. **Subscribe how?** Events are the likely answer; is anything better?
   - Unsubscribe when an object goes away (garbage collection): no memory leaks, no more subscriptions than necessary.
   - The owner's `Events` class makes an empty `events` object. Create it lazily, behind a gate ("if it doesn't exist, create it").
2. **Fork vs copy:** is a clone **linked**, so a base update flows to the clone, or a **hard copy**, not linked? Support both, granular per property:
   - each property can be overridden;
   - an override can be reset;
   - which properties are overridden is visible, per section and per property;
   - CSS properties are one kind among many.

   Arrive at a short, stable list of property kinds.
3. **Property objects are optional.**
   - A `Property` instance per value is easier to extend and more object-oriented, but costs objects.
   - Alternative: bind to the parent's property-name change event. Does `Item.set` emit one today, and should it? Or a `BindableItem extends Item`, or `item.bind("name")`?
   - Don't make everything a Property. Measure a 1,000-row grid with tens of thousands of elements: plain values vs Property per cell vs lazy events.
4. **`Field extends Property`:** a value that changes, plus a field type (text input, slider, any control), with its own `set`.
   - `page.clone({ name: value })` assigns any field or property.
   - A value that is `instanceof Property` means "bind live"; a plain value means static.
   - Find a simple syntax for "bind to this object's value" when not using Property objects (passing an event?). The owner finds it unclear: propose and compare.
5. **Lists:** live `List`s of items already propagate adds. Items save themselves as deltas in JSONL (their own file, or embedded in `page.jsonl`). A session, task or message on screen has data (properties, even a whole grid), and that data should be bound to its template.
6. **Paths and expressions (later, record now):**
   - Hover any value to see its JavaScript path in a tooltip, so you know where it lives and how to reference it.
   - In the UI, `={path}` binds to a value, and `={ any JS expression }` computes one (a condition, any logic): really a callback between two bound values.
   - A UI control bound to a property, and one property bound to another, with no manual wiring.

## Order
Research and measure first. Write `binding.md` with the decision and its alternative for each question. Prototype the smallest piece the Template slice needs (one live-bound field, one override and reset), with tests. Explore the syntax patterns side by side in the demo.
