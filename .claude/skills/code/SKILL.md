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
- `classify()` adds a class for EVERY constructor in the chain (`Rail extends Sidebar` → `.rail.sidebar`). A subclass named like a layout word — `Rail`, `Wall`, `Stage`, `Solo`, `Card`, `Grid`, `Flex`, `Page` — wears that CSS: a playground's `Rail` got Page.css's side-region shape (sticky, `align-self: start`, a 22em cap) and stopped 129px down, 2026-08-19; a `Stage` got `.stage`'s `container-type: inline-size; overflow: hidden` and shrank to 307px inside a 1546px frame, 2026-09-05. Prefix it (`PlaygroundRail`) — and note the name lands in the same namespace as the classes you type, so it is a `new-css-class` census like any other.
- Shadowing a `View` member never warns, and `render()` is not the only landmine: `View` owns `text()`, `toggle()`, `show()`, `hide()`, `html()`, `click()`, `on()` as methods — a state field `this.text ??= ""` silently never writes (a function is never nullish) and throws two rungs away (`this.text.trim is not a function`, ux/Filter 2026-08-21); a data field `on: true|false` shadowed `View.on()`, the event binder, and broke every row on the PARENT page three frames away (paging-clarity, 2026-09-04). `classify()` also reads `this.name` back as a CSS class — `new Chip({ name })` wore its tag text as a class (ux/Tags 2026-08-21).
- **The constructor calls three of core's own methods before your `initialize()` runs** — `Page` does `assign() → naming() → declare() → initialize()`. A page method named `naming()` (a natural name for "the naming controls") replaced core's url/name/title deriver, ran against state `initialize()` had not created yet, and 404'd the WHOLE PAGE: the console said `Page.load("…") — the file EXISTS but failed to load: TypeError: Cannot read properties of undefined` and named neither the method nor the collision. Same session, same shape: `chips()`, which `Paging`'s `dress()` calls on every column render. Grep the constructor's own call chain before naming a page method, not just `Page.nav()`'s fields (2026-09-05).
- **An async `load_all_children()` override must keep core's own guard.** A page whose children arrive from a fetch overrides `child()` and `load_all_children()` (the pattern in `cms/json/page.js`) — carry `if (levels <= this.loaded) return this;` across, because core returns `this` unchanged in that case WITHOUT touching `this.loading`, so a second call reads back the very promise being assigned and `p.then(() => p)` throws **"Chaining cycle detected for promise"** from the microtask queue: no file, no line, no stack that names your code. Four of them on one page load (2026-09-05, `/imagine/paging/doc/persistence.md`).
- Windows: `git mv` on a whole directory can EPERM while a file-watcher (the dev server) holds the dir handle — per-file `git mv old new` into a pre-made destination dir succeeds anyway (core/Page restructure, 2026-08-19).
- **A new method on `Page`/`View` is a new reserved word for every page's config.** `Object.assign` copies a page's fields over the prototype, so a page declaring `words: "flex gap"` silently replaced the `words()` method core gained on 2026-09-06 and 38 `styles/layouts/*` pages threw `this.words is not a function` — the byte-identical proof missed it because none of them was a control surface. Before adding a method, `grep -rn "<name>:" public --include=page.js`; before landing, crawl every page, not six.
- `View.style(obj, callback)` silently DROPS the callback — the second argument is not a capture form. Three note pages and two other agents built an empty box this way on 2026-09-06, and a clean four-width crawl cannot see it (an empty flex child overflows nothing). Style, then capture: `div.c("x", cb).style({...})`, or `.style({...})` on the returned view.
- Resolve urls against `import.meta`; the SPA fallback makes the document url the route.
- Only `p()`/`h1`–`h6` read backticks; a backtick inside `` css(`…`) `` kills every page — usually one in a `/* */` comment quoting a class name, and `.claude/hooks/syntax-guard.mjs` blocks the write that does it. A literal `*/` typed as PROSE inside a `/* */` block comment closes it the same way, same failure, three characters — a glob pattern (`mastermind-*/task.jsonl`) written in a sentence ended a comment three lines early and the rest became live code; syntax-guard caught it but named the wrong line (card-replies, 2026-09-19).
- A stylesheet that 404s resolves and warns — check the console. Windows: `pkill` matches nothing.
- `.append(fn)` calls `fn.call(this, this)` — a bare reference gets the View as its FIRST argument. `.append(hero)` on a `tone => view` band handed it a View where its tone goes; twelve specimens rendered the default surface, nothing threw. Pass `() => fn(args)`, never a bare reference, to anything that takes parameters.
- And the trap that follows from it: `$row = div.c("x").append(() => acts($row))` runs the callback SYNCHRONOUSLY inside the statement being assigned, so the closure reads `undefined` — `Cannot read properties of undefined (reading 'empty')` from a click handler one gesture later, and the button just did nothing (page-cms, 2026-09-13). Take the view from the callback (`.append($r => …)`), never from the variable the same statement is assigning.
- **A captured callback's RETURN VALUE is appended too.** `div.c("row", () => chip(x))` appends the chip twice (the captor, then the return — and the second append MOVES it to the end); `$p => this.regions.set(name, $p)` painted a literal `[object Map]`. A builder callback ends in a statement (`() => { chip(x); }`), never an expression, unless you mean to append what it returns (2026-08-27, 08-30). This is the same family — the ambient captor — as the two traps below: read it hard, it was still written 8 times in one file after being read once (list-shapes, 2026-09-18).
- **New: two more shapes of the ambient-captor bug above.** A factory (`div.c()`, `grip({...})`) called as a BARE STATEMENT outside any capture callback appends into whatever captor is left over from wherever the code last ran, and never throws — one specimen rendered the literal text `"() => $grip"` where a real element should have been. And passing the captor view you are already inside as an ARGUMENT to a sibling factory call (`h2($c, card.title)`, `p($o, opt.label)`) throws `Failed to execute 'appendChild': The new child element contains the parent` — inside a capture callback, call factories bare and only READ the callback parameter, never pass it to another factory (devbar-chat, card-replies, 2026-09-19).
- **The bare factory chains `.c()` and nothing else** — `input.attr("type", "text")` throws `input.attr is not a function` (three pages, two sessions, one day); it is `input().attr(…)` or `input.c("x").attr(…)`. Same shape one level up: a bare element function (`details`, `summary`, `div`...) is not a View at all until `.c(cls, ...)` or a direct call returns one — `details.append(fn)` throws `details.append is not a function` with no hint which call was wrong (imagine-research, 2026-09-04).
- **`card` `label` `icon` `description` `classes` `topic` `topics` `width` `index` `leaf` `src` `depth` are DATA core reads off a page** — `Page.nav()` returns `card: this.card` as the preview's classes, so a page METHOD by any of those names dies three frames away in core (`arg.split is not a function`), on the PARENT page. Before naming a Page method, grep `Page.nav()`'s fields and your own config keys (2026-08-30, three hits).
- **New: a config field can mean something narrower than it looks, and none of these throw.** `icon:` naming a glyph the icon font doesn't have paints an empty box (notes-pages, 2026-09-06); `index: true` means "my own `content()` already draws my children," not "show my children," and SUPPRESSES core's default child-link list (pages-in-d1, 2026-09-17); `a({ href: url }, text)` does NOT set an href — the object literal is read as a named child-view slot, not attributes, and silently renders a nested empty child instead — use `a(text).href(url)` (verify-design, 2026-09-19). Only a screenshot or a read of the rendered text catches any of the three.
- Even a quoted heredoc delimiter (`<<'PY'`) fails once the payload runs past a few lines — a python block died mid-write with "unexpected EOF while looking for matching quote" and nothing was written, while the same bytes written to a `.py` file with the Write tool and then run worked first try; the inline heredoc is for one-liners only (self-evident-critique-2, 2026-09-13). **A bash heredoc eats one backslash layer, so build the file with the Write tool instead.** Through the Bash tool a doubled `\\` arrives single: a python heredoc carrying `"\t"` is delivered as a real TAB, the old-string match then fails silently and the script dies on its own assert with nothing edited (three retries in one session, two different files), and a `\"` inside an UNQUOTED heredoc (`<<PY`) lands raw and broke `json.loads` at column 154. Anything whose payload holds a backslash, a quote or a regex — an edit script, a `.jsonl` line, a `ui-test` plan — is written with the **Write tool** (or `json.dumps`) and then run; if it must be inline, quote the delimiter (`<<'PY'`) and build the escape from `chr(92)`. Five tasks lost a retry apiece to this on 2026-09-04/05.
- **A new core method named after a plain noun collides with page state that already exists** — `Page.opens()` was shadowed by a page's `opens: 0` field and killed it. A new `Page`/`View`/`App` method gets its family's prefix, and `grep -rn "opens[:=]" public/` before naming (2026-08-27).
- **`Edit`'s `old_string` must match real TAB characters, and past ~5 levels of nesting the Read tool can't show you that.** Its line-numbered output aligns tabs and spaces the same way, so retyping a deeply-nested block by eye silently produces a non-matching string and Edit fails with "not found" and no diff to compare against. Past that depth, read the file with a small script, confirm the real tab count against a literal tail (`JSON.stringify(src.slice(-N))`), and build the replacement with `"\t".repeat(n)` instead of retrying Edit (`layouts/page.js`, two failed attempts, 2026-09-08).
- **The Bash tool's MSYS layer rewrites a unix-looking path argument before node sees it.** `node probe.mjs /websites/` delivered `C:/Program Files/Git/websites/`, not `/websites/` — the script was right, the argument was not, and every Playwright load then failed with "Cannot navigate to invalid URL". Any url path, docker path or `--flag=/x` passed through Bash needs `MSYS_NO_PATHCONV=1` on the call (or a leading `//`) — it bit two agents the same night, the same way (`/websites/`, then `/layouts/`, 2026-09-08). Its sibling: `rg`'s DOUBLE-DASH flags get mangled the same way through Bash on Windows — `-g "*.md"` and `--type md` both exit 2 with "the system cannot find the file specified," yet the command still PRINTS RESULTS, silently falling back to an unfiltered search rather than erroring — read the exit code, or better, use the Grep tool instead of fighting `rg` flags through Bash (spacing-census, 2026-09-17).
- **This repo has mixed line endings, and the file next door proves nothing.** `core/Page/Page.css` is CRLF while `core/Page/Page.class.js` beside it is LF — an exact-match edit script built with a hard-coded LF fails on a CRLF file with the same "expected 1 match, found 0" a mis-typed anchor gives. Before building any anchor, read the file, count its CR-LF pairs, and join anchor lines with THAT file's own separator (even-columns, 2026-09-17).
- **A python one-liner that opens a file for write and reads it in the same expression empties it first.** `io.open(p,"w").write(io.open(p).read())` truncates on the open, so the read returns `""` and the file lands at zero bytes — no error, no traceback, a shell that reports success. Always `s = read(p)` on its own line, then `write(p, s)`, and grep the file after every scripted edit (real-page-move, 2026-09-18).
- **An async gate started synchronously inside a page's own `content()` cannot resolve before the page is attached — so draw the FIRST time unconditionally.** A `rAF`, or a promise (a fetch, `ext/JSONL`'s `live()`), scheduled during construction genuinely can fire before the framework attaches the built subtree, leaving `$el.isConnected` reading false forever with no retry (proven by instrumenting every call: shapes that redrew later eventually read `true`, a cold load with zero interaction never did). The fix is NOT an `isConnected` guard on that first draw — that guard belongs only on a LATER callback that can fire after the page may genuinely have left (a `watch()`-style update). Guarding the first draw the same way permanently blanks the honest, no-interaction case. Retry the measurement across a few frames instead (list-shapes, approve-any-page, 2026-09-18).
- **`export { A, B } from "./x.js"` is a pass-through, not a binding** — it publishes the names without putting them into the module's OWN scope, so code in the SAME file that reads `A` throws `A is not defined` at import time, the same silent-whole-realm shape as the `render()`/`naming()` collisions above (graduate-3, 2026-09-06).
- **A link into a page carrying `#hash`/`?query` state is read wrong on a real in-app click.** `Router.go()` calls `history.pushState()` only AFTER the target module has already constructed and read the OLD `location.hash` — works on a direct `page.goto()`, silently wrong on an in-app click; `target="_blank"` avoids it by forcing a real navigation (paging-explorer, 2026-09-04).
- **`View.html()` runs the browser's sanitizer and silently strips a bare `class` off an injected SVG child element** — the CSS rule targeting that class then matches nothing and the element falls back to its tag default (an unfilled `<path>` renders solid black), and nothing throws or warns. Raw markup the module itself wrote (never user input) goes through `html_unsafe()`, which skips the sanitizer, never `html()` (background-layer, 2026-09-19).
- **A native `<details name="...">` shared by several elements fires its own `toggle` event when `open` is set PROGRAMMATICALLY on a fresh redraw, not only on a real click.** A handler shaped `if (e.target.open) redraw()` (redraw rebuilds the same `<details>`, `open` gets set again, `toggle` fires again) loops silently — measured 7,384 rebuilds in 300ms, no console error, no stack overflow. Only redraw on a genuine state CHANGE, never on a toggle that just restates the id already open (list-shapes, 2026-09-18).
- **A `Server/` plugin fired from a static "new" event must never assume its own host or a sibling has reached `initialize()` yet.** `node --check` only proves the file PARSES, not that it BOOTS — a plugin that read a sibling's not-yet-set state (`this.socket_server.sockets`) passed the check clean and crashed the child at every boot, taking a supervised server down for real. Boot a `Server/` edit yourself — `PORT=<yours> node server.js`, then curl it — before it can reach anyone else's restart (reload-hold, 2026-09-19).
- **`flex-shrink` defaults to 1** — a COLUMN of card-shaped flex items inside a height-capped or viewport-relative-height ancestor squishes every card to a sliver instead of overflowing and letting the ancestor's own `overflow-y: auto` scroll. Hit twice, same day, two different files (81 real cards collapsed to 0.3px in one; 38px-tall cards overprinting their neighbor in the other). `flex-shrink: 0` on the card by default for any flex-column card/row list, not as an afterthought once it breaks (devbar-chat, 2026-09-19).
- **A shared module statically imported by something every page loads (`DevBar`) has sitewide blast radius.** A relative import miscounted by one `../` in a brand-new file is invisible in the diff and in `node --check` (which only proves the file parses, not that its imports resolve) — it 404'd silently and blanked the WHOLE SITE for about 80 seconds once the dev bar's own always-loaded import chain pulled the new module in (dashboard-next, 2026-09-19). Two standing fixes: a module reused across trees imports its cross-tree dependencies by ROOT-ABSOLUTE path (`/framework/ext/Ask/stream.js`), never relative depth, so it cannot break by miscounting `../`; and code built for one page only is `await import()`ed LAZILY inside a `try`, so a fault there costs only that section, never the whole rail. The reload hold does not prevent this — it only suppresses LiveReload to tabs already open, not the site's own health crawler re-loading a page fresh; the real check before a hold comes off is an actual page load with zero failed requests, not just `node --check`.
- **`@layer util` beats `@layer theme` regardless of selector specificity — the layer order decides, not the selector.** A component's `.thing[hidden] { display: none }` written in the theme layer could never beat a `flex` utility class also present in the markup; the element drew as an empty 35px card. The fix is to stop wearing the utility class and let the component own its own display — this is at least the third time a util-layer class has silently beaten component CSS here (2026-09-21).
- **A rendered field and its plain-text preview are the same field — until one of them learns to render and the other doesn't.** Card bodies started running through `md()`; a rail preview reading the same `c.text` had no renderer, so every preview began showing raw `## heading` and `[label](url)` markdown source instead of the rendered text. Anything the body learns to render, its preview has to learn to strip (2026-09-21).
- **A measured constant outlives the thing it was measured against.** A timeline spaced cards at 0.5em per minute, capped at 6em — correct when every row was a ~90px card. Once rows became 16px one-liners, a quiet twelve minutes drew 93px of blank space above a 16px row and only three rows fit a screen; nothing broke, the number just silently stopped meaning what it was tuned to mean. When a layout's scale changes, the constants tuned to the old scale are now wrong and silent (2026-09-21).

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
