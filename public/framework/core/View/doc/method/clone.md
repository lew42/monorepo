**Usage** — one caller, and it is a broken one: `repeat()` (`View.js:371`).
Nothing else in `public/`.

**Necessity** — no, on evidence.

**Simplicity** — subtly wrong for a subclass. `new this.constructor({ el: … })`
re-runs the subclass constructor with **only** an element — so a `NoteView`'s
`note` is gone, `render()` runs again into an element that already has the
cloned children, and you get the content twice. It is safe for a plain `View` and
unsafe for exactly the class of object a clone is worth having.

Delete it with `repeat()`, or narrow it to `View` and say so.

