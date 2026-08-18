# quality — is the tool proposing the right fixes?
6 pages @1280, three seats on **the same six pngs** (`--replay`): A = Sonnet `critique-full-v2`,
B = Sonnet `critique-full-v2b` (byte-identical, fresh session), C = Opus; A and B carried
`--turn2 css-v2`. 74 findings, $6.51 of a $9 ceiling.

## Precision — right ÷ all (right / taste / wrong)
| | findings | fixes | decls |
|---|---|---|---|
| A (Sonnet, 26) | 16/7/3 → **0.62** | 16/5/5 → **0.62** | 1/3/1 → **0.20** |
| B (Sonnet, 24) | 12/10/2 → **0.50** | — | 0/1/0 → **0.00** |
| C (Opus, 24) | 9/14/1 → **0.38** | — | no turn 2 (budget) |
| **all 74** | 37/31/6 → **0.50** | | **1/4/1 → 0.17** |

Decls judged: 6 = decls in `vision.jsonl`: 6 ✓ · `broken` (15) → **0.60**, `maybe` (59) → **0.47**,
and all 3 wrong findings were filed `broken`. **Only 6 of 74 findings produced a declaration** — 68
were declined, 18 quoting the files back accurately; the gate is n=6. **Skill notes: zero** across
12 turn-2 calls (wiring parses, appends, dedupes — unit-tested).

## Consensus — does agreement predict `right`? **No. It inverts.**
| | clusters | right | precision |
|---|---|---|---|
| agreed ≥2/3 | 18 | 6 | **0.33** |
| lone seat 1/3 | 32 | 21 | **0.66** |
| contradictory directions | **0** | | |

The failure Mike feared did not happen; a different one did. **The seats agree on the generic
complaints and disagree on the real bugs.** All three flag "dead space on the right" (the
deliberate 40em measure); one seat each caught the bar filled 1-of-5 beside a "0/5" label, a
subtitle promising *five* above **ACTIVE 4**, and every card truncated. Two agreed clusters are
agreed-and-*wrong* — both Sonnet seats made the same false pixel claim.
## Worst three
1. `ui/` — "approximately **5 px** from the viewport edge". It is **89px**, wider than the 42px left inset.
2. `core/` — "the App card has no visible right-side margin". Its gutter is 44px against the left's 42px. **Both Sonnet seats said it**; the decl would have broken a symmetry already right.
3. `ext/DesignTool/` — "cards hard-cut by the viewport, no cue that the page scrolls". That is the fold; the header already said *this is the TOP of the page, scroll 0*.
## Best three
1. `ai/2026-08-17/` — "colour across two or three of five segments while the label reads **0/5**". A live data bug, found by eye.
2. `core/` — turn 2 **retracted its own turn-1 finding** after reading the CSS: *"`.page.topic { --measure: 40em }` intentionally caps the prose track… **No defect.**"*
3. Twice refused to widen a column: *"widening trades dead space for an unreadable measure; gutter is correct."*

## Verdict — GATE FAILS (0.17 < 0.6). Nothing built on top.
**The dominant failure is `taste` filed as `broken`, by a critique turn that cannot see the
code.** 4 of 6 decls are taste; the one wrong decl serves an invented finding. Turn 1 cannot
know that the 40em measure, the shipped `--subtle` bump and `.wall`'s `align-items: start`
are deliberate — so it reports them, and turn 2 spends its budget retracting.

**The prompt change:** give turn 1 the constraints turn 2 discovers. `critique-full-v3.md`
(now run — see below) starts it — sidebar is chrome, name greys as greys, never state a pixel
distance, the fold is not a defect. The larger move is a short **design-intent header** (the
measure is deliberate, `--subtle` is AA, the rail is chrome) and making `retracted` a
first-class turn-2 outcome. Re-run v3 on these pngs (~$2.30) first.

## v3 + intent — not default
`critique-full-v3` + `prompts/intent.md` (Sonnet, same 6 pngs, findings only, $0.82): **11 findings, 6/4/1 → 0.55** findings and **0.55** fixes, against seat A's 0.62/0.62. Every mode it targeted is gone — no "5px from the edge", no flush App card, no fold-as-defect, no dead-space-right, no sidebar chrome — and wrong fell 3→1.
**But it over-suppresses: `broken` went 5 → 0**, so the ≥0.75 broken bar is undefined, and `/framework/ai/2026-08-17/` returned **0 findings**, losing both real bugs it had caught (the 1-of-5 bar beside "0/5", the subtitle promising *five* above **ACTIVE 4**). Intent silences the generic complaint and the specific bug together. Keep v2 default; make intent a `maybe`-only damper, or name the bugs it must still report.
