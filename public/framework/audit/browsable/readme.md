# audit/browsable — the prime objective's scorecard: how deep the site is, and how much of the way in is a picture — computed from source, for the owner and the next agent

## Use
`findings.json` is the generated baseline; `page.js` only renders it, so every number moves when it is regenerated:
```js
const { totals, by_kind, depth_table, rows } = await fetch("/framework/audit/browsable/findings.json").then(r => r.json());
```
Regenerate with a one-off Node script from a checkout — never at runtime (LAW#1), never committed (RULE#12); the recipe is under "Regenerate" in [doc/decisions.md](./doc/decisions.md).

## Watch out
- Never type a number into `page.js` — the one-off it replaced was stale the day it was written; regenerate `findings.json` instead. [doc/decisions.md](./doc/decisions.md)
- A lone apostrophe in a `//` comment reads as an open string to a naive scanner and silently eats every field after it — check for comments before quotes. [doc/decisions.md](./doc/decisions.md)
- `children: "a " + "b "` (concatenated strings) and `Doc.wall()` (declared children also previewed as cards) are real patterns; miss either and the count is silently wrong. [doc/decisions.md](./doc/decisions.md)
- Known undercounts: "own docs" is only `hasReadme` + `isDoc`, and an `array.map(…)` child list becomes one `dynamic-list` placeholder (4 places). [doc/decisions.md](./doc/decisions.md)

## More
- [doc/decisions.md](./doc/decisions.md) — why this page exists, the static-parse method, the regenerate recipe, traps found the hard way, what is still open.
- Page: [/framework/audit/browsable/](/framework/audit/browsable/) — parent: [/framework/audit/](/framework/audit/)
- Files that matter: `findings.json` (generated baseline, committed) · `page.js` (renders the JSON) · `readme.md` (this index)
