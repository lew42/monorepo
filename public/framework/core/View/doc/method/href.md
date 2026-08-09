**Usage** — ~154 call sites, and it is what makes navigation work: `Page.link()`
(`Page.class.js:149`), `Page.previews()` (`Page.class.js:167`),
`Sidebar` rows, `ext/tabs` tab links, `Router.mark_links()`'s targets. Every one
of them is a real `<a href>`, which is why the Router can mark them and Back works
with no component holding state.

**Necessity** — as *sugar*, no; as a **convention**, yes. One name for the one
attribute the router cares about means there is a single thing to grep when asking
"what builds links here".

**Simplicity** — right-sized: one line, and it inherits `attr()`'s getter form for
free (`view.href()` reads it back).

