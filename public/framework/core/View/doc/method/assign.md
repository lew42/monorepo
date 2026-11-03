**Usage** — called from the constructor (`View.js:9`), and 34 times across
`public/` where an object is layered onto an existing one — most visibly
`Page.child()` handing `app` down (`Page.class.js:72`) and `App.load()` adopting
the root page.

**Necessity** — yes, as *the* constructor convention. Copy it exactly into any new
class:

```js
constructor(...args){ this.assign(...args); }
assign(...args){ return Object.assign(this, ...args); }
```

**Simplicity** — one line, and the whole shape of the framework rests on it.
`...args` rather than named parameters means nothing to remember about argument
order, defaults live on the prototype so an assigned value just overrides, and
**later args win** — so a caller layers what it must inject on top of whatever the
user passed, with no branch:

```js
this.router = new Router(this.router, { app: this });
```

`this.router` may be `undefined`, a POJO or already a Router. None needs a case.
That is why injecting a dependency costs one object key and no signature change.

