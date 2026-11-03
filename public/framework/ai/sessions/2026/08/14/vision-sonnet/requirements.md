# vision-sonnet — requirements

## The ask (verbatim)

> spawn a Sonnet agent to look into the styles/layouts/* pages.
>
> have the agent use playwright to screenshot the first 5 pages in styles/layouts/, at 400px, 1920px, and 3440px (at full height?), and save these screenshots to the task directory.  specifically ask the agent not to analyze the screenshots yet, just place them in the directory.
>
> once the agent is done grabbing the screenshots, i want you to pay special attention to the agent session's token usage.  for each screenshot, make note of the current token usage, and ask the agent to analyze one image at a time for layout, and create layout-analysis.json in the task directory with the following information:
>
> - for each screenshot, the filename, url it was taken from, etc.
> - the token cost to analyze
> - the layout analysis (the findings)
>
> when you're done with that, spawn another new-task, and do the same with haiku and opus, if possible.  then, create another task dir to write a report on the findings.  how does screenshot analysis vary between models, in terms of token cost, accuracy/quality of findings, etc?

## Scope of THIS task

The Sonnet leg only. Siblings: `vision-haiku-opus` (same analyses, other
models), `vision-report` (cross-model comparison).

## Decisions

- **"First 5 pages"** = first five declared children of the Layouts catalog
  (`layouts/page.js` `children:` order): `fit flex grid document docs`.
  URLs: `http://localhost/framework/styles/layouts/<name>/`.
- **Widths** 400 / 1920 / 3440, `fullPage: true` (the "full height?" question
  answered yes — full-page capture).
- **Agent = cold `claude -p` CLI session** (`--model claude-sonnet-5`), resumed
  once per image for the analysis turns. CLI sessions report exact per-turn
  `usage` in their JSON output — that is the token metering the task exists to
  collect. Not a context fork; a cold brief suffices.
- **One session, sequential turns**: screenshot turn first, then 15 analysis
  turns resumed one image at a time, recording usage before/after each — so
  cumulative context growth is itself measured.
- **Haiku/Opus reuse THESE screenshots.** Re-shooting would confound the
  vision comparison (timing/rendering variance) and waste tokens.

## File ownership

- Sonnet agent writes **only** `shots/*.png` (15 files, `<page>-<width>.png`).
- Orchestrator (Fable, this session) owns `task.jsonl`,
  `layout-analysis.json`, this file.
- Driver scripts live in the session scratchpad, not the repo.
