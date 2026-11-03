# Cross-review (sonnet-b)

Both peers implement the same winning names, so both are functionally the
same as mine on every method's contract: `apply`, `models`, `model`,
`overruleCount`, `retire`, `explain` all take the same arguments and return
the same shapes, `retire()`'s two-condition rule and median math match, and
`explain()` produces the same kind of one-sentence summary. I did not find a
behavioral difference that would show up in a test: same rows in, same
numbers out.

## haiku-c

Functionally the same as mine, with one real bug and one real improvement.

- **Better:** `models()` builds its per-model totals with a single pass over
  `rows` into a `Map` (`by.get(r.model) ?? by.set(...).get(...)`), then maps
  the map's values into the final shape. Mine calls `rowsFor(model)` (a
  `.filter`) once per unique model inside `models()`, so mine is O(n·m) where
  haiku-c's is O(n). Small at this data size, but it's a cleaner loop and I'd
  take it.
- **Worse (a real bug):** the import path is
  `"../../../../../../../public/framework/ext/JSONL/JSONL.js"` — a relative
  path counting up out of its own collab dir back into `public/`, instead of
  the plain `"../JSONL/JSONL.js"` a module actually living beside `Collab.js`
  in `ext/Collab/` would use. That only works from the exact depth the file
  happens to sit at right now inside this collab's scratch directory; moved
  into `ext/Collab/Collab.js` as shipped code, it would need rewriting or it
  would 404.
- **Worse (a real bug):** `explain()`'s retiring branch always recomputes
  "why" from `m.wins === 0 ? "no wins yet" : winPct%`, but `retire()`'s
  actual rule is win_rate AND cost — so a model with, say, a 10% win rate and
  1 prior win gets told "10% win rate and costlier than the panel median,"
  which is accurate but never says "no wins yet" unless wins is exactly 0.
  Not wrong, just a slightly misleading label some of the time versus mine,
  which states the rule itself ("low win rate and costlier than the panel
  median") rather than trying to characterize the number.
- Also calls `overruleCount()` conceptually right but doesn't reuse it in
  `models()` — like mine, it inlines the overrule count in the same loop,
  which is fine and arguably better than a second full-array `.filter` call.

## haiku-a

Functionally the same as mine.

- **Better:** same `Map`-based single-pass `models()` as haiku-c — faster
  than my `rowsFor()`-per-model approach for the same reason.
- **Better:** `explain()` only appends the overrule clause when
  `m.overrules > 0` ("overruled once" / "overruled N times"), leaving it out
  entirely for the common case of a model that was never overruled. Mine
  always computes `overruleNote` the same way (empty string when zero), so
  the visible result is actually identical, but haiku-a's version reads more
  clearly as "skip this clause" rather than "build an empty string."
- **Better:** the judgment-call note explicitly says `explain()` reads
  `m.overrules` off the already-computed model row instead of calling
  `overruleCount()` a second time — same thing mine does, but haiku-a says
  why out loud, which is the kind of thing that saves the next reader a
  double-take.
- No bugs I could find. Its import (`"../JSONL/JSONL.js"`) is correct for a
  module living in `ext/Collab/` beside `Collab.js`, same as mine.

## If I revise

Take haiku-a's/haiku-c's `Map`-based single pass in `models()` — it is a
straightforward improvement over my per-model `.filter()` and costs nothing
in clarity. Keep my `explain()` wording (states the retirement rule, not a
guessed reason) and my correct relative import.
