The child this columns host shows before anything routes — the one whose `classes`
includes `default`. `render_column()` builds it eagerly (a page is otherwise BUILT when
it activates, so a default child would never exist for the arrangement contract to show).

```js
children: {
	Browse: {
		classes: "default",          // shown on landing, stood down when a real column opens
		initialize(){ this.columns(); },
	},
}
```

**Usage** — one caller: `render_column()` (`core/Page/Page.class.js`) renders it into
the host's `.page-column-pages`. Consumers mark, they never call: `uses/split`'s top
panel and the three example labs each carry the one word.

⚠ **The host hands it `app` on the way in.** Nothing routes to a default column, so
`child()` — the usual place a page is handed the app — never runs for it, and the `app` it
was adopted with at module scope is still `undefined`. `this.app.router` inside one threw
*"Cannot read properties of undefined"* (`/imagine/screens/deck/`, 2026-08-29); the fix is
`this.default_column()?.assign({ app: this.app }).render()`, which makes `render_column()`
the second of the two places `app` travels down.

**Necessity** — a non-routed columns host (in a panel, in a demo box) has no active
chain, and the contract hides an unmarked page with nothing thrown — the blank panel of
2026-08-27. Before this seam, `uses/split` wrote `activated(){ this.view.ac("default") }`
by hand.

⚠ **Not `opens()`.** A core method named after a plain noun squats a name a page may be
using as its own state — `uses/inbox` counted messages in `opens: 0`, the field shadowed
the method, and the page died on `this.opens is not a function`. This family stays
`*_column` / `column_*` for that reason (`doc/decisions.md`).
