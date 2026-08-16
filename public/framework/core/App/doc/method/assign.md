## Usage

`App.js:14` — the constructor, and nowhere else.

The call that matters is the one it enables, at `app.js:25`:

```js
const app = window.app = new App({
    socket: Socket.singleton(),
    logo(){ … },
    brand(text, href){ … },
    config(){ lew42(this); },
    render(){ … },
});
```

## Necessity

Essential, and this class is the clearest demonstration of why. **A method passed
in the constructor overrides the prototype method of the same name** — so
`render()`, `config()`, `logo()` and `brand()` above are all the same mechanism,
and a site never has to decide between "subclass" and "configure".

Remove it and either every seam becomes an option (`{ render: fn }` read by hand)
or a site must subclass to change one line.

## Simplicity

Right-sized. One line, identical on `View`, `Page`, `App` and `Router`.

The trap it creates is worth stating once: **it runs before `instantiate()`, but
after the two fields the constructor sets** (`loaders`, `ready`). So a passed
`loaders` is overwritten, and a passed `ready` is honoured — an asymmetry nobody
has hit, and nobody should rely on.
