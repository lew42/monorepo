# vision-prompts — short vs targeted vs full, same images, same model

Laws: less is more · clarity · prioritize. **Deliverable: rows in the pilot run Mike can filter by prompt, and a ≤ 30-line note saying which prompt earns its tokens. Final message ≤ 15 lines.**

Mike: *"Experiment with different models and different prompts, from short, simple prompts, to long detailed prompts. … Maybe ask it specifically for things like, 'identify misalignment', 'identify missing background colors', etc. … I want to see the prompts used. This is actually the most important part."*

## Do

1. Read `ext/DesignTool/vision/readme.md`, `run.mjs` (flags; how a row is keyed — can the same png be asked again under a new `prompt_id` without recapturing? if `--resume-run` keys on hash only, add a `--prompt`-aware key or recapture — say which), `prompts/critique-v1.md`, `prompts/critique-full-v1.md`.
2. Write `prompts/checklist-v1.md` (≤ 25 lines): the targeted form — a numbered checklist the model answers yes/no-with-evidence: misalignment · missing background/surface · empty or dead space · cramped against an edge · text contrast · truncated/clipped/overflowing text · inconsistent spacing between siblings · controls unlabelled or hidden · one thing that would most improve it. Same JSON block and `class` rule as the others. **No score.**
3. Run, Sonnet, whole-page rows only, the 6 pilot pages @1280 (the pngs already exist in `ai/2026-08-17/vision-pilot/shots/`): `critique-v1` and `checklist-v1` → `--out public/framework/ai/2026-08-17/vision-pilot` (same run, so the browse page's prompt filter compares them against the `critique-full-v1` rows already there). ~12 asks ≈ $1. Log the `--dry` estimate first.
4. `note.md` here (≤ 30 lines): a table — prompt · avg $ · avg output tokens · findings/shot · broken/shot · findings that only this prompt found (count + one example each) · did it invent anything (spot-check 2 shots per prompt against the png). Then one paragraph: which prompt to make the default, and what to fold from the others into it (`critique-full-v2` as a proposal — write it as `prompts/critique-full-v2.md` only if the evidence says so, ≤ 40 lines).

## Rules

- Files: `ext/DesignTool/vision/prompts/checklist-v1.md` (+ `critique-full-v2.md` if earned), the `vision-pilot` run dir (rows appended by the runner), this dir. Do not edit `run.mjs` beyond a `--resume-run` key fix if step 1 needs it (say so); never `browse.js`/`page.js`.
- Log in `task.jsonl` here (bash `printf`, never Out-File; timestamps from `date -Iseconds`); bump `step`; land per `finish-task` with the browse URL filtered to each prompt in `links`.
