The shape both wings share: one library entry as a page config — the
declaration, the pattern at the page's own width, a live score, and the same
pattern measured in an iframe at 400 / 1280 / 1920 / 3440.

A `bad` entry and a good one differ by what they *say*, not by what they are,
which is what makes reading the two side by side possible.

## The body is not a demo stage, deliberately

`probe.IGNORE` covers `.demo-screen`, so anything built inside `demo.stage()`
measures **zero nodes** — `walk()` bails on `el.closest(ignore)`, and that
matches the root itself. The stage also simulates a width with `zoom`, which
`escale` correctly divides back out and which therefore cannot stand in for a
real viewport. So an entry is a plain box at the page's own width, and the
other widths come from `frame()` — a real iframe with a real `innerWidth`.

## `widths()` guards on `window.top`

`frame()` loads **this same page** in an iframe. Without the guard the page
inside would run `widths()` too, and each of its four frames would spawn four
more. One line, and the comment names the trap because nothing about the code
shows it.

## 1280 is in the list on purpose

Half the don'ts are clean at 400 *and* at 1920 and broken between them: an
unbounded reading track only fails in the band where it holds one column, which
on this site is roughly 1100–1300px. A three-width table would have shown
"Prose with no ceiling" as clean everywhere.

## Prose sits in its own 34em track

The entry page takes `dt-page` (`--measure: none`) because the **specimen**
needs the window. Prose does not: unbounded it ran ~190 characters a line at
3440 and would have made these the worst-measuring pages on the site. `prose()`
is the one-line helper that keeps every sentence in a `.measure.start` block.

## Improvements

1. **Four `frame()` loads fire on every entry page view**, unconditionally, at
   roughly 350ms of settle each. A "measure" button, or running only the width
   the reader is at until asked, would cut that — at the cost of a table nobody
   presses the button for. *(medium, speculative.)*
2. **`measured()` swallows the error into a string.** Fine for a table cell,
   but a load failure and a genuine analysis failure read identically. *(simple,
   useful.)*
