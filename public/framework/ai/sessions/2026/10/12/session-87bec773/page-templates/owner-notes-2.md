# Owner notes 2 (2026-10-12): clone as a delta, prototype fallthrough, tests

- **Anything can become a template**, and does once it proves useful.
- **Clone as a delta:** besides `new SomeClass`, a user's duplicate button or alt-drag could append a delta that calls `clone`. Then any item can be modified procedurally. Untried; "seems pretty powerful if it could work properly".
- **Fallthrough via the prototype:** `Object.create` gives any number of fallbacks for free. Delete an override and it falls back to the parent's value.
  - If properties are `Property` instances in a map (name → Property), `Object.create` the map too, so a clone accepts its own overrides instead of writing changes into its prototype.
  - Whether each Property must also be cloned is open; work it out.
- **Get the OO right, and test it.** Check whether we have a testing system (the owner has gone back and forth on it). Write tests for clone, override, delete-falls-back and live binding.
- **Efficiency:**
  - With thousands of nested objects, don't build evented infrastructure for every property when most are static. Make a Property evented only when something is bound to it (lazy).
  - Batched DOM updates belong to [perf-system](../perf-system/requirements.md).
