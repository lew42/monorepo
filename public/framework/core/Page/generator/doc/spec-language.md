# generator — the spec language (moved from the readme)

<!-- moved verbatim from readme.md lines 25-115, 2026-10-12 readme audit -->

The spec:

```
wall large cols=3   <block> [width] [key=value …], indentation is nesting
  list
    prose
  tabs
vtabs
```

**Five block words**, and every one says **where a child goes when you pick it**:

| word | picking a child | looks like |
|---|---|---|
| `wall` | opens a NEW column, right | cards, each with a peek at the page behind it |
| `list` | opens a NEW column, right | an inbox — previews left, the detail beside them |
| `prose` | (the leaf — no children) | the page itself |
| `tabs` | swaps IN PLACE, same column | a strip over a panel |
| `vtabs` | swaps IN PLACE, same column | a rail beside a panel |

**Width words** — `small large full` — are core's own, stamped as `page-column-<width>`. An
in-place child never gets one: it lives in a panel, and a width word is a track in the *row*.

`gen(7)` is the same tree forever, in any browser, so a permutation is a link: the seed rides
in `#7` and every generated href carries it. **Type in the spec box** and your text is the
tree — and the address, carried whole as `#s=<encoded>`.

A word the box does not know still draws — as `prose`, the leaf — but the line under the box
now names it (`not recognised, becomes prose: widget`), inline and quiet, so a typo teaches the
vocabulary instead of silently swallowing it.

## The controls

Every column head carries **its own two words as menus** — switch a page from `tabs` to `list`
and watch its children stop swapping in place and start opening a column. A `wall` or a `list`
also gets a chip row for its arrangement, and the generator's own header sets the defaults for
the whole tree:

| where | control | writes |
|---|---|---|
| any column head | kind · width `default small large full hug fill` | the spec line: `list large` |
| a `wall` / `list` | flow `grid`/`flex` · cols `auto 1 2 3` · gap `snug flush airy` | the spec line: `cols=3 gap=0px` |
| the header | size `small default large hug fill` · gap · look `finder cards ink` | tokens on the host: `--page-column-*`, `--gen-gap`, and one `page-gen-look-*` class |

**A control edits the SPEC, never a live column** — so a switched tree is a link (`#s=…`), a
reload lands on it, and the box shows you the text you just wrote by clicking. The seed is
never touched: `#7` still means one tree, and the reproducibility line goes on proving it.

**The header's three are not the spec, and not the address.** `size`, `gap` and `look` are how
you like a tree *dressed*, so the split is: **the url carries the tree, `store()` carries the
dressing** — plus the last tree, for an arrival with no hash at all. A link someone sent still
wins; the store is only read when the address names nothing.

The copy icon beside the seed stepper takes the address (`hash()`, whole) — a click, a beat of
confirmation, nothing typed.

## The three looks

`look` is [`/imagine/vary/colstyles/`](/imagine/vary/colstyles/)'s answer — a columns tree can be
re-dressed without being rearranged — worn by a tree that was never built. `finder` is the
shipped default and has no rule; `cards` floats every column on a `--wash` row; `ink` goes dark.

Ink is the one worth reading, because it is **five tokens on the body, not a rule per part**:
everything a generated column draws is already written in `--line` / `--tint` / `--surface` /
`--ink` / `--subtle`, so redeclaring those redresses the bars, the chips, the media stand-ins,
the item colours and the sketches at once. The rules are `generator.css`'s own, not colstyles' —
`core/` may not import from `/imagine/`, and half of that stylesheet would miss anyway
([`doc/decisions.md`](/framework/core/Page/generator/doc/decisions.md)).

The arrangement chips write **framework words** — `.grid.auto` / `.flex.auto` / `.gap` and the
`--column` and `--gap` they read (`framework.css`), so what you learn here transfers to any
page. `cols=3` is `--column: calc((100% - 2 * var(--gap)) / 3)`; `gap=0px` is the cut `flush`
word as the number it always was.

Which word may appear under which is `rules.js` — a multiplier per pair, above 1 encouraged,
below 1 discouraged, printed on the wall so you can argue with it. `gen(seed, { chaos: 1 })`
ignores the rules and draws what the flat table drew.

**The [permutation wall](/framework/core/Page/generator/rolls/)** is twenty-four rolls at once
— `#42` there means seeds 42…65 — each a small picture of its tree, each a link to that seed.

## The spec gallery

A seed is an address against one `MODEL`, and every model bump redraws every seed — so a tree
worth keeping is kept as its **text**. [`specs.js`](/framework/core/Page/generator/specs/) is
where: nine page shapes that are real things — a docs site, an inbox, a settings rail, a shop,
[the magazine](/layouts/labs/mag/) — as a wall of the same sketches the permutation wall draws, each
with a sentence saying what it is for. Pick one and it becomes the tree; the address turns into
`#s=<the text>`. The magazine's own three-level shape (a full-width cover, an inbox of
articles, each a plain leaf) fit the five existing words with no sixth needed —
