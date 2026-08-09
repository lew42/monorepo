**Usage** — the constructor (`Page.class.js:8`), `add()` for an already-built Page
(`Page.class.js:49`), `child()` handing `app` down (`Page.class.js:72`), and
`App.load()` adopting the root (`framework/core/App/App.js:60`).

**Necessity** — yes, as *the* constructor convention. It is copied verbatim from
`View`, and any new class copies it again:

```js
constructor(...args){ this.assign(...args); }
assign(...args){ return Object.assign(this, ...args); }
```

**Simplicity** — one line, and the whole adoption model rests on it. **Later args
win**, so a caller layers what it must inject on top of whatever the user passed,
with no branch:

```js
new Page(pojo, { name, parent: this, app: this.app })
```

`pojo` may be undefined, a POJO, or already a Page. None needs a case. That is why a
`page.js` never mentions `app` or `parent`: you assign what you know, and what knows
you assigns itself.

`Page` does **not** extend `View`, so this is a second copy of the same two lines.
That duplication is deliberate — a Page is not a wrapper over an element — and it is
the one place the two classes agree by convention rather than by inheritance.

