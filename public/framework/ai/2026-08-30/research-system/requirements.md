# research-system — refine the research system by wiring it to a live program

## The ask (verbatim)

TASK — refine the research system by wiring it to a live program, and judge whether it becomes a skill.

CONTEXT: `ext/Research` exists (2026-08-18: append-only research.jsonl, validated CLI + MCP writers, a live page, rounds of scouts → skeptic/builder → verdicts — read `ext/Research/readme.md` + its doc/ + `/framework/research/` pages first). FOUR content minions are RIGHT NOW researching ancient-technology topics in parallel; the mastermind fixed their data contract: each writes `public/imagine/research/<topic>/log.jsonl` (topics: stone, depictions, disclosure, theories), one line = `{"at","topic","kind":"finding"|"source"|"theory"|"opinion"|"question","title","summary","url","credence":"established"|"contested"|"fringe"|"speculation"}`, plus curated `.md` pages in their own dirs. Their dirs are THEIRS — you never write inside `<topic>/`.

WHAT YOU BUILD:
1. **The presentation** at `/imagine/research/` (replace the stub; the owner browses here tomorrow): the program's front — reads all four topic logs, renders the living aggregate: latest findings stream, per-topic cards (counts by kind + credence), the theories board (each major theory: claim, mainstream assessment, implications — from the `theory` + `opinion` entries), and an honest CREDENCE legend (established/contested/fringe/speculation rendered as distinct visual treatments — the presentation must never flatten a fringe claim into a fact; this is the system's epistemic backbone). Build on `ext/JSONL`'s reader + the AI board's live-append pattern so new lines stream in while a tab is open (dev server permitting; degrade to load-time on static).
2. **The refinement of ext/Research**: assess it against THIS real use — what of its rounds/verdict machinery serves the continuous-digging shape (scout → skeptic → verdict maps well to claim → mainstream-check → credence); fix/extend the SMALLEST set (maybe: the entry schema above becomes a validated writer; the live page points at multi-log programs). Log what you changed and what you deliberately left.
3. **The skill verdict**: should "research" be a `.claude/skills/research/` trigger skill (how an agent runs a research round: the entry schema, the credence discipline, the skeptic pass, where logs live, how presentation picks it up)? If yes — WRITE it (SKILL.md + improvements.md stub, modeled on the house skills' shape: trigger description, steps, traps). If no — say why in 3 lines.

FENCE — `/imagine/research/page.js` + `research.css` (+ an aggregate reader module in that dir), `ext/Research/**`, `.claude/skills/research/**` (if the verdict is yes), css-scopes.txt prefix. NOT `<topic>/` subdirs (the minions'), NOT /imagine/page.js.

TRAPS: every CSS rule in a layer; one backtick inside css(`…`); torn jsonl lines kill readers (ext/JSONL rules); a minion's log may not exist yet — render gracefully from zero; headless Playwright global: `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`.

VERIFY: the front renders with whatever topic logs exist at verify time (and with a synthetic 10-line log written to the SCRATCHPAD and pointed at temporarily — never into their dirs), credence treatments visibly distinct, counts = line counts (two numbers that agree), zero console errors at 400/1920.

## Fences

- MINE: `public/imagine/research/page.js`, `research.css`, an aggregate reader module in that dir; `public/framework/ext/Research/**`; `.claude/skills/research/**`; the `research-` prefix line in `framework/styles/css-scopes.txt`.
- NOT MINE: `public/imagine/research/<topic>/**` (four minions are writing there right now), `public/imagine/page.js`.
- Never kill/restart the :80 dev server. Never stash. Never commit. Never drive owner tabs.
