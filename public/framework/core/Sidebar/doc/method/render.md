Two boxes and a key handler. The whole component, in four lines.

```js
render(){
    this.bar();
    this.menu();
    this.on("keydown", …);
}
```

## Usage

`View.js:15` — `initialize()` calls `this.append(this.render)`. **Nothing calls
this method directly**, and the indirection is load-bearing: `append(fn)` sets the
captor to this view, runs `fn`, and restores it — which is why `bar()` and `menu()`
can build with bare factories and land inside the sidebar.

## Necessity

Essential: it is `View`'s one override point, and a `View` subclass that renders
nothing renders nothing.

The structure it declares is the structure the CSS depends on. `bar` over `menu`,
and `menu` is nav over footer, so **the nav is the only scroller** and the header
and footer are pinned by structure rather than by `position`. It replaced a
`position: fixed` mode pill that floated over every page, full-bleed ones included.

## Simplicity

Right-sized, with one thing in it that doesn't belong to any of the others: the
`keydown` handler.

```js
if (e.key === "Escape" && this.hc("open")){ this.open(false); this.$toggle.el.focus(); }
```

Three lines of narrow-screen behaviour sitting in the method that declares the
whole component. It is harmless on a wide screen (`.open` does nothing there) and
it is the only listener not attached beside the element it belongs to. Candidate
for moving into `toggle()`, weighed in the readme.
