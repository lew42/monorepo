# ai-dashboard — usage rail, step-based task cards, task detail template

## The ask, verbatim (Mike, 2026-08-14)

> let's scrap using the timeline view for framework/ai
>
> the left side should show: the current usage windows. use progress bars, but
> color them like so: add a visual indicator how far into that window (how much
> longer in the 5h window, how much longer in the weekly window), use an upside
> down triangle above the progress bar to indicate where we are temporally.
> then, set the progress bar's color to green if we're below that threshold,
> yellow -> orange -> red if we're on pace to run out.
>
> below the usage section, we want to list the AITask cards, starting with those
> in progress. the card should be a preview, and then full view appears to the
> right

> build the usage rail + cards + card detail system. use a new task, so i can
> see it in the browser
>
> skip the composer for now, we'll need to rethink this ai <-> ui <-> me
> workflow later
>
> make sure, in the task card previews, to render an overview of that task's
> progress. figure out the best way to organize the task. remember, we have the
> ability to load the full session log from claude. it doesn't look like that's
> being used on the current task detail page.
>
> remember, when writing to these .jsonl files, the browser refreshes. we don't
> want to spam too many updates too fast, we just want to document the major
> milestones.
>
> the requirements should be documented, the proposal should be an outline of
> steps and specific structures, and the task's preview status should basically
> be a progress bar that jumps based on the step # (3/8, for example), with the
> current step displayed "Building x, y, and z." Green progress bars for tasks
> in progress. No progress bar for dormant tasks. Move dormant tasks out of the
> Active tasks section. We'll also want the dollar cost of the task, if
> available, and token consumption if not.
>
> then, when you click through to the detail page, we should see a checklist of
> the steps, with those completed checked off. also, have any additional data
> regarding the session, usage, agents, etc. generating these task pages from a
> master template seems like a good idea for simplicity, however could we have
> an override, where a task/page.js could customize the actual page, add unique
> content, etc?

Mike's message ended mid-sentence at "we should see" — the remainder is
unstated. Building everything above; the trailing thought is logged as an open
question rather than guessed at.

Also asked, handled outside this task dir:
- A note in the `new-task` skill on when to fork Claude to spawn minions
  (context management, context-specific analysis, parallelization).
- "why do we have (do we need both) usage.json and usage.jsonl?" — answered in
  chat and recorded in this task's notes.

## Proposal — the outline

Two new fields carry the whole progress model, and nothing else changes shape:

```json
{"assign": {"steps": ["<label>", "<label>", …]}}
{"assign": {"step": 3, "now": "Building x, y, and z"}}
```

`steps` is the outline, declared once at launch. `step` is the 1-based index of
what's underway — so steps `1..step-1` are done, `step` is in flight, and
progress is `(step-1)/steps.length`. The checklist, the `3/8`, and the bar all
derive from those two fields; no new verb, no per-step bookkeeping, no way for
the two to disagree. A landing `assign` carries `step: steps.length` and
`landed_at`, which reads as all-checked.

### Steps

1. **Step model** — `steps`/`step` in `TaskJSONL`, documented in
   `ext/JSONL/readme.md`. Derivations (`progress`, `done`, `label`) live beside
   the other pure helpers in `stats.js`, not in a renderer.
2. **Usage rail** — `usage.js` in `ext/AITask`: one meter per limit, a
   `▼` marker at elapsed-fraction, bar colored by projected end-of-window
   total (`percent / elapsed`): green ≤100, yellow ≤125, orange ≤175, red
   beyond, held neutral for the first 10% of a window where the projection is
   still noise.
3. **Card preview** — progress bar (green, in-progress only), `3/8`, the `now`
   line, and cost: `$` when the manifest has one, tokens when it doesn't.
4. **Sections** — `Active` (running) above; dormant (landed, then proposed)
   below in their own group, no bars.
5. **The rail** — `ai/page.js` drops `ai_timeline()`; the rail becomes usage +
   cards, detail opens right via `catalog()`. `ext/Timeline` stays a
   general-purpose module with its own page; only this caller goes away.
6. **Detail: checklist** — steps rendered as a checklist, `1..step-1` checked,
   `step` marked current.
7. **Detail: the session log** — confirm `feed()`/`replay()` actually reach
   `/ai-logs/<uuid>`, and that every task's first `assign` carries
   `session_id` (today `ai-page/task.jsonl` does not, which is why its detail
   page shows no log).
8. **Template + override** — the default `AITask` page is the template; a task
   dir's own `page.js` extends rather than replaces it, so it can add unique
   content without reimplementing the report.
9. **Skill note** — `new-task` gains the fork/minion guidance and the
   `steps`/`step` convention.

### Files this task owns

`public/framework/ext/AITask/*`, `public/framework/ext/JSONL/*`,
`public/framework/ai/page.js`, `.claude/skills/new-task/SKILL.md`, and this
task dir. No agents are dispatched — the work is narrow and design-heavy.
