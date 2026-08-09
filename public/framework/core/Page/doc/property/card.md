A page's claim on the wall it sits in: `"wide" | "tall" | "big"`.

**Usage** — carried by `nav_for()` (`Page.class.js:160`) and applied by exactly one
consumer, `styles/gallery/`'s `card()` (`framework/styles/gallery/gallery.js:50`).
Declared three times in `public/`: `framework/styles/layouts/holy-grail/page.js:13`
(`"big"`), `framework/ui/stats/page.js:12` (`"wide"`),
`framework/ui/timeline/page.js:16` (`"tall"`).

**Necessity** — marginal, and honest about it: three declarations, one reader. It
survives because the alternative is a parent hand-listing which of its children are
wide, which is the duplication `label` and `icon` were moved to avoid.

**Simplicity** — right-sized as a string, and the interesting decision is where it is
*not* applied. **`previews()` deliberately ignores it**: those are flat 60px link
rows, and forcing a two-row span onto one left a 72px hole beside it every time. A
wall wants the span; a link list never does.

One sharp edge, in the gallery rather than here: **spans do not clamp themselves.**
`auto-fill` must generate at least as many tracks as the widest span demands, so a
`wide` card forces a second track even at one column unless the wall sets a floor.

