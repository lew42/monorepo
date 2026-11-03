One class, 41 methods, 10 properties, one page — every element factory on the site
(`div`, `p`, `h1`…`h6`, `button`, `a`, and ~55 more) is generated here and
destructured into a named export at the bottom. `View` is what a `Page` is built
out of, and importing it is what fixes `framework.css` into the document.

## The constructor pipeline

`assign → prerender → initialize → render`, and every subclass on the site takes
all four with no constructor of its own. Full account, with the three class-field
traps hiding in it: `doc/lifecycle.md`.

## Two module exports that are not class members

`icon(name)` (`View.js:469`) and a re-export of `is` (`View.js:474`) live here
because `elements()` and `is` are the two things every factory-writing file needs.
Neither can have a rail entry — they are not on `View` or its prototype.

## The load-order trick has moved to app.js

`stylesheet()` (`View.js:378`) builds a `View`, which runs `append_fn`, which
pushes onto `View.previous_captors` — so calling it before this file finishes
loading throws on an undefined array. The framework.css call itself no longer
lives in this file: it's `App.stylesheet("/framework/framework.css")` at
`public/app.js:14`, a thin wrapper (`App.js:99`) over this same method. Because
every module that builds DOM imports `View` first, that one `<link>` is still
always the first stylesheet in `<head>`, which is what fixes the `@layer` order
for the whole document. `doc/method/stylesheet.md`.

## The captor lives here, and only here

`View.captor` (declared implicitly — see `doc/property/captor.md`) and
`View.previous_captors` (`View.js:478`) are the one piece of global, synchronous
state in the framework. Everything else in this file is a method acting on `this`;
capturing is the one idea that reaches across instances. `doc/capturing.md`.

## Improvements

Condensed from the every-member audit; full weighing for each is in `readme.md`
§Proposed.

1. **`View.body()`'s `init(){ View.set_captor(this); }` key has never run** — the
   constructor calls `initialize()`, not `init()`. Delete it. *(simple, important —
   dead code that reads as a real hook)*
2. **Delete `append_pojo`/`append_prop`.** Zero callers in `public/`, and the
   collision guard (`if (!this[prop])`) is truthiness against the **prototype
   chain** — `append({ text: "hi" })` silently drops the assignment because
   `View.prototype.text` exists. *(simple, important)*
3. **Delete `html()` and `supports_sanitizer` together.** Without the Sanitizer
   API, `html()` warns and writes the value as **text** — the same call renders
   markup on one browser and prints angle brackets on another, and nothing in
   `framework/` calls it (everything uses `html_unsafe`). *(simple, important)*
4. **`hide`/`show`/`toggle` write inline `display`**, the top rung of the CSS
   ladder — nothing downstream can override it, and `toggle()` reads the
   *computed* style, so an already-CSS-hidden view toggles to hidden on the first
   call. A `.hidden` utility class toggled with `tc()` fixes both. *(medium,
   important — one caller, `Sidebar`, to change)*
5. **Fold `has_class`→`hc` and `toggle_class`→`tc`.** Each long form has exactly
   one caller and it is its own two-letter twin. *(simple, useful — keep `tc`'s
   space-splitting when inlining)*
6. **Move `ctrl()` to `ext/demo`.** 18 lines — longer than `append()` — one caller
   outside `framework/`, and it emits `.class-ctrls`, which no stylesheet on the
   site styles. *(medium, useful)*
7. **Rename the static `View.lazy` to `View.lazy_queue`.** It shares a name with
   the instance method `lazy()` — one word, two unrelated things, in one file.
   *(simple, useful)*
