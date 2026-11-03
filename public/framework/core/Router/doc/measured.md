# Measured

The measurements were taken against this design in `core/new/1/`, whose
`Router.js` is line-for-line the one that shipped. That directory is where this
design was proved; its readme is the long form of the Router's record.

```
warm navigation     0.2ms median over 500 navigations
mark()              89µs / 49 anchors · 11ms projected at 5000
:has() recalc       ~300x a plain recalc, still 146µs at 1600 pages —
                    you would need ~183,000 pages on screen to spend one frame
serial walk         RTT + 16ms per SEGMENT, linear. A 5-deep cold link is
                    1.7s of walking at 150ms RTT
```

**What a cold route now fetches:** its chain, **plus each page in that chain's
declared children** — they are imported at construction so menus can draw once with
real titles. Measured on `/framework/`, which draws two levels: 1 → **28** `page.js`
fetches, **+51ms to first paint**, flat with depth. Inline pages (`add()`, `route()`,
`Doc`) still cost **zero** modules.

The serial walk is the honest cost and it **cannot be parallelised blindly**: a
segment's children are unknown until its module has run. Prefetching would need a
manifest, which is the build step this framework doesn't have.
