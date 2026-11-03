# Binding doc — brief

Deliverable: `public/framework/core/Page/doc/binding.md`, linked from `core/Page/readme.md` and `core/Page/doc/templates.md`.

Read first: [owner-notes-3.md](../owner-notes-3.md) (the source; every point in it is a numbered deliverable), [plan.md](../plan.md) (decisions 1-12), and the slice built in worktree/qf-2 (merging into michael/dev now): `core/Property/Property.js` (+ `Property.test.mjs`), `core/Page/Template/Template.js`, `core/Page/doc/templates.md`, `core/Item/Item.js`, `core/Events/Events.js`.

The doc decides, for each owner point, with the alternative named:
1. Events and cleanup: who unbinds what, when a view is dropped or a clone dies.
2. Linked vs hard-copy clones: per-property overrides, and `reset(name)` back to the linked value.
3. Property optional vs Item events: when a field is a plain value, when a Property, when Item's `change` is enough.
4. `class Field extends Property`: what it adds (name, type, owner), whether to build it now.
5. Measure, don't guess: a node script (in this task's `binding/` folder) that builds a 1,000-row grid of clones with a few bound fields and prints time to create, time to update one shared value, listener count, and memory before/after drop. Compare Property vs Item `change` vs plain re-render. Put the numbers in the doc.
6. Paths (`a.b.c`) and `={expr}` expressions: design note only, marked "later".

Rules: plain readme voice for new coders (CLAUDE.md law 2); short sections, class names and signatures as code; no new npm deps. If a test proves a slice bug, add a failing check to `Property.test.mjs` and fix it, committing each step. Work in a pool worktree, commit with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, check_page `/framework/core/Page/doc/binding.md`'s page, then report back with the commits and the measured numbers. Log to ../task.jsonl.
