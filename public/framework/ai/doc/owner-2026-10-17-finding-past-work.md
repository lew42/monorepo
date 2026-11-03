# Finding past work before building (owner asks 1 to 3, 2026-10-17)

What the owner asked, in plain words: work already done must be findable; the old prompts hold many asks that were never done; and before anything new is built, someone checks whether it already exists. Source: [requirements-15.md](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-15.md). The checkup that acted on it: [checkup.md](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-past-work/checkup.md).

## Where the past-work query stands (ask 1)

Three ways in, all one command or one page:

- **By task or module:** `node Server/PastWork.mjs <topic>` (the [past-work skill](../../../../.claude/skills/past-work/SKILL.md)) lists landed tasks, module logs and, since this checkup, **sessions whose digest tags match** the words.
- **By session, on the site:** the [Sessions page](/framework/ai/sessions/) search box now matches a session's tags (`page/live-cards`, `topic/...`) as well as its name, agent, id, role and model.
- **By ask:** [asks-by-module.md](asks-by-module.md) lists the owner's asks per module; `ext/Refine/doc/asks.md` is the Refine view of the same asks.

## "Does it already exist?" before a build (ask 2)

Done as a file, not a promise: `node Server/PastWork.mjs --task <task dir>` reads the task's `requirements.md` title and writes `past-work.md` beside it (tasks, modules, tagged sessions). The mastermind and new-task skills already say to run past-work first; this makes the answer a file the owner can open.
**Next, decided but outside this checkup's fence:** `Server/TaskDirs.mjs --new` and `spawn_agent` should run `--task` automatically. Handed to `checkup-task-system`; wiring it into Servex needs a restart, which the parent picks.

## Readme indexing is the discovery path (ask 3)

How it works, once:

1. Every directory's `readme.md` is an index: one line per child, what it is and when you would load it, a link to the child's own readme. Under about 100 lines.
2. A reader (human or agent) walks the chain root to leaf: `CLAUDE.md`, `readme.md`, then each readme down the path. `Server/readme-reach.mjs` checks that a module named in a readme resolves; today it reports 33 checked, 0 misses, and two readmes over 100 lines (`core/Page`, `Server`).
3. When the name of the thing is not known, a **throwaway Haiku minion** gets the chain and the question and answers `EXISTS at X / PARTLY at X, missing Y / NEW`. `node Server/PastWork.mjs --brief "<question>" [--dir <path>]` builds that prompt and prints the token estimate (warns above 60k, hard ceiling 100k). The pattern is in the past-work skill, section 1b.
4. Related items: the owner's idea of a "Related" list per readme ([owner-2026-10-16-indexing.md](owner-2026-10-16-indexing.md)) is not built; a readme's links are the relations for now.

## Decisions made (each with its alternative)

- Tag search is free text in the existing box. Alternative: clickable tag chips on the `tag_filter` predicate that already exists. Chips win once the tag list is short enough to show; that is the follow-up.
- One query, not three: keep `SessionIndex`; `PastWork`, `ModuleLog` and `Asked` stay separate for now (`core/Page/doc/query.md` keep/scrap list). Merging wins when a fourth source appears.
