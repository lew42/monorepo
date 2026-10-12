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
