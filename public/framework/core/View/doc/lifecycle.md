# Constructing a view — the four steps, in order

```js
constructor(...args){
    this.assign(...args);
    this.prerender();
    this.initialize();
}
```

Four steps, no options, and every `View` on the site takes all four. There is no
`constructor` page in the rail beside this one, because the constructor has no body
worth showing — the three calls above are it.

| step | what it does | override it? |
|---|---|---|
| `assign(...args)` | copies every argument onto `this`, later args winning | no — copy it verbatim into a new class |
| `prerender()` | makes `this.el`, hands the view to the captor, adds the classes | rarely; `ext/highlight` wraps it |
| `initialize()` | `this.append(this.render)` | to build differently without touching the constructor |
| `render()` | empty here — **the seam** | **yes.** This is the one you write. |

```js
class NoteView extends View {
    render(){ span("🗒 "); span(this.note); }
}

new NoteView({ note: "hello" }).ac("pad");
```

## Three consequences that are not obvious from the list

**`render()` is *appended*, not called.** `initialize()` passes it to `append()`,
which routes a function through `append_fn` — so `render()` runs **as a capture**
and the elements it builds land inside this view with nothing declared. It is also
handed the view both ways, so `render($me)` and `render(){ this… }` both work.

**A class field cannot configure `prerender()`.** `capture`, `classes` and
`classify` are all read inside `super()`, and a subclass's class fields do not
exist yet at that point. `classes = "docs"` silently never applies. Pass a
constructor argument, or assign to the prototype, or — best — name the subclass and
let `classify()` derive the class from it.

**The view is in the DOM before `render()` runs.** `prerender()` hands it to the
captor first, so by the time your `render()` builds anything, the element is
already placed. That ordering is what makes the whole capture model work, and it is
why a `render()` that measures layout gets real numbers.

## `initialize` is spelled exactly that

`View.body()` passes an `init()` in its constructor argument. Nothing calls it —
the constructor calls `initialize()` — so that hook has never run. See
`doc/method/body.md`.
