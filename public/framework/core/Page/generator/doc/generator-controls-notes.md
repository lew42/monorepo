# Controls — History and Design

## THE CONTROLS

Nothing here writes a class onto a live column. A switch rewrites one line of the spec text, the generator regrows the tree from it, and the url carries that text — so a switched state is a link you can send, a reload lands on it, and the next switch starts from what you can see in the box. One state, one place.

The three groups, and where each one's behaviour actually lives:

- **kind / width**: the two words `gen.js` already has — a menu per column head
- **flow / cols / gap**: `.grid.auto` / `.flex.auto` / `.gap` and the tokens they read, straight out of framework.css. No generator CSS behind them.
- **size / cell**: the generator's own header: core's `--page-column-*` and the framework's `--column`, declared on the columns HOST so every column that names no width of its own takes them.

Control behaviour: a control never rerolls. `MODEL` and the seed are untouched by everything here; the seed drew the first draft and the text is the state from then on.

## THE SPEC BOX'S OWN FEEDBACK

`read()` (spec.js) already turns an unrecognised first word into `prose` — the leaf — so a typo drew a page instead of throwing. That is the right call for the DRAW path (a typo should never blank the tree) and the wrong one for the READER: nothing ever said which word it did not know.

Why `unknown()` walks `parse()`'s tree a second time: the same reason `rolls.js` re-parses rather than editing `read()` — the control layer may look, but the draw path (spec.js, gen.js, rules.js) stays exactly what it was. One more `parse()` on a spec that is at most a few dozen lines is nothing to guard against.

## menu() — select.value assignment order

Observed trap (ext/layout learnt this): `.el.value` is written AFTER the options exist. An `option` marked selected while the list is still building is silently the wrong one.

## GAPS and gap control

`snug` is the word's own gap; `flush` is the cut word, as the number it always was (readme.md — `--gap: 0`, four lines of `new Page()`).

## width() — not offered to in-place child

A width word is a track in the row. `gen.js` refuses to draw one there and `tree.js` drops one from a typed spec; a menu here would be a third place that has to agree with the other two.

## cols chip — auto vs number

`auto` is a track FLOOR — the header's `cell` control, or `--column`'s own 14em. A number is that many tracks exactly, whatever the column is worth.

## shape() — nav arrangement in framework words

The nav's arrangement reads framework classes and tokens:

- `.grid.auto`: `repeat(auto-fit, minmax(min(var(--column), 100%), 1fr))`
- `.flex.auto`: `flex: 1 1 calc(var(--column) * …)` + wrap
- `.gap`: `gap: var(--gap, 1em)`

Both walls read the SAME two tokens, which is why one chip swaps between them and nothing else has to change. The values are inline because they are only known at roll time — the one thing an inline style is for.

## length() — unit requirement

Observed trap: a bare number needs its unit. `gap=0` is a plain NUMBER in calc, so `100% - 1 * 0` is a percentage minus a number — invalid at computed-value time, which throws away the whole `--column`, which throws away `.flex.auto`'s `flex` shorthand. Three cards silently shrank to 62px, no error.

## track() — cols interpretation

`cols=3` is three tracks exactly: the width left after the gaps, divided three ways — so `auto-fit` fits three and cannot fit a fourth. `cols=9em` is a floor, which is what `--column` means everywhere else on the site. Same token, both readings.

## SIZES — core's width default

Core's width words are per page; this is the DEFAULT every column that names none of them takes. Tokens on the host, so there is no specificity to win — exactly what `.page-column-small` does, one level up. `--gen-list` is the inbox's own width, which would otherwise be the one column that ignored the control.

### fill uncaps the ceiling

`fill` uncaps: core's 40em ceiling is what leaves a 3440 screen mostly empty when two columns are open, and `max-width: none` spends the whole row on them. It predates and is NOT the same mechanism as core's own `fill` width word (doc/decisions.md, wave 5) — this one is a host-level default, that one a per-column class. Two different mechanisms, same word.

### hug pending CSS

`hug` has no tokens yet (2026-08-29): core's `.page-column-hug` isn't written, and guessing its `--page-column-min/max` numbers would be a value to un-teach later. An empty entry is an honest no-op — it reads as `default` until the CSS lands.

## LOOKS — the COSTUME

`/imagine/vary/colstyles/` asked whether a columns tree can be re-dressed without rearranging it and answered yes, three looks deep; this is that answer reached for from the one page that can put any tree under it.

`finder` is the shipped default and has NO rule — the same call colstyles made: a look that is the default is the absence of one, and the word exists so the control can say so.

Note: Not in the address, for the reason `size` and `gap` are not: `#7` has to keep meaning one TREE, and what it is wearing is not the tree. It rides in `store()` instead, which is the other half of that split (page.js).

## globals() — the three header controls

The second global: the DENSITY of every wall and inbox in the tree, through the same one-token indirection as `--gen-list` — each word declares `--gap: var(--gen-gap, …)`, so the header can reach past a component default that inheritance alone would lose to. A per-column `gap` chip is written inline and still wins.

### Tried but NOT here

Two globals that were tried and are NOT here:

1. A CELL SIZE measured as a no-op: `.grid.auto` is `auto-fit`, which collapses the empty tracks and stretches what is left, so three cards fill their column at 8em and at 20em alike.
2. A COUNT was worse — the track is `(100% - gaps) / n`, and computed on the HOST that `var(--gap)` is the host's, not the nav's: `cols 2` measured as one column, `cols 3` as two. A count has to be computed where the gap is, which is what the per-column chips do.
