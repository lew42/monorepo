# Which words earn `framework.css`

Counted 2026-08-30 across `public/**` (`.js` + `.css`), excluding `node_modules`,
`core/new/1/` (an archived prototype) and `fly/` (vendored three.js).
**No `framework.css` edit was made this task** — promoting a word is a vocabulary decision
and it is the owner's.

## What the site does today

| | count | where |
|---|---|---|
| `flex auto` class strings | **53** call sites | ~26 are two-child rows, ~7 three-child, **only ~8 are walls of many tiles** |
| inline weighted flex (`flex: "2 1 30em"`, grow ≠ 1) | **10** declarations, 8 files | `wire/specs.js` ×2, `apidoc/page.js`, `spec/page.js` ×2, `Page/overview/columns/uses/uses.css`, `ext/demo/shell.css`, `Page/generator/generator.css` ×2 |
| `--grow` (the shipped fix) | **6** real call sites | `layouts/set`, `layouts/anatomy`, `layouts/home` ×2, `layouts/bold-editorial` ×2 |
| 2-track `grid-template-columns` | **16** | `styles.css`, `blog/blog.css` ×2, `ext/toc`, `ext/AITask`, `ext/DesignTool` ×2, `ext/Panel/templates`, `dev/DevBar`, `Page/generator` ×2, `imagine/screens` ×2, `imagine/decks`, `imagine/blogx`, `arya/styles/grid` |
| 3-track `grid-template-columns` | **10** | 5 are `auto 1fr auto` chrome frames, not columns |
| `.basis` (a fixed track beside a fluid one) | **49** call sites, 34 files | plus 3 places that hand-write `flex: 0 0 var(--sidebar)` instead of using the word |

**The headline: the dominant use of `flex auto` on this site is a two-track row, not a wall.**
Roughly 33 of 53 call sites are 2- or 3-track — the case
[the indictment](/framework/styles/layouts/cols/doc/indictment/) says it answers by accident.

## Recommended: promote two

As `.cols.half` and `.cols.main-aside` — the `.flex.auto` / `.grid.auto` shape — with the
one general rule and its four tokens behind them.

**`half`** — 26 two-child `flex auto` rows and 16 two-track grids want it. It is a strict
upgrade for every one of them: the same stacking behaviour, an exact 1.000 instead of a
near-1.000, and a floor that stays where it was put.

**`main-aside`** — the ceiling, which the vocabulary does not have at all. Six `--sidebar`
consumers, `ext/toc`'s `minmax(0, 1fr) 15rem`, `ext/DesignTool`'s `minmax(0, 1fr) 17em`,
`ext/AITask`'s `minmax(22em, 38em) minmax(0, 1fr)` and `styles.css`'s
`minmax(16em, 24em) minmax(0, 1fr)` are all the same shape written five ways. If only one
word ships, this is the one — a capped track is the thing that is missing, and it is the
thing that goes wrong at 3440.

## Keep in the lab

- **`two-one`** — `--grow` already holds this ratio exactly; the word only adds a `rem`
  floor. Worth having once `half` proves the shape, not before. The 10 inline
  `flex: "2 1 30em"` declarations should move to `--grow` today regardless — that fix
  needs no new CSS.
- **`thirds`** — 7 three-child rows, and most of the ten three-track grids are
  `auto 1fr auto` chrome, which is a frame and not columns. Thin evidence.
- **`golden`** — zero call sites outside `/imagine/decks/`. A taste word; it earns a lab
  page, not a utility.
- **`rail-main-aside`** — two real occurrences (`styles.css:174`, `ext/AITask/ai.css:173`),
  both already grids. A three-track documentation frame may simply *be* a grid; this word
  exists here to prove a fixed track and a capped track can share one rule.

## Migration list, if `half` and `main-aside` ship

Highest value first — each is a hand-rolled row replaced by one word:

1. `public/styles.css:161` — `minmax(16em, 24em) minmax(0, 1fr)` → `main-aside`, reversed.
2. `framework/ext/toc/toc.css:17` — `minmax(0, 1fr) 15rem` → `main-aside` with
   `--cols-aside: 15rem`. This is the exact shape, already capped, written by hand.
3. `framework/ext/DesignTool/DesignTool.css:113` — `minmax(0, 1fr) 17em` → the same.
4. `framework/ext/AITask/ai.css:27` — `minmax(22em, 38em) minmax(0, 1fr)`.
5. `framework/styles/layouts/apidoc/page.js:283-285` and
   `framework/styles/layers/theme/lew42/page.js:67,74` — hand-written
   `flex: 0 0 var(--sidebar)` beside a `999 1 24em`; three declarations, one word.
6. The two-child `flex auto` rows in `layouts/home/page.js` (90, 158, 239) — the ones the
   `--grow` weights were added to, which is evidence the wrap threshold was never what
   those rows wanted.

## Not recommended

Teaching `.flex.auto` a ceiling. Its basis, its threshold and its grow are one mechanism —
`--column × --grow` is simultaneously the ratio and the wrap point — and a `max-width`
bolted on would freeze a track while the threshold kept moving. The two mechanisms should
stay separate words, which is what this lab is proposing.
