# reset-recovery — get back what the 23:16 reset destroyed

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Recover what is cheap and certain. Do not chase the unrecoverable.
2. **Clear beats brief — by far.** Plain sentences. The owner needs to know what is back and what
   is not.
3. **Prioritize.** In the order below. It is the order of value per minute.

## What happened

At **23:16 tonight** something discarded every uncommitted modification to **tracked** files in this
repo, reverting them to commit `8b4ced8e` of 2026-09-17. It was not a Claude session — no transcript
on this machine holds an executed reset — and most likely it was the Discard All Changes button in
VS Code's source control panel, which leaves no reflog entry. It also happened on 2026-09-18.

**Untracked files were untouched**, which is why all of tonight's work survives: it was new files,
not edits. The site serves 200 on every page.

Two things are already recovered, do not redo them:
- Six `.claude/skills/*/SKILL.md` files, rewritten by the agent that was mid-edit when it hit.
- The missing section of `CLAUDE.md`, restored from the mastermind's own context. **`CLAUDE.md` is
  out of your fence entirely — do not touch it.**

## Job 1 — the padding fix, which is small and certain

Tonight's card-padding work was in `framework.css` and `devbar.css`, both tracked, both reverted.
Two things are gone:

- `--pad-card` in `public/framework/framework.css`. Before the reset, line 303 read exactly:

      --pad-card: calc(clamp(1rem, 2.6%, 2em) * var(--size));

  That `1rem` floor was the fix. The token was originally created earlier today by the
  `padding-audit` task with a `0.5em` floor, which was wrong — the floor was relative to each
  card's own font-size, so a component running smaller local type got a smaller floor. Read
  `public/framework/ai/2026-09-19/card-adopt/` (its page and its `task.jsonl` both survived, being
  untracked) for the full reasoning and the measurements.
- Three uses of `var(--pad-card)` in `public/framework/dev/DevBar/devbar.css`, on `.dev-says-card`,
  `.dev-chat-card` and `.dev-chat-minion`, which before the reset were at roughly lines 309, 442 and
  484. The card-adopt task page names what each one replaced.

**Restore both, then re-measure.** The number that proves it: a real dev bar log card should compute
to **16px** of padding at both 400px and 1920px. If you get 6.4px you have restored the old broken
floor; if you get 12.8px the dev bar rule did not take. Put the measured number in your log.

⚠ `framework.css` is loaded by every page on the site. Hold reloads around the batch, and load a
page headless before you release.

## Job 2 — say exactly what else is gone

The owner needs a list they can judge, not a vague loss. Compare the working tree against
`8b4ced8e` and work out which tracked files had uncommitted edits before 23:16 and now do not.

The best evidence available: **the git status captured at the start of the mastermind's session**,
which is in `public/framework/ai/2026-09-19/mastermind-sonnet-run/task.jsonl` in the `request`
field's surrounding context, and more completely in the agent transcripts under
`C:/Users/mike/.claude/projects/c--Code-lew42-monorepo/`. Several transcripts from today contain a
`git status` output listing the modified files. Find one and use it as the manifest.

Produce `lost.jsonl`, one line per file:

    {"lost": {"path": "<repo-relative>", "recoverable": "yes|partial|no",
      "source": "<which transcript or task page holds its content, or why nothing does>"}}

**Do not restore anything in job 2 yet.** The list is the deliverable; restoring a hundred files
from transcript fragments without the owner seeing the list first is how a bad recovery makes things
worse than the loss.

## Job 3 — only if jobs 1 and 2 are done and solid

Recover any file from job 2 marked `recoverable: yes` whose content a transcript holds **in full**
— a complete file read, not a fragment or a diff. Anything partial stays on the list. Say how many
you restored and how many you left.

## What you must not do

- **Never `git stash`, `git checkout --`, `git reset`, `git restore`, commit or push.** Given what
  just happened this is not a formality: a wrong git command here turns a recoverable situation into
  a permanent one. If you think you need one, stop and say so instead.
- **Do not touch `CLAUDE.md` or `.claude/settings.json`.**
- **Never kill or restart the dev server** (port 80 is the owner's; 8123; the health watcher;
  whisper-server). **Never drive the owner's tabs.** Headless only.
- Do not search from the filesystem root.
- **Never invent content.** A file you cannot recover exactly is `recoverable: no`. Writing a
  plausible reconstruction of someone's code and calling it recovered is worse than the loss,
  because nobody will know it is not the original.

## Deliverables

1. **The padding fix back, with the 16px measurement.**
2. **`lost.jsonl`** — the honest manifest.
3. **`page.js` in your task dir — one screen.** Top line, plain words: what was lost, what is back,
   what is gone for good. Then the list, grouped by recoverable or not. Then one sentence on what
   would have prevented it. `new-page` for the shape; add it to the day page's `children:`.
4. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "reset-recovery (in-process agent)"`. Land with `finish-task`.

## Fences

You own `public/framework/framework.css` (the `--pad-card` line only), 
`public/framework/dev/DevBar/devbar.css`, and
`public/framework/ai/2026-09-19/reset-recovery/**`. One line in the day page's `children:`, one
append to its `day.jsonl`. Job 3 extends your fence to exactly the files you restore, named in your
log before you touch them.

## Length budget

One screen. Landing `outcome`: what is back, what is gone, and at most five sentences.
