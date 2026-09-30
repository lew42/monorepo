# Rename — tap a title, Rename it, pick from a dropdown of 5

The owner's own ask: click a card's title, ask to rename it, and get a dropdown of
suggested names to pick from instead of typing a new one from scratch. See it working,
live: [the demo](/framework/ux/Rename/).

## Use
```js
import Rename, { rename_options } from "/framework/ux/Rename/Rename.js";

const log = [];
new Rename({ id: "card-1", title: "Q3 planning", log });
// several Rename instances can share one `log` array to show a combined history

const out = await rename_options("Q3 planning");
// -> {ok: true, names: [5 strings], source: "assistant" | "fixtures"}
```

## Watch out
- **Two ways in, same result:** the "Rename" button, or typing "rename this" into the
  small field beside a selected title — both call the same `start()`.
- **`rename_options()` asks Servex's `/api/hitl`, live only after a later restart** (a
  sibling task is building the route). Until then, and any time the call fails, it
  falls back to `fixtures.js` — plain variations on the current title — and says so in
  a small status line next to the dropdown.
- **The log is a plain array, not a real file.** A demo never writes a real log
  (requirements.md); a real caller would pass its own log — a card's own line array,
  or whatever it already writes decisions to — and read the latest `rename.id` line the
  same way `current()` does here.
- **The latest line for an `id` wins** — exactly the same rule `ux/Content/Decision`
  uses for its `chose` lines, so this stays consistent with how every other "pick one,
  change your mind later" widget on the site behaves.

## More
- [Live demo](/framework/ux/Rename/) — three cards, one shared log shown beneath
- [`doc/decisions.md`](/framework/ux/Rename/doc/decisions/) — why a plain array, not `ux/Content`
- Files: `Rename.js` (the class, `rename_options()`, the demo), `fixtures.js` (the offline rules pass)
