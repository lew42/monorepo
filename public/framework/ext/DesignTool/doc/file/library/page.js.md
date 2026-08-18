The library's index: the prose that says how to read an entry, the wall of
eleven pattern cards plus the `bad/` card, and a strip that measures every entry
at one width in its own iframe.

## The children are two kinds in one list

`children: [...patterns.map(entry), "bad"]` — eleven inline page configs built
from `patterns.js`, then one **string**, which `Page.declare()` resolves from
`bad/page.js` on disk. Nothing else in the module mixes the two forms; it is
what lets the don'ts wing be a real directory (with its own index, its own run
strip and its own corpus) while the entries stay data.

## The wall is above the fold, and it is the navigation

Same rule the module's own `page.js` records: the destinations go above the
live report, not under two screens of prose. Every card carries a live
`zoom-25` render of its pattern as its thumb, so the wall answers *what is
this* before a click.

## `run(width)` renders inside `empty(fn)`

Eleven `frame()` loads in sequence, then one render. Every factory call is
inside the `empty()` callback because capture is synchronous and the loop's
`await` has already let the captor drift. The same shape as `tests/page.js`,
for the same reason.

## Improvements

1. **`run()` here and in `bad/page.js` differ only by their table columns.**
   The loop itself is already shared (`run_all` in `entry.js`); the two
   `results()` methods are ~15 lines each and could collapse if the "Trips /
   Fires" pair were made an optional column set rather than a second method.
   *(simple, speculative — two readable methods may be worth more than one
   parameterised one.)*
2. **No `sweep()` anywhere in the library.** The entries report four chosen
   widths; the widths *nobody chose* are what `sweep.js` exists to find, and
   the "Scroller in a wrapping row" don't is explicitly a case only a sweep can
   catch. A per-entry "find my edges" button is the obvious next thing.
   *(medium, important.)*
