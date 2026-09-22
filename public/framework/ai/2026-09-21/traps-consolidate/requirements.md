# traps-consolidate — twenty hard-won traps are sitting in a backlog no agent reads

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** The output must be SHORTER than what it replaces. If `code/SKILL.md` grows
   by twenty paragraphs you have failed.
2. **Clear beats brief — by far.** Each trap has to be recognisable by an agent about to make it,
   in one reading, without the incident report.
3. **Prioritize.** Rank by how often the trap has actually bitten. The ones that bit more than
   once earn the most words.

## The problem

`.claude/skills/code/improvements.md` holds **about twenty entries**, most of them one dense
paragraph each, dating from 2026-09-04 to today. Every one is a real trap that really bit, with
its evidence. **None has ever been applied to `code/SKILL.md`.**

The improvements file is a backlog agents append to and nobody reads. The SKILL.md is what every
agent loads. So twenty hard-won lessons are filed exactly where they cannot help — and the
mastermind made three mistakes today that this file's own family of traps would have warned
about.

The mastermind skill's rule: a fail-safe improvement — *naming a trap that actually bit, with its
evidence* — may be applied straight to the SKILL.md, **then the entry is deleted.** Six of eight
entries once went stale for want of that deletion.

## Your job

**Read all of `.claude/skills/code/improvements.md` and fold it into `code/SKILL.md`'s existing
"Failures that never throw" section — as families, not as twenty separate bullets.**

They are not twenty unrelated facts. Reading them, you will find recurring shapes, for example:

- **The ambient captor.** Several entries are the same bug wearing different clothes: a factory
  called as a bare statement, a callback's return value appended twice, passing the captor view
  as an argument to a sibling factory. One family, one explanation, the variants named in a line
  each.
- **Comments and templates that close early.** A backtick inside `css()`, a literal `*/` in the
  prose of a block comment, `**/` in a comment. Same failure, three characters.
- **Edit scripts that destroy files.** A read-and-write in one expression truncating to zero,
  heredocs dying on size, mixed CRLF/LF in the same directory, rg's flags mangled through Bash.
- **Async that runs before the page is attached.** `rAF` and promises resolving pre-attach, and
  the sharp counter-lesson that the `isConnected` guard belongs only on the LATER callback —
  guarding the first draw permanently blanks the page.
- **A name that silently shadows or is ignored.** `on` shadowing `View.on`, `index: true`
  suppressing child links, `a({href})` not setting an href, a missing icon painting a blank box.

Those groupings are my reading, offered so you have somewhere to start — **regroup them however
the evidence actually falls, and say in your log where you disagreed with me.**

Rules for the writing:

- **One line of evidence per trap, at most.** "Measured 7,384 rebuilds in 300ms" earns its place;
  the full incident narrative does not. The task dirs hold the narrative.
- **Keep every trap that bit.** Compressing is the job; dropping is not. If you think one should
  be dropped, leave it in and say why in your log.
- **Do not invent rules.** Nothing goes in that is not in the source entries.
- **Then delete the entries you applied**, leaving the file's header and its instructions intact.
  An entry you did NOT apply stays, with one line saying why.

## Three more from today, not yet in the file — add them

1. **`@layer util` beats `@layer theme` regardless of specificity.** A `.v3-toast[hidden]
   { display: none }` written in a component stylesheet could never beat the `flex` utility class
   in the markup; the element drew as an empty 35px white card. The fix is to stop wearing the
   utility class and let the component own its display. This is at least the third time a
   util-layer class has silently beaten component CSS here.
2. **A rendered field and a plain-text field are the same field.** Card bodies started going
   through `md()`; the rail preview reads the same `c.text` and does not render it, so every
   preview began showing raw `## heading` and `[label](url)` source. Anything the body learns to
   render, its preview has to learn to strip.
3. **A measured constant outlives the thing it was measured against.** The timeline spaced cards
   at 0.5em per minute capped at 6em, correct when every row was a ~90px card. Once rows became
   16px one-liners, a quiet twelve minutes drew 93px of blank above a 16px row and three rows fit
   a screen. Nothing broke; the number just stopped meaning what it meant. Worth a line: when a
   layout's scale changes, the constants tuned to the old scale are now wrong and silent.

## ⚠ You probably cannot write to `.claude/`

Measured today: a CLI minion under `--permission-mode acceptEdits` had its `.claude/` edits
refused, along with every `node` and `git` command.

**So: try it, and if the write is refused, put your finished text in
`public/framework/ai/2026-09-21/traps-consolidate/skill-patch.md` instead** — as the exact
replacement text, with a one-line note saying which section of `code/SKILL.md` it replaces and
which `improvements.md` entries to delete. The mastermind applies it. Say clearly in your landing
line which of the two happened, so nobody thinks it landed when it did not.

Report every refused command individually, as `safe-rollout` did — that honesty is what made its
findings usable.

## Prove it

Two numbers that must agree, and you can get both by reading:

- **Lines removed from `improvements.md`** and **lines added to `code/SKILL.md`** (or to the patch
  file). The second should be well under the first. State both.
- **Every trap accounted for**: a count of entries in the source, and a count of traps in your
  output. If they differ, the difference is your log line explaining which were merged into which.

## What you must not do

- **Never kill or restart the dev server**, the whisper server on 8178, or the health watcher.
  **Never drive the owner's tabs.** This task touches no page and needs no browser.
- **Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or push**; do not touch
  `stash@{0}`.
- **Do not touch any other skill's SKILL.md or improvements.md.** `code` only.
- **Do not touch `CLAUDE.md`** — it is the owner's, and it says so itself.
- Search scoped to the repo, never `find /`.

## Deliverables

1. **The consolidated section**, applied or as `skill-patch.md`.
2. **The applied entries deleted** from `improvements.md` — if that write is refused too, list
   exactly which line numbers to delete in the patch file.
3. **`page.js` in your task dir — half a screen**: the two numbers, the families you found, and
   what you deliberately kept that I suggested cutting. `new-page` for the shape; add it to
   `public/framework/ai/2026-09-21/`'s `children:`.
4. **`task.jsonl`**: append only, `"group": "ai-ops"`, `"worker": "traps-consolidate"`. One `log`
   line where you regrouped against my reading, one for anything you refused to drop. Land with
   `finish-task`.

## Fences

`.claude/skills/code/SKILL.md`, `.claude/skills/code/improvements.md`, and
`public/framework/ai/2026-09-21/traps-consolidate/**`, plus one line in the day page's
`children:` and one append to its `day.jsonl`.

## Length budget

The consolidated section should read in about two minutes. Landing `outcome`: the two numbers,
whether it applied or produced a patch, and at most three sentences.
