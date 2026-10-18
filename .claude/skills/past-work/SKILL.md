---
name: past-work
description: Before building anything, find out what already exists — past tasks, docs, modules, commits on the topic — so we never rebuild what is stable and used everywhere. Run it at the start of every task (before the plan), as a one-screen answer. A mastermind runs it or has a Haiku minion run it.
---

# Past work: look before you build

The owner (2026-10-12): "We don't want to set off and build something that's already been built, especially if it's stable and used everywhere." So every task starts with one cheap question: **has this been done?**

## 1. Run the script (it searches and counts; you only judge)

```
node Server/PastWork.mjs <topic words>        # e.g. data grid · page templates · colour schemes
```

About 1 second, about 2,000 tokens of output, newest first: tasks (date, title link, landed `outcome`, and how many of the paths it names still exist), modules that exist now with a count of files that use them, docs and readmes, owner asks, commits. The whole-site topic list is [`ai/past-work-index.md`](/framework/ai/past-work-index.md) (rebuilt with `node Server/PastWork.mjs --index`).

For a task that already has a `requirements.md`, `node Server/PastWork.mjs --task <task dir>` runs the search on its title and writes `<task dir>/past-work.md` (computed, so the check is a file the owner can open, not a promise in chat). Since 2026-10-18 the file is written for you at spawn (`spawn_agent`'s `task` option and the Dispatcher): read the `past-work.md` beside your brief first, and run the script only when it is missing.

### One module's history: `ModuleLog`

```
node Server/ModuleLog.mjs public/framework/core/Page --by week     # or day | month, --since 2026-10-01
```

Joins the task logs, `git log -- <path>` and the task folders for one path, grades each task (landed-and-committed, committed-never-closed, never-started) and lists commits that belong to no task. Samples: [core/Page](/framework/ai/sessions/2026/10/15/voice-20261015/past-work-log/sample-core-Page.txt), [framework/ai](/framework/ai/sessions/2026/10/15/voice-20261015/past-work-log/sample-framework-ai.txt). Class: `Server/ModuleLog.mjs`.

## 1b. Not sure what it is called? A Haiku searcher reads the readme chain

A folder of 50 to 100 things with a paragraph each is too much for you to load (the owner, 2026-10-17). A throwaway Haiku minion can: it costs a few cents, reads under 100k tokens, and is thrown away after it answers. You **should** do this at the mastermind level before a build, whenever the thing might exist under a name you do not know.

```
node Server/PastWork.mjs --brief "<the question>" --dir public/framework/ext     # prints the brief: the question, the readme chain, its size in tokens, the answer shape
```

Spawn the minion (Haiku, `role: "minion"`) with that text. It answers with one word first: **EXISTS** at a path, **PARTLY** (what is there, what is missing), or **NEW** (nothing found, and the readmes it read). Act on the answer: reuse it, extend it, or build new and say why. How indexing works, and why readmes are the main index: [ai/doc/owner-2026-10-17-finding-past-work.md](/framework/ai/doc/owner-2026-10-17-finding-past-work.md).

The script search (section 1) now also lists **sessions tagged with your words** (the saved tags from `session.jsonl`, newest first); the Sessions page search box finds them too.

## 2. Judge it (a Haiku minion, under 60k tokens, or yourself if the output is already in your context)

Brief for the minion: *"Run `node Server/PastWork.mjs <topic>`. The new ask is: <ask>. Open at most 5 of the linked readmes/outcomes; check live code with Grep, never trust a landed note. Reply in at most 25 lines, no more."*

The reply is one screen with four parts:

- **Done before:** what was built, with its date and link.
- **Still live?** Checked against the code now (the module exists, who imports it), not copied from the old note. Say "replaced by X" or "gone" when so.
- **Same or different:** how the new ask overlaps with it, in one sentence each.
- **Advice:** reuse it, extend it (which file), or build new, and why.

"Nothing relevant" is a good answer; say it in one line.

## 3. Then the plan

past-work → investigate (how it works now, the relevant pieces, the decisions to make) → `plan.md` beside `requirements.md` → build. Details in `new-task`.

Improve this skill: append to `improvements.md`.
