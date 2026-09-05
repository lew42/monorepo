# Build — the page builder

**"New page" to a finished page, with nothing but controls.** Seven controls on the left, the
page assembling live in the middle, and the `page.json` it writes on the right — changing with
every click. Save puts it on disk beside every other page you have made.

Live: [/imagine/paging/build/](/imagine/paging/build/)

## Use

The controls, in the order you meet them, and what each writes:

| # | control | writes |
|---|---|---|
| 1 | Name, description, icon | `title` · `description` · `icon` |
| 2 | **Navigation** — none · columns · top tabs · left rail · right rail · takeover | `mode.kids` + `mode.mech` |
| 3 | Surface — plain · card · tint · prim · dark | `mode.style` |
| 4 | Layout — the [layout numbers](/imagine/layouts/) 1.stack · 2.main-aside · 3.thirds · 4.wall | `mode.arrange` |
| 5 | Blocks — prose · card wall · template | `mode.blocks[]` |
| 6 | Pages — each row is icon, name, order, default | `children[]` |
| 7 | Code — the `page.js` a hand would write | nothing; it is the way out |

**Adding a tab is adding a page and picking "top tabs".** Configuring one is the four things
every child has — name, order, default, icon.

```js
import { NAVS, NEW_PAGE, add_child, set_default, code_for } from "/imagine/paging/build/words.js";
import BuildStage from "/imagine/paging/build/stage.js";

// The stage draws any node, anywhere — it needs a Paging page for its `at()` and nothing else.
new BuildStage({ page: this, node, classes: "build-screen" });
```

## Watch out

- **`blocks` and `arrange` ride inside `mode`.** `FileStore.file()` writes five keys and drops
  everything else at the top level, so a top-level `blocks` is lost on save. The same trap ate a
  child's `default: true` before it moved into `mode` too —
  [`../doc/builder.md`](/imagine/paging/doc/builder.md) has the one-line diff that would fix it
  properly.
- **`$stage`, `$frame`, `$note`, `chips()`, `naming()`, `group`, `card` are taken.** Four of
  them bit while this was written: `naming()` is core's own url-deriving method and overriding
  it 404'd the whole page; `chips()` is `Paging`'s axis list and `dress()` calls it on every
  render. The head note in `page.js` names each one.
- **`.cols` is `display: flex` in `@layer util`** and beat this sheet's `display: grid` at any
  specificity — the card shipped as two columns until the class came out of the markup.
- **`pre` is a dark code block in this theme.** Overriding only its background left #e6e6e6 ink
  on a near-white box; the JSON pane read as an empty grey rectangle in three screenshots.
- The template families are imported **lazily** — `families.js` pulls the magazine, the blog
  manifest, the shells and two `ux` modules with it.

## More

- [`../doc/builder.md`](/imagine/paging/doc/builder.md) — the census of all 890 `page.js` on the
  site, the ruling that navigation is one control, the tabs answer, and five one-line proposals.
  ⚠ Linked as a raw `.md` path on purpose: it is not in `paging/doc/page.js`'s `RECORDS` map yet,
  so the pretty `/imagine/paging/doc/builder/` route 404s — that entry is proposal 2.
- [`../doc/persistence.md`](/imagine/paging/doc/persistence.md) — where the pages go, and why
  there is exactly one store
- [Make](/imagine/paging/make/) — the CRUD list of everything built here: rename, reorder, delete
- Files: `page.js` (the page and its seven controls) · `words.js` (the vocabulary and the node
  operations, imports nothing) · `stage.js` (`BuildStage` — a node, drawn) · `build.css`
