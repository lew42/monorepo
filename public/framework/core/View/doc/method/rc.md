**Usage** — 9 live call sites: `framework/ext/layout/` (`layout.js`, `panel.js`,
`controls.js`), `framework/ui/parts.js:41`, and `View.js:170` inside
`toggle_class()`. The mode switchers there are one idiom — clear a set of mutually
exclusive words, then add one — and the rest drop a single state class:

```js
$box.rc(MODES.join(" ")).ac(mode);
```

**Necessity** — yes. `ac`'s twin; a class you can add and never remove is not a
class system.

**Simplicity** — right-sized, and identical in shape to `ac` down to the
`filter(Boolean)`. The duplicated loop is four lines and reads better than a
shared `each_class(fn)` helper would.

