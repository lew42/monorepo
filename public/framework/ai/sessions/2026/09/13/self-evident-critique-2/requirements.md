# self-evident-critique-2 — round two: what still misleads a newcomer, after the fixes

Run: `ai/2026-09-13/mastermind-page-cms/` (the mastermind). Group: `ux`. You are a CRITIC: you edit nothing under `public/` except your own task dir. **"Nothing left" is a success, not a failure** — report it as such with the evidence.

## The three laws, and your length budget

1. **Less is more.** Report only what remains and what regressed. Do not re-report the ten defects round one found unless one is still there — say so by number.
2. **Clear beats brief.** Each defect: what a newcomer sees, what they would think, what it should be. Three plain sentences and a png.
3. **Prioritize.** Rank by how badly a newcomer would misread the screen.

Budget: findings as numbered `log` lines in your task.jsonl; the landing `outcome` is one screen. No findings.md.

## The rule you judge against — the owner's words, verbatim, 2026-09-13

> when looking at the sidebar, we want to see self-evident demos that are impossible to misunderstand. every button, every item, every part - perfectly clear what goes where, what does what, what clicks do, etc.

> imagine a fully functional, enterprise grade application.

## Read first

1. `public/framework/ai/2026-09-13/self-evident-critique/requirements.md` — round one's brief (the two screens, the method, the data rules). The same method applies here.
2. `public/framework/ai/2026-09-13/self-evident-critique/task.jsonl` — the ten `DEFECT n.` lines round one found.
3. `public/framework/ai/2026-09-13/self-evident-fixes/requirements.md`, then the two fixers' `task.jsonl` under `self-evident-fixes/make/` and `self-evident-fixes/importance/` — what was changed and how, with after-pngs beside them. Round one's defect 1–3, 5, 7, 8 (Make) and 4, 6, 9, 10 (Importance) were fixed; Make's Description field was left on purpose.

## What round two asks

- **Re-run round one's ten gestures** cold, at 1280 and 3440, and say per number: gone / still there / came back differently. Two numbers that must agree: ten gestures listed, ten verdicts given.
- **Regressions.** A fix that broke something beside it — a row that now wraps, a label that now truncates, a control that moved out of reach at 400 or 3440. The fixers touched `paging.css`, `make.css`, `stage.js`, `config.js`, the drawer, the star, the block controls, the judge cards, the trail, the rank row.
- **The cold read again.** Before reading code, write one sentence per pane saying what you think it is for, at 1280 and at 400. Where you are wrong, that is a defect.
- **The whole path a newcomer walks.** Land on `/imagine/paging/` (the realm hub) and find Make from there; land on `/imagine/` and find Importance. Does the rail / the card tell you what you will get? Say what is unclear on the way in, not only on the screens.
- **Press what is new** — `Next two`, `Pick this one`, the trail crumbs, the `Why?` toggle, the sample eyebrow, the two-press site clear, the icon and family dropdowns, the `+ Prose / + Card wall / + Template` acts — once each, on probe data, and record label · visible consequence · predictability.

## Method and fences — round one's, exactly

`ui-test`; a PRIVATE server `PORT=8098 node server.js` from the repo root (another 809x if taken), killed by pid at landing. Never the port-80 server, never the owner's tabs, never `git stash`, never commit. Probe pages named `zzz-probe-*` (a name the app never generates — round one's `probe-*` cleanup selector matched an owner row); delete them before landing; `git status public/imagine/paging/made/` unchanged before/after. Every judgment / node / edge you write to `public/imagine/importance/data/` removed by id; `md5sum` the three files before and after and log both. Own only `public/framework/ai/2026-09-13/self-evident-critique-2/**`; pngs into it as `NN-<control>-<width>.png`.

Open your task with `new-task` (group `ux`, steps: read round one · re-run the ten · cold read + the way in · press what is new · rank · land); `skill-improvement` for anything that misled you; land with `finish-task`.

## Landing report (to the mastermind)

One screen: the ten verdicts as a single line (`1 gone · 2 gone · …`), then every remaining or new defect as "control · what a newcomer thinks · the fix · png", then the way-in findings in two sentences, then the cleanup line. If nothing remains, say so and show the two counts.
