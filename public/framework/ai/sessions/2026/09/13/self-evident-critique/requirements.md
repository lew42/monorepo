# self-evident-critique — can a newcomer misunderstand Make or Importance?

Run: `ai/2026-09-13/mastermind-page-cms/` (the mastermind). Group: `ux`. You are a CRITIC: you edit nothing under `public/` except your own task dir. A fix pass follows you and reads your list cold.

## The three laws, and your length budget

1. **Less is more.** Ten real defects, ranked, beat forty observations. Every defect names the control, the misunderstanding, the fix.
2. **Clear beats brief.** Each defect is three plain sentences a fixer can act on without opening your transcript: what a newcomer sees, what they would think, what it should be. A png per defect.
3. **Prioritize.** Rank by how badly a newcomer would misread the screen. A control that seems to do nothing outranks a wrong margin.

Budget: findings as `log` lines in your task.jsonl, one per defect, numbered; the landing `outcome` is the top five in one screen with png paths. No findings.md.

## The rule you judge against — the owner's words, verbatim, 2026-09-13

> when looking at the sidebar, we want to see self-evident demos that are impossible to misunderstand. every button, every item, every part - perfectly clear what goes where, what does what, what clicks do, etc.

> imagine a fully functional, enterprise grade application.

> i click buttons, nothing happens. i have no idea what this is.

A reviewer who cannot say what a control does has found a defect. A click whose consequence is not visible within one frame is a defect. A pane or row that does not show its own state (selected, saved, unranked) is a defect. Prose that explains what a picture should have shown is a defect.

## The two screens (landed tonight; read each realm's `readme.md` first)

1. **Make** — `/imagine/paging/make/`: the page tree (left, drag-and-drop by the grip; star = default child; + = add a child; × = delete with a second press), the picked page drawn for real (middle, with core's h1 and its url), its settings (right: title, description, icon, the seven words, blocks). `/imagine/paging/make/notes/` is a made page at its own url. Code: `public/imagine/paging/make/` (`page.js`, `tree.js`, `settings.js`, `made.js`, `make.css`). ⚠ Every control here WRITES a real file under `public/imagine/paging/made/` — the owner's pages `notes`, `ideas`, `archive` and the `new-tab` / `new-page` rows are theirs; create your own `probe-*` pages to press things on, and delete them before landing. `git status public/imagine/paging/made/` before and after must match.
2. **Importance** — `/imagine/importance/` (the ranked context view: rank, bar, "N% of M judgments", caveats attached, "why?" opens the rows, Propose) and `/imagine/importance/judge/?at=car` (two cards, "Which matters more?", keys 1 / 2 or ← →, an optional reason, the judge name). Code: `public/imagine/importance/`. ⚠ A judgment APPENDS a line to the committed `data/judgments/2026-09.jsonl`; a proposal appends to `nodes.jsonl` + `edges.jsonl`. Remove every line you add before landing: `git diff --stat public/imagine/importance/data/` must be empty. A sibling agent may be editing `public/imagine/importance/*.js` (a live-update follow-up) while you look — if a page errors on load, wait a minute and retry, and say so.

## Method

- `ui-test` skill, a PRIVATE server (`PORT=8098 node server.js` from the repo root unless netstat shows it taken; 8093 / 8095 / 8097 were siblings'), killed by pid at landing. Never the port-80 server, never the owner's tabs, never `git stash`, never commit.
- Widths: 1280, 1920, 3440 for each screen; 400 once for each to see what collapses.
- **Press everything once** (on your probe pages / with your own judgments): every button, chip, dropdown, grip, key. For each, record: its label or tooltip (or "none"), what changed on screen within one frame (or "nothing visible"), and whether a newcomer could have predicted it. The two numbers that must agree: controls you found vs controls you pressed.
- Read each screen cold before reading its code: write down in one sentence what you think each pane is for, then check. Where you were wrong, that is a defect in the screen, not in you.
- Do not fix; do not propose redesigns of the architecture. Concrete, local fixes only ("the × needs a label", "the selected row needs a stronger mark", "this sentence should be a picture").

## Fences

- Own: `public/framework/ai/2026-09-13/self-evident-critique/**` only. Read anything. Write nothing else under `public/` — your probe pages and judgments are removed before landing.
- Plans and pngs in the session scratchpad under `critique-*`; a png per defect copied into your task dir, named `NN-<control>-<width>.png`.

## Rules every brief carries

- Open your task: `ai/2026-09-13/self-evident-critique/task.jsonl` with the `new-task` skill (own `session_id`, group `ux`, steps: read cold · press everything on Make · press everything on Importance · rank · land). Land with `finish-task`.
- A skill that misled you gets ONE evidence line in its `improvements.md` (`skill-improvement`).
- Every recipe here was checked on 2026-09-13 against the files.

## Landing report (to the mastermind)

One screen: the top five defects, each as "control · what a newcomer thinks · the fix · png", then the two counts (found / pressed) per screen, then one line on which screen is closer to "impossible to misunderstand" and why.
