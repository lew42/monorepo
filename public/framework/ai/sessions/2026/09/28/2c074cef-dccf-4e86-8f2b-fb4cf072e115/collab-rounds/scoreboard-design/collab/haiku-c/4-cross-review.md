# Cross-Review: Scoreboard Implementations (haiku-c)

## haiku-a vs haiku-c

**Functionally equivalent?** Yes. Both implement the same 6 methods with identical behavior and return types. Both read rows, aggregate by model, and compute the same statistics.

**What is better about haiku-a:**

1. **Conciser explain() output** — Only includes overrule text when `m.overrules > 0`, producing "haiku-a: 1 decision, 0 wins (0%), $0.01 total." instead of my "…, never overruled, …". This is more graceful for the common case of uncontested models.

2. **Slightly cleaner overruleCount() logic** — Uses `model == null` (loose equality) instead of `=== undefined`, which catches both `null` and `undefined` in a single check. More defensive.

3. **No explicit constructor/assign methods** — Relies on JSONL's own constructor chain. My explicit methods are redundant since I immediately call `super()` which already sets `this`.

**What is better about haiku-c (mine):**

No clear advantages — haiku-a's approach is slightly more polished in the explain() output and the null check is more permissive.

---

## sonnet-b vs haiku-c

**Functionally equivalent?** Yes. Both implement the same 6 methods and produce identical behavior, but sonnet-b's structure is quite different.

**What is better about sonnet-b:**

1. **rowsFor(model) helper method** — Extracts the common pattern of filtering rows by model into a reusable method. While this costs a seventh method, it makes the logic clearer and enables future queries without modifying the class (e.g., someone could call `board.rowsFor("haiku-a").length` directly).

2. **Static median() method** — Extracts median calculation into a standalone, documented static method. Makes the algorithm explicit and testable independently. More maintainable than inline calculation.

3. **models() via unique Set + model(id) map** — Different strategy: finds unique model ids, then computes each individually. Less efficient (N passes vs. 1) but more modular — models() delegates to model(id), so all per-model logic lives in one place.

4. **Excellent class-level documentation** — The comment block at the top includes a usage example and clearly explains the grouping strategy. My implementation has less context.

5. **More robust no-data handling in explain()** — Returns `"${model}: no decisions logged yet."` vs. my bare `"${model}: no data"`. Slightly more helpful.

6. **Overrule text format** — "overruled once" vs. my "overruled once" (identical actually). Both are equally good.

**Performance tradeoff:**

- My approach (and haiku-a's): Single-pass Map aggregation. O(n) where n = rows.
- sonnet-b's approach: models() calls model() for each unique id, each of which filters rows. O(n × m) where m = unique models. Slower for large datasets but trade-off accepted for modularity.

**What is better about haiku-c (mine):**

- Performance: Single-pass aggregation is faster than sonnet-b's per-model filtering approach.
- No redundant constructor/assign boilerplate (though sonnet-b includes it more explicitly, matching house style better than my explicit methods after super()).

---

## Summary

**haiku-a** wins on polish: concise output and defensive null handling. No extra methods, same efficiency as mine.

**sonnet-b** wins on modularity and maintainability: rowsFor() and static median() are architectural improvements that make the code clearer and more extensible, despite the performance cost. The documentation is also stronger.

**My implementation** is solid but occupies a middle ground — efficient like haiku-a but less polished in output; modular like sonnet-b but without the helper methods. The explicit constructor/assign is unnecessary boilerplate given JSONL's own setup.

If I had to rank them: **sonnet-b > haiku-a > haiku-c**, with haiku-a and haiku-c close on performance but haiku-a superior on polish.
