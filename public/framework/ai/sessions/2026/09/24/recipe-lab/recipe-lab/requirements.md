# Recipe lab — how to staff a task

## The owner's words (verbatim)

> Then we could compare outcomes. One team runs it all by itself; a separate group spawns 20 minions and compares them all, to see if the extra tokens actually matter, and try to find the right recipe: how many minions, what kind of tasks they're good at, and how to get things done faster. For a mastermind to run the quality-of-outcome audit, it's probably best left to me, the user, to judge the quality. You could try to judge and give your best guess as to whether one is actually better or whether they're generally the same. But for design things the outcomes are likely pretty close, so it will be hard to judge which is actually better.

## The experiment

One brief ([build-brief.md](build-brief.md)): a dark card for a mastermind or minion session (owner-asks #6), drawn from [fixture.json](fixture.json). Three recipes, each in its own worktree, none merged:

- **A** — one Opus 5.5 agent, medium effort, alone (`worktree/recipe-a`).
- **B** — one Sonnet 5 agent, medium effort, alone (`worktree/recipe-b`).
- **C** — three Sonnet 5 minions in parallel (medium), each building independently into `build-1..3/`, then one Sonnet picks the best and copies it to `build/` (`worktree/recipe-c`). Five was asked; cut to three when the lab budget fell from $15 to $10.

Recorded per recipe: dollar cost (agent + descendants), wall-clock time, the result.

## Deliverables

1. A judging page here: the brief, then X / Y / Z screenshots at 1920 side by side, a Decision card for the owner's one-click pick, a second tab revealing labels, costs and times, and the machine's own guess, marked as such.
2. `doc/findings.md`: cost, time and guess per recipe, and which kinds of task each probably suits.
3. A "live" card reply when the judging page is up.

Fence: `public/framework/ai/2026-09-24/recipe-lab/`, the day page's `children:` line, and the three `recipe-*` worktrees.
