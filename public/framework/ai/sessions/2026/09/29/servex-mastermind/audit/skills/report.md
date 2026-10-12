# Skills audit — which skills fire, which don't, can we tell

Read-only, no edits outside this file. Window: task dirs `2026-09-22` → `2026-09-29` (no dirs for 09-26/27).

## Inventory (26 skill dirs with a SKILL.md, sorted by size)

| skill | lines | last commit | description starts |
|---|---|---|---|
| mastermind, layout, fork-claude-session, ui-test, sub-mastermind, code | 484/363/320/284/220/209 | all 09-21→09-29 | the big reference/orchestrator skills; no size or freshness problem |
| research, minion, page, css, check-claude-usage | 147/121/117/112/101 | 09-29/09-29/09-29/09-29/**08-18** | mid-size, all still actively called (see next table) |
| finish-task, new-task, servex-mastermind, documentation, auditor | 90/90/75/74/71 | 09-28/09-29/09-29/09-29/**09-21** | landing + orchestration skills |
| new-page, log-assistant, new-css-class, content, every-prompt, master-assistant, clarity | 61→50 lines | 09-21→09-28 | small, focused trigger skills |
| skill-improvement, decide, naming | 38/42/13 | **08-18**/09-29/09-29 | short, mechanical |
| **openrouter** | 7 | **untracked (`??`)** | never committed — can vanish on any clean/stash elsewhere |
| **assistant** (dead dir) | no SKILL.md | 09-21 | only holds `say.mjs`; not in the skill listing at all — leftover from before `every-prompt` was named |

## Invocations, 09-22 → 09-29 (146 task dirs opened in that window)

| skill | count |
|---|---|
| finish-task | 72 |
| documentation | 25 |
| check-claude-usage | 13 |
| skill-improvement | 12 |
| layout | 11 |
| fans | 10 |
| code | 10 |
| css | 6 |
| new-page | 5 |
| new-css-class | 4 |
| minion | 4 |
| page | 3 |
| ui-test | 2 |
| new-task | 1 |
| all others (mastermind, sub-mastermind, servex-mastermind, auditor, clarity, master-assistant, log-assistant, every-prompt, naming, decide, research, content, openrouter, assistant) | **0** |

## Trigger gaps (skill that should fire vs. what actually happened)

| trigger skill | should-fire count | logged calls | gap |
|---|---|---|---|
| new-task | 146 task dirs created | 1 (16 ever, any date) | 145 |
| finish-task | 150 `landed_at` writes | 72 | 78 |
| new-page | 103 `page.js` files added (git log, same window) | 5 | 98 |

## Stale / missing

Zero logged calls, 09-22→09-29: mastermind, sub-mastermind, servex-mastermind, auditor, clarity,
master-assistant, log-assistant, every-prompt, naming, decide, research, content — explained in
finding 3, not a straightforward "unused" list. No skill's text pointed at a missing file on
spot-check (`Servex/ext/openrouter/readme.md` etc. all exist). No repeated "no skill for this"
complaint found in any `improvements.md` touched in the last 7 days (11 files, checked below).

## Findings

1. **new-task and new-page gaps are real, not a logging artifact.** 146 task dirs opened this
   week; only 1 `"skill: new-task"` line logged (16 ever, repo-wide). new-page: 103 new
   `page.js` files landed, the skill fired 5 times. The skill says run before the first edit —
   mostly it isn't.

2. **Part of the gap is the hook's own chicken-and-egg hole — but not most of it.** The hook
   logs into `task.jsonl`, the file `new-task` itself creates; a call before that file exists
   has nowhere to log. So the true count is above 1, but capped near 16 — still far short of 146.

3. **Zero-invocation orchestrator skills prove a blind spot, not that they're unused.**
   mastermind, sub-mastermind, servex-mastermind, master-assistant, log-assistant, every-prompt
   run as long-lived launch prompts, not Skill-tool calls inside an open task, so they rarely
   touch a `task.jsonl`. The brief asks "can we verify skills fire?" — for half the roster,
   **no, not with this log**. That's the biggest finding here.

