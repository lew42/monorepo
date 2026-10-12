# self-evident-critique-3 — round three: does anything above minor remain?

Run: `ai/2026-09-13/mastermind-page-cms/` (the mastermind). Group: `ux`. You are a CRITIC: you edit nothing under `public/` except your own task dir. **"Nothing above minor remains" is the success this round is looking for** — say it with the evidence, and the loop stops.

## The three laws, and your length budget

1. **Less is more.** Report what remains and what regressed. Round one and two's findings are re-run by number, one verdict each; do not re-describe them.
2. **Clear beats brief.** Each remaining defect: what a newcomer sees, what they would think, what it should be. Three plain sentences and a png.
3. **Prioritize.** Rank by how badly a newcomer would misread the screen, and label each **above minor** or **minor**. Above minor = a control that seems to do nothing, a false statement on screen, a destructive gesture that does not say what it destroys, a newcomer who cannot say what a pane is for. Minor = everything else.

Budget: findings as numbered `log` lines; the landing `outcome` is one screen. No findings.md.

## The rule — the owner's words, verbatim, 2026-09-13

> when looking at the sidebar, we want to see self-evident demos that are impossible to misunderstand. every button, every item, every part - perfectly clear what goes where, what does what, what clicks do, etc.

## Read first

1. `public/framework/ai/2026-09-13/self-evident-critique-2/requirements.md` — round two's brief: the two screens, the method, the data rules, the way in. The same method applies.
2. Round two's findings: the `FINDING 1.` … `FINDING 11.` and `THE WAY IN` lines in `self-evident-critique-2/task.jsonl`.
3. The two round-two fixers' landing lines (last `assign` in `self-evident-fixes-2/make/task.jsonl` and `self-evident-fixes-2/importance/task.jsonl`) and their after-pngs beside them. Both fixers named what you should look at first:
   - **Make:** the drawer `More` opens — its twelve **nest** chips ("Put it inside") still wear the orange `.on` the seven word rows just lost: the "one fill, two meanings" defect one section lower.
   - **Importance:** the **reason** field on the judge column still types a pick key rather than casting — a deliberate decision (an accidental permanent append is worse than a visible digit). Judge whether a newcomer would read it as broken; say which side you land on and why, in two sentences.
   - **Make, from the fixer's own accident:** a fresh load of Make picks the FIRST row, and the drawer edits the picked page — so a newcomer who opens Make and presses a drawer dropdown writes into `Notes` without having chosen it. Is the selection state visible enough that this is fine, or is it a silent write? Measure: what on screen says which page the drawer will change.

## What round three asks

- Re-run round two's eleven gestures and the way in; one verdict each (gone / still / different). Eleven listed, eleven verdicts — the two numbers that must agree.
- Regressions from fix pass two: the drawer's new selects, the swatch rectangles, the red destroyers, the trimmed prose, the icon names, the rename line, the hub lede, the rail; the judge column's dedup, the moved judgment rows, the name-field keys. At 400 / 1280 / 3440.
- The cold read, one sentence per pane before code, 1280 and 400, both screens.
- Press what is new once each on `zzz-probe-*` data.

## Method and fences — round two's, exactly

`ui-test`; a PRIVATE server `PORT=8098 node server.js` from the repo root (another 809x if taken), killed by pid at landing. Never the port-80 server, never the owner's tabs, never `git stash`, never commit. Take a full copy of `public/imagine/paging/made/` before the first gesture; probe pages `zzz-probe-*`, deleted before landing; `git status public/imagine/paging/made/` and a `diff -r` against your copy both unchanged. Every judgment / node / edge you write removed by id; `md5sum` the three importance data files before and after, both logged. Own only `public/framework/ai/2026-09-13/self-evident-critique-3/**`; pngs into it as `NN-<control>-<width>.png`.

Open your task with `new-task` (group `ux`); `skill-improvement` for anything that misled you; land with `finish-task`.

## Landing report (to the mastermind)

One screen: the eleven verdicts on one line, then each remaining defect as "control · what a newcomer thinks · the fix · png · above minor / minor", the three look-firsts answered in a sentence each, the cleanup line — and the one-word verdict the mastermind needs: **stop** (nothing above minor) or **another round**.
