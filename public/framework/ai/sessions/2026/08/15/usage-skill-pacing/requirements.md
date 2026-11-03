# usage-skill-pacing

## The ask (verbatim)

> duplicate the check usage skill into this project, so it gets into the repo
>
> add to the skill a note about token management: try to stay under the time-based pacing.  for example, you don't want to exceed 50% of the token allowance before you've passed 50% of the windows duration.  this goes for 5h, weekly, and weekly fable.  this way, we should be paced to hit 100% just as the window resets.  if you exceed this pace, slow down and finish up.  if you expect to exceed this pace soon, slow down and finish up..

## Scope

- Copy `~/.claude/skills/check-claude-usage/SKILL.md` to `.claude/skills/check-claude-usage/SKILL.md` (project-scoped, tracked in git).
- Add a pacing section: usage % must trail elapsed % of the window, for all three windows (`session`, `weekly_all`, `weekly_scoped`); over pace (or about to be) → slow down and finish up.
- Keep the user-level copy in sync so the two don't diverge.

## Steps

1. Open task, snapshot usage
2. Copy skill into `.claude/skills/check-claude-usage/`
3. Write the pacing section
4. Sync the user-level copy
5. Land

No agents; single session, file edits only.
