# Harden the rubric before we bet the site on it

`ai/2026-08-17/vision-baseline/` established the baseline and answered the
tiebreaker: **taste correlates with how pages look, the math tier is
anti-correlated** (Pearson −0.393; it rewards emptiness and never emits below 70).
Sonnet is good enough to be the production scorer (Spearman +0.625, ~5,620
tokens/image). `baseline.json` holds 18 frozen 1280×800 shots keyed by content
hash, with five anchored dimensions and raw prose per dimension.

**Do not redo any of that.** The next step is to make the instrument trustworthy
enough to run over the whole site, and its author named the three gaps itself.

## The finding that governs this task

**A constant 72 that never looks at the image scored MAE 5.22 — beating taste
(7.22) and crushing math (12.78).** Haiku's MAE of 5.06 "looked best in class"
and it is a constant-70 generator: range [68, 72], sd 1.65, 14 of 18 rows flat,
Spearman +0.207.

So **MAE alone selects the scorer that does nothing.** Every comparison you report
must carry **spread (sd), the flat-row count, and a rank correlation** beside it.
If a number can be gamed by refusing to discriminate, it is not a score — it is a
hazard. Treat that as this task's first rule.

## Three jobs

**1. Measure the baseline's own repeatability.** It is a single-scorer baseline and
its self-agreement is unmeasured, so we do not know whether an 8-point
disagreement with taste exceeds the baseline's own noise. Re-score all 18 images
**blind** — do not read `baseline.json`'s scores until after you have written your
own — then report per-dimension MAE, sd and rank correlation against the first
pass. **This number bounds every other claim in the program**: no tier can be
shown to agree better than the baseline agrees with itself.

If self-agreement is worse than the tiers' agreement, say so plainly. That would
mean the rubric is under-specified, and it is far better to learn it now than
after scoring 168 pages.

**2. Split `contrast`.** It has the worst cross-model agreement of any axis
(Sonnet MAE 9.0) and its author's read is that it is doing two jobs. Work out what
those two jobs are from the raw prose already in `baseline.json` — the sentences
say what drove each number — then define the replacement axes with their own
30/60/90 anchors and re-score the 18 images on the new axes only.

⚠ **Keep the total axis count at five or six.** *"a rubric with twelve axes is a
rubric nobody reads"* — if splitting `contrast` makes six, consider whether a
weak axis has earned its place. `polish` was already rejected as a fudge factor;
apply the same standard.

**3. Validate the Sonnet rescale.** The proposed monotone map is
`70.2 + (s − 66.2) × 2.04`, claimed to fix Sonnet's hedging into 60–72 while
leaving rank correlation untouched. **Verify that claim rather than assuming it** —
a monotone transform cannot change Spearman, so if the recomputed Spearman moves
at all, something else changed and you have found a bug. Report MAE and sd before
and after, and state whether Sonnet-plus-rescale is now good enough to be the
production scorer.

## What to conclude

One paragraph, decision-ready: **is this rubric ready to run over ~168 pages, and
on which model?** If yes, say what it costs per page and in total. If no, say
exactly what is still wrong. A "not yet" with a named blocker is a better outcome
than a premature yes.

## Hard constraints

- **Reuse the existing frozen PNGs** — do not re-shoot. They are keyed by content
  hash; verify the hashes still match before scoring and stop if any don't.
- **Score no new pages.** ⚠ `styles/layouts/**` is being redesigned right now, so
  any page measured today is a moving target. Sticking to the frozen 18 is what
  makes these numbers comparable at all.
- **Do not edit `ext/LayoutTool/**`.** Its four calibration bugs are real and
  queued for a later atomic pass; logging further evidence about them is welcome,
  fixing them is not yours.
- No site pages, no `Server/**`, no `ext/Panel/**`, no `ext/JSONL/**`, no
  `ext/AITask/**`.

## Files you own

- `public/framework/ai/2026-08-17/rubric-v2/**` — your task dir, including
  `rubric.md` (the axes and their anchors) and `agreement.json` (the numbers).
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

⚠ **`baseline.json` in the sibling task dir is READ-ONLY.** It is the source of
truth and rewriting it destroys the comparison. Your second pass is a *new* file.

## Deliverables, in this order

1. **Repeatability**, as `log` lines in your `task.jsonl`: per-dimension MAE, sd,
   rank correlation, first pass vs blind second pass.
2. **The split `contrast` axes**, anchored, with the 18 images re-scored on them.
3. **The rescale verification**, with the Spearman-cannot-move check.
4. **`rubric.md`** — the final axis list, ready to hand to a production scorer.
5. The one-paragraph ready/not-ready verdict, naming the model and the cost.

Running short? Cut 2 before 1. **Never cut 1** — without repeatability every other
number in this program is unbounded. Say plainly what you didn't reach.

## Working notes

- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.json)) { Start-Sleep 15 }`
- Spawn a subagent per cheap tier if you re-measure one; give it the identical
  rubric and identical images or the comparison is meaningless.
- LAW#4: no npm dependencies. Report token counts and cost per image — they are
  part of the answer, not overhead.
- Log findings as `log` lines in your own `task.jsonl`, never a `findings.md`.
