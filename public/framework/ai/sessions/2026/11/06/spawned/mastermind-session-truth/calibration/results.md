# Prompt-refinement calibration 1: Sonnet wins on quality and on cost

This is the first calibration from [prompt-refinement-and-tasks.md](/framework/ai/doc/prompt-refinement-and-tasks.md) ("Next", step 1). Four of the owner's voice prompts from the cloud session `cloud-8849dcc6` (turns #27, #95, #114 and #116) were refined by Haiku 5.5 and then by Sonnet 5.5. Both got the same fixed [instructions.md](instructions.md) and were checked against the 24 tasks of the [voice-app record](/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/). Opus judged them (this page). No task was written into that record. Each prompt, its words and both outputs are drawn on [/live/calibration/](/live/calibration/).

## The verdict

- **Use Sonnet 5.5 at no thinking for refinement.** It groups the owner's sentences into fewer, truer asks (#116: 9 asks against Haiku's 15; #95: 4 asks covering every sentence). It also catches the ask hidden in a complaint: on #114 it split out "fix the page error after reload ('P is not a function')", which Haiku folded into the worktree rule.
- **Haiku gets the mapping right but not the signals.** On every prompt the two models put sentences under the same task 70–100% of the time (`same_task_as_haiku`: 7/10, 29/31, 11/11, 79/89). Haiku marks honest doubt ("I'm not sure how this works") as a red flag. Red flags are meant to be things left waiting on the owner.
- **Sonnet is cheaper too.** Haiku 5.5 thinks (up to 6k thinking tokens on #95), while Sonnet answers directly. Without the bloat below, the four prompts cost about **$0.12 with Sonnet and $0.39 with Haiku**. That is an estimate: (input bytes ÷ 4) × the cache-write price plus output × the output price, and it came within 15% of the one clean run (Haiku #27: $0.070 estimated, $0.082 actual).

| prompt | sentences | coverage (Haiku / Sonnet) | what the record lacks |
|---|---|---|---|
| #27 why sessions don't complete | 10 | 100% / 100% | nothing: `close-with-proof` and `past-work-audit` hold it (neither model thought of `completion-page`, which fits too) |
| #95 page shape and indexing | 31 | 15% / 7% | page storage converging on one system; does a parent load every child; a page index one level deep |
| #114 "your agents broke my page" | 11 | 0% / 0% | the page error itself; worktree + smoke test before merging (already a rule in agents.md, but no task) |
| #116 autonomy, live page, page settings | 89 | 30% / 31% | page settings screen with a Files tab; breadcrumbs = window path; plan-first; live-page multi-agent warning |

Coverage counts the sentences that carry an ask or its context and are placed under an existing task. Run [compare.mjs](compare.mjs) for the full table (it reads [outputs/](outputs/); the inputs are in [inputs/](inputs/)).

## What to fix before the next run

1. **The instructions should let a sentence be covered by a rule or doc, not only a task.** #114 asks for something agents.md already says ("commit … in a worktree"), so 0% coverage overstates the gap. Add a `rule` value naming the doc.
2. **Define red flags tightly:** only things waiting on the owner, "your call", "needs your yes". Not the owner's own uncertainty.
3. **Speech-to-text artifacts:** Sonnet asked about a "Git mode" in #116, which is probably a mis-heard word. One line should tell the model to read through transcription errors.

## Cost of this run: $13.71, against a budget of $5

The [outputs/](outputs/) files hold each call's real cost. Seven of the eight calls each wrote about 235k cache tokens. `claude -p --tools ""` turns off the built-in tools but still loads every connected MCP server's tool list (Figma, Fal, Riverside…). The first call ran before those connected and cost $0.08. **Next time, add `--strict-mcp-config`** with no `--mcp-config`. The run's command is in [readme.md](readme.md).
