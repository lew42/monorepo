**Usage** — 10 live call sites: `framework/core/Sidebar/Sidebar.js:29,67`,
`framework/ext/demo/demo.js:90`, `framework/ext/layout/` (`layout.js`,
`controls.js`, `panel.js`), and `View.js:381` inside `ctrl()`. All of them ask a
question mid-expression:

```js
.click(() => this.open(!this.hc("open")));
```

**Necessity** — yes. It is the only member that reads class state back out;
without it every caller reaches for `view.el.classList.contains(…)`.

**Simplicity** — it returns a boolean, so it is the one class method that **ends**
a chain rather than continuing it. That asymmetry is correct and worth stating.
Like `tc`, it delegates to a longer-named twin (`has_class`) with no other caller
— see `readme.md` §Proposed.

