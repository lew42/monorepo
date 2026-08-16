The don'ts index: ten cards, a run strip, and one column the good wing does not
have — **Fires**, which says whether the rule an entry was built to trip
actually did at that width.

## Quiet is a result, not a pass

`fires()` splits the entry's `rule` string on `·` and asks whether any of those
ids appear in the report's issues. A quiet row usually means the entry is
width-scoped and this is not its width: `dead-space` is not a finding below
1500px, and a rail that ladders on a phone is silent on a monitor. The page
says this in prose, because a bare "quiet" reads as "clean".

## One entry is quiet at every width, and it is the point

"Scroller in a wrapping row" declares `rule: "nothing — a blind spot"`. Its
failure is vertical overflow of a box whose `overflow` is `visible`, and every
geometry rule in the tool measures the horizontal axis or a clip. The index
names it as the standing example so a reader does not take the clean score for
a clean layout. Full write-up:
[Blind spots](/framework/ext/LayoutTool/knowledge/blind-spots/).

## It is not the test corpus

`tests/` asks whether the **analyzer** is right, and its cases are minimal
rule-trippers with declared verdicts. This wing asks what an author should
write instead, so every specimen is a plausible page shape — a card wall, a nav
beside an article, a table — and every entry ends in a link to the library
entry that replaces it. The two overlap in subject and not in job; both pages
say so.

## Improvements

1. **Nothing checks that a don't is still bad.** The good wing's failures show
   up as findings; a don't that quietly stops firing (a rule retuned, a
   threshold moved) looks identical to one that was never measured. The
   corpus's declared-verdict machinery in `tests/page.js` is exactly the missing
   piece, and it already exists. *(medium, important.)*
2. **`fires()` parses prose.** `rule: "escape · dead-space"` is a display
   string that doubles as data. An array plus a rendered join would be honest;
   one field that reads two ways is the sort of thing that survives until it
   does not. *(simple, useful.)*
