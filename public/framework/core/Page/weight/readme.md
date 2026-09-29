# Weight — one number per page, 1 by default, that says how much it matters

Live: [`/framework/core/Page/weight/`](/framework/core/Page/weight/) — the formula, then four
live demos with real data: main navigation, quick links, the size upgrade past 10, and two ways
to SHOW the number (A/B, not decided yet). The owner's own words: [`ai/2026-09-29/page-system/weight-brief.md`](/framework/ai/2026-09-29/page-system/weight-brief.md)
and the "Continued, 4:55 PM" half of [`ai/2026/09/29/familiar-structure-every-named-system-ge/owner-words.md`](/framework/ai/2026/09/29/familiar-structure-every-named-system-ge/owner-words.md).

## Use

- **`weight(page_url)`** (`weight.js`) — `await weight("/framework/core/Page/layout/")` →
  `{ weight, refs, manual }`. Fails soft to `{ weight: 1, refs: [], manual: 0 }` for any page
  with no log at all, including a plain `page.js` page.
- **`node Server/page-refs.mjs <from-url> <to-url>`** — the one way a `referenced_by` line gets
  written. Run twice for the same pair and only one line lands.
- **`node Server/page-refs.mjs <to-url> --weight <N>`** — the manual number; can be negative.

## Watch out

- **A `page.js` folder can get a real `page.jsonl` file too**, written by the tool above. It
  looks unusual — most `page.jsonl` files here ARE the page — but this one is pure data, inert
  to routing, and only `weight.js` ever reads it. Proof, not assumption: `doc/design.md`.
- **`referenced_by` accumulates; `weight` doesn't.** Every distinct referencing page is kept
  (like `place()` in `Log.js`); a manual `weight` line is a plain "set" — the latest one wins.
- **`core/Page/doc/jsonl.md` doesn't document these two line kinds yet** — that file is outside
  this task's fence (another minion owns it). The exact shapes: `doc/design.md`.
- **`jsonl/` is missing from the live demo on purpose** — it's the other live example the brief
  named, but another minion was mid-edit on that folder while this task ran, so it was left out
  rather than risk a collision.

## More

- [`doc/design.md`](/framework/core/Page/weight/doc/design.md) — the formula, why add not
  multiply, why a `page.jsonl` beside a `page.js` is safe, and the four mid-task additions.
- [`doc/prior.md`](/framework/core/Page/weight/doc/prior.md) — what already existed before this
  task (the type-use counter, the importance graph, the static weight proposal, the `jsonl.md`
  accumulation pattern) and how this differs from each.
