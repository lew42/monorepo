**Usage** — called once, from `initialize()` (`View.js:15`), and overridden by
every `View` subclass on the site: `Sidebar.render()`, `App.render()`,
`Page.render()` (a different class, same contract). Empty here on purpose.

**Necessity** — yes. It is the single named seam a subclass fills, and the reason
`class NoteView extends View { render(){ … } }` needs no constructor.

**Simplicity** — right-sized. Two things a reader should hold on to:

- It is passed to `append()`, not called — so **it runs as a capture**, and the
  elements a subclass builds inside it land in the subclass's own element with
  nothing declared.
- It receives the view as its argument and as `this` (via `append_fn`), so both
  `render($me){ … }` and `render(){ this … }` work.

