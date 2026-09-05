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
| 2 | **Navigation** — none · columns · top tabs · left rail · right rail · takeover | `mode.navigation` |
| 3 | Surface — plain · card · tint · prim · dark | `mode.surface` |
| 4 | **Arrangement** — plain · toolbar top · footer · panel left · panel right · main + aside · wall | `mode.arrangement` |
| 5 | Blocks — prose · card wall · template | `mode.blocks[]` |
| 6 | Pages — each row is icon, name, order, default | `children[]` |
| 7 | Code — the `page.js` a hand would write, **all seven words in it** | nothing; it is the way out |

**Adding a tab is adding a page and picking "top tabs".** Configuring one is the four things
every child has — name, order, default, icon.

```js
import { NEW_PAGE, add_child, set_default, code_for_node } from "/imagine/paging/build/words.js";
import { NAVIGATION, config_of } from "/imagine/paging/blocks.js";
import BuildStage from "/imagine/paging/build/stage.js";

// The stage draws any node, anywhere. Inside, it is the realm's own `PagingStage`.
new BuildStage({ page: this, node, classes: "build-screen" });
```

**The middle column is a `PagingStage`** (2026-09-05). This file no longer draws tabs, a rail, a
toolbar or a surface — `stage.js` does, the same as for every other page in the realm. What is
left is the crumb strip, the node's title, and the child panel's *"the url did not change"*.
[`../doc/builder.md`](/imagine/paging/doc/builder/) has the seams and the numbers.

## Watch out

- **The builder has no words of its own.** Every control writes one of the realm's
  [seven words](/imagine/paging/) into `mode`, read back by `config_of()` in `blocks.js`. Until
  2026-09-05 it wrote `style`/`mech`/`kids`/`layout`/`arrange` instead — a second schema in the
  same file, which meant a chip here changed nothing at all on a page Make had made.
- **`blocks` rides inside `mode`.** `FileStore.file()` writes five keys and drops everything else
  at the top level, so a top-level `blocks` is lost on save. The same trap ate a child's
  `default: true` before it moved into `mode` too —
  [`../doc/builder.md`](/imagine/paging/doc/builder/) has the one-line diff that would fix it
  properly.
- **A block you add has to reach the page you save.** They were collected, written to disk and
  drawn by nothing outside this directory until 2026-09-05. `draw.js` is the one renderer and a
  made page calls it through the stage's `draw` seam — what you see while building is what the
  saved page shows.
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

- [`../doc/builder.md`](/imagine/paging/doc/builder/) — the census of all 890 `page.js` on the
  site, the ruling that navigation is one control, the tabs answer, where a built page's blocks
  go, and how this stage became the realm's own `PagingStage`.
- [`../doc/persistence.md`](/imagine/paging/doc/persistence.md) — where the pages go, and why
  there is exactly one store
- [Make](/imagine/paging/make/) — the CRUD list of everything built here: rename, reorder, delete
- Files: `page.js` (the page and its seven controls) · `words.js` (the vocabulary and the node
  operations) · `stage.js` (`BuildStage` — the frame around a `PagingStage`) · `draw.js` (the
  blocks, drawn; a made page calls this too) · `build.css`
