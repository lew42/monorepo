```js
constructor(...args){
    this.assign(...args);
    this.listen();
}
```

Documented here rather than as a member page because `Doc` renders a member's
real source, and a class's `constructor` descriptor **is the class** — the panel
would print the whole file.

## Usage

`App.js:56`, once per document:

```js
this.router = new Router(this.router, { app: this });
```

`this.router` may be `undefined`, a POJO of options, or already a Router. Later
args win, so App layers what it must inject on top of whatever the site passed —
three cases, one line, no branch.

## Necessity

Essential, and it is two lines because a Router has nothing to build. Assign, then
start listening. Everything else in the class is a reaction to an event.

## Simplicity

Right-sized, with two things worth saying out loud:

**Constructing it starts it.** There is no `start()` and no `stop()`, so a Router
built in a test is a Router intercepting that document's clicks.

**One per document is assumed, and nothing enforces it.** A second Router would see
the same click and navigate twice. Only `App` constructs one, which is why it has
never bitten — see the readme for whether that should be enforced or just written
down.
