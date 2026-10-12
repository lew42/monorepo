# Re-derive the three bands that still don't measure what they claim

`ai/2026-08-17/tier-calibration/` fixed five mechanisms and deliberately stopped
short of three more, because fixing them requires **re-deriving a band** and that
was forbidden in its brief. **It is permitted now** — because it did the expensive
part first and *measured the real causes*. Read its `task.jsonl` before anything
else; the "Open" section is your specification.

## The three

**1. `measure` — reads 26.1 characters on `/framework/`.** Cause, measured: **188px
card captions outvote the prose.** ⚠ Note what this is *not* — the earlier
hypothesis blamed 14 nav labels, and that was proven false: `prose` requires >80
characters, so nav labels were never in the population at all. The band is picking
the wrong population among things that *are* prose-shaped.

**2. `contrast` — reads 8.38 on `/framework/`.** Cause, measured: a **125.7px demo
clock** over a 15px median. Again, not the earlier guess (an h1 over chrome
microtype). One enormous decorative glyph is dominating a ratio meant to describe
type hierarchy.

**3. `scale` — credits 0 at every width** on `/framework/ui/`, where it reads 11–12
distinct type sizes. That page is a Doc holding 19 live component renders, so a
wide spread of sizes is *correct*, not a defect. The `ui-wall` agent's read was
"probably not actionable" — **decide that properly.** A band crediting zero
everywhere is the exact signature of the three dead bands already found this
week, so treat "it's fine actually" as a claim requiring evidence.

## The standard — internal evidence, not agreement

⚠ **Do not tune toward any baseline.** The 18-image vision baseline **does not
reproduce itself** (ICC 0.510), and `taste`'s correlation with it flips sign
between passes. Agreement numbers are near-uninformative and must not drive a
single decision.

What *did* catch every real bug this week is **a band's value distribution against
its own declared range.** For each band you touch, report before and after:

- min, median, max across the full corpus at **both 1280 and 3440**
- **how many pages fall outside the band's own `ok` range** — 16 of 17 was the tell
  for `width-used`, 8 of 18 for `repetition`
- how many score a **hard zero** and how many score **full credit**

⚠ **Both saturation directions are failures.** A band paying full marks to 18 of 18
pages measures nothing, exactly like one paying zero to 17 of 18. `lanes` was
doing precisely that before today. **Sweep all eleven bands for both patterns
while you're in here** — `tier-calibration` logged five as saturated or loose with
numbers, and that list is your starting point, not your limit.

## Also fix

**`frame-gap`'s −0.01 guard bug**, logged by `tier-calibration` as not done. Small,
known, and it's sitting in the same file you'll be in.

## Do not regenerate the baselines

⚠ `audit/taste.json` and `audit/findings.json` were regenerated at 17:14 today and
are **already stale** — `/framework/ui/` was rebuilt afterwards. **One sweep will be
run after both in-flight tasks land; it is not yours.** Regenerating now means
paying for it twice, which is how an earlier run in this repo burned ~1M tokens.

Measure freely to get your distributions — just don't write the committed
baselines.

## Files you own

- `public/framework/ext/DesignTool/taste/**` — `read.js`, `ranges.js`, and the
  band implementations.
- `public/framework/ext/DesignTool/knowledge/**` — ⚠ **every number you change must
  land in `thresholds.md` with its provenance**, and any false-positive class you
  discover goes in `false-positives.md`. A threshold whose derivation isn't written
  down gets "fixed" again by the next person.
- `public/framework/ai/2026-08-17/band-rederive/**` — your task dir.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

⚠ **Fenced off, and this one is live:** another agent is rebuilding
`ext/DesignTool`'s **presentation** right now — `page.js`, `report.js`,
`highlight.js`, `address.js`, the audit pages and `dev/DevBar/**`. **Do not touch
any of them.** If a band change needs a display change, log it and say so; don't
reach across. Also fenced: `ext/Panel/**`, `public/framework/ui/**`,
`styles/layouts/**`, and `audit/*.json` per above.

## Verify

- The module's own **`tests/`** — 23/23 at 400/1280/1920/3440 as of an hour ago.
- **`taste/corpus/`** — 27/1/14, with the `width-used` case now agreeing on all
  seven subjects. ⚠ The corpus is an *ordering* corpus: it asserts that breaking a
  page makes its score go down. A re-derived band that breaks a corpus case is
  telling you something — read the case before you edit either side.
- Spot-check the specific pages named above (`/framework/`, `/framework/ui/`) and
  confirm the new readings match what the page actually is.

## Deliverables, in this order

1. **`measure` and `contrast` re-derived**, with before/after distributions.
2. **The `scale` verdict** — broken or correct — with evidence either way.
3. **The all-eleven-band saturation sweep**, as a table.
4. `frame-gap`'s guard bug, and `knowledge/` updated for everything you changed.

Running short? Cut 4 last, then 3. **Never cut 1**, and say plainly what you
didn't reach — a silent truncation reads as "covered everything".

Log findings as `log` lines in your own `task.jsonl`, never a `findings.md`.

## Working notes

- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.json)) { Start-Sleep 15 }`
- Playwright is installed globally (LAW#4 — no npm dependencies). Reuse the dev
  server on port 80; **do not restart it**, another agent is on it.
- Assert `document.visibilityState === "visible"` before any measurement — hidden
  tabs run no rAF and no ResizeObserver and return frozen geometry. Never wait for
  `networkidle`. Recycle the browser context every ~40 navigations.
- RULE#9: comments near zero, except a trap the code cannot show. A band's
  *derivation* is not a comment — it belongs in `knowledge/thresholds.md`.
