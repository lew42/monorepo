# Core — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

## What belongs here, and what doesn't

**The render/routing substrate is five classes, and only one of them is a DOM
element by inheritance.** `Sidebar extends View`; `App` and `Page` each build a
`View` for their own element inside `render()` (`this.$app = div.c("app", …)`,
`this.view = div.c("page …")`) rather than subclassing it; `Router` has no
element at all — it owns the url, and everything it does is write two classes,
`.active-page` and `.active-ancestor`, for CSS to read (`core/page.js`, "There is
no layout tier"). `Item` and `List` are the odd pair out: no view, no DOM, no
import of `View` at all — `Item`'s own readme says it plainly, *"No view, no
transport, no DOM — it runs in node."* They're here because the framework's other
six classes need one persistence primitive to build on, not because they're part
of the render substrate.

**The one enforced rule: core may never import `ext/`.** Stated on `ext/`'s own
`page.js` ("core never depends on them") and confirmed by grep — nothing under
`core/*.js` reaches into `ext/`. The traffic runs one way: an ext imports and
patches core (`ext/tabs` fills `Page.regions`, `ext/catalog` patches
`Page.prototype.catalog`) and core never imports back, never checks for the
patch, never knows the ext exists. Dependencies core classes *do* need from
outside — the socket, the theme — arrive by constructor injection from `app.js`
(`new App({ socket: Socket.singleton() })`), never by a core file importing
`dev/` or `ext/` directly.

**`core/new/` is on disk but not live.** `new/0/`, `new/starter/` and `new/1/`
are frozen sketches — `new/1/` is where the shipping design was proved and its
readme is the long-form record with measurements, the other two are earlier
attempts. All three still import `View`, but as CLAUDE.md and `core/View/readme.md`
both say, they are not live consumers. Don't import any of them into anything
that ships.

## Traps that cross the tier

- **⚠ `instanceof` across `core/` and `core/new/`.** Both directories ship —
  `public/` *is* the deploy artifact — so a typo'd `../new/0/Page.class.js` import
  resolves successfully, to a real file, and yields a *different class with the
  same name*. Nothing throws. `Page.add()` does the one internal `instanceof`
  worth checking if a page ever silently fails to adopt.
- **⚠ Mutual parent/child imports break only on deep reloads.** `import` hoists
  regardless of textual position, so a child importing its parent reads an
  uninitialized binding — `/a/` throws while `/a/b/` works. Imports flow down;
  the backref (`page.parent`) arrives by adoption in `add()`, never by a child
  importing upward. Worked example: `core/Page/children/page.js`.
- **⚠ A POJO default export whose key collides with a `Page` method silently
  shadows it.** `export default { render(){ … } }` in capture style returns
  nothing from `render`, and `activate()` then reads `.el` of `undefined`.
  `content()` is the seam a page.js wants, not `render()`.
- **⚠ "Core reads a property core never writes, filled by an ext core may not
  import."** `Page.regions` is the sharp case — `container()` reads it,
  `ext/tabs` is the only writer, and the two files never mention each other.
  Survivable only because `container()` logs which claim it took
  (`core/Page/doc/property/regions.md`); the same shape elsewhere would be black
  magic.

## Open

- **Is `List` its own class, or two private methods on `Item`?** `List` has
  exactly one caller in the whole framework — `Item` itself, which is the class
  it was extracted from. Recorded as a real open question for the owner in the
  2026-08-16 documentation audit (`/framework/audit/overview/priorities/`, "6 —
  Structural, and needing the owner"), not yet resolved either way.
