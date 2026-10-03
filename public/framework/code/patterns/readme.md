# Patterns — the shape of a module

The framework's house style: a small set of shapes, used everywhere, so any file can be read top
to bottom and understood. Full detail, with the worked examples: [the Patterns page](/framework/code/patterns/).

## Index

- Capturing is synchronous
- A module is a class; every method is a seam
- Parts are classes, hung on the constructor as statics
- Names
- The blessed page shape — the code is shown on [the Patterns page](/framework/code/patterns/), section 5

## Use

Copy the assign-based constructor exactly:
```js
constructor(...args){ this.assign(...args); }
assign(...args){ return Object.assign(this, ...args); }
```
`...args`, never named parameters or a `config` object; later args win.

**Parts as statics:** a class carries its parts, so one import brings them all:
```js
List.View = class ListView extends View { }   // list.View and ListView are the same class
new this.constructor.View({ list: this })      // use the part through the constructor…
class MyList extends List { static View = class extends List.View { } }   // …so a subclass swaps it
```

**Folder, file and class share one name** (the owner, 2026-10-02): `ext/JSONL/JSONL.js` exports `class JSONL`; `core/Task/Task.js` exports `class Task`. The same capitalisation everywhere, and the capital letter says "this is a class". Allowed: a subclass defined inside the main file (`TaskJSONL` in JSONL.js), or a part in its own capitalised file in the same folder (`Inbox/Rail.js` → `Inbox.Rail`). A lowercase file or folder (`objects.js`, `rail.js`, `ext/drawer/`) holds functions, helpers or views, never a class someone will search for. **Census:** `node public/framework/code/patterns/class-census.mjs` lists every mismatch (81 on 2026-10-02: ai/objects.js, ai2/*.js, ext/drawer/rail.js, ext/AITask/nested.js, core/Page/Page.class.js…). Fix a module's mismatches whenever you work in it.

**Naming a part's instance:** the property is the class name, lowercased: `inbox.rail` holds an `Inbox.Rail`, `item.store` a `Store`, `x.view` a `View`. Never `inbox_rail`. (the owner, 2026-10-02)

**One source of truth:** keep each fact in ONE place and look it up by reference (a page's `icon` lives on the page; every nav row, card and mention reads it from there). A copy you have to keep in sync needs a stated reason (measured speed, or offline use) written beside it. (the owner, 2026-10-02)

**Every class module's readme opens with `## Architecture`:** a code block with the class's shape, properties first, then the main methods, `[X]` for an array, and its parts and submodules. It's the ONLY copy (no duplicate guide), and whoever changes the class updates it.

## Watch out

- **Capturing is synchronous** — a factory call written after an `await` appends to the wrong
  place, and nothing throws. Capture the container first, fill it in a callback.
- **A page method named `render()` collides with core** — `draw()` and `report()` are free names.
  The full list of names core already owns is on [dos-and-donts](../dos-and-donts/).

## More

- Full detail, with the worked examples: [the Patterns page](/framework/code/patterns/)
- [dos-and-donts](../dos-and-donts/) — the traps these patterns exist to avoid
- [objects](../objects/) — the view every class ships once it has real state
