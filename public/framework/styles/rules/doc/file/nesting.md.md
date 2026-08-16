## What this file is

The third chapter, and the one with the closed-form list: a block-level box in
normal flow containing block-level boxes in normal flow cannot break, and
there are exactly six departures from that. `nesting_table()` in `demos.js`
builds all six live below the prose and reports what `ext/LayoutTool`
actually finds in each.

## The one line worth memorizing

`1fr` **is** `minmax(auto, 1fr)` — the `auto` floor is the content, which is
named as "the single most common broken-grid cause in this repo." Every other
chapter in this module that touches grid (Robust, the layouts catalog) treats
this as already known.

## Improvements

1. **Nothing ranked.** The table is exhaustive by construction (six
   departures, all six demoed), and the live column means "safe" is measured
   rather than claimed.
