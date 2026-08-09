The element name to create. Defaults to `div`.

**Usage** — read in `prerender()` (`View.js:21`) and in `append_prop()`
(`View.js:138`), which builds each named child with the *parent's* tag. Written by
every factory (`new View({ tag })`, `View.js:443-476`) and by `stylesheet()`
(`tag: "link"`).

**Necessity** — yes. It is what makes 60 tag functions one class.

**Simplicity** — right-sized, and deliberately not on the prototype: a subclass
sets it as a class field (`tag = "nav"`) or a constructor argument, and neither is
shadowed, because unlike `capture` this one is read *after* fields initialize —
`prerender()` runs from the constructor body, not from `super()` of a subclass.

There is no validation. `new View({ tag: "svg" })` builds an HTML element that
happens to be named svg, in the wrong namespace, and renders nothing — see
`framework/styles/elements/media/page.js:48` for the real answer.

