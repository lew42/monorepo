# ux/ skill suggestions

For whoever writes `ux-design`. Eight things the first five classes proved, each with the
evidence that proved it. These are suggestions for the owner, minimal and not overly
restrictive — not a gate.

## Whether to graduate, and how to build the subclass

- **A template graduates when something has to be remembered between renders** — state, a
  listener the component installs, a lifecycle. Everything else stays in `ui/`; the
  2026-08-21 audit scored 1 / 20 on this test — [`ux/doc/system.md`](/framework/ux/doc/system/).
- **Subclass over mixin — proven, not asserted.** A naive `Object.assign` mixin crashed
  (`RangeError`, its own "call the previous behavior" lookup called itself); the careful
  version ran clean but silently overwrote the first mixin and permanently mutated the
  shared prototype for every instance, including ones built before it. The subclass form
  stacked both layers and left the base untouched — [`Wizard/doc/decisions.md`](Wizard/doc/decisions.md).
- **Prototype the road not taken, headless, before ruling it out.** Both `Wizard`'s losing
  mixin and `Course`'s rejected `extends Wizard` were actually built and run, not argued in
  the abstract — the numbers in both decisions.md files are printed output —
  [`Course/doc/decisions.md`](Course/doc/decisions.md).

## The seams a class needs

- **A method that composes N things is a seam per thing**, not one seam for the whole
  method. `Auth.login()` calls `password_field()` rather than building the field inline,
  which is the one line that let `MagicAuth` skip it in 14 lines instead of forking
  `login()` — [`Auth/doc/decisions.md`](Auth/doc/decisions.md).
- **One wire out: a predicate or a node, never a DOM reference.**
  `Tree.selected_change(node)` and `Filter.changed(predicate)` both hand the caller a plain
  value; `Filter` proved it holds with three simultaneous consumers —
  [`Filter/doc/decisions.md`](Filter/doc/decisions.md).
- **Parts hang off the constructor, reached through `this.constructor`.** `TreeKeys`
  replaces one static and needed zero changes to `Tree`; hard-coding the base class instead
  of reading it live would have made the extension impossible —
  [`Tree/doc/decisions.md`](Tree/doc/decisions.md).

## Traps that don't throw

- **Every method on a `View` subclass shadows the base silently.** `render`/`text`/`toggle`/
  `show`/`hide` are taken; `Filter`'s own `this.text` state property wrote nothing because
  `View.text()` is already a getter/setter, and it threw two rungs away instead of at the
  write site — [`Filter/doc/decisions.md`](Filter/doc/decisions.md).
- **Style the real root, not a wrapper.** `Wizard.render()` builds directly onto `this`, no
  inner wrapper div, so a caller's `.ac()`/`.style()` — a subclass, the words demo — lands
  on the actual element instead of a box one level removed —
  [`Wizard/readme.md`](/framework/ux/Wizard/).
