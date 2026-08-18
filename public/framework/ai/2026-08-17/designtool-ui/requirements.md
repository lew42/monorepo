# Diagnose the DesignTool's interface — design it, don't build it

Mike, 2026-08-17, verbatim:

> for the LayoutTool, we shouldn't have 2 screens. also, the whole devbar is very
> cluttered, it's not visually clear what is selected, what we're looking at, what
> the target is, etc. soemtimes, a layout report item highlights the whole page -
> not very helpful. we need the feedback from the layout tool to be accurate.

> until the layouttool becomes mathematically accurate (without the visuals), maybe
> we should integrate image analysis.

> Do not recompute screenshot + image on resize!!!

⚠ **You may not edit `ext/DesignTool/**` — another agent is inside it right now**
fixing four calibration bugs. Your deliverable is a **document that the next agent
implements from**, written with evidence. Read and screenshot freely; change
nothing outside your own task dir.

Note the module was renamed from `LayoutTool` to `DesignTool` today, so Mike's
words above use the old name for the same thing.

## Job 1 — the whole-page highlight bug, diagnosed to a line

*"soemtimes, a layout report item highlights the whole page - not very helpful."*

This is the most concrete complaint and the most fixable. **Find the actual
mechanism**, don't theorise:

- Reproduce it. Which findings highlight the root? Is it a rule whose subject
  genuinely *is* the page (a whitespace or width finding about the whole
  viewport), or is it a lookup failing and falling back to the root?
- ⚠ `probe` walks a flat preorder node array with a depth cap and a `cut` flag —
  a finding pointing at a culled node has no element to highlight. That is a
  strong candidate; confirm or eliminate it with a real measurement, not a guess.
- Say for each cause whether the honest fix is **a better highlight target**, or
  **not offering a highlight at all** for findings whose subject is the page. An
  affordance that lies is worse than an absent one.

Name the file and line for every claim.

## Job 2 — one screen, not two

Establish what the two screens currently are, what each uniquely offers, and
**what the single screen looks like.** Concretely:

- Inventory both. What does each show that the other doesn't? Anything appearing
  in both is a duplicate and picks a side.
- ⚠ **Deleting beats adding** (RULE#18). The one-screen answer is most likely
  *"screen B's three useful parts move into screen A and screen B is deleted"* —
  not a new third screen that unifies them. If you propose a new view, justify why
  neither existing screen could host it.
- Design the layout of the single screen, and say how it behaves from **390 to
  3440** — a tool that only works on a wide monitor is half a tool.

## Job 3 — the devbar: make the state legible

*"not visually clear what is selected, what we're looking at, what the target is."*

There are three distinct pieces of state hiding in that sentence, and the fix
starts by naming them:

- **the target** — which element or page is being measured
- **what we're looking at** — which report, tier or width is on screen
- **what is selected** — which finding is active

Work out how many controls the devbar actually carries today (count them), which
of those three states each one reflects, and **which states have no visible
representation at all.** Then design the minimum that makes all three
unambiguous. ⚠ Fewer controls, not more labels — clutter is the complaint, so a
proposal that adds a legend has misread it.

## Job 4 — where image analysis fits, and one hard constraint

Mike wants vision integrated *"until the layouttool becomes mathematically
accurate."* The groundwork exists and you should read it before designing
anything:

- `ai/2026-08-17/vision-baseline/` — the 18-image scored baseline, and the finding
  that the **rules tier's aggregate score is anti-correlated** with how pages look
  (Pearson −0.393) while taste correlates. The aggregate is being removed right
  now by the other agent.
- `ai/2026-08-17/rubric-v2/` — the rubric being hardened, with a
  ready/not-ready verdict and a per-page cost.
- `ai/2026-08-17/shots-in-log/` — the `shot` log line and the loopback-guarded
  route that already serves screenshots to the dashboard. **Reuse it; do not
  design a second mechanism** (RULE#7).

⚠⚠ **"Do not recompute screenshot + image on resize!!!"** — three exclamation
marks, so treat it as a hard constraint. Vision scoring costs real money per image
(~$0.035 on the cheapest tier that works). Say exactly **what triggers a
re-score** and what does not. Keying by image content hash is the mechanism
already chosen; your job is to say where that cache lives and what invalidates it.

State plainly whether vision belongs **in** the tool's UI or **beside** it as a
separate pass whose results the tool displays. Mike suggested it *"should probably
be in a fresh claude session"* — note that `ext/Ask` already runs one headless
Claude turn from the browser, so the mechanism exists.

## The deliverable

**`design.md` in your task dir**, written as requirements the next agent can build
from without re-deriving anything:

1. The highlight bug's mechanism, file and line, and the fix per cause.
2. The one-screen design: what merges, **what gets deleted**, how it behaves at 390
   and 3440.
3. The devbar's three states, the current control count, and the minimum design.
4. Where vision fits, and the exact re-score trigger.
5. **A build order**, cheapest-decisive-first, and what to cut if it runs short.

Include **annotated screenshots** of the current state — the clutter is a visual
complaint and needs visual evidence. Log every screenshot path in your
`task.jsonl`; the dashboard surfaces those lines.

⚠ Write it as a **design to execute**, not a menu of options for Mike to
adjudicate. He delegated these calls — *"for all the other decisions, you make
them."* Where you genuinely can't decide, say what you'd need to measure to
decide, and pick a default meanwhile.

## Files you own

- `public/framework/ai/2026-08-17/designtool-ui/**` — your task dir only.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

**Everything else is read-only**, and `ext/DesignTool/**` doubly so — its files are
changing under you. ⚠ Its `score`/`grade` on the rules tier is being **removed**
right now, so don't design around it. Do not edit any site page: a baseline
regeneration is pending and a site edit corrupts it.

Running short? Cut 4, then 3. **Job 1 is the one Mike can verify himself**, so
never cut it.

Log findings as `log` lines in your own `task.jsonl`, never a `findings.md`.

## Working notes

- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.png)) { Start-Sleep 15 }`
- Playwright is installed globally (LAW#4 — no npm dependencies). Reuse the dev
  server on port 80; **do not restart it**, another agent depends on it.
- Assert `document.visibilityState === "visible"` before any screenshot or
  measurement — hidden tabs run no rAF and no ResizeObserver and return frozen
  geometry. Never wait for `networkidle`; the live-reload socket never idles.
- Load the `layout-design` and `css-strategy` skills before proposing any CSS.
