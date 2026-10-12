# Refine today's long dictations — batch job

Verbatim brief from the mastermind (Servex agent `minion-refine-today`):

> Batch job, with a budget of about $25 in total (stop and report if you pass it). Read
> `Server/doc/refine.md` first.
>
> Input: the owner's long dictations to the VS Code tab: in `.claude/prompts/2026-09-29.jsonl`,
> the lines with `prompt.author === "owner"`, `prompt.session_id ===
> "361c4d18-e878-4c04-9537-444e847e13d5"`, and text over 1500 characters (41 of them), oldest
> first.
>
> For each: run `node Server/refine.mjs` on it, as cheaply as the tool allows (one cheap
> drafting model, e.g. `--models haiku`; skip the repair rounds unless coverage drops more than 3
> sentences), writing to `public/framework/ai/2026-09-29/refine-today/<nn>-<slug>/`. Run them in
> series, not in parallel, because memory is tight.
>
> Then build ONE card: `POST http://127.0.0.1:8090/card/create {"title":"Today's dictations,
> refined","type":"note","by":"minion-refine-today"}`. Place one markdown file on it: a list,
> oldest first, one row per dictation: its time, a 5–8 word title, the brief's asks as 2–4
> bullets, and a link to its ext/Refine view (or its folder), where the owner can click an ask
> and see their words light up. Put the total cost at the top. Use node fetch for the card
> routes.

## Deliverables

1. 41 refine runs, one per matched dictation, each in its own numbered dir, `--models haiku`,
   no repair round unless coverage drops more than 3 sentences from clean to brief.
2. One dashboard card, `type: "note"`, titled "Today's dictations, refined", with total cost at
   the top and a markdown list (oldest first) — time, 5-8 word title, 2-4 ask bullets, and a link
   per dictation.
3. Total spend at or under ~$25 — stop and report if it's about to be exceeded.

## Notes

- Series, not parallel (memory is tight on this machine right now).
- The 41 matched line indexes (0-based, in `.claude/prompts/2026-09-29.jsonl`) were captured
  by this task at scoping time, see `task.jsonl`.
