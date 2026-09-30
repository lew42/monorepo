# The traps that never throw — full list

Each entry is the trap and the check, in that order. Where a link follows, the incident that
taught it (the measurement, the symptom, the file) is in that task's log; where no link follows,
the story is only here.

## Names that collide with core

Core reads fields off your page and calls methods on it, so a name you invent can quietly replace
one of its own.

- A page method named `render()` collides with core's `render()`. `draw()`, `report()` are free.
- **The constructor calls three of core's own methods before your `initialize()` runs** —
  `Page` does `assign() → naming() → declare() → initialize()`. A page method named `naming()`
  (the natural name for "the naming controls") replaced core's url/name/title deriver, ran against
  state `initialize()` had not created yet, and 404'd the WHOLE PAGE with a console error naming
  neither the method nor the collision; `chips()`, which `Paging`'s `dress()` calls on every
  column render, did the same thing the same session. Grep the constructor's own call chain
  before naming a page method, not just `Page.nav()`'s fields (2026-09-05).
- **`View` owns `text()`, `toggle()`, `show()`, `hide()`, `html()`, `click()` and `on()` as
  METHODS**, and shadowing one never warns — a state field `this.text ??= ""` silently never
  writes (a function is never nullish), a data field `on: true` shadows the event binder and
  breaks every row on the PARENT page. `classify()` also reads `this.name` back as a CSS class.
- **`card` `label` `icon` `description` `classes` `topic` `topics` `width` `index` `leaf` `src`
  `depth` are DATA core reads off a page.** A page METHOD by any of those names dies three frames
  away in core (`arg.split is not a function`), on the PARENT page. Grep `Page.nav()`'s fields
  before naming one.
- **A new method on `Page`/`View`/`App` is a new reserved word for every page's config** —
  `Object.assign` copies a page's fields over the prototype, so a core `words()` method was
  silently replaced by 38 pages declaring `words: "flex gap"`. Before adding one: `grep -rn
  "<name>:" public --include=page.js`, then crawl every page, not six.
- **`classify()` runs inside `super()`**, so a `classes = "x"` field arrives too late — name the
  subclass. It also adds a class for EVERY constructor in the chain, so a subclass named after a
  layout word — `Rail`, `Wall`, `Stage`, `Solo`, `Card`, `Grid`, `Flex`, `Page` — silently wears
  that CSS. Prefix it (`PlaygroundRail`) and treat the name as a `new-css-class` census like any
  other.
- **`export { A, B } from "./x.js"` is a pass-through, not a binding** — it publishes the names
  without putting them in the module's OWN scope, so code in the same file reading `A` throws `A
  is not defined` at import time ([graduate-3](/framework/ai/2026-09-06/graduate-3/)).

## The ambient captor

`View.captor` is one global with a push/pop stack. Every factory call appends into whatever
captor is current, so a wrong shape builds the right element in the wrong place and nothing
throws. This family has cost more retries than any other here.

- **A captured callback's RETURN VALUE is appended too, and that second append MOVES the element
  to the end.** `div.c("row", () => chip(x))` appends the chip twice; `$p => this.regions.set(name,
  $p)` painted a literal `[object Map]`. End a builder callback in a statement (`() => { chip(x); }`),
  never an expression, unless you mean to append what it returns.
- **A factory called as a BARE STATEMENT outside any capture callback** appends into whatever
  captor is left over from wherever the code last ran; one specimen rendered the literal text
  `"() => $grip"` ([devbar-chat](/framework/ai/2026-09-19/devbar-chat/)).
- **Passing the captor view you are already inside as an ARGUMENT to a sibling factory**
  (`h2($c, card.title)`) throws `The new child element contains the parent`. Call factories bare
  inside a capture callback and only READ the callback parameter
  ([card-replies](/framework/ai/2026-09-19/card-replies/)).
- **`$row = div.c("x").append(() => acts($row))` runs the callback SYNCHRONOUSLY** inside the
  statement being assigned, so the closure reads `undefined`. Take the view from the callback
  (`.append($r => …)`), never from the variable that same statement is assigning
  ([page-cms](/framework/ai/2026-09-13/page-cms/)).
- **`.append(fn)` calls `fn.call(this, this)`** — a bare reference gets the View as its FIRST
  argument. Pass `() => fn(args)` to anything that takes parameters.
- **`View.style(obj, callback)` silently DROPS the callback** — the second argument is not a
  capture form. Style, then capture: `div.c("x", cb).style({…})`.
- **Chaining onto `code.js()` in argument position is discarded** — `.ac()`, `.on()` are lost. Use
  the capture form.
- **The bare factory chains `.c()` and nothing else** — `input().attr(…)` or `input.c("x").attr(…)`,
  never `input.attr(…)`; a bare element function is not a View at all until `.c()` or a direct call
  returns one ([imagine-research](/framework/ai/2026-09-04/imagine-research/)).

## Config fields that mean something narrower than they look

Only a screenshot or a read of the rendered text catches any of them. `icon:` naming a glyph the
icon font lacks paints an empty box ([notes-pages](/framework/ai/2026-09-06/notes-pages/)); `index:
true` means "my own `content()` already draws my children" and SUPPRESSES core's child-link list
([pages-in-d1](/framework/ai/2026-09-17/pages-in-d1/)); `a({ href: url }, text)` does NOT set an
href — the object is read as a named child-view slot — use `a(text).href(url)`
([verify-design](/framework/ai/2026-09-19/verify-design/)).

## Timing and lifecycle

- **An async gate started inside a page's own `content()` cannot resolve before the page is
  attached — so draw the FIRST time unconditionally.** A `rAF` or a promise scheduled during
  construction can fire before the framework attaches the subtree, leaving `$el.isConnected` false
  forever. Do NOT guard that first draw with `isConnected`: that guard belongs only on a later
  callback, and on the first draw it permanently blanks the honest, no-interaction case. Retry the
  measurement across a few frames instead ([approve-any-page](/framework/ai/2026-09-18/approve-any-page/)).
- **An async `load_all_children()` override must keep core's own guard** — carry `if (levels <=
  this.loaded) return this;` across, or a second call reads back the promise being assigned and
  throws **"Chaining cycle detected for promise"** from the microtask queue, with no file, no line
  and no stack naming your code.
- **A native `<details name="…">` fires its own `toggle` when `open` is set PROGRAMMATICALLY on a
  redraw**, not only on a real click — a handler shaped `if (e.target.open) redraw()` loops
  silently, measured at 7,384 rebuilds in 300ms with no console error and no stack overflow. Only
  redraw on a genuine state CHANGE, never on a toggle that restates the id already open.
- **A link carrying `#hash`/`?query` state is read wrong on a real in-app click** — `Router.go()`
  calls `pushState()` only AFTER the target module has read the OLD `location.hash`. Right on a
  direct `page.goto()`, silently wrong in the app; `target="_blank"` forces a real navigation
  ([paging-explorer](/framework/ai/2026-09-04/paging-explorer/)).
- Mutual parent/child imports break only on deep reload — imports down, adoption for the backref.
  Resolve urls against `import.meta`; the SPA fallback makes the document url the route.

## Blast radius — what takes the whole site down

- **Before you add a static import to any file that `Page.class.js` or `core/Page/Log.js` reaches,
  grep whether the new target imports `Page.class.js` back** (directly or through its own
  imports). If it does, load it with a dynamic `import()` inside the function that needs it. The
  cycle is invisible from the file you are editing, passes `node --check`, and throws `Cannot
  access 'Page' before initialization` on every page, so load a real page after the edit
  ([page-system](/framework/ai/2026-09-29/page-system/)).
- **A module reused across trees imports its cross-tree dependencies by ROOT-ABSOLUTE path**
  (`/framework/ext/Ask/stream.js`), never relative depth, and code built for one page is `await
  import()`ed lazily inside a `try`. `node --check` proves a file PARSES, never that its imports
  RESOLVE, and one `../` too few blanked the whole site for about 80 seconds. The reload hold does
  not cover this — it suppresses LiveReload to open tabs, not the health crawler loading a page
  fresh — so the check before a hold comes off is a real page load with zero failed requests
  ([dashboard-next](/framework/ai/2026-09-19/dashboard-next/)).
- **Only `p()`/`h1`–`h6` read backticks, and backticks are all they read** — so `**bold**` inside a
  `p()` prints the asterisks. A backtick inside `` css(`…`) `` kills every page, usually one in a
  `/* */` comment quoting a class name, and a literal `*/` typed as PROSE closes a block comment
  the same way. `.claude/hooks/syntax-guard.mjs` blocks the write that does it
  ([card-replies](/framework/ai/2026-09-19/card-replies/)).
- **An Edit that OPENS a capture callback must close it in the SAME Edit** — a two-step "open at
  the top, close at the bottom" leaves the file unparseable between the two calls, which on this
  no-build site is a live outage window. Build the whole span as one `old_string`/`new_string`
  pair, and import what it needs before the first of them
  ([review-3-days](/framework/ai/2026-09-22/review-3-days/)).
- **`View.html()` runs the browser's sanitizer and silently strips a bare `class` off an injected
  SVG child** — the rule targeting it then matches nothing and an unfilled `<path>` renders solid
  black. Raw markup the module itself wrote goes through `html_unsafe()`
  ([background-layer](/framework/ai/2026-09-19/background-layer/)).
- **A `Server/` plugin fired from a static "new" event must never assume its own host or a sibling
  has reached `initialize()` yet** — one that read a sibling's not-yet-set state passed `node
  --check` clean and crashed the child at every boot. Boot a `Server/` edit yourself (`PORT=<yours>
  node server.js`, then curl it) before it can reach anyone else's restart
  ([reload-hold](/framework/ai/2026-09-19/reload-hold/)).
- A stylesheet that 404s resolves and warns — check the console. Windows: `pkill` matches nothing.

## Layout and CSS that never throw

- **`flex-shrink` defaults to 1**, so a COLUMN of card-shaped flex items inside a height-capped
  ancestor squishes every card to a sliver instead of letting the ancestor's own `overflow-y: auto`
  scroll. `flex-shrink: 0` on the card by default for any flex-column card list
  ([devbar-chat](/framework/ai/2026-09-19/devbar-chat/)).
- **`@layer util` beats `@layer theme` regardless of selector specificity** — the layer order
  decides, not the selector, so a component's `.thing[hidden] { display: none }` can never beat a
  `flex` utility class in the same markup. Stop wearing the utility class and let the component own
  its display (at least the third time here, 2026-09-21).
- **A measured constant outlives the thing it was measured against.** A timeline spaced at 0.5em
  per minute was right for 90px cards and drew 93px of blank above a 16px one. When a layout's
  scale changes, the constants tuned to the old scale are wrong and silent (2026-09-21).
- **A rendered field and its plain-text preview are the same field** until one learns to render —
  card bodies started going through `md()` and every preview began showing raw `## heading`
  source. Anything the body learns to render, its preview has to learn to strip (2026-09-21).

## The tools themselves

- **In a Node test, set `process.env` first and then `await import()` the module that reads it.**
  Static imports run before every other line of the file, so a module constant like
  `Servex/home.js`'s `HOME` has already frozen on the real path; a green test then writes into the
  live Servex's logs (`Servex/agents/global.test.mjs` does it right, 2026-09-28).
- **Build any script or payload with the Write tool and then run it — never an inline heredoc.**
  Even a quoted `<<'PY'` dies mid-payload past a few lines ("unexpected EOF") having written
  nothing, and bash eats one backslash layer, so a `"\t"` arrives as a real TAB and a `\"` lands
  raw — an edit script's own match then fails silently. Appends to a `.jsonl` go through
  `node .claude/hooks/append.mjs`, which does the same job mechanically
  ([self-evident-critique-2](/framework/ai/2026-09-13/self-evident-critique-2/)).
- **`Edit`'s `old_string` must match real TAB characters, and past ~5 levels of nesting the Read
  tool cannot show you that** — its line-numbered output aligns tabs and spaces the same way, so a
  block retyped by eye silently produces a non-matching string and Edit fails with "not found" and
  no diff to compare against. Past that depth, read the file with a small script, confirm the real
  tab count against a literal tail (`JSON.stringify(src.slice(-N))`), and build the replacement
  with `"\t".repeat(n)` instead of retrying Edit (2026-09-08).
- **This repo has mixed line endings, and the file next door proves nothing** — `core/Page/Page.css`
  is CRLF while `core/Page/Page.class.js` beside it is LF, and an anchor hard-coded with LF fails
  on a CRLF file with exactly the "expected 1 match, found 0" a mis-typed anchor gives. Before
  building any anchor, read the file, count its CR-LF pairs, and join anchor lines with THAT file's
  own separator (2026-09-17).
- **The Bash tool's MSYS layer rewrites a unix-looking path argument before node sees it** —
  `node probe.mjs /websites/` delivered `C:/Program Files/Git/websites/`. Any url path or
  `--flag=/x` through Bash needs `MSYS_NO_PATHCONV=1` or a leading `//`. Its sibling: `rg`'s
  double-dash flags get mangled the same way and `rg` still PRINTS RESULTS from a silently
  unfiltered search rather than erroring — use the Grep tool instead
  ([spacing-census](/framework/ai/2026-09-17/spacing-census/)).
- **A python one-liner that opens a file for write and reads it in the same expression empties it
  first** — `io.open(p,"w").write(io.open(p).read())` truncates on the open, so the read returns
  `""` and the file lands at zero bytes: no error, no traceback, a shell that reports success.
  Always read on its own line, then write, and grep the file after every scripted edit
  (2026-09-18).
- Windows: `git mv` on a whole directory can EPERM while a file-watcher holds the dir handle —
  per-file `git mv old new` into a pre-made destination dir succeeds anyway.
