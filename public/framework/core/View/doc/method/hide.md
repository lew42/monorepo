**Usage** — two live callers: `toggle()` (`View.js:349`) and
`alex/framework/core/Router/Router.js:132`, which hides the app while a reload is
pending.

**Necessity** — marginal. It writes `display: none` **inline**, which is the top
rung of the escalation ratchet — nothing in any layer can override it afterwards.

**Simplicity** — the method is two lines and correct. The *approach* is the
question: a `.hidden` utility class would leave the decision overridable and
visible in the element inspector as a class rather than as a style attribute.
Given `toggle()` reads the computed style, the class form would work identically.
Proposed in `readme.md` as a set with `show`/`toggle`.

