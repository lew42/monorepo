# Where are the missing 33 points?

A second turn of the crank **plateaued** (`ai/2026-08-17/generator-compound/`):
mean 66.60 → 67.00, ceiling 78 → 78, p10 58 → 58, and the held-out delta was
*smaller* than the fit-range delta, so it isn't overfitting either. Refitting
`SHAPES` has run out of road.

**Two reasons to suspect the loop was turning the wrong knob, before anyone turns
it harder:**

1. **`SHAPES` reweighting can only change the *mix* of rolls, never the *quality*
   of any one roll.** If the score distributions of `bands`, `column`, `rail` etc.
   overlap heavily, shifting mass between them moves the mean a fraction of a
   point and cannot touch the extremes — which is exactly the measured signature
   (ceiling and p10 both moved by literally zero).
2. **Credit assignment can only fit what `roll()` records, and it records five
   things.** A round-3 row is:
   `{seed, choices:{seed, fit, depth, chaos, masthead, shape}, worst, mean}`.
   So `COUNTS`, `DEPTHS`, `INNER`, `ROLES`, `TONES` and every `AUTHOR` emission
   range (pad, gap, measure, tracks…) are **invisible to the loop** — `draws()`
   picks them and then throws the pick away. Most of the generator's knobs have
   never been credited at all.

The mean roll leaves roughly **33 points** on the table. Nobody knows which of
the eleven taste bands they are in. **Find out. Diagnose before fitting.**

## Deliverable 1 — the loss budget (this is the task; do it first)

Sweep the same population as round 3 so it stays comparable — pooled over
depth {1,2,3} × chaos 0 × seeds 0–119, n=360 — but this time **capture
`rate()`'s per-band output for every roll**, not just the aggregate score.

Produce, for each of the eleven bands in `ext/LayoutTool/taste/ranges.js`:

- **mean points lost** to that band (its weight × how far off-ideal it sits),
- **how often it is the `weakest` band** in a roll,
- **how often it is dropped/unread** (`covered` tells you; a band nothing could
  read is not a band being failed — do not count those as losses),
- and the **share of the total 33-point gap** it accounts for.

Rank them. **The output is a table sorted by points lost.** That single table is
the deliverable — it tells us whether the gap is one fixable emission (say
`measure` or `width-used`, both of which a one-line change to `gen.js` could
move) or spread thin across ten bands, in which case no amount of search helps
and the honest answer is "the generator is near its structural ceiling".

Then answer the question the table implies, in one paragraph: **is the dominant
loss fixable by changing what `gen.js` emits, or only by changing what shapes
exist?** Name the specific emission if it's the former.

## Deliverable 2 — make the other knobs visible

Widen what `roll()` records in `choices` to include every table `draws()`
actually consults: `COUNTS`, `DEPTHS`, `INNER`, `ROLES`, `TONES`, and the
`AUTHOR` emission values. Keep the existing five keys and their names —
`search.js`'s `credit()` reads them and round-3/4 data must stay parseable.

This is instrumentation, not a fit. **Do not refit any weights under this
deliverable.** Verify `credit()` and `proposal()` still run and still produce the
same output for `shape` as before your change — if they don't, you broke
something.

## Deliverable 3 — one targeted experiment, only if 1 and 2 both land

Take the single largest fixable loss the table found, change **one** emission in
`gen.js` to address it, and re-sweep the same 360 seeds **plus** the held-out
range (seeds 10000–10119). Report the delta on mean, ceiling and p10 for both.

Keep the change only if the **held-out** numbers improve. If they don't, revert
it and log that you did — a null result here is worth having and costs nothing to
report honestly.

## Hard constraints

- **Do not edit anything under `ext/LayoutTool/**`.** The taste tier is frozen so
  every number stays comparable to rounds 3 and 4. If you believe a band's maths
  is wrong, **log it as a finding and carry on measuring with it as-is** — a
  broken range still discriminates, and re-tuning the ruler mid-measurement is
  how the last run wasted ~1M tokens.
- **Do not change `SHAPES` weights.** They are where round 4 left them and that
  is the baseline.
- Fitness stays **worst-width, not mean**. That's deliberate.

## Files you own

- `public/framework/styles/layouts/space/**` — yours alone.
- `public/framework/ai/2026-08-17/loss-budget/**` — your task dir.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

**Read-only everywhere else.** `ext/Panel/**` belongs to another session; another
agent may be reporting on `public/framework/audit/pages.js`. Don't measure
anything you don't own — a repo being edited under you gives false readings.

## Reuse this, don't rebuild it

The previous run left a working harness in the session scratchpad:
`sweep-round.mjs`, `round3.json`, `round4.json` at
`C:\Users\mike\AppData\Local\Temp\claude\c--Code-lew42-monorepo\c6315543-dde2-46c6-b052-c819794f42e8\scratchpad`.
Read `sweep-round.mjs` first and extend it. Raw data stays in the scratchpad,
never in the repo (RULE#12).

## Deliverables, in this order

1. **The ranked loss table and the paragraph, as `log` lines in your own
   `task.jsonl`.** Not a `findings.md` — the harness blocks subagents writing
   report files, and RULE#15 wants them in the log.
2. The `choices` instrumentation.
3. A **Decisions** entry in `space/readme.md`: where the points actually go.
4. The targeted experiment, if there's room.

Running short? Cut in reverse order — 4 first, then 3. **Deliverable 1 is the
whole point; never truncate it silently.** If you only get the table, say so.

## Working notes

- **Foreground is the default.** A two-minute blocking command is normal. If you
  background one, poll it: `while (-not (Test-Path out.json)) { Start-Sleep 15 }`
- Use a **standalone headless Playwright browser** (globally installed), not a
  tab in Mike's browser. A hidden tab reads `visibilityState === "hidden"` and
  runs no rAF and no ResizeObserver, so it measures frozen geometry. Assert
  `visibilityState === "visible"` before trusting a number.
- Recycle the browser context every ~40 navigations — the renderer wedges after
  ~85–110 in one context. Never wait for `networkidle`: the live-reload socket
  never idles.
- Check usage before wide work.
