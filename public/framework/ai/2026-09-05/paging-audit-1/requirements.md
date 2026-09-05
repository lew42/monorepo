# paging-audit-1 — the audit BEFORE the rebuild (two critics, Opus)

Read first: the repo's `CLAUDE.md` (law 2 and the Presentation section), `../mastermind-day/requirements.md` (the owner's brief verbatim — his paging paragraphs are the rubric), `../../2026-09-04/mastermind-platform/minion-rules.md`. Then walk `/imagine/paging/` on a private server (never port 80) at 1280 and 3440 with screenshots of every page you open. Skills: `new-task` (your own dir, group `paging`), `layout`, `finish-task`.

## The owner's words, this morning

> i want the paging system to have a small handful of concrete building blocks, mechanisms, whatever... and i want to be able to see examples of them, and explore alternatives, either by generating, or configuring, or whatever. have some minions audit this whole paging system now, to look at these things, and suggest improvements.
> the idea of the paging mechanism explorer, was to be able to SEE different layouts x navigation x appearance/style x visual hierarchy in action, and maybe have a chance to configure or play with it without having to write it out as a new page. we did not really achieve that.

## Two critics, two briefs

**Critic A — the overwhelmed newcomer** (task dir `paging-audit-1/`, this one). Open `/imagine/paging/` cold at 3440 and click for twenty minutes the way a newcomer would. For every page you land on, write four short lines in your log: what I think this page is for · what I clicked and what happened (did anything jump, did two columns open, did I lose my place) · what confused me, quoted · what would have made it obvious. Screenshot each. Then the ten-line verdict: what the realm is for, in the newcomer's words; the five most confusing things, ranked; the three best things to keep; and a sketch (words, not code) of the first screen you wish you had seen.

**Critic B — the systems designer** (task dir `../paging-audit-1b/`; create it with `new-task`). Read the realm's code and docs (`paging.js`, `readme.md`, `doc/*`, every tree's `page.js`) and answer: **what is the small handful of concrete building blocks this system actually has?** Name at most six, each in one sentence a newcomer gets, and for each: is it shown by an example a newcomer can see; can a reader explore alternatives by configuring or generating; what in the realm is redundant with it or a synonym of it (the realm has mechanisms, styles, sizes, surfaces, layouts, templates, toolbars, examples, make, build, transitions, center, rightnav, explorer — most of these are the same few blocks under different names). Then the ten-line verdict: the handful, what to merge, what to delete, what is missing, and the one organizing principle the rebuilt realm should follow.

## Rules

Fix nothing; change nothing under `public/`. Private server (kill by the pid you started). Never `find /`. Budget ~200k each. Each reports in ≤ 10 plain lines; the detail stays in the log. The mastermind hands both verdicts to the rebuild.
