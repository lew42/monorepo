---
name: code
description: Load once per session before writing or editing JS under public/ — the lifecycle of a task, house style (assign-based OOP, every method a seam, parts as static subclasses), and the traps that never throw. Reference skill; reload only after a long gap. Companions it will remind you of — new-task, layout, css, new-css-class, new-page, documentation, finish-task.
---

# Code

Read the directory's readme index first — it lists what exists — before working with anything in that directory.

No bundler, no build, no transpile — `public/` runs in the browser as native ESM, and the
thesis is that you can read a class top to bottom and know what happens. Three laws
(CLAUDE.md): less is more, clarity is the exception, prioritize.

**Every process you start is hidden.** Node: `windowsHide: true` on every `spawn`, `exec`,
`execFile` and `fork`, detached included. PowerShell: `Start-Process -WindowStyle Hidden`, with no
`-Redirect…` flags. Check that `MainWindowHandle` is `0`. Visible windows popping up in front of the
owner broke his work three times in four days.

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

**Every choice you make between alternatives is a `decision` line in your `task.jsonl`** — the
question, the options you really considered, the one you chose, why, and the rule
(`code#<section>`) that produced it — so the owner can Approve or Improve it on your task's
Decisions tab, and an Improve comes back here as a line in [`improvements.md`](improvements.md).
Shape and example: [`ext/JSONL`](/framework/ext/JSONL/).

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
- **A new class or public method gets its name recorded**, so the ⋯ beside it on the Docs API tab
  shows how the name was chosen. If the name is still open, run a names vote
  (`node Server/collab.mjs <taskdir>` with `target: {module, class}`). If the name was given,
  append one `{"named":{module, class, member, kind, decision: "owner"}}` line to
  `public/framework/ai/collab/decisions.jsonl`. The format is in
  `ai/2026-09-28/collab-rounds/collab-format.md`.
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

Each entry is the trap and the check, in that order. Where a link follows, the incident that taught it — the measurement, the symptom, the file — is in that task's log; where no link follows, the story is only here, so it is written out.

**Names that collide with core.** Core reads fields off your page and calls methods on it, so a name you invent can quietly replace one of its own.

- A page method named `render()` collides with core's `render()`. `draw()`, `report()` are free.
- **The constructor calls three of core's own methods before your `initialize()` runs** — `Page` does `assign() → naming() → declare() → initialize()`. A page method named `naming()` (the natural name for "the naming controls") replaced core's url/name/title deriver, ran against state `initialize()` had not created yet, and 404'd the WHOLE PAGE with a console error naming neither the method nor the collision; `chips()`, which `Paging`'s `dress()` calls on every column render, did the same thing the same session. Grep the constructor's own call chain before naming a page method, not just `Page.nav()`'s fields (2026-09-05).
- **`View` owns `text()`, `toggle()`, `show()`, `hide()`, `html()`, `click()` and `on()` as METHODS**, and shadowing one never warns — a state field `this.text ??= ""` silently never writes (a function is never nullish), a data field `on: true` shadows the event binder and breaks every row on the PARENT page. `classify()` also reads `this.name` back as a CSS class.
- **`card` `label` `icon` `description` `classes` `topic` `topics` `width` `index` `leaf` `src` `depth` are DATA core reads off a page.** A page METHOD by any of those names dies three frames away in core (`arg.split is not a function`), on the PARENT page. Grep `Page.nav()`'s fields before naming one.
- **A new method on `Page`/`View`/`App` is a new reserved word for every page's config** — `Object.assign` copies a page's fields over the prototype, so a core `words()` method was silently replaced by 38 pages declaring `words: "flex gap"`. Before adding one: `grep -rn "<name>:" public --include=page.js`, then crawl every page, not six.
- **`classify()` runs inside `super()`**, so a `classes = "x"` field arrives too late — name the subclass. It also adds a class for EVERY constructor in the chain, so a subclass named after a layout word — `Rail`, `Wall`, `Stage`, `Solo`, `Card`, `Grid`, `Flex`, `Page` — silently wears that CSS. Prefix it (`PlaygroundRail`) and treat the name as a `new-css-class` census like any other.
- **`export { A, B } from "./x.js"` is a pass-through, not a binding** — it publishes the names without putting them in the module's OWN scope, so code in the same file reading `A` throws `A is not defined` at import time ([graduate-3](/framework/ai/2026-09-06/graduate-3/)).

**The ambient captor.** `View.captor` is one global with a push/pop stack. Every factory call appends into whatever captor is current, so a wrong shape builds the right element in the wrong place and nothing throws. This family has cost more retries than any other here.

- **A captured callback's RETURN VALUE is appended too, and that second append MOVES the element to the end.** `div.c("row", () => chip(x))` appends the chip twice; `$p => this.regions.set(name, $p)` painted a literal `[object Map]`. End a builder callback in a statement (`() => { chip(x); }`), never an expression, unless you mean to append what it returns. Read this one hard — it was still written 8 times in one file after being read once.
- **A factory called as a BARE STATEMENT outside any capture callback** appends into whatever captor is left over from wherever the code last ran; one specimen rendered the literal text `"() => $grip"` ([devbar-chat](/framework/ai/2026-09-19/devbar-chat/)).
- **Passing the captor view you are already inside as an ARGUMENT to a sibling factory** (`h2($c, card.title)`) throws `The new child element contains the parent`. Call factories bare inside a capture callback and only READ the callback parameter ([card-replies](/framework/ai/2026-09-19/card-replies/)).
- **`$row = div.c("x").append(() => acts($row))` runs the callback SYNCHRONOUSLY** inside the statement being assigned, so the closure reads `undefined`. Take the view from the callback (`.append($r => …)`), never from the variable that same statement is assigning ([page-cms](/framework/ai/2026-09-13/page-cms/)).
- **`.append(fn)` calls `fn.call(this, this)`** — a bare reference gets the View as its FIRST argument. Pass `() => fn(args)` to anything that takes parameters.
- **`View.style(obj, callback)` silently DROPS the callback** — the second argument is not a capture form. Style, then capture: `div.c("x", cb).style({…})`.
- **Chaining onto `code.js()` in argument position is discarded** — `.ac()`, `.on()` are lost. Use the capture form.
- **The bare factory chains `.c()` and nothing else** — `input().attr(…)` or `input.c("x").attr(…)`, never `input.attr(…)`; a bare element function is not a View at all until `.c()` or a direct call returns one ([imagine-research](/framework/ai/2026-09-04/imagine-research/)).

**Config fields that mean something narrower than they look** — and only a screenshot or a read of the rendered text catches any of them. `icon:` naming a glyph the icon font lacks paints an empty box ([notes-pages](/framework/ai/2026-09-06/notes-pages/)); `index: true` means "my own `content()` already draws my children" and SUPPRESSES core's child-link list ([pages-in-d1](/framework/ai/2026-09-17/pages-in-d1/)); `a({ href: url }, text)` does NOT set an href — the object is read as a named child-view slot — use `a(text).href(url)` ([verify-design](/framework/ai/2026-09-19/verify-design/)).

**Timing and lifecycle.**

- **An async gate started inside a page's own `content()` cannot resolve before the page is attached — so draw the FIRST time unconditionally.** A `rAF` or a promise scheduled during construction can fire before the framework attaches the subtree, leaving `$el.isConnected` false forever. Do NOT guard that first draw with `isConnected`: that guard belongs only on a later callback, and on the first draw it permanently blanks the honest, no-interaction case. Retry the measurement across a few frames instead ([approve-any-page](/framework/ai/2026-09-18/approve-any-page/)).
- **An async `load_all_children()` override must keep core's own guard** — carry `if (levels <= this.loaded) return this;` across, or a second call reads back the promise being assigned and throws **"Chaining cycle detected for promise"** from the microtask queue, with no file, no line and no stack naming your code.
- **A native `<details name="…">` fires its own `toggle` when `open` is set PROGRAMMATICALLY on a redraw**, not only on a real click — a handler shaped `if (e.target.open) redraw()` loops silently, measured at 7,384 rebuilds in 300ms with no console error and no stack overflow. Only redraw on a genuine state CHANGE, never on a toggle that restates the id already open.
- **A link carrying `#hash`/`?query` state is read wrong on a real in-app click** — `Router.go()` calls `pushState()` only AFTER the target module has read the OLD `location.hash`. Right on a direct `page.goto()`, silently wrong in the app; `target="_blank"` forces a real navigation ([paging-explorer](/framework/ai/2026-09-04/paging-explorer/)).
- Mutual parent/child imports break only on deep reload — imports down, adoption for the backref. Resolve urls against `import.meta`; the SPA fallback makes the document url the route.

**Blast radius — what takes the whole site down.**

- **Before you add a static import to any file that `Page.class.js` or `core/Page/Log.js` reaches, grep whether the new target imports `Page.class.js` back** (directly or through its own imports). If it does, load it with a dynamic `import()` inside the function that needs it. The cycle is invisible from the file you are editing, passes `node --check`, and throws `Cannot access 'Page' before initialization` on every page, so load a real page after the edit ([page-system](/framework/ai/2026-09-29/page-system/)).
- **A module reused across trees imports its cross-tree dependencies by ROOT-ABSOLUTE path** (`/framework/ext/Ask/stream.js`), never relative depth, and code built for one page is `await import()`ed lazily inside a `try`. `node --check` proves a file PARSES, never that its imports RESOLVE, and one `../` too few blanked the whole site for about 80 seconds. The reload hold does not cover this — it suppresses LiveReload to open tabs, not the health crawler loading a page fresh — so the check before a hold comes off is a real page load with zero failed requests ([dashboard-next](/framework/ai/2026-09-19/dashboard-next/)).
- **Only `p()`/`h1`–`h6` read backticks, and backticks are all they read** — so `**bold**` inside a `p()` prints the asterisks. A backtick inside `` css(`…`) `` kills every page, usually one in a `/* */` comment quoting a class name, and a literal `*/` typed as PROSE closes a block comment the same way. `.claude/hooks/syntax-guard.mjs` blocks the write that does it ([card-replies](/framework/ai/2026-09-19/card-replies/)).
- **An Edit that OPENS a capture callback must close it in the SAME Edit** — a two-step "open at the top, close at the bottom" leaves the file unparseable between the two calls, which on this no-build site is a live outage window. Build the whole span as one `old_string`/`new_string` pair, and import what it needs before the first of them ([review-3-days](/framework/ai/2026-09-22/review-3-days/)).
- **`View.html()` runs the browser's sanitizer and silently strips a bare `class` off an injected SVG child** — the rule targeting it then matches nothing and an unfilled `<path>` renders solid black. Raw markup the module itself wrote goes through `html_unsafe()` ([background-layer](/framework/ai/2026-09-19/background-layer/)).
- **A `Server/` plugin fired from a static "new" event must never assume its own host or a sibling has reached `initialize()` yet** — one that read a sibling's not-yet-set state passed `node --check` clean and crashed the child at every boot. Boot a `Server/` edit yourself (`PORT=<yours> node server.js`, then curl it) before it can reach anyone else's restart ([reload-hold](/framework/ai/2026-09-19/reload-hold/)).
- A stylesheet that 404s resolves and warns — check the console. Windows: `pkill` matches nothing.

**Layout and CSS that never throw.**

- **`flex-shrink` defaults to 1**, so a COLUMN of card-shaped flex items inside a height-capped ancestor squishes every card to a sliver instead of letting the ancestor's own `overflow-y: auto` scroll. `flex-shrink: 0` on the card by default for any flex-column card list ([devbar-chat](/framework/ai/2026-09-19/devbar-chat/)).
- **`@layer util` beats `@layer theme` regardless of selector specificity** — the layer order decides, not the selector, so a component's `.thing[hidden] { display: none }` can never beat a `flex` utility class in the same markup. Stop wearing the utility class and let the component own its display (at least the third time here, 2026-09-21).
- **A measured constant outlives the thing it was measured against.** A timeline spaced at 0.5em per minute was right for 90px cards and drew 93px of blank above a 16px one. When a layout's scale changes, the constants tuned to the old scale are wrong and silent (2026-09-21).
- **A rendered field and its plain-text preview are the same field** until one learns to render — card bodies started going through `md()` and every preview began showing raw `## heading` source. Anything the body learns to render, its preview has to learn to strip (2026-09-21).

**The tools themselves.**

- **In a Node test, set `process.env` first and then `await import()` the module that reads it.** Static imports run before every other line of the file, so a module constant like `Servex/home.js`'s `HOME` has already frozen on the real path; a green test then writes into the live Servex's logs (`Servex/agents/global.test.mjs` does it right, 2026-09-28).
- **Build any script or payload with the Write tool and then run it — never an inline heredoc.** Even a quoted `<<'PY'` dies mid-payload past a few lines ("unexpected EOF") having written nothing, and bash eats one backslash layer, so a `"\t"` arrives as a real TAB and a `\"` lands raw — an edit script's own match then fails silently. Appends to a `.jsonl` go through `node .claude/hooks/append.mjs`, which does the same job mechanically ([self-evident-critique-2](/framework/ai/2026-09-13/self-evident-critique-2/)).
- **`Edit`'s `old_string` must match real TAB characters, and past ~5 levels of nesting the Read tool cannot show you that** — its line-numbered output aligns tabs and spaces the same way, so a block retyped by eye silently produces a non-matching string and Edit fails with "not found" and no diff to compare against. Past that depth, read the file with a small script, confirm the real tab count against a literal tail (`JSON.stringify(src.slice(-N))`), and build the replacement with `"\t".repeat(n)` instead of retrying Edit (2026-09-08).
- **This repo has mixed line endings, and the file next door proves nothing** — `core/Page/Page.css` is CRLF while `core/Page/Page.class.js` beside it is LF, and an anchor hard-coded with LF fails on a CRLF file with exactly the "expected 1 match, found 0" a mis-typed anchor gives. Before building any anchor, read the file, count its CR-LF pairs, and join anchor lines with THAT file's own separator (2026-09-17).
- **The Bash tool's MSYS layer rewrites a unix-looking path argument before node sees it** — `node probe.mjs /websites/` delivered `C:/Program Files/Git/websites/`. Any url path or `--flag=/x` through Bash needs `MSYS_NO_PATHCONV=1` or a leading `//`. Its sibling: `rg`'s double-dash flags get mangled the same way and `rg` still PRINTS RESULTS from a silently unfiltered search rather than erroring — use the Grep tool instead ([spacing-census](/framework/ai/2026-09-17/spacing-census/)).
- **A python one-liner that opens a file for write and reads it in the same expression empties it first** — `io.open(p,"w").write(io.open(p).read())` truncates on the open, so the read returns `""` and the file lands at zero bytes: no error, no traceback, a shell that reports success. Always read on its own line, then write, and grep the file after every scripted edit (2026-09-18).
- Windows: `git mv` on a whole directory can EPERM while a file-watcher holds the dir handle — per-file `git mv old new` into a pre-made destination dir succeeds anyway.

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

## 9. OOP: a default view for any instance

Give any object a look with `view(thing)` (`ux/Content/Object/DefaultView.js`) — it
checks `thing.constructor.View` first (a plain static, so `Thing.View = class extends
DefaultView {...}` overrides it, and a subclass inherits its parent's automatically),
else falls back to `DefaultView`: a tree of `ui/item` rows, one per own property,
opened lazily so a big object graph costs nothing until clicked. A class opts its own
instances into being findable at all with `core/track/track.js`: `track(MyClass)`
once, then `MyClass.track(this)` — one line, in that class's own constructor — most
classes should skip this. Live: [the Object demo](/framework/ux/Content/Object/).

**Every new class ships a view of its state** (the owner, 2026-09-29: "I want to see as much of
the data as possible to start trying to understand the internal workings"). Show the essential
state in the simplest meaningful form, at more than one size:
- **icon:** one glyph for the whole object, with small flags that light up for on/off state (recording, connected, muted);
- **row:** the icon, the name and the one or two values that matter;
- **panel:** everything, opened on demand.
It applies to abstract classes too (an audio stream, a session, a queue), not just visible things.
The default view is the fallback; a class with real state earns its own `View`.

**Objects the owner sees** (ai-page, 2026-09-30; live example `public/framework/ai/objects.js`, `AIObject` with `Skill`, `Ask`, `Task`):
- Name the object first: a thing the owner sees (an agent, a task, a skill, an ask, a card) is a class with a noun for a name, one file, one job.
- The three views above are three METHODS, `chip()` (icon + name, inline), `row()`, `panel()`; the base class draws them, a subclass says only what it is (`static icon`, `static kind`) and what it knows (`name()`, `fact()`, `facts()`, `href()`), and replaces one view without touching the others.
- A page about an object renders a real instance from its real data, never a description of it.

Improve this skill: append to [`improvements.md`](improvements.md).
