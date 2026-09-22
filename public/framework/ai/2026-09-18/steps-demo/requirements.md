# Steps demo — two column layout: demo + minimal steps

## The owner's words (2026-09-18, 14:20)

"one really useful layout we haven't explored is a two column demo plus text. A lot of pages
lead with a title and intro paragraph and I haven't been pleased — too simplified, not very
clear. [...] an image or a demo on the left or the right, then minimal but explanatory text,
maybe steps — do this one, two, three — and you do it in the demo and boom, you experience
exactly what the demo does. I think we did have a stepwise demo system somewhere; let's get
back to that. For most reports and tasks it should be: first click here, then do this, drag
and drop, to experience the full feature set. It forces us to document exactly what we can do
and what to start with first."

Suggestions, not laws: build the shape, apply it to two pages, and say where it fits.

## First, look (read-only, 15 minutes max)

Look for the stepwise system the owner remembers: `ext/demo` (readme.md, doc/method/*.md —
demo.exhibit(), demo.page(), demo.tree(), demo.layout(), demo.app(), demo.source()),
`ux/Course` (chapters of lessons: rail, reading column, next-up card), `ux/Wizard`, `/web/`
(guide tier), and `rg -il "step|walkthrough|guided"` across ext, ux, web docs. Log what
exists and whether one of them IS the thing already — if so, extend it, don't add a new shape.

## Deliverables

1. `demo.steps()` (or the existing shape's evolved name) in `ext/demo`: two columns — a
   numbered list of minimal steps (verb phrase each, at most eight) beside the demo, side
   `left` or `right` by option, stacked at 400 with steps first. A step marks itself done when
   the demo emits the event the step names (`{ say: "Drag Jackets into Shoes", when: "move" }`)
   or when the reader clicks it. The current step is the one cue (weight or accent, not both).
2. Two first consumers, minimal edits to `page.js` only:
   - `ux/Tree`'s module page — steps: expand a branch, drag a row above another, turn on adapt.
   - `/layouts/shell/` — steps: resize the sidebar, pick a design, open the fold.
3. `ext/demo/readme.md` Use section gets the line; `doc/method/steps.md` is the full record,
   including the alternative (steps as a rail beside a full-width stage) and when that wins
   instead.
4. Verify headless on the private server (PORT=8127, background, killed by its real Windows
   PID): both pages at 400 / 1280 / 1920, a step marking done after the real gesture, zero
   console errors. One screenshot each at 1280.

## Fence

`public/framework/ext/demo/**`, the `page.js` of `public/framework/ux/Tree/` and of
`public/layouts/shell/` (the steps call only), this task dir. Nothing else.

## Never

Never touch the owner's dev server on port 80. Never `git stash`. Never `find /`. Never drive
the owner's browser tabs. `rg` patterns starting with `/` return nothing on this Windows
box — drop the leading slash.

## Report shape

One screen: what existed, the shape's name, the two consumer links, the two screenshot paths,
what was left and why.
