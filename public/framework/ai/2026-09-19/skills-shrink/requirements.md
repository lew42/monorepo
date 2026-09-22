# skills-shrink — the war stories get shorter; the teeth stay in

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** This whole task is that law applied to the rulebook.
2. **Clear beats brief — by far.** A rule an agent skims past is worse than a longer one it obeys.
3. **Prioritize.** The three biggest skills first. Stop when the return drops.

## Why this exists

The owner asked this afternoon for the skill system to be reviewed for what to improve and **above
all what to subtract**. Tonight's evaluation ranked this third of seven changes: every dated
incident story in a skill shrinks to one sentence plus a link to the task log holding the story.
Its estimate was about 600 lines saved of 2,740 prose, with no story lost.

Right now `SKILL.md` files total **2,412 lines**. Dated incidents are concentrated in three of
them: `ui-test` 42, `mastermind` 38, `layout` 35, then `css` and `code` at 14 each, `minion` 13.

And an hour ago a sibling applied 48 backlog entries to these same files, adding 104 lines. The
queue got shorter and the rulebook got longer. That is the wrong direction and this task is the
correction.

## The one thing you must not break

**The evidence is what makes an agent obey.** "On 2026-08-19 an Opus ran `taskkill node.exe`
mid-task while the owner was on the live site" works precisely because it happened. "Do not restart
the dev server" does not land the same way. An agent follows a written rule to the letter, and a
rule stripped of its reason is the first one skipped.

So this is **not** a blanket compression, and if you treat it as one you will make the skills worse
while making them shorter. The test for each story, one at a time:

- **Does the story carry the teeth?** If the specific consequence is what makes the rule obeyed —
  a live outage, lost work, an hour burned — keep a short version of it *inline*. One clause is
  usually enough: "(an agent did this on 2026-08-19; the live site 404'd for 20 seconds)".
- **Is the story a retelling of something the rule already says?** Then compress hard: one sentence,
  a link to the task log, done.
- **Is the same story told in two skills?** Keep the fuller one where it is most likely to be read,
  and make the other a link.
- **Is it a narrative of how somebody debugged something?** That is the clearest cut of all — the
  outcome is the rule; the journey belongs in the task log.

**Never delete a link to a task log, and add one wherever you compress.** The story has to remain
findable or you have destroyed it rather than moved it. If you cannot find the task log a story
refers to, leave that story alone and say so.

## Do not change what any rule decides

You are shortening prose, not revising policy. Do not soften a rule, harden one, change a number,
add a step or remove one. The owner deliberately loosened two numeric rules in August because
agents were treating thresholds as verdicts — leave every number exactly as written. If shortening
a passage would change what an agent does, that passage is not shortenable; move on.

Leave `improvements.md` and `caveats.md` files alone entirely. A sibling just cleared that backlog
to 26 lines and five deliberate proposals; do not disturb it.

## Order, and when to stop

`ui-test`, `mastermind`, `layout` first — they are the three biggest files and hold the most stories.
Then `css`, `code`, `minion` if the return is still there. **Stop when you are cutting less than
about a line per story examined**; the last twenty percent is not worth the risk of mangling a rule.

## Prove it

Three numbers, measured not estimated:

- Total `SKILL.md` lines before and after. It is 2,412 now; say what it is when you finish.
- Stories examined, and of those: compressed, kept in full, left alone for want of a link.
- **The check that matters: every skill you touched still reads coherently end to end.** Re-read
  each one in full after editing and say that you did. You are editing the instructions every
  future agent follows; a mangled sentence there is worse than the verbosity you removed.

One more check, and it is the real one: **pick the three rules whose stories you cut hardest, and
ask whether you would still obey them having read only the new version.** If the answer is no for
any of them, put the teeth back. Say in your log which three you tested.

## What you must not do

- **Do not touch `CLAUDE.md`** — it is the owner's and says at the top not to edit it without
  asking. **Do not touch `.claude/settings.json`.**
- **Never restart the dev server** (port 80 is the owner's and they are on it; 8123; the health
  watcher; whisper-server). **Never drive the owner's tabs.**
- **Never `git stash`, `git checkout --`, `git reset`, commit or push.** Read the never-list in
  `.claude/skills/minion/SKILL.md` — it was tightened tonight after an agent used `git checkout --`
  to undo its own mistake and destroyed five days of another file's history.
- Do not search from the filesystem root.

## Deliverables

1. **The shortened skills.**
2. **`page.js` in your task dir — one screen.** Top line: the before and after line counts and what
   was actually removed, in plain words. Then the three rules you stress-tested and why they still
   work. Detail one click down. `new-page` for the shape; add the page to the day page's
   `children:`.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "skills-shrink (in-process agent)"`. Land with `finish-task`.

## Fences

You own every `.claude/skills/*/SKILL.md` and
`public/framework/ai/2026-09-19/skills-shrink/**`. One line in the day page's `children:`, one
append to its `day.jsonl`. **Not** `improvements.md`, **not** `caveats.md`, **not** `CLAUDE.md`,
**not** `.claude/settings.json`, **not** `.claude/hooks/**`.

## Length budget

One screen, led by the two numbers. Landing `outcome`: the before and after counts and at most five
sentences.
