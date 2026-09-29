# Refine — a dictation shown as a ladder: raw → clean → structured → brief, with a coverage table

`refine()` fetches one run of `Server/refine.mjs` (dev-only — see `Server/doc/refine.md`) and lays it out as four columns side by side: what was said, then each refinement step. Click an ask, or a bullet in Structured, and its source sentences light up in Clean and Raw — "wait, what did I actually say?" answered without reading anything twice.

## Use
```js
import refine from "/framework/ext/Refine/Refine.js";
refine(import.meta, { run: "/framework/ai/2026-09-29/prompt-refine/runs/b/" });
```
A `runs` list — `[{ id, label, dir }, …]` — draws a picker (`<select>`) above the ladder and makes this view **own** `?run=` in the url, the same one-owner rule [`ext/files`](/framework/ext/files/) uses for `?file=`: a reload lands back on the same run. The card at [`from-dictation-to-a-brief-with-nothing-l`](/framework/ai2/2026/09/29/from-dictation-to-a-brief-with-nothing-l/) uses this for its sample/a/b/c picker.

## Watch out
- **Three widths, not two.** 1600px+: four full columns. 640–1599px: three — Raw and Clean share one, with their own mini tab strip (four columns squeezed a real run's Raw and Clean down to a few words a line as low as 1280px). Under 640px: the original stacked four-way tabs.
- **The "Dropped & flagged" strip, right under the one-line count**, is a shortcut into the full coverage table below — every dropped or "(thin)" sentence, one row per flagged ask (anchored on its first cited sentence, not one row per sentence in a big range). Click a row the same as an ask or a bullet.
- **A citation is a comma list ("[S3, S7]") or a range ("[S6-S9]")** — `Server/refine.mjs` writes whichever shape it lands on per run; `parse_cites()` accepts both, expanding a range to every sentence in it for the highlight while keeping its written form for display. Cost a real bug: run B and C's citations are mostly ranges, and the first version only understood commas, so clicking almost any ask on those two runs highlighted nothing.
- **The raw → clean highlight is a heuristic, not a citation the tool wrote.** `clean.md` numbers its own sentences; `raw.txt` doesn't. The matching stretch in Raw is found by word overlap between each clean sentence and Raw's own sentences — see `doc/raw-match.md` for the worked example and where it could be wrong.
- **A run missing a file shows what it has, and says what's missing**, instead of breaking — useful while `Server/refine.mjs` is still landing its later steps (`--collab`, `refine.json`).
- **`refine-` is a new CSS class prefix**, not yet in `styles/css-scopes.txt` — that file was outside this module's fence, the same as `ask-`'s precedent (see the file's own comment there). The mastermind registers it.
- **Dropped rows are warm (`--warn`), never `--error`/`--hot`.** A dropped sentence is worth a look, not a failure — the owner's rule for the whole view.

## More
- [Overview](/framework/ext/Refine/) — run C live by default (the longest of the four runs, and the one with a dropped sentence AND a thin citation on its very first screen — `runs/sample` alone has neither); `?run=` picks any other run, including the small hand-built fixture
- `doc/raw-match.md` — the word-overlap heuristic that lights up Raw, worked example
- `Server/doc/refine.md` — what `refine.mjs` writes, and why each file looks the way it does
