# generator — the four cut words (moved from the readme)

<!-- moved verbatim from readme.md lines 89-128, 2026-10-12 readme audit -->
## The four words that were cut, and what to write instead

`grid`, `flush`, `crumbs` and `rail` changed how the child links *looked*; not one of them
changed where a child went. A shape with no behaviour is a **pattern**, not a word — so here
they are, as the `new Page()` you would actually write.

**A denser wall** (was `grid`) — `previews()` already draws the cards; the cell is a token:

```js
new Page({ meta: import.meta, title: "Icons", children: "…",
	content(){ return this.previews().style("--column", "8em"); } });   // a wall's default is 14em
```

**The same wall, no gaps** (was `flush`) — one more token:

```js
content(){ return this.previews().style({ "--column": "8em", "--gap": "0" }); }
```

**A trail** (was `crumbs`) — core derives it from `chain()`, so it cannot be wrong, and a
columns host already draws one above the row:

```js
content(){ this.crumbs(); md("…"); }
```

**A side rail of sections** (was `rail`) — this is `ext/tabs` turned on its side, and it is
where the generator's `vtabs` came from:

```js
import "/framework/ext/tabs/tabs.js";        // once, anywhere in your app

new Page({ meta: import.meta, title: "Guide", children: "intro api faq",
	content(){ return this.tabs().ac("vertical"); } });
```

Inside the generator itself, a denser wall is `--gen-cell` on `.page-gen-wall`.

- Moved verbatim to [doc/traps.md](./doc/traps.md): traps.

