# Settings — a plain settings store between data and UI

**What goes here:** one class, `Settings`, that holds a level's defaults and one instance's own overrides, with get/set, a live `change` event, a save policy, and a row-per-field view. **Next door:** [Events](../Events/) (the on/off/emit this builds on), [Plugin](../Plugin/) (the same override-and-make-default idea, but for a class's plugins instead of named fields).

## Use

```js
import { Settings } from "/framework/core/Settings/Settings.js";

const s = new Settings({
	fields: [{ key: "volume", label: "Volume", type: "slider", min: 0, max: 10, low: "quiet", high: "loud" }],
	defaults: { volume: 5 },
	save: { debounce_ms: 400 },
	persist: own => fetch("/save", { method: "POST", body: JSON.stringify(own) }),
});

s.get("volume");          // 5 (the default; no override yet)
s.set("volume", 8);       // own override, "change" fires, persist is scheduled
s.own;                    // { volume: 8 } — plain, JSON-safe
s.render();                // a View: one row per field
```

## Structure

- `Settings.js` — `class Settings extends Events(Object)`. `get(key)` reads `own[key]`, else `defaults[key]`. `set(key, value)` stores the override, or removes it when it equals the default, emits `"change"` `(key, value, group?)`, and schedules `persist` per the save policy. `own` is `{...own overrides}`, plus one entry per group that has overrides of its own. `load(obj)` replaces every override (an unlisted key goes back to the default) and emits `"change"` per key that actually moved — it never persists, because a session opening is not a user edit. `reset()` is `load({})` followed by `save()`. `make_default()` folds `defaults + own` into the new `defaults`, clears `own`, persists, and returns the merged object — the caller (one level up) is the one that stores it as the new default.
- **Save policy** (`save:` in the constructor): `"each"` persists on every `set`; `{ debounce_ms }` (the default, 400ms) waits for a quiet gap, using an injectable `clock` (`{setTimeout, clearTimeout}`, for tests); `"manual"` persists only when `save()` is called. `reset()` and `make_default()` always persist immediately, regardless of policy.
- **Groups** (`groups: { dictate: {...}, recite: {...} }`) make `s.dictate` / `s.recite` a child `Settings` (its own `save: "manual"`, since the parent is what actually calls `persist`). A group's `"change"` bubbles to the parent as `(key, value, "dictate")` and schedules the parent's persist; the parent's `own` includes `{dictate: {...}}` only while that group has an override.
- `render()` — a View, one row per field by type (`toggle`, `slider`, `number`, `select`, `text`): a slider shows its `low`/`high` end texts and the live value; a select shows the chosen option's `help` text underneath. A field's `path` (e.g. `Interrupt.threshold`), if given, is shown in small type under its label. A `level` string, if given, is shown as a line above the rows. Checked in a browser, not in the node tests.
- `Settings.test.mjs` — 13 tests, `node public/framework/core/Settings/Settings.test.mjs`.

## Who reads this next

- `core/Session` — a session's chat settings (`session.settings`), one line `{"settings":{"recite": {...}}}` per changed group, replayed with a shallow merge (later line wins per top-level key). Not built here.
- The Chat settings panel — draws `s.render()`. Not built here.

## Watch out

- `set`/`load` compare against the default with `JSON.stringify`, so two different objects with the same shape count as equal (an override is dropped) — fine for plain field values, not for anything that needs identity.
- A group's own `save` policy is forced to `"manual"`: only the parent's policy and `persist` actually run. Calling `save()` on a group directly is a no-op (it has no `persist_fn`).

## More

[Try it live](/framework/core/Settings/) — a toggle, a slider with end texts, a number, a select with help text, two groups, and the live `own` JSON beside it.
