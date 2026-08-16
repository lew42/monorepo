# mastermind-skill

## The ask (verbatim)

> create a new skill, called "mastermind"
>
> i want this to be an autonomous agent that runs continuously, never stops,
> manages usage quotas (via check claud usage skill), spawns agents, etc...
>
> it's a pretty basic skill, but when invoked, "you are the mastermind, begin",
> the skill should attempt to make the best use of usage allowances, find the
> highest priority tasks, spawn lesser (Opus) agents to get them done, be the
> higher (Fable) power to make executive decisions, etc...

Mid-task addition:

> make sure to reiterate check claude usage's wisdom about staying below the
> 5h and weekly thresholds... exhausting our token allowances does no good

## Scope

One file: `.claude/skills/mastermind/SKILL.md`. No agents; single session.
The skill encodes the budget protocol (5h window target 50% / ceiling 75%,
weekly Fable-scoped under 50%), the cycle loop (usage → harvest → prioritize
→ spawn → log → schedule wakeup), Opus workers with Fable never fanned out,
and the stand-down + janitor-survival rules.

## Proposal

1. Read skill format + budget protocols
2. Open task
3. Write `.claude/skills/mastermind/SKILL.md`
4. Self-review against CLAUDE.md laws/rules + budget protocols
5. Land
