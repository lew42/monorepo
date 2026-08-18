---
name: code
description: Load once per session before writing or editing JS under public/ — the lifecycle of a task, house style (assign-based OOP, every method a seam, parts as static subclasses), and the traps that never throw. Reference skill; reload only after a long gap. Companions it will remind you of — new-task, layout, css, new-css-class, new-page, documentation, finish-task.
---

# Code

No bundler, no build, no transpile — `public/` runs in the browser as native ESM, and the
thesis is that you can read a class top to bottom and know what happens. Three laws
(CLAUDE.md): less is more, clarity is the exception, prioritize.

## The lifecycle — and when each skill loads

1. **`new-task`** before the first edit.
2. **Rough it in JS first** — views and page shape, no CSS yet. Fine to see it ugly.
3. **`layout`** before the first factory call of anything with a size — what container,
   how big, its own layout, how many containers the page has. This is where pages go wrong.
4. **`css`** the moment you write CSS (it has you read `framework.css` itself);
   **`new-css-class`** for a new class name.
5. **Look at it** — 400 / 1280 / 1920 / 3440, headless or `ext/DesignTool` `analyze()`.
   Then cycle 3 → 4 → 5: rough, measure, refine. Two passes is normal.
6. **`documentation`** once decisions are made — readme (index), page.js (show), `doc/`.
7. **`finish-task`** to land it on the board.

## 1. Capturing is synchronous — never build DOM after an `await`

`View.captor` is one global with a push/pop stack, restored the instant your function
*returns* — for an `async` function, its **first `await`**. Elements built after that land
somewhere else. Nothing throws. **Mechanical check: a factory call textually after an
`await` is wrong.** Capture the box now, fill it in a callback (a callback re-establishes
the captor); returning a promise is the other blessed form.

```js
previews(){
    return div.c("page-previews", async ($previews) => {
        const children = await Promise.all(names.map(n => this.child(n)));
        $previews.append(() => children.forEach(c => c.preview()));   // captor is $previews again
    });
}
```

## 2. A module is a class; every method is a seam

Lean into OOP: behaviour lives in methods, so any piece can be cherry-picked or overridden
by a subclass without editing the file. Loose functions that only see each other can only
be forked. Every constructor is assign-based — copy exactly:

```js
constructor(...args){ this.assign(...args); }
assign(...args){ return Object.assign(this, ...args); }
```

`...args`, never named parameters or a `config`; defaults on the prototype; later args win
(`new Router(this.router, { app: this })`). What the caller knows arrives by assign; what
only the container knows arrives by **adoption** (`child.parent = this`). A `page.js` never
mentions `app` or `parent`. **Never read `window.app` inside `framework/`** — it is undefined
during boot; take the app as an arg, read `this.app`. Derive inside the class, idempotently
(`this.title ??= this.name`), never at the call site.

## 3. Parts are classes — hang them on the constructor

If a class needs several things, give the thing a class. Even when there is exactly one
`ThingManager` today, the unique case shows up later and wants somewhere to live. More
classes, not more files — a part lives in its owner's file until the file has a real reason
to split.

**Attach parts as statics and they inherit.** `extends` copies the static side too, so a
whole machine travels down the chain:

```js
List.View = class ListView extends View { … };

Sortable.List = class SortableList extends List { … };
// Sortable.List.View === List.View — inherited, nothing to wire

Sortable.List.View = class SortableListView extends List.View { … };
// only Sortable's branch has the sortable view; List.View is untouched
```

Import the part you need and its sub-machines come with it. Inside a method, reach the part
through the **live** class, never the lexical name:

```js
row(item){ return new this.constructor.View({ item }); }   // a SortableList builds SortableListView
```

`new List.View(…)` hard-codes the base and no subclass can ever replace it;
`this.constructor.View` resolves per branch at runtime (in a static method it is just `this.View`).

## 4. Names

- If it does work, it's a method: `page.chain()`, not a getter. A getter only aliases state.
- Say a new name out loud first. Short and exactly right beats long and complete. Propose
  before adding a name to `View`/`Page`/`App`/`Router`/`Sidebar`.
- A dir and file named after the class they export are PascalCase (`ext/Panel/Panel.js`,
  `core/Page/Page.css`); everything else lowercase. `$prop` after the class it carries
  (`this.$sidebar_inner` ↔ `.sidebar-inner`).
- The base API covers most cases with no config; beyond that is an override or subclass,
  opted into by the file that wants it. An option is API surface forever.

## 5. Page — the blessed shape

```js
import { Page, p } from "/app.js";
export default new Page({ meta: import.meta, title: "Text", children: "intro guide", content(){ p("Body."); } });
```

Dormant until placed; `children` are names in nav order, auto-imported; imports flow
**down**, `.parent` points **up** — never both. `new-page` has the rest.

## 6. CSS — invoke `css`

Write as little CSS as possible; a component starts with no stylesheet. `css` first, then
`new-css-class` for a name. Not restated here.

## 7. Failures that never throw

- A page method named `render()` collides with core `render()`. `draw()`, `report()` are free.
- Mutual parent/child imports break only on deep reload. Imports down, adoption for the backref.
- Chaining onto `code.js()` **in argument position** is discarded — `.ac()`, `.on()` lost. Use the capture form.
- `classify()` runs inside `super()`; a `classes = "x"` field arrives too late — name the subclass.
- Resolve urls against `import.meta`; the SPA fallback makes the document url the route.
- Only `p()`/`h1`–`h6` read backticks; a backtick inside `` css(`…`) `` kills every page.
- A stylesheet that 404s resolves and warns — check the console. Windows: `pkill` matches nothing.

## 8. Before you add anything

No npm dependency (`npx`/global tools fine). No black magic — a file that names a class
constructs it. Propose before major surgery. Comments near zero.

**Try** to keep a file under ~100 lines — a signal to look, not a rule. Past it, ask whether a
logical piece wants to be its own class (§3); split only when the seam is real. Never halve a
file to hit a number, and 500 lines that belong together are fine — the old hard 100 is why
modules here carry 5–20 sub-files where another class in the same file was the answer.

Demos use the five blocks (Page, `previews()`, `ext/demo`, `ext/layout`, utilities) — a sixth
is a proposal. A new module isn't done until it has a `page.js` its parent's `children:`
names. `core/new/1/` is prior art with measurements — read, never import.

Improve this skill: append to [`improvements.md`](improvements.md).
