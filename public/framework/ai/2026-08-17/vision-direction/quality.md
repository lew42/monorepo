# quality — direction first, then the delta
6 pilot pages @1280, `--replay` of the gate's own pngs, Sonnet, `critique-full-v4` (= `v2`, only the `fix` key changed) + `--turn2 css-v3`. **30 findings, $3.64** of a $5 ceiling.
Every number here is measured — headless rects, computed colours, pixels sampled from the pngs the model saw, and each `decl` injected into the live page to see what it moved.

## The four precisions — right ÷ all (right / taste / wrong)
| | n | all | `broken` (10) | `maybe` (20) |
|---|---|---|---|---|
| findings | 30 | 9/11/10 → **0.30** | **0.30** | **0.30** |
| **directions** | 30 | 28/0/2 → **0.93** | **1.00** | **0.90** |
| decls | 4 | 1/0/3 → **0.25** | 0.50 (n=2) | 0.00 (n=2) |
| retracts | 20 | 15/1/4 → **0.75** | 0.83 (n=6) | 0.71 (n=14) |

4 decls + 20 retracts + 6 "no CSS can do this" = **30 = findings in `vision.jsonl` ✓**; turn 2 answered **30 of 30**, so never-return-nothing held — and so did the schema: 30/30 directions inside the closed vocabulary, **zero** px or hex leaked into a `fix`, zero missing `fix.text`.

**The direction layer works — 0.93.** Given its own observation the model names the right property and sign 28 of 30 times; both misses are the same one, *"increase the content column width a lot"* for the deliberate 40em measure, which turn 2 then correctly refused. The failure is **upstream** (seeing) and **downstream** (translating), never in asking for a direction.
**`broken` has stopped predicting** — 0.30 against `maybe`'s 0.30 (was 0.60 / 0.47); 4 of the 10 wrong findings are filed `broken`.

## Worst three
1. **A real accessibility bug retracted by wrong arithmetic** (`ai/2026-08-17/`): *"`.muted` bumped to 75% today; #6f6f6f = 5.02:1 on white, over AA."* The darkest glyph pixel of "dispatched" in that png is **rgb(135) = 3.59:1**; `.muted` composed on `--subtle` computes **2.96:1**. It read the right file and dropped the `.muted` multiplier — the hazard `framework.css:225` names one line above the rule. Two right findings (#6, #10) killed by one sum.
2. **A provably inert decl** (`ext/DesignTool/`): `.page.dt-page { gap: var(--gap, 1em) }` — the page wears `.page.doc-page.page-DesignTool`. Injected live: 309→309, 602→602, code top 73→73. A selector from a file it read, for a page that never wears it.
3. **A fix for a difference that does not exist** (`/framework/`): *"three narrow '0' stat cards"* → `grid-template-columns: repeat(5, 1fr)`. All five measure **138.375px**. It hard-codes five columns over a responsive `.grid.auto` — a regression below ~700px, for nothing.

## Best three
1. **It killed the false finding both Sonnet seats shipped last run** (`core/`): *"the App card's right edge clips against the content-area boundary"* → retracted, quoting `.page > :is(.page-previews, .page-walls) { padding-inline: var(--gutter-x) }`. Measured **42px right, 42px left**.
2. **The one right decl, verified** (`ui/`): `::placeholder { color: var(--subtle); opacity: 1 }` — no `::placeholder` rule exists anywhere in `public/`. Injected: **4.61:1 → 5.32:1**. One rule, no branch.
3. **Exact citation** (`core/` #29): *"`.flow > * + *` gives `.page-previews` the same `var(--flow)` margin as every sibling."* Measured: both gaps **30.08px**.

## Verdict — GATE FAILS (decls 0.25 < 0.6). No preview/accept path.
**Turn 2 does not write CSS, it writes retractions** (20 of 30) — and 3 of the 4 deltas it did write are wrong about *rendered* state it cannot see.
**The next knob is not a prompt: give turn 2 the measurements.** It has `Read` and nothing else, so it guesses geometry and colour from source. Run `probe()`/`analyze()` on the same url and paste the rects and computed colours beside the DOM outline it already gets — free, node-only, and it kills every mode above: 3.59:1 vs "5.02:1", 138px vs "narrower", 42/42 vs "flush", `.dt-page` vs `.doc-page`.
A one-line bug found on the way: `sheets()` offers only the `.css` in the url's own directory, so `/framework/ai/` never saw `ext/AITask/ai.css` — #19 and #20 lost their decl to it.
⚠ [`proposal.md`](./proposal.md) beside this file (another seat, 20:58) wires that accept path into `browse.js`, and **this measurement does not open it** — one accepted `decl` in four would be wrong. Wire the *retract* first: at 0.75 it is the only turn-2 output worth a button. And `browse.js` is a hard 404 right now — line 3 imports `../../audit/twin.js`; the file is at `../audit/twin.js`.

**$0.121 a finding** end-to-end ($0.71 turn 1 + $2.94 turn 2), $0.152 a decl-or-retract, **$0.228 a *correct* one**. Turn 2 is **81% of the bill** and bought four declarations.
⚠ The 0.30 findings figure is **not comparable** to the prior run's 0.62 — same referee, far stricter method (measured, not eyeballed). Compare inside this table; a real v2-vs-v4 read needs v2 re-judged.
