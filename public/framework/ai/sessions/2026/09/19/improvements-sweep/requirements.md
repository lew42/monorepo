# improvements-sweep — 55 recorded lessons that nobody has ever applied

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Deleting beats adding. The best outcome here is a shorter rulebook.
2. **Clear beats brief — by far.** Plain full sentences, basics first.
3. **Prioritize.** Apply the safe ones; rank the rest; do not agonise over the middle.

## Why this exists

Every skill in `.claude/skills/` has an `improvements.md` beside it. When a skill misleads an
agent, the agent appends one evidence line there. **There are 55 such lines and nobody owns
applying them.** Tonight's evaluation of the whole skill system named this as one of its top three
problems, and the owner asked earlier today for the skills to be reviewed for what to improve and
**above all what to subtract**.

The backlog: `ui-test` 15, `layout` 14, `css` 7, `mastermind` 6, `documentation` 4,
`new-css-class` 3, `auditor` 3, `finish-task` 2, `new-page` 1, plus a few singletons.

Two of tonight's entries are mine and are marked as not fail-safe — leave those as proposals.

## The test you apply to every single entry

The `mastermind` skill defines this and it is the whole job. Read its "Skills improve themselves"
section first, then judge each entry against it.

**Fail-safe — apply it straight to the SKILL.md, then DELETE the entry.** It cannot make the next
agent worse off:
- naming a trap that actually bit, with its evidence
- correcting something factually wrong: a renamed API, a moved path, a dead link
- adding a link to detail that already exists
- tightening wording without moving the decision

**Not fail-safe — leave the entry, write it up as a proposal.** Anything that:
- changes what the skill *decides*
- adds a new required step (every step is paid by every future agent, forever)
- relaxes or hardens a rule or a number the owner chose
- deletes guidance because you disagree with it

⚠ **Two specific landmines.** The owner deliberately softened two numeric rules on 2026-08-18
because agents were treating thresholds as verdicts — **do not re-harden what was loosened.** And
the owner has said twice that what they say in a dictation is a *suggestion* unless stated
otherwise: write *should*, *could*, *often*, *worth asking* — not *always*, *never*, *the limit*. A
hard rule is earned only by breaking things repeatedly. If an entry asks you to write a law, that
alone makes it a proposal, not a fail-safe edit.

**When you cannot decide, it is a proposal.** The cost of wrongly proposing is that someone reads
one more line tomorrow. The cost of wrongly applying is that every future agent obeys a bad rule.
Those are not symmetric, so bias hard toward proposing.

## Deleting is the point, not a side effect

An applied entry that stays in the file gets applied again by the next reader — the mastermind
skill records that six of eight entries were stale for want of a deletion. So: **apply, then delete
the entry in the same edit.** Also delete an entry that is simply obsolete (it names a file that no
longer exists, or describes a problem that is demonstrably fixed) — say so in your log with the
evidence, and count it separately from the ones you applied.

And look for the bigger subtraction while you are in there. If the same lesson appears in three
entries across two skills, that is one edit in one place plus a link, not three. If a skill has
grown a section that its own improvements keep tripping over, say so — that is a finding worth more
than any individual edit.

## What you must not do

- **Do not touch `CLAUDE.md`.** It is the owner's and it says at the top not to edit it without
  asking. If an entry implies a change there, that is a proposal for the owner, always.
- **Do not touch `.claude/settings.json`.** Same reason.
- **Do not rewrite a skill.** You are applying specific, evidenced lines. A skill that needs
  restructuring is a finding, not tonight's job.
- **Never restart the dev server** (port 80 is the owner's and they are on it, 8123, the health
  watcher, whisper-server). **Never drive the owner's tabs.** Headless only.
- **Never `git stash`, `git checkout --`, `git reset`, commit or push.** Read
  `.claude/skills/minion/SKILL.md`'s never-list before you start — it was tightened tonight after
  an agent used `git checkout --` to undo its own mistake and destroyed five days of another
  file's history in the process.
- Do not search from the filesystem root.

## Prove it

Three numbers, and they must add up: **entries applied + entries deleted as obsolete + entries left
as proposals = 55.** If your total is not 55, find the discrepancy before you report anything.

For each skill you edited, confirm the file still reads sensibly end to end — you are editing the
instructions every future agent follows, and a mangled sentence there is worse than the original
problem. Say that you re-read each one.

## Deliverables

1. **The fail-safe edits applied, and their entries deleted.**
2. **`page.js` in your task dir — one screen.** Top line in plain words: how many lessons were
   sitting unapplied, how many are now in the skills, and how much shorter or longer the rulebook
   got (net lines added or removed across all SKILL.md files — measure it, it is the number the
   owner cares about). Then the proposals, ranked, each one line. Detail one click down.
   `new-page` for the shape; add it to the day page's `children:` — nothing crawls.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "improvements-sweep (in-process agent)"`. One `log` line per applied edit naming the
   skill and what changed. Land with `finish-task`.

## Fences

You own `.claude/skills/**` (every `SKILL.md` and every `improvements.md`) and
`public/framework/ai/2026-09-19/improvements-sweep/**`. One line in the day page's `children:`, one
append to its `day.jsonl`. **Not `CLAUDE.md`, not `.claude/settings.json`, not `.claude/hooks/**`.**

Nothing else is running in the skills directory right now, so you have it to yourself.

## Length budget

One screen, and the headline is a number. Landing `outcome`: the three counts, the net line change,
and at most five sentences.
