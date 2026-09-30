# DevShell — decisions

## One `core/Shell`, mounted once, toggled by a class — not built and torn down

`dev/DevBar` already proved the pattern this copies: mount the whole rail once, on `<body>`, at
`App.render()`, and let a single class on `<html>` (`dev-open` for the old rail, `dev-shell-open`
here) be the entire open/closed state. `DevShell.js` does the same thing with a `new Shell({...
frame: true, dark: true })` instead of a hand-built `<div>`. The payoff is free from `core/Shell`
itself: a `frame` shell's `watch_frame()` writes `--shell-top/-left/-right/-bottom` off a
`ResizeObserver` on each region, and a `display: none` region (`DevShell.css`'s own rule for
`:root:not(.dev-shell-open)`) reports zero size — so closing the shell and zeroing every token
`.app` reads are the same one CSS rule, with nothing extra written here to make that true.

## Left is fixed content, not a tab — right is the tab switcher

The brief named two different shapes for the two sides: the left is "the page tree / route and the
`structure` section", stated as one fixed thing; the right is "the dev bar's tabs", stated as a
set you switch between. `DevShell.js` follows that literally — `$tree` always shows the whole
`page` tab's own section list from `dev/DevBar/tools.js` (`says`, `route`, `server`, `xray`,
`structure`, `jump`), imported and called, never copied; `$tabs`/`$body` on the right switch among
all of `tools.js`'s tabs (`page`, `layout`, `ai`), exactly the set the old rail already shows,
reusing the very same `tabs` array so a third tab added to `tools.js` tomorrow appears in both
rails with no DevShell edit.

`route` itself is not an exported function of `tools.js` — only the whole `tabs` array is. Rather
than pull it out by array position (fragile: renumber `tools.js`'s own array and the wrong section
draws), the left side calls every section in the `page` tab. That is slightly more than the brief's
two named things, but it is all real reuse-by-import with no fragile indexing, and the extra two
or three lines (`says`, `server`, `xray`, `jump`) are the same short lines the old rail already
shows on its own `page` tab.

## `dark: ["head","left","right","foot"]`, never `dark: true`

The first headless proof (`shots/1920-open.png`) showed a shell that was dark everywhere —
including where the real page should have shown through between the two rails. The cause:
`CoreShell.apply_dark()`'s `dark: true` branch stamps `core-shell-dark` on the shell's OWN root
element, and in `frame` mode that root is the `position: fixed; inset: 0` box that sits over the
whole window — `main`'s own `background: transparent` (Shell.css) can't undo a background painted
by an ANCESTOR that fills the same rectangle. Naming the four chrome regions instead
(`dark: ["head","left","right","foot"]`, the array form Shell.js already supports) darkens each of
them individually and leaves the outer frame element, and therefore the hole, with no background
of its own — which is what actually lets the live page show through it, pushed but untouched, the
whole point of `frame` mode. Not a Shell.js bug: the plain (non-`frame`) demos on `core/Shell`'s own
page never hit this, because there the shell has no fixed, full-window ancestor of `main` to paint
over.

## `pref.js` is its own file so neither module imports the other's module

`DevShell.js` already imports FROM `DevBar.js` (its default export, for `devbar.toggle()`, and
`tools.js` for the tab array) — that direction is required, DevShell is built on DevBar's own
sections. The reverse direction — the old rail's new "shell" button asking `DevShell.js` to open —
would close an import cycle (`DevBar.js` → `DevShell.js` → `DevBar.js`), the same trap
`framework/readme.md`'s own "Traps that never throw" names: "a parent↔child import cycle breaks
only on deep reload." Two ways around it: a shared, dependency-free module for the one bit of
state both sides need to read (`pref.js` — `use_v1()`/`set_v1()`, this task's fence already listed
it under `dev/DevShell/**`), and a `window` event (`dev-open-shell`) for the one action that would
otherwise need the reverse import. `DevBar.js`'s new button only ever imports `pref.js`, never
`DevShell.js` itself.

## Only one rail reserves space, ever — enforced by always closing the other first

Both rails can be MOUNTED at once (cheap: a closed one is `display: none`, nothing measures or
renders inside it) but only one is ever OPEN, because every path that opens one closes the other
first: the shell's own "v1" button calls `toggle(false)` (itself) before `devbar.toggle(true)`; the
old rail's new "shell" button does the same in reverse. Ctrl + \ never has this problem at all —
`pref.js`'s `use_v1()` gates both keydown listeners, so only one of them ever answers the
shortcut in the first place; the other returns before calling its own `toggle()`.

## What a fresh mastermind should check

- Load any page, press Ctrl + \ — the DARK shell opens (not the light rail), with a visible left
  (page tree/route) and right (page/layout/ai tabs).
- Click "v1" in the shell's header — the shell closes, the light rail opens instead, and the page
  underneath is pushed by the OLD rail's own reservation (`--devbar`), not the shell's.
- Click "shell" in the old rail's header — same swap, the other way.
- Press Ctrl + \ again after switching to "v1" — it opens the OLD rail again, not the shell, until
  "shell" is clicked at least once.
- With either rail open, then closed, the page's own width and scroll position are back to exactly
  what they were before it opened — the `framework.css` `.app` padding change (this same task) is
  the reason; a screenshot at 400/1920/3440 before, during and after is the proof this task shipped
  (`shots/`).
