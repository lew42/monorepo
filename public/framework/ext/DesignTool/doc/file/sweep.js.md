Where does a layout's behaviour actually change? Coarse stride, then bisect
only the intervals whose *signature* differs — the same edges a per-pixel
sweep would find, for roughly 2% of the loads. The reasoning, and what it
found the first time it ran, is worked in full in
[Responsiveness](../knowledge/responsive.md).

## A signature is discrete facts, never a bucketed continuous one

The first version bucketed `width_used` into 5% bands and reported four edges
where there was one, because a continuous metric crosses a bucket boundary every
few hundred pixels regardless of whether anything reflowed.

**And discrete was not enough.** The second version used the whole firing
rule-set, which is discrete and still unstable: a page sitting near any
threshold flips a rule on and off as the width drifts. In a 174-edge site sweep,
**five separate pages "changed" at 1272px** and every one of them only because a
*low* `line-height` finding dropped out. The signature now keeps the
**structural** rules (`unreachable`, `clipped`, `escape`, `doc-overflow`,
`collision`, `zero-size`) at any severity, **any rule at all firing `high`**,
the sideways-scroll flag, the cut count, and the **measure band** — whose
boundaries are the numbers `measure` itself judges by.

⚠ The `high` clause is why typography is not simply excluded. The worked example
in `responsive.md` — an `illegible` band existing only between two widths — is
exactly a non-structural rule appearing and disappearing, and a signature that
dropped the tier would have lost the finding the file exists to advertise.

## `frame()`'s timeout is what makes an unattended sweep safe

Three of twenty site sweeps hung outright inside `page.evaluate`, waiting on an
`onload` that never came. `frame()` rejects after 15s, so a sweep now fails
loudly — but nothing here catches or retries, so one bad url still ends the
sweep. That is the right default for a measuring tool and worth knowing before
wiring `sweep()` into a page.

## `bisect()` costs six loads per edge, `precision` stops it early

The narrowest window containing a change is pinned to the pixel in six loads;
raising `precision` trades exactness for fewer iframe loads when a rough
answer is enough.

## Improvements

1. **`sweep()` is not called from anywhere in this module's own UI** — not
   `audit/page.js`, not `tests/page.js` — only from the console and (per the
   readme's own Open section) it "runs from the console and the tests page,"
   which this file itself doesn't confirm: `tests/page.js` does not actually
   import `sweep`. That's a stale claim in the readme worth fixing alongside
   this file's docs. *(simple, important — see the audit report.)*
2. **`loads: samples.length + edges.length * 6` assumes `bisect()` always
   takes exactly six iterations**, which is only true when `precision` is left
   at its default (4) and the interval is exactly one `stride` wide. Passing a
   custom `precision` silently makes this count wrong. *(simple,
   speculative — the count is informational only, never used for control
   flow.)*
