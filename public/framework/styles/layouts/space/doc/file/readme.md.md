## What this file is

The design record for treating a layout as a string: why text and not JSON
(edited by a person, in a textarea, at the speed of a thought — and a text
format has exactly one representation, so nothing can drift), why `:` means
a declaration, and the `ext/LayoutTool` grade this page earned on itself.

## What this page does not replace

Stated up front: the sixteen hand-written layouts stay. A generated layout
is a sample; a written one is a lesson with a note on which trap it teaches
and which parts a reader can switch off. This page is explicitly the search,
not the curriculum — worth reading before assuming `space/` should absorb
the other fifteen directories.

## The record grew five sections for the generator rewrite (2026-08-16)

Grammar, chaos, tone and the self-improving loop each earned their own
heading rather than a paragraph tacked onto an existing one: **"A grammar,
not a flat pick"** is `model.js`'s design (role vs. part, and why a rail is
absent from `INNER` on purpose); **"Chaos: one dial, and it is a distance"**
is `draw.js`'s linear blend and why a temperature curve was rejected;
**"The tones are the site's, not invented"** is the hue-to-token-reference
change; **"The loop — how the generator gets better"** wires `model.js`,
`ranges.js`'s `AUTHOR` table, `search.js` and `credit()` into the four pieces
of a system that improves itself; and a fifth section ranks all nine
`presets.js` layouts against the new rulebook — the record's own evidence
that the instrument works on the thing it was pointed at first.

## The self-grade is unusually honest

`ext/LayoutTool` at three widths: C 76 flat across 1280, 1920 and 3440 after
the one-row pass, up from C 79 / C 71 / **D 68** as a sidebar — and the record
breaks down exactly which findings are this page's problem
(none, currently) versus a site-wide token issue (`--measure: 52em` running
~96 characters a line at 3440px) versus a tool artifact (the ignore markers
reading as dead space). Naming which findings are *not* this file's to fix
is as valuable as naming the ones that are.

## Improvements

1. **Nothing ranked** beyond the file's own "Open — phase 2" list (neighbour
   navigation, a promote-to-`page.js` button, scoring via `ext/LayoutTool`,
   pinning specs via `core/Item`/`ext/Saver`, and widening the generator's
   two families) — all already named as the intended next steps.
