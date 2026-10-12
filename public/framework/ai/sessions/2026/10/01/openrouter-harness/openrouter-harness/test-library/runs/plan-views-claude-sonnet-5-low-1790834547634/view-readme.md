# View — a chainable wrapper over one DOM element; every HTML tag is a function that makes one, and a function child fills it (capturing)

## Use

```js
import { View, div, h3, p, button } from "/app.js";

div.c("flex v gap pad", () => {
	h3("Today");
	button.c("prim", "Save").click(function(){ this.text("Saved."); });   // methods chain; `this` is the view
});

class NoteView extends View { render(){ p(this.note); } }   // renders div.note
new NoteView({ note: "hi" });
```

## Watch out

- Never build DOM after an `await` — the captor is restored the instant your function returns; fill in a callback instead: [`doc/capturing.md`](./doc/capturing.md)
- `classes = "x"` as a class field arrives too late (`classify()` runs inside `super()`) — name the subclass, or pass it to the constructor: [`doc/lifecycle.md`](./doc/lifecycle.md)
- Only `p` and `h1`–`h6` turn backticks into `<code>`; every other factory appends strings raw: [`doc/method/backtick_append.md`](./doc/method/backtick_append.md)
- A handler added with `on()` cannot be removed again — the DOM holds a wrapper arrow; keep your own reference and use `el.addEventListener` if it must come off: [`doc/method/on.md`](./doc/method/on.md)
- `html()` silently writes *text* when `Element.setHTML` is missing; markup goes through `html_unsafe()`: [`doc/method/html.md`](./doc/method/html.md)
- `text()`/`html()`/`attr()` are getters only when called with no value — never when the value matches: [`doc/method/text.md`](./doc/method/text.md)

## More

- [Overview](/framework/core/View/) · [`doc/decisions.md`](./doc/decisions.md) (used-by, decisions, the eight unapplied proposals, open questions) · [`doc/capturing.md`](./doc/capturing.md) (the model) · [`doc/lifecycle.md`](./doc/lifecycle.md) (assign → prerender → initialize → render)
- One page per member under [`doc/method/`](./doc/method/) and [`doc/property/`](./doc/property/) — usage, necessity, simplicity; [`doc/file/`](./doc/file/) annotates each file.
- Files that matter: `View.js` (the whole class), `page.js` (the guided tour)
