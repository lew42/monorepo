# Improve daily task dashboard + layout-design skill

## The ask (verbatim, Mike, 2026-08-13)

> we have a slightly new framework/ai system. hopefully the fork-claude-session skill (and, is there a new-task skill?) highlight some of the new fundamentals.
>
> before we do anything, we want to create a new task in the daily report (ai/<date>/) page.
>
> the ui for these, despite my request, still suck ass... there are token window allowances at the top of the daily page, but the tokens and window% per task is a bit iffy (hard to read, there are basically 2 fonts inside each card)
>
> there's some sort of 3 checkmarks above the Task Previews section. not sure what they are...
>
> i asked for a daily dashboard, to see all running tasks, their progress, their objectives, etc...
>
> we need a new skill: layout-design
>
> 1. what size is the final "thing"? basically, is it 1 column, or 2+?
>
> 2. what size should be the preview? on the parent page, is this 1 col, 2 col, full width, etc?
>
> 3. most things should attempt to utilize 3-4 full columns. at 3440, that might be 3 1000px columns. it's not so important, so much that we think about responsiveness from 300px to 4000px...
>
> too often, we're creating pages that display shit in a really awkward way. the spacing, layout, amount of detail, click through layout/presentation... it's all a little off.

## Scope

1. Diagnose the day-dashboard card UI: mixed fonts inside cards, hard-to-read
   tokens/window% figures, the unexplained "3 checkmarks" above Task Previews.
2. Improve the dashboard so it actually reads as a dashboard: running tasks,
   progress (`now`), objectives, at a glance.
3. Author a new skill `.claude/skills/layout-design/SKILL.md` encoding the
   sizing questions above: final-thing column count, preview size on the
   parent page, wide-screen utilization (3-4 real columns at 3440), and the
   general "spacing / detail / click-through" judgment that keeps coming out
   awkward.

## File ownership

Single-session task, no agent fan-out planned yet. If agents run, fences get
added here first.
