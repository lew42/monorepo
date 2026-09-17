# paging-spacing-3440 — why prose spacing balloons at 3440, and the one knob

Run: `ai/2026-09-13/mastermind-page-cms/` (the mastermind). Group: `layout`.

## The three laws, and your length budget

1. **Less is more.** Measure, find the RULE, change one number if one number is the cause. Deleting beats adding.
2. **Clear beats brief.** Your finding is readable by someone who has never seen the size standard: what grows, by how much, and where the number lives.
3. **Prioritize.** Diagnosis first, with numbers. A proposal with the diff written is a complete deliverable; an applied one-knob fix is better only when it IS one knob.

Budget: findings as `log` lines in your task.jsonl; a landing report of one screen; a table of numbers in the task dir as `spacing.md`.

## The owner's words, verbatim

> when the imagine/paging/make/ page gets 3440, the (owl-based?) spacing (gap?) becomes huge (%?). the text is restrained to --measure? so... we have like 8em padding, looks bad, wastes space

## What the mastermind measured, 2026-09-13, headless at 3440×1440

`/imagine/paging/make/` (a prose page in the paging app's 3027px middle): body font **18px**; the lede capped at **648px** (36em); `--flow` resolves to **54px** (`clamp(2em, 1.4cqi + 0.8em, 3em) * var(--size)`, at the 3em ceiling); the `h3` margin-top **104.64px**; page padding-top 54px. So at 3440 the reader sees a 648px column of text in a 3027px box, with 105px between a paragraph and the next heading. At 1280 the same page has body ~15–16px and a smaller flow. The suspicion: the base font scales with the viewport AND the clamp scales in `cqi` AND section headings multiply `--flow` — three multipliers compounding, none wrong alone.

Where the numbers live: `public/framework/framework.css` lines 191–201 (the size standard: `--pad`, `--gap`, `--flow` on `:where(*)`), the `h2`/`h3` margin rules in the same file (grep `--flow` from line 780 on), and whatever sets the body font-size per viewport (the lew42 theme under `public/framework/styles/`). `public/imagine/design/size/` and `/imagine/design/spacing/` + `ceilings/` are the studies that chose these; the "spacing ceiling (1x / 1.5x / 2x)" was awaiting the owner as of 2026-09-05 — the owner has now said the current result "looks bad, wastes space". Treat that as the verdict: 3440 spacing may not exceed about 1.5× the 1280 spacing on the same page.

## Deliverables

1. **The diagnosis, as a table** (`spacing.md` in your task dir): for five pages — `/imagine/paging/make/`, `/imagine/paging/`, `/framework/core/Page/`, `/imagine/cms/`, `/blog/` (or another prose page) — at 1280 / 1920 / 3440: body font-size, resolved `--flow`, `h2` and `h3` margin-top, paragraph gap, the prose column width, and the ratio 3440 ÷ 1280 for each. Headless, `ui-test`'s runner or a scratch Playwright script; the `eval` reads `getComputedStyle`. Two numbers that must agree: the resolved `--flow` and the measured gap between two adjacent paragraphs.
2. **The rule, named.** Which multiplier(s) produce the growth, in one paragraph a newcomer can follow.
3. **The fix.** If ONE number (a clamp ceiling, a font step, a heading multiplier) brings every measured page to ≤ 1.5× at 3440 without changing 1280 at all, apply it, re-measure the five pages, and put before/after in the table. If it takes more than one change, or changes 1280, write the exact diff into `spacing.md` as a proposal and apply nothing. Either way say which happened in your landing line.

## Fences

- Own: `public/framework/ai/2026-09-13/paging-spacing-3440/**`. May edit exactly one file for the fix if deliverable 3 is a one-knob change: `public/framework/framework.css` OR the theme file that sets the viewport font step — name it in the log before you edit. Nothing under `public/imagine/**` (a sibling owns `paging/make/**` and `paging/build/**` right now and is rebuilding Make; do not measure Make while its files are changing — if `git status public/imagine/paging/make` shows edits under way, measure `/imagine/paging/` and `/imagine/paging/doc/` instead and say so).
- Do not edit any skill, readme or doc outside your task dir; a proposal for `/framework/styles/` docs goes in `spacing.md`.

## Rules every brief carries

- Open your task: `ai/2026-09-13/paging-spacing-3440/task.jsonl` with the `new-task` skill (own `session_id`, group `layout`, the three deliverables as `steps`). Findings as `log` lines. Land with `finish-task`.
- **Never kill or restart the dev server on port 80. Never drive the owner's tabs. Never `git stash`. Never commit.**
- Headless: a PRIVATE server `PORT=809x node server.js` from the repo root (`netstat -ano | grep LISTENING | grep -E ":80(8|9)[0-9]\s"` shows taken ports; a sibling may hold one), killed by pid at landing. Scripts and pngs in the session scratchpad under `spacing-3440-*`.
- Never measure while a sibling is editing the page you measure; re-run on a quiet tree.
- A skill that misled you gets ONE evidence line in its `improvements.md` (`skill-improvement`).

## Landing report

One screen: the ratio per page in one small table, the rule in one paragraph, whether the knob was applied or proposed, the before/after png of `/imagine/paging/` at 3440.
