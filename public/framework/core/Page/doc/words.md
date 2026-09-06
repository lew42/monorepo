# The six page words — a page's shape, said instead of coded

**A page can describe its own shape in six words.** Every one is optional, every default
writes nothing at all, and a page that says none of them renders exactly what it rendered
before the words existed. Say one and core builds a *frame*: chrome where the
`arrangement` word puts it, children drawn the way `navigation` says, content in the
middle.

The values live in one file — [`core/Page/words.js`](/framework/core/Page/words.js) — so a
dropdown, a card, a url and this table cannot disagree about what a word means.

| word | what it does | its values |
|---|---|---|
| `navigation` | what a click on a child does, and how the children are drawn | `none` `tabs` `rail` `rail-right` `expand` `columns` `takeover` |
| `content` | what is in the box | a function · a string · **an address** (`/notes/x.md`, `/imagine/paging/made/notes/`) |
| `width` | how much of the region the page takes (older key: `room`) | `narrow` `reading` `wide` `full` |
| `arrangement` | where the page's other parts sit around the box | `plain` `bar-top` `bar-bottom` `rail-left` `rail-right` `main-aside` `wall` |
| `surface` · `background` | two independent colours: the content box's own fill, and the page behind it | `plain` `card` `tint` `prim` `dark` |
| `type_size` | the type scale | `compact` `regular` `display` |

**And what each one already was in core, under another name.** Four of the six are things
core has always done; the word is what makes them sayable from a page's declaration
instead of from a method body.

- `navigation` stamps `.page-nav-*` — and `tabs` is [`ext/tabs`](/framework/ext/tabs/),
  `columns` is `Page.columns()`, `takeover` is `width: "full"`. Only `expand` was new.
- `content` is read by `render_content()`: an address is fetched and drawn, two levels
  deep, and the third hands over a link.
- `width` stamps `.page-w-*`; `reading` writes nothing and `full` is `.page.solo`.
- `arrangement` stamps `.page-arr-*` and opens a **region** in `this.regions` that a
  declared child mounts in — the same seam `ext/tabs` has always used.
- `surface` paints the content box (`.page-surface-*`), `background` paints the page
  (`.page-bg-*`). One class each, on two different elements.
- `type_size` stamps `.page-type-*`.

Each `arrangement` value also names the arrangement it compiles to in
[the layout catalogue](/framework/core/Layout/) — thirty shapes, each proven at seven
widths — so *Panel left* is [Rail and content](/framework/core/Layout/rail-and-content/)
and *Wall* is [Wall](/framework/core/Layout/wall/).

## One page file, before and after

Before — the shape is in the code, and you have to read `content()` to find it:

```js
export default new Page({
	meta: import.meta,
	title: "Notes",
	children: "today later",

	content(){
		this.tabs();                       // a strip of tabs over one panel
		div.c("surface pad", () => {       // a card around the content
			p("What is in the box.");
		});
	},
});
```

After — the shape is three words, and `content()` is only the content:

```js
export default new Page({
	meta: import.meta,
	title: "Notes",
	children: "today later",

	navigation: "tabs",       // how my children are drawn, and what a click does
	surface: "card",          // my content box's own fill
	width: "wide",            // how much of the region I take

	content(){ p("What is in the box."); },
});
```

## Watch out

- **`type_size`, never `type`.** `type` is already a page method
  ([`generator/page.js`](/framework/core/Page/generator/)), and a field of that name reads
  the function back and stamps a CSS class made out of a function body. Inside a saved
  page's `mode` object the key is `type` — there it is data, and it shadows nothing.
- **`surface` paints the box, `background` paints the page.** Stamped in both places for
  one build, `surface: "card"` drew a bordered card and then a second card inside it.
- **In a columns row, `width` is a different set** — `small hug large fill full`, not these
  four, because a column has no page grid to claim a track in:
  [`columns.md`](/framework/core/Page/doc/columns/).
- **`room:` still reads** as an older name for `width`, and `surface`/`wash` as older names
  for `card`/`tint` — `Page.words()` resolves all three on the way in, so every page file
  and every saved `page.json` already written keeps working.

## More

- [The paging lab](/imagine/paging/) — the six words as a live control surface: change one
  and watch the box. Every value has a url.
- [The layout catalogue](/framework/core/Layout/) — what `arrangement` points at.
- [`Frame.js`](/framework/core/Page/Frame.js) — the box the words open, one method per piece.
