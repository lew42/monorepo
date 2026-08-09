## Usage

`Router.js:4` — the constructor, and nowhere else. The interesting call is the
one that goes *through* it, in `App`:

```js
this.router = new Router(this.router, { app: this });   // App.js:63
```

## Necessity

Essential, and not because of the one line it runs. `this.router` may be
`undefined`, a POJO of options, or already a Router — later args win, so App
layers what it must inject on top of whatever the site passed with **no branch**.
Remove this and the constructor spells `Object.assign(this, ...args)` itself,
which works, and the layering stops being visible from the class.

## Simplicity

Right-sized. One line, identical on `View`, `Page`, `App` and `Router` — four
copies is the price of having no base class, and a base class for one line costs
more than it saves.
