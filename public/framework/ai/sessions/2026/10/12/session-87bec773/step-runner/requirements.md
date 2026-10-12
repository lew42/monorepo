# Step runner: approved procedures followed 100%, nudged by node, not remembered by AIs (mastermind brief)

**Owner (2026-10-12, dictated):** "We shouldn't have AIs forgetting to do things. When we have a process set up, we want it to be followed 100%."

## What the owner wants
- **Structured tasks:** a task is a list of approved steps, each with a **time estimate**. Once the steps are approved, node prompts each next step automatically.
- **Check-ins by estimate, not chit-chat:** if a step hasn't reported by about **double its estimate**, node nudges once: "You were on step 3; is it done?" (the minion may be on step 7 and just forgot the log). The agent should check in on its own first; the nudge is the backstop. Spend few tokens on it.
- **Special instructions by task type:** a UI task gets the [screenshot system](../screenshot-system/requirements.md) steps attached, and its tools triggered or strongly prompted.
- **Each system has a name, its requirements and its own log**, so you can see what happened in it.
- **Node does the clerical work, AI does the judgement:** most clerical steps still need a small AI call; the procedure itself is code.
- **Measure:** track how often each process is followed fully, aiming for 100% (the skills work reached 98% by having node inline the skill).

## Order
1. Past work (`past-work` skill): Servex `TaskLoop` (it chases quiet agents), `task_loop_status`, the "node step-runner" the mastermind skill says doesn't exist yet, `skill-reliability` (node inlines skills), the `new-task`/`finish-task` skills and their Stop hook.
2. `plan.md`: what exists, what's missing, the smallest change.
3. Build: steps with estimates in the task (a `steps` line in `task.jsonl` or `plan.md` parsed by node), the nudge at 2× estimate in TaskLoop, a UI-task step template, and a followed-rate report.
4. Prove it on two real tasks; record the before and after followed-rate.

Opus 5.5 for design, Sonnet to build; keep your context under 100k. Worktree; one Servex restart proven on a private port; smoke clean; commit each step; merge. Update the `mastermind` skill in a line or two (suggestion, not law). `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open.
