# What a review costs

Three real, already-landed commits, run through `review.mjs --range` so the originals were never touched. Targets: light under $0.50, full under $3 — both comfortably met.

| Size | Task (real commit) | Model | Cost | Seconds |
|---|---|---|---|---|
| none | [ai2-dashboard](../../../2026-09-24/ai2-dashboard/) — a 7-line CSS tweak | — (no agent) | $0.00 | <1s |
| light | task-page fix — renamed a shadowing method | Sonnet | $0.30 | 50s |
| full | [task-cost](../../../2026-09-24/task-cost/) — new cost-tracking module + a live screenshot | Opus | $0.51 | 42s |

The light and full reviews are the real `review.md` files at `proof/light-task-page-fix/review.md`
and `proof/full-task-cost/review.md` — both found genuine, specific problems (a stale doc example,
a missing wire-up, an unfinished deliverable), not filler notes.
