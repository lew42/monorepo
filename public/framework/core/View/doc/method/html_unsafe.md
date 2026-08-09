**Usage** — 4 live call sites, all of them the same trusted case:
`framework/ext/markdown/md.js:27,42,72` (markdown this repo just parsed) and
`framework/styles/elements/media/page.js:48` (an inline `<svg>`, which no factory
can build — `document.createElement("svg")` makes an HTML element in the wrong
namespace and renders nothing).

It is also **replaced at runtime**: `ext/highlight` wraps it
(`framework/ext/highlight/highlight.js:213`) so every markdown code fence is
highlighted synchronously, with no flash of un-highlighted code.

**Necessity** — yes, and the name is doing its job — you cannot type it by
accident.

**Simplicity** — right-sized: three lines, no sanitizer, no options. The open
question is not this method but the patching. Two exts wrapping one member would
compose in import order with nothing to inspect; there is one today and no plan
for two.

