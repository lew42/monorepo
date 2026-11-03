# openrouter — probe tasks (moved from the readme)

<!-- moved verbatim from readme.md lines 138-174, 2026-10-12 readme audit -->
## Probe tasks — is a failure the system, the model, or the config?

[`evals/probes.mjs`](./evals/probes.mjs) gives a fresh agent a tiny, rough, open-ended job ("make
a new page here: a short blog post about owls") in a throwaway worktree, scores the result on six
fixed checks (parses, loads with no console errors, followed the prompt, used the right skills,
opened/logged/landed a task, linked from its parent), and labels every failing cell **(a)** the
system, **(b)** that model, or **(c)** config/parity. The design is
[`probes.md`](/framework/ai/sessions/2026/09/30/probe-tasks/probes.md) and
[`probes.json`](/framework/ai/sessions/2026/09/30/probe-tasks/probes.json); each run appends one line to
[`evals/results.jsonl`](./evals/results.jsonl), which is the model × task matrix (requirements.md
Phase 2, item 4) filling itself in.

```
node Servex/ext/openrouter/evals/probes.mjs --models claude-haiku-4-5-20251001 --probes page-blog,log-line [--effort low] [--topic owls] [--dry-run]
node Servex/ext/openrouter/evals/probes.mjs --selftest   # proves the checks can actually fail
```

**First real result (claude-haiku-4-5-20251001, the control, effort low):** `page-blog` passed
only check 1 (parses); `log-line` passed none of its one check. Haiku wrote good, on-topic
content both times, but no `skill:` line and no `task.jsonl` under `public/framework/ai/<date>/`
ever showed up — and for `page-blog` it overwrote the scratch directory's own seeded page instead
of adding a child page and linking it.

**This result is unlabelled on purpose, and not yet trustworthy as a verdict** (review finding
2026-09-30, #4/#6): because it's the control's own baseline there's no prior control row to label
against, which is the right call per `probes.md`'s rule — but there's a second open question
nobody has checked yet: does the Skill hook even fire for an agent spawned the way a probe spawns
it (no `task:` option, `cwd` inside a pool worktree)? If the hook path itself never reaches the
agent, "no `skill:` line" is a **(c)** config/parity problem, not evidence the model skipped the
steps. Until that's checked, read "skipped the task system" above as a description of what
happened, not a diagnosis of why. Also: **(a)** here means only "the control fails this same
cell too" — not "every model fails it" — so one (a) label is a hint, not a unanimous verdict.

Still open: whether the Skill-hook-reaches-the-agent question above resolves this to (c); whether
this is a low-`effort` problem specifically (worth its own data point); and the three probes
probes.json lists but this run never reached (`demo-add`, `css-tweak`, `doc-fix`).

