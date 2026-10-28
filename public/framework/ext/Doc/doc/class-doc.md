# ClassDoc: a class page that shows before it tells

`class ClassDoc extends Doc` ([ClassDoc.js](../ClassDoc.js), styles in [ClassDoc.css](../ClassDoc.css)). The owner's ask (2026-10-28): "Every time we create a view for something, it's just vomit… I really just need to see things and then be able to click through." Brief and plan: [build C](/framework/core/Session/tasks/data-shapes/build/class-docs/).

**See it:** [Item at 1920](class-doc/item-1920.png) · [Item on a phone](class-doc/item-400.png) · [List at 1920](class-doc/list-1920.png) (2026-10-28, headless).

## What the Overview draws, top to bottom

1. **The class line:** `Item extends Events · holds …`. The parent class is read off the prototype; `extends:` names it when the parent is a mixin with no name.
2. **A live one:** `example()` returns a real instance, drawn with [`view()`](/framework/ux/Content/Object/) (the default view).
3. **How a change is saved:** `life: {who, path}`, one picture. Item's is [Item.life.js](/framework/core/Item/Item.life.js), drawn from seat (g)'s [delta-flow.md](/framework/core/Session/tasks/data-shapes/seats/delta-flow/delta-flow.md); List reuses its `path` with its own `who`.
4. **Its test, step by step:** `steps` is an array of `{title, code, note, run(t), check(t), show(t)}`. Each step is a card: its code, pass or fail, the object after it (a snapshot), and the lines it wrote. `run_steps` ([Item.steps.js](/framework/core/Item/Item.steps.js)) runs the same array in the browser and in node (`Item.steps.test.mjs`, `List.steps.test.mjs`); the store is a `ScratchStore` that writes no file.
5. **Methods:** a wall of cards (signature, one-line job), each a link.
6. Then the page's own `content()`, if any (Item and List fold their older checks into one line there).

## Method pages

- `method_list: {name: {job, example(), static?}}` (Item's: [Item.methods.js](/framework/core/Item/Item.methods.js)). The Methods tab replaces the API tab.
- `methods/<name>/` is built by the Methods section's `route(name)`; there is no page.js per method. It shows the signature, the job, the example's body as code and its result drawn live, then `methods/<name>.md` when the name is in `method_notes` (Item: `set get toJSON`). `method_setup` is a comment shown above every example, for a helper they share (List's `shop()`).
- Old `api/<name>/` links (ClassCard rows on pages that inherit from Item, older docs) land on `methods/<name>/`, and the address bar is corrected with `replaceState`, the same shape as Doc's `docs/` → `doc/`.

## Watch out

- `example()` and every method example run on each visit; keep them pure (no file, no network).
- The older per-member notes in `doc/method/*.md` are no longer shown by a ClassDoc page (they were the API tab's). Most predate `set()` as a delta; move what still holds into `methods/<name>.md` and retire the rest.
