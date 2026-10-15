# framework/ai readme audit and the new smoke-test rule

Ask: [ask-ea3d4c58](../ask-ea3d4c58.md), B1. 2026-10-15.

## On one screen

- **The rule is in the mastermind skill**, under "Readme upkeep is yours": [`.claude/skills/mastermind/SKILL.md`](/.claude/skills/mastermind/SKILL.md). Two sentences: smoke-test your module's readme chain, fix what is plainly wrong or send one claim to a minion, chase nothing else.
- **The `framework/ai` readmes are in good shape.** 21 readmes and 183 `doc/*.md` files; every link in the readmes was checked by a script. Three were dead and the real state is below. The earlier readme audit (2026-10-13, all readmes under 100 lines) shows.
- **Do not let a model check links.** Three Haiku minions read the readmes and reported 14 dead links; the script found only 3 real ones, and one of those is an example in prose. Haiku claimed `/framework/ux/Dictate/`, `/framework/servex/doc/` and `/framework/ai/tasks/lanes/` were missing; all three are served. Behaviour claims ("this script does X") are what a model is for; paths are a script's job.

## Fixed now

| Where | Problem | Fix |
|---|---|---|
| `ai/system/readme.md:7` | linked `../overview.js`, which does not exist | now `../AIOverview.js` |
| `ai/system/readme.md:5` | described `models.json`, "the model benchmark", generated 2026-10-02; the page now draws `now.json` (which agent runs on which model) | rewritten |
| `Servex/doc/task-loop.md:15-16` | quiet and gap defaults 20 and 30 | 10 and 15, as in `TaskLoop.js:33-34` |

## Left, with the reason

| Where | Problem | Why not fixed here |
|---|---|---|
| `ai/systems-map.md` | the size and date columns say "computed 2026-10-08"; most rows have moved (ai readme 71 to 90 lines, Servex readme 388 to 104) | a table of computed numbers should be written by a script, not retyped (law 7). A refresh script is the fix, about 30 lines. |
| `Servex/doc/echo.md:10` | says `SERVEX_ECHO_OR=none` puts Echo back on Claude; `Echo.js:137` says that gate is gone | outside `framework/ai`; one sentence for the Servex owner |
| `.claude/skills/mastermind/SKILL.md:10` | tells you to open a run task in group `ai-ops`; `ai/rail/groups.json` has no such group | a group that does not exist is harmless, but the board does not show it; add the group or change the word |
| `ai/review/readme.md:33` | `../page/questions.md` is a dead-looking link | it is an example of link syntax inside a sentence; no change |
| `ai/sessions/readme.md` (1,482 words, the longest) | far over the 100-line readme target in words | not wrong, already splits into `doc/readme-full-2026-10-12.md`; a trim is a separate pass |
| `ai/AITask/readme.md` (858 words), `ai/readme.md` (1,141 words) | long | same |

## How this was done

One script checked every markdown link in 21 readmes against the file tree and the site's routes; three Haiku minions read the same readmes for contradictions and stale claims (through the in-process Agent tool, because Servex had no free pool worktree for minions). The Haiku pass found no contradictions and two real stale facts (the `models.json` line). Cost: about 190k Haiku tokens across three jobs.
