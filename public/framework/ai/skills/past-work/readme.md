# past-work: look before you build

The owner (2026-10-12): "We don't want to set off and build something that's already been built, especially if it's stable and used everywhere." So almost every task starts with one cheap question: **has this been done?** Run it before the plan, before you spawn a builder, and whenever an ask might already exist under a name you don't know.

This is one of our own skills ([how skills work here](../readme.md)): a plain readme, in two parts.

- **[mastermind.md](mastermind.md)**: the asker. Splits the owner's words into separate searches, gives the worker the terms, reuses the same worker for follow-ups, and decides: reuse, extend, or build new.
- **[worker.md](worker.md)**: the Haiku searcher. Reads the logs first, greps, and logs each find the moment it has it.

A one-line ask that names the thing exactly needs only step 1 below and no worker.

## 1. Run the script first (it searches and counts; you only judge)

```
node Server/PastWork.mjs <topic words>        # e.g. data grid · page templates · colour schemes
```

About 1 second, about 2,000 tokens of output, newest first: tasks (date, title link, landed `outcome`, and how many of the paths it names still exist), modules that exist now with a count of files that use them, docs and readmes, owner asks, commits, and sessions tagged with your words. The whole-site topic list is [`ai/past-work-index.md`](/framework/ai/past-work-index.md) (rebuilt with `node Server/PastWork.mjs --index`).

For a task that has a `requirements.md`, `node Server/PastWork.mjs --task <task dir>` writes `<task dir>/past-work.md` (computed, so the check is a file the owner can open, not a promise in chat). It is written for you at spawn: read the `past-work.md` beside your brief first, and run the script only when it is missing.

### One module's history: `ModuleLog`

```
node Server/ModuleLog.mjs public/framework/core/Page --by week     # or day | month, --since 2026-10-01
```

Joins the task logs, `git log -- <path>` and the task folders for one path, grades each task (landed-and-committed, committed-never-closed, never-started) and lists commits that belong to no task. Samples: [core/Page](/framework/ai/sessions/2026/10/15/voice-20261015/past-work-log/sample-core-Page.txt), [framework/ai](/framework/ai/sessions/2026/10/15/voice-20261015/past-work-log/sample-framework-ai.txt).

## 2. Not sure what it is called? Send a Haiku searcher

A folder of 50 to 100 things with a paragraph each is too much for a mastermind to load (the owner, 2026-10-17). A Haiku minion can read it: a few cents, thrown away after it answers. Do this before a build whenever the thing might exist under a name you don't know. The trial that proved it, and its method notes: [past-work-per-file-docs/findings.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/past-work-per-file-docs/findings.md) (found `doc/file/<path>.md`, 349 notes, in about 116k tokens).

```
node Server/PastWork.mjs --brief "<the question>" --dir public/framework/ext     # prints the brief: question, readme chain, size in tokens, answer shape
```

How indexing works, and why readmes are the main index: [ai/doc/owner-2026-10-17-finding-past-work.md](/framework/ai/doc/owner-2026-10-17-finding-past-work.md). The planned standing tool (a results list on the child session, a `read_only` spawn): [doc/past-work-haiku.md](/framework/ai/doc/past-work-haiku.md).

## 3. The answer is one screen

- **EXISTS** at a path, **PARTLY** (what is there, what is missing), or **NEW** (nothing found, and the readmes read).
- **Done before:** what was built, with its date and link.
- **Still live?** Checked against the code now (the module exists, who imports it), never copied from an old note. "Replaced by X" or "gone" when so.
- **Same or different:** how the new ask overlaps, one sentence each.
- **Advice:** reuse it, extend it (which file), or build new, and why.

"Nothing relevant" is a good answer; say it in one line.

## 4. Then the plan

past-work → investigate (how it works now, the pieces, the decisions) → `plan.md` beside `requirements.md` → build. Details in `new-task`.

Improve this skill: `item({path: "/framework/ai/skills/past-work/improvements.jsonl", delta: {tasks: {add: {title, why}}}})`.
