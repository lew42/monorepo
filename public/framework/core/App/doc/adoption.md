# Adoption: `app` arrives on the walk, not at boot

A `Page` is constructed in userland at module scope (`export default new Page(…)`),
so there is no constructor for App to inject into.

- **`add(name, child)`** — the one place `parent` is assigned.
- **`.app`** — assigned in `child()`, on the walk, to the page about to need it.
  Nothing recurses it over the tree at boot.

A Page reads `.app` in one place: `activate()`, for `container()`. Everything else —
`link()`, `preview()`, `previews()`, `render()`, `chain()`, `naming()` — never
touches it.

**The cost:** an eager child you have never navigated to has no `.app`, so anything
reaching through it — `app.router.go(page.url)` from site code, an ext reading
`app.loaders` — has nothing to reach through. `link()` is a plain `<a href>` and
needs none of it, which is why it is the one used everywhere.

**Never read `window.app` inside `framework/`.** It is a console convenience, it
hard-codes one App per document, and it is `undefined` during boot — `app.js` runs
`window.app = new App()`, so the global is unset while `config()` executes.

## The gap a default tab opens, and where it is closed

`add()` copies `app: this.app` at add time and `child()` re-copies it on the walk.
A child added from inside the **constructor** — which `initialize()` is — is
therefore adopted with `app: undefined`, and only a later `child()` fixes it.

**A default tab is never routed to**, so that later `child()` never happens: a
`classdoc` overview is rendered straight out of `children.get(name)`. For a while
`this.app` was simply `undefined` inside an overview's `content()`, and every use
of it was a silent no-op — `new Sidebar({ app: this.app })` rendered without its
mode toggle, and *worked* if you opened the child's own url. That is the worst
shape a bug can have.

`ext/tabs` closes it, in the one line that renders a default:

```js
const first = this.children.get(list[0])?.assign({ app: this.app });
```

**The rule this leaves behind:** anything that renders a child *without* routing to
it hands `app` down itself, exactly as `Page.child()` does. There is no third place
that does this, and a fourth would be a bug of the same shape. Verified on
`/framework/core/Sidebar/`, two levels deep:

```
class page   /framework/core/Sidebar/                    app ✓
group        /framework/core/Sidebar/overview/           app ✓
overview     /framework/core/Sidebar/overview/overview/  app ✓
```
