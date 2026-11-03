The one CSS declaration in the whole directory that reads as a bug report,
plus the `table()` function it belongs to. See [the `table` API page](/framework/ui/api/table/) — `doc/method/table.md` —
for what the function itself guarantees.

## The declaration

`.ui-table { width: 100% }` overrides `framework.css`'s `table { width:
max-content }`, which exists so a wide table can scroll itself but shrink-wraps
a small one. Measured across all 49 tables on the site before landing here
rather than upstream — full weighing in `doc/record.md` §5.

`.c("num")` is the numeric-column variant: `th + th, td + td { text-align: end
}`, the one place in the library a text-align utility exists at all.

## Improvements

Nothing ranked: 13 lines, one override with a measured justification on
record, one variant class.
