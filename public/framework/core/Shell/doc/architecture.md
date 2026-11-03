# Shell architecture — five optional regions on one CSS grid

A `Shell` wraps a page in up to five regions (`header`, `left`, `main`, `right`, `footer`) laid out by a CSS grid. It is for any page, and for `dev/DevShell`, which is built on it. The class is `CoreShell extends View`, exported as `Shell`: [`Shell.js`](/framework/core/Shell/Shell.js), styled by `Shell.css`.

## A missing region takes no space
**Decided:** a region you leave out is never drawn; the grid's own track for it is empty and collapses.
**Why:** an empty placeholder box would leave hairlines and gaps, and would need sizing code.
**Instead:** always drawing every box and hiding the unused ones (more markup, more CSS).
**Detail:** [readme](./../readme.md)

## Nesting is free
**Decided:** `main` accepts a function or a `View`, so `main: new Shell({…})` nests shells with no special code.
**Why:** a `Shell` is a `View`, and `View.append()` already takes both.
**Instead:** a dedicated nested-shell option (extra API for something that already works).
**Detail:** [readme](./../readme.md)

## Passed content lives in `this.content`, apart from the methods
**Decided:** the five values passed to the constructor are pulled into `this.content` by an overridden `assign()`; `header()`, `left()`, `main()`, `right()` and `footer()` stay real methods a subclass can override.
**Why:** every `View` constructor runs `Object.assign`, so `header: fn` would replace the `header()` method with your data.
**Instead:** a different option name per region (breaks the "same word" naming) or no overridable methods.
**Detail:** [doc/decisions.md](./decisions.md#constructor-content-vs-the-method-of-the-same-name)

## The prefix is `core-shell-` and the class is `CoreShell`
**Decided:** every CSS class starts `core-shell-`, and the real class name is `CoreShell` with `Shell` as an export alias.
**Why:** `shell` and `.shell-*` are reserved for `/imagine/shells` in `styles/css-scopes.txt`, and `View.classify()` stamps a class from the real constructor name, so a class literally named `Shell` paints a bare `.shell`.
**Instead:** a class named `Shell` with hand-written `shell-` classes, which collides with the older lab.
**Detail:** [doc/decisions.md](./decisions.md#the-prefix-is-core-shell--not-shell--and-the-class-is-coreshell)

## `frame` mode: `main` is always a click-through hole
**Decided:** with `frame: true` the shell is `position: fixed; inset: 0`, `main()` ignores any content and returns an empty hole, and each region's size is written to `<html>` as `--shell-top`, `--shell-left`, `--shell-right`, `--shell-bottom`.
**Why:** drawing content over the hole would stop you clicking the real page; the tokens let that page pad itself in.
**Instead:** letting a framed shell also hold a real `main` (no use case yet, and it defeats the point).
**Detail:** [doc/decisions.md](./decisions.md#frame-mode-never-draws-main)

## `publish: false` keeps the frame look without moving the page
**Decided:** a frame shown as a demo passes `publish: false`; it skips writing the `--shell-*` tokens.
**Why:** a demo frame once pushed the whole site in by its region sizes.
**Instead:** always publishing (a demo then disturbs the page around it).
**Detail:** [`Shell.js`](/framework/core/Shell/Shell.js) `watch_frame()`

## Below 34em the side regions stack
**Decided:** under 34em `left` and `right` sit above and below `main`; only a media query changes the grid template.
**Why:** a toggled sheet needs an overlay, scrim and close control that a general shell has no other use for; `dev/DevShell` can lay its own drawer on top.
**Instead:** a toggled sheet (JS, extra markup, state).
**Detail:** [doc/decisions.md](./decisions.md#below-34em-stack-not-a-toggled-sheet)

## Resizing uses `ext/grip`; widths persist only for a named shell
**Decided:** `left` and `right` are resized by the shared [`ext/grip`](/framework/ext/grip/) handle (also used by `core/Sidebar`); with a `name`, the dragged width is saved and restored before first paint through a guarded store.
**Why:** one handle for every rail, and a guarded store survives private mode or a full quota without a second try/catch.
**Instead:** a Shell-only drag handler, or raw `localStorage`.
**Detail:** [doc/decisions.md](./decisions.md#reusing-pagestore-instead-of-a-second-trycatch)
⚠ The log says `Page.Store`; the code calls `new Page.Prefs({ id: "shell:" + name })`.

## Dark is one line
**Decided:** `dark: true` adds a class that sets `color-scheme: dark` on the whole shell; `dark: [...]` does the same to the named regions.
**Why:** the site's colours are `light-dark()` pairs, so the scheme alone flips the theme and nothing here names a colour.
**Instead:** a dark palette of Shell-owned colours (a second theme to maintain).
**Detail:** [readme](./../readme.md)
