# paging-audit-1b — Critic B, the systems designer

The brief this task serves is [`../paging-audit-1/requirements.md`](/framework/ai/2026-09-05/paging-audit-1/requirements.md).
Critic A is the overwhelmed newcomer; this is the other half.

## The ask, verbatim

> **Critic B — the systems designer** (task dir `../paging-audit-1b/`; create it with `new-task`).
> Read the realm's code and docs (`paging.js`, `readme.md`, `doc/*`, every tree's `page.js`) and
> answer: **what is the small handful of concrete building blocks this system actually has?** Name
> at most six, each in one sentence a newcomer gets, and for each: is it shown by an example a
> newcomer can see; can a reader explore alternatives by configuring or generating; what in the
> realm is redundant with it or a synonym of it (the realm has mechanisms, styles, sizes, surfaces,
> layouts, templates, toolbars, examples, make, build, transitions, center, rightnav, explorer —
> most of these are the same few blocks under different names). Then the ten-line verdict: the
> handful, what to merge, what to delete, what is missing, and the one organizing principle the
> rebuilt realm should follow.

The owner's own words, which are the rubric:

> i want the paging system to have a small handful of concrete building blocks, mechanisms,
> whatever... and i want to be able to see examples of them, and explore alternatives, either by
> generating, or configuring, or whatever.
> the idea of the paging mechanism explorer, was to be able to SEE different layouts x navigation x
> appearance/style x visual hierarchy in action, and maybe have a chance to configure or play with
> it without having to write it out as a new page. we did not really achieve that.

## Scope and fences

- **Read only.** Nothing under `public/imagine/` or `public/framework/` outside this dir is edited.
- Writes: this directory only (`task.jsonl`, this file).
- No server needed — this half is the code and docs read; Critic A walks the pages.
- No sub-agents, no `find /`, no git stash/commit.

## Output

The findings and the ten-line verdict are `log` lines in `task.jsonl`. The mastermind hands the
verdict to `paging-v3`.
