**Usage** — one internal caller: `append()`'s plain-object branch
(`View.js:66`). No file in `public/` passes a POJO to `append()` today.

**Necessity** — questionable. It builds a named child per key and assigns each onto
the view (`this.header`, `this.body`), which is a second, invisible way for a View
to acquire properties.

**Simplicity** — the branch is cheap; the *feature* is not. It is tested after the
renderable branch, so `{ render(){ … }, title: "x" }` never reaches it, and the
properties it writes can collide with prototype methods — which `append_prop`
handles with a `console.warn` rather than a rule. Removal proposed in `readme.md`,
with the note that it is the one `append()` branch nothing depends on.

