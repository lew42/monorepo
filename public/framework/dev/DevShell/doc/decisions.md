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

## Three real layout bugs a reviewer caught in the first screenshot, not a claim to take on faith

The task mastermind rejected the first landing after looking at `shots/1920-open.png` itself: the
right rail sat beside the left one instead of at the window's edge, the real page wasn't visibly
pushed, the width readout hung below the header, and `STRUCTURE` was empty. All four turned out to
be three bugs, fixed in this worktree, re-shot, and looked at again before re-landing:

**1 & 2 — the right rail floating near the left, and the page looking uncovered.** One bug, two
symptoms. `core/Shell`'s `.core-shell-grid` columns are `auto 1fr auto`, and an `auto` track sizes
itself off its content's max-content width UNLESS the item's own CSS width is a plain, resolvable
length — `left`/`right`'s width is `clamp(12rem, …, 50%)` (Shell.css), and that `50%` is a
PERCENTAGE, which can't be resolved before the track itself has a size (the same chicken-and-egg
problem percentages always hit in intrinsic sizing). So the browser fell back to sizing `right`'s
column off its CONTENT's max-content instead — and this shell's right side holds paragraphs of
real text (the mastermind log), whose max-content is "the whole paragraph on one line", well over
1000px. The `right` column ballooned to ~1685px (measured), `main`'s `1fr` column got squeezed to
22px, and `core-shell-right`'s own 288px-wide box sat at the START of that oversized column —
right beside `left`, nowhere near the window's real edge — leaving the column's own unused width
(522px to 1920px) with nothing painted in it at all (not even `main`'s hole, which is a separate,
much narrower column). Fixed in `DevShell.css`, not `Shell.css` — the plain demos on `core/Shell`'s
own page never hit this because their `main` has no full-window `frame` ancestor and their content
is one short line, never a paragraph:

```css
.dev-shell-root .core-shell-grid {
	grid-template-columns: var(--core-shell-left-w, 18rem) 1fr var(--core-shell-right-w, 18rem);
}
```

The same custom properties `Shell.js`'s own `size()` already writes on a drag, with the clamp's own
18rem default as the fallback — DEFINITE lengths, no percentage, so `1fr` gets the real leftover
width and `right` lands flush against the window's edge.

**3 — the width readout wrapping below the header.** `DevShell.css`'s own `.dev-shell-head-line`
had `width: 100%` — meant for when it's the only thing in the head, but `head()` also appends
`width(app)`'s own box as its SIBLING in the same `core-shell-head` flex row. `width: 100%` forces
a flex item's basis to the full row, so with two items wanting the whole row's width, the OTHER one
(`.dev-width`, which is `.flex.wrap` inside itself) got squeezed down to its own minimum — too
narrow for its four size icons and the "1536px · 9em" text on one line, so the text wrapped below
the icons, inside a box that was itself still a sibling of the path/buttons row, reading as "below
the header" even though it never left `core-shell-head`. Fixed by giving `.dev-shell-head-line`
`flex: 1 1 auto; min-width: 0` instead of a hardcoded `width: 100%` — it now grows into whatever
`width(app)`'s own natural size leaves behind, instead of claiming the whole row regardless.

**4 — `STRUCTURE` empty.** `structure.js`'s own `draw()` (reused here by import, never copied) only
actually redraws its box when `$box.el.closest(".dev-body")` finds something — a guard written for
`dev/DevBar`'s own body box, and DevShell's `$tree`/`$body` boxes carried no such class, so the
guard silently never matched and the section stayed permanently blank (no error, since the check is
`&&`, not a throw). Fixed by adding `dev-body` as an EXTRA class on both boxes (`DevShell.js`) —
`dev-body`'s own CSS rules (`devbar.css`: `flex:1 1 auto; min-height:0; overflow-y:auto; …`) are
harmless extras here too, not a conflict, and `DevShell.css`'s own rules for `.dev-shell-tree`/
`.dev-shell-body` load after `devbar.css` in the cascade (app.js imports `devbar` before
`devshell`), so this file's own padding/overflow choices still win wherever the two disagree.

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
