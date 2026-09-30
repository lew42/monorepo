# Shell — five optional regions around a CSS grid: header, left, right, footer, main; put a Shell inside a Shell's main and they nest

## Use

```js
import { Shell } from "/framework/core/Shell/Shell.js";

new Shell({
	header(){ /* a thin line — path, buttons */ },
	left(){ /* a sidebar */ },
	main(){ /* the page, or another new Shell(…) */ },
	right(){ /* a panel */ },
	footer(){ /* a thin status line */ },
});
```

Every region — `header`, `left`, `right`, `footer`, `main` — is optional, and each one is either
a plain function (written exactly like a page's own `content()` — this box is the captor) or a
real `View`. Leave one out and there is no empty box left behind: the CSS grid's own track for it
has nothing in it, so it takes no space. `main` taking another `new Shell({…})` is how shells
nest — `Shell.js` needed no special code for that, because a `Shell` is a `View` like anything
else `main` already knows how to hold.

`left` and `right` are resizable by their own inner edge ([`ext/grip`](/framework/ext/grip/), the
same handle [`core/Sidebar`](/framework/core/Sidebar/) uses) — drag it, double-click to reset. Add
`name: "something"` and the width you drag to is remembered in `localStorage` and restored next
time; without a `name`, sizes are for this visit only.

`dark: true` makes the whole shell `color-scheme: dark` — the site's own colours are
[`light-dark()`](/framework/styles/) pairs, so that one line is the whole dark theme, nothing
here ever names a colour. `dark: ["left", "right"]` darkens only those two boxes.

`frame: true` turns the shell into the window's own frame — `position: fixed; inset: 0`, `main`
an empty hole the real page shows through — and writes each region's own size onto `<html>` as
`--shell-top` / `--shell-left` / `--shell-right` / `--shell-bottom`, so a page underneath can pad
itself in by them. This is what [`dev/DevShell`](/framework/dev/DevShell/) is built on. A frame shown
as a demo inside a box passes `publish: false`, so it keeps the look but never pushes the page.

Not the same thing as [`/layouts/shell/`](/layouts/shell/): that lab is one page's own resizable
design-tree sidebar; this is the general region system any page can wrap itself in.

## Watch out

- `header`/`left`/`right`/`footer`/`main` passed to the constructor are NOT the methods of the
  same name — they are the CONTENT those methods draw. `this.content.left` holds what you passed;
  `left()` is the part a subclass overrides. Naming them the same thing would have let
  `Object.assign` (every `View`'s constructor) silently replace the method with your data, the
  same trap the `code` skill's own "names that collide with core" section warns about.
  [`doc/decisions.md`](./doc/decisions.md)
- The CSS prefix is `core-shell-`, not `shell-` — `shell` and every `.shell-*` class are already
  reserved for `/imagine/shells` in `framework/styles/css-scopes.txt`. The class name is
  `CoreShell` for the same reason: `View.classify()` stamps a bare class from the real
  constructor name, and `Shell` is only an export alias onto it (`new Shell(…)` still works).
  [`doc/decisions.md`](./doc/decisions.md)
- Below 34em, `left`/`right` STACK above and below `main` instead of sitting beside it — not a
  toggled sheet. [`doc/decisions.md`](./doc/decisions.md)
- `frame: true` never draws whatever you passed as `main` — it is always the click-through hole.
  [`doc/decisions.md`](./doc/decisions.md)
- `name` is also written as a plain CSS class on the shell — `View.classify()`'s own rule for
  every view, not something this file adds.

## More

- [`doc/decisions.md`](./doc/decisions.md) — the prefix collision and the rename, the
  content/method split, why `frame`'s hole never draws `main`, why 34em stacks instead of
  sheeting, reusing `Page.Store` instead of a second `localStorage` guard
- Page: [/framework/core/Shell/](/framework/core/Shell/) · Files: `Shell.js` (the class),
  `Shell.css` (the grid, the rails, dark, frame, the 34em stack), `page.js` (seven demos)
- Next: [`ext/grip`](/framework/ext/grip/) is the handle; [`core/Sidebar`](/framework/core/Sidebar/)
  is the other resizable rail it's shared with
