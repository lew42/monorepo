# Section — a page you put inside a page

`Section extends Page`, so storage, children, naming and the six page words arrive
inherited. It starts as a plain box 2.5em tall with nothing in it, and it has one idea of
its own: it can be given an **approved layout** from [core/Layout](/framework/core/Layout/),
and that layout's named boxes become the section's slots.

## Use

```js
import Section from "/framework/core/Section/Section.js";

// a plain box — no layout, no padding, no chrome
new Section({ url: "/framework/core/Section/band/" }).render();

// editing on (demo and doc pages only): hover it, one control, pick a layout
new Section({ url: "…", editing: true }).render();

// a layout, with children mounted into its slots by name
new Section({
    url: "…",
    layout: "main-aside",
    children: { Main: { content(){ p("…"); } }, Aside: { content(){ p("…"); } } },
}).render();

// and from disk — `page.json` plus one key, `layout`
Section.from("/framework/core/Section/example/").then(section => section.render());
```

`section.edit()` is the same switch as `editing: true`, said later.

## Watch out

- **Editing is off unless code turns it on**, and a demo never persists a pick.
  Storage is inherited and works; writing is an editor's job: [`doc/idea.md`](./doc/idea.md).
- **The picker lists only what fits this box** — LayoutRule #1 — and a layout below its
  floor is a row saying why, not a disabled button: [`doc/picker.md`](./doc/picker.md).
- **`fits()` should live in `core/Layout`.** It is `rules.js`'s width rule with the
  reporting taken off, and a second copy is one edit from disagreeing:
  [`doc/picker.md`](./doc/picker.md).
- **A child's view is appended, never built inside the captor** — a page memoizes its
  view, so a captured `child.render()` appends nothing on the second draw and the slot
  comes up empty with no error: [`doc/slots.md`](./doc/slots.md).
- **Below its floor a section stacks** — it draws no layout, and says so in the overlay. A
  `ResizeObserver` re-asks on every width change: [`doc/slots.md`](./doc/slots.md).
- **Children the layout did not claim still render**, stacked under it. Content is never
  silently dropped: [`doc/slots.md`](./doc/slots.md).
- **A page whose `content` is a plain string sets one character per line** — the text is an
  anonymous grid item and `.page > *` cannot reach it, so it lands in the page grid's
  gutter. It is `core/Page`'s to fix; `example/` points its children at `.md` files
  instead.
- **Every View part is `PageSection*`.** Three other modules in this repo export a
  `Section` and `.section` is a live rule: [`doc/idea.md`](./doc/idea.md).
- **Layouts do not stack.** One layout per section; composition is nesting sections.

## More

- [Overview](/framework/core/Section/) · [`doc/idea.md`](./doc/idea.md) ·
  [`doc/picker.md`](./doc/picker.md) · [`doc/slots.md`](./doc/slots.md)
- Files that matter: `Section.js` (the class and its picker), `Section.css` (where the
  overlay sits, what a slot is), `example/page.json` (the JSON form, read by the page).
- Next door: [core/Layout](/framework/core/Layout/) owns the thirty layouts, their proven
  ranges and the rules; [core/Page](/framework/core/Page/) owns everything else here.
