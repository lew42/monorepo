# Docking — one rail, one custom property, and it pushes

```js
html.classList.toggle("dev-open", on);        // DevBar.js — the entire state
```

```css
html.dev-open { --devbar: var(--dev-rail); }   // devbar.css
padding-inline-end: min(calc(var(--drawer, 0px) + var(--devbar, 0px)),
                         max(0px, 100% - 26rem));   /* framework.css, on .app */
```

`dev-open` on `<html>` is the whole state — no JS-held boolean, no signal, no
observer. The shell's push, the slide-in transform and what the `✕` undoes
are all CSS reading that one class. Anything elsewhere that wants to react to
the rail reads the class or the `--devbar` token, never a property on this
module.

Undocked is a transform, not a `display`, and it slides by a plain `100%` —
which is only correct because the resize strip lives **inside** the rail's box.
It straddled this edge until 2026-08-16 and cost two bugs: closed, its outer
half stayed on screen as an invisible `ew-resize` column down every page; open,
that same half covered every pixel of `.pages`' scroll gutter, which sits flush
against this edge because the region is `overflow-y: scroll`. There is no room
on the page side of this line at all. Measurements: `devbar.css` in the
[Files](/framework/dev/DevBar/files/) tab, and `ext/grip/doc/decisions.md` —
the strip moved to `ext/grip` on 2026-08-18 so [`ext/drawer`](/framework/ext/drawer/)
could use the same edge, and it carried this fix with it.

## Why `<body>`, outside `.app`

Every colour token in `framework.css` is a `light-dark()` pair that resolves
against the element *using* it, so `color-scheme: dark` on `.dev-bar` alone
retunes ink, surface, line, wash and subtle together — `devbar.css` names no
colour at all. Mounting inside `.app` would also put the rail inside the
site's `.theme-lew42`, and a dev tool that changes size when the site's type
scale changes is a dev tool you cannot trust. The cost, paid deliberately:
this rail cannot borrow a component class from the theme, ever.

`--devbar` itself lives on `:root` rather than `.app` for the same reason —
there is one rail per **document**, and the rail hangs off `<body>` where it
could not inherit a token scoped to `.app`.

## Two rails, one edge, summed

[`ext/drawer`](/framework/ext/drawer/) reserves `--drawer` at the
same inline-end edge, opened by any caller rather than a keystroke — and the two
can be open at once, which is the whole reason the sum below exists. (It was
`ext/layout`'s drawer until the rail moved out of that module, 2026-08-16.) Before
2026-08-14 `--devbar` was `.app`'s only reservation there, and a second panel
sharing the edge would have silently lost its push the moment `deselect()`
cleared `--drawer`. `framework.css` now sums `--drawer + --devbar` on `.app`,
so the two sit side by side rather than one clobbering the other — three
one-line edits (the sum, the layout drawer's own inset, `.mode-btn`'s clamp)
made two independently-built panels compose. The clamp above is what stops a
17rem-plus-17rem reservation leaving no page at all on a phone: below about
43rem combined it collapses and the rail covers instead of pushing, which is
what a drawer is supposed to do down there.

## What this buys, and what it costs

Buys: a preset button is one subtraction (`innerWidth - target`, see
[sizing](/framework/dev/DevBar/doc/sizing/)) because the rail is *the entire
distance* between the window and the page — no second measurement anywhere.
Costs: any future inline-end panel on this site has to know about this sum by
convention, reading `framework.css`, rather than by registering with
something. Recorded as deliberate in [`ext/drawer`'s
readme](/framework/ext/drawer/) too — neither module owns the contract; both
just honour it.
