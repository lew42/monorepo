The catalog: eleven arrangements the site is actually built from, as data.
Each entry carries a `group`, a one-line `short` for its card, the `decl` it
runs, a `caption` written after the numbers came back, a `see` line linking its
don't, and a `build()`.

## The declaration shown is the declaration that ran

Where an entry quotes a `framework.css` utility, the build uses that class
rather than restating it inline — `.grid.auto gap` with `--column`, `.measure
.start`, `.flex.gap.wrap`. Where there is no utility, the build sets the exact
properties the `decl` block lists. A `decl` that has drifted from its `build()`
is the one failure this file can have and nothing detects it.

## Four entries were rewritten by their own measurements

Written from the doctrine, measured, and wrong — each is now recorded in its
own caption:

- **Rail and content** ran 160 characters a line at 1920 and 261 at 3440.
  `flex: 1` means *take the slack*, and prose is the one thing that must not;
  the body now holds an inner `.measure.start`.
- **List and detail** was a two-track grid, and at 400 the first track
  collapsed to 62px with the detail prose laddering at 9.6 characters a line.
  It is now the site's own shape — `flex wrap` with a basis and `overflow-y:
  auto` on **all three** boxes.
- **Dashboard row** was a fixed three-track grid and laddered at 400 (2.4
  characters a line in a 16px column). `flex-wrap` with a `20em` basis is the
  same three places above ~34em and one column below.
- **Section band** and **Dashboard row** both carried a padding the
  `pad-scale` rule called disproportionate; both now use
  `clamp(…, 3.5%, 3.5em)`, which is the ratio the rule is written against.

## Two entries keep a finding on purpose

**Reading column** trips `measure` at 103 characters — that is the house
`--measure: 52em`, and the finding is the token's, not the page's
([Characters per line](/framework/ext/LayoutTool/knowledge/characters-per-line/)).
**Wide table** trips `dead-space` at 13% while filling the width, because the
rule spans text blocks over 20 characters and a table has one column of them.
Both captions say so; removing the finding would have meant not showing the
pattern the site uses.

## Improvements

1. **`decl` and `build()` can drift silently.** A check that parses the `decl`
   block and asserts the built element's computed style matches would make the
   file self-verifying — the same trick `demo()` gets for free by stringifying
   the function it ran. *(medium, important.)*
2. **The file is ~190 lines**, over the house's ~100. It is a corpus, like
   `tests/cases.js` at 198, and splitting it by `group` would put four files
   where one list belongs. *(noted, not recommended.)*
