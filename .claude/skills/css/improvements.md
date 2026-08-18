# css — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

2026-08-18 · the "existing component beats a utility" tiebreak should carry an exception for `ui/table`: `.ui-table { width: 100% }` is for a DATA table that wants the column it was given, and it overrides framework.css`s `width: max-content` · a generated 6-column reference table built on it stretched to the full 2428px at 3440 with no gain; dropping back to a bare `table()` shrink-wrapped it to 1391px and needed no stylesheet at all (ext/CSSDoc)

2026-08-18 · step 1 should say that a class which does not exist paints nothing and throws nothing, so the vocabulary has to be verified by reading framework.css AND by reading back computed styles — never by inference from a token · `--tint` is a real token with no `.tint` class, and `div.c("pad flex v gap tint")` shipped on eight layouts looking plausible until a probe read `backgroundColor: rgba(0,0,0,0)` on every box and found no `.tint` rule in any stylesheet on the document (styles/layouts/wire/doc/decisions.md)
