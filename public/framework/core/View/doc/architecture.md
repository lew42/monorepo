# View architecture — one chainable wrapper per element, filled by capture

View wraps one DOM element with chainable methods. Every HTML tag is a factory (`div`, `p`, `button`…) that makes a View; a function passed to a factory is the *capture* fn, and anything built inside it lands in that element. Main class: [`View.js`](./../View.js). Model: [`capturing.md`](./capturing.md); order of work: [`lifecycle.md`](./lifecycle.md).

## Capture is synchronous

**Decided:** `append_fn` makes the view the captor, runs your function, and restores the previous captor the instant the function returns.
**Why:** one global captor with a push/pop stack is the whole mechanism, so it can only follow code that runs in one turn.
**Instead:** capture across an `await` drops every later element into whatever captor is current (usually `$app`), and nothing throws. Capture first, then fill in a callback, or return a promise.
**Detail:** [`capturing.md`](./capturing.md)

## `append()` decides by type

**Decided:** `append(x)` branches on what `x` is: a View, a renderable, an array, a function, a promise, or anything else. There is no `mode` option.
**Why:** the type already says what the caller meant.
**Instead:** `append(x, { mode })` was rejected as a second way to say the same thing.
**Detail:** [`method/append.md`](./method/append.md)

## Factories are named exports, not a Proxy

**Decided:** every tag is a named export made by a plain `const` destructure.
**Why:** a typo like `dvi("x")` fails loudly at import. Through a Proxy it would silently create a `<dvi>` element.
**Instead:** a Proxy, which accepts any name.
**Detail:** [`method/elements.md`](./method/elements.md)

## Only `p` and `h1`–`h6` read backticks

**Decided:** those seven factories send their string arguments through `backticks()`, so `` `code` `` becomes `<code>`. Every other factory appends strings raw.
**Why:** prose tags carry the text of a page; the other tags are often given raw markup or labels, where backtick parsing would surprise.
**Instead:** backtick parsing everywhere, which breaks any string containing a backtick, such as one inside a `css()` template.
**Detail:** [`method/backtick_append.md`](./method/backtick_append.md)

## Subclass classes are named, not declared as fields

**Decided:** `classify()` reads the class name (or a constructor argument) to set the element's class. It runs inside `super()`.
**Why:** `super()` runs before a subclass's class fields are set, so `classes = "docs"` as a field arrives too late.
**Instead:** a `classes` field on the subclass, which silently does nothing.
**Detail:** [`method/classify.md`](./method/classify.md)

## Listeners are bound to the view and cannot be removed

**Decided:** `on(event, cb)` calls `cb` with `this` bound to the view, so handlers use `function`, not arrows. There is no listener registry.
**Why:** `on()` adds a wrapper arrow to the DOM, so the DOM can only remove a listener by the reference `on()` never returns. A registry would be memory that has to be kept in step with the DOM.
**Instead:** to be able to remove a handler, keep your own reference and call `el.addEventListener` directly.
**Detail:** [`method/on.md`](./method/on.md)

## Getter or setter by whether a value was passed

**Decided:** `attr(name, value)` reads when called with fewer than two arguments, and writes otherwise. A nullish value writes nothing and stays chainable, so an optional url or label needs no guard.
**Why:** a getter that returns a string mid-chain breaks the chain.
**Instead:** testing whether the value differs from the current one, which returned a string when the value was equal.
**Detail:** [`method/attr.md`](./method/attr.md)

⚠ `text()` and `html()` do not use arity. `html(value)` tests `is.def(value)`, so `html(null)` or `html(undefined)` *reads* the markup instead of writing. Only `attr()` is arity-based. See [`method/html.md`](./method/html.md).

## Markup goes through `html_unsafe`, never `html`

**Decided:** `html_unsafe(v)` sets `innerHTML`. `html(v)` uses `Element.setHTML` when the browser has it, and otherwise writes `v` as text, with a console warning.
**Why:** the same `html(v)` call shows markup in one browser and angle brackets in another. The explicit name makes the trust decision visible at the call site.
**Instead:** `html()` with sanitizing only, which hides the text fallback.
**Detail:** [`method/html.md`](./method/html.md)

## Style: custom properties use `setProperty`

**Decided:** `style()` calls `setProperty` for any `--x` name and assignment for the rest.
**Why:** `el.style["--x"] = v` silently does nothing; only `setProperty` works for custom properties.
**Instead:** plain assignment, which fails silently for `--x`.
**Detail:** [`method/style.md`](./method/style.md)

## Hide and show write inline styles

**Decided:** `hide()` and `show()` set `style.display`; `toggle()` reads the computed `display` first.
**Why:** a view hidden by CSS must still toggle to visible on the first call.
**Instead:** a `.hidden` class, which is the cleaner option but has not been applied (see the proposals in [`decisions.md`](./decisions.md)).
**Detail:** [`method/toggle.md`](./method/toggle.md)

## Stylesheet promises always settle

**Decided:** `View.stylesheet()` pushes a promise into `View.stylesheets`, and that promise resolves on `error` as well as `load`.
**Why:** `App` awaits every stylesheet promise. A 404'd `<link>` fires `error`, not `load`, so a promise that only resolves on `load` leaves the page permanently blank. A failed sheet resolves unstyled, not down.
**Instead:** a promise that rejects on error, which would stop the whole page.
**Detail:** [`method/stylesheet.md`](./method/stylesheet.md)

## What View deliberately does not have

**Decided:** no `prepend`, `replace`, `clone`/`repeat`, `off`, `insert`/`index`, `buffer`/`flush`, registry, or module-level `append()`/`load()` exports.
**Why:** each had no caller in `public/`, and some could not work: `off()` cannot remove a listener `on()` added, and `repeat()` discarded every clone it made.
**Instead:** `append()` into a container you placed first, which is the only meaningful way to build captured content in order.
**Detail:** [`decisions.md`](./decisions.md) (the full list of removed members)
