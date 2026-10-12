# reset-deep — the recovery searched 5 transcripts; there are 56

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Script over the data. Do not read it yourself.
2. **Clear beats brief — by far.** The owner needs to know what came back and what is truly gone.
3. **Prioritize.** Source code and docs first; screenshots never.

## The situation, and the gap you are closing

A hard reset at 23:16 on 2026-09-19 destroyed uncommitted work across this repo. Three tasks have
already run — read their dirs first, they are your foundation and you must not redo them:

- `public/framework/ai/2026-09-19/reset-recovery/` — the manifest, `lost.jsonl`, **1,470 entries**.
- `public/framework/ai/2026-09-19/reset-scope/` — how the total was proven.
- `public/framework/ai/2026-09-19/reset-restore/` — **171 files already restored**, byte-for-byte.

**The gap:** the restore task's own report says it replayed "all 5 session transcripts on this
machine." There are **56**, totalling 203 MB, and the single largest (53 MB) is bigger than
everything it searched. So a large share of the roughly 280 files currently marked gone for good
may have a full copy sitting in a transcript nobody has opened.

That is your job: **search all 56, and recover what you find.**

## ⚠ The one rule that will break you if you ignore it

**Never open a transcript with the Read tool.** They are up to 53 MB each; one Read would blow your
context and end the task. Every transcript access goes through a script — python or `rg` — that
extracts what you need and prints only a summary. Write the script to a file in the session
scratchpad, named after this task so a sibling cannot overwrite it, and run it. Print counts and
paths, never file bodies.

The restore task built exactly this and it worked: a replay of every `Read`/`Write`/`Edit` tool call
in chronological order, accepting a file only when a complete copy exists with every later edit
applying cleanly. **Read its script and its method from its `task.jsonl` and reuse them** rather
than inventing a second approach — then point it at all 56 files instead of 5.

## The rules that make a restore safe — unchanged from the earlier tasks

1. **Byte-for-byte from the record, or not at all.** A ranged read (`lines 1-40`), a diff, a
   fragment, or a cache-dedup message is **not** a full copy — the earlier task was caught out by
   exactly those two cases and corrected itself. Never write a plausible reconstruction: one nobody
   can distinguish from the original is worse than an honest gap.
2. **Never clobber newer content.** Restore only where the file is absent, or still carries the
   reverted content from commit `8b4ced8e`. If it differs from both, something newer is there —
   skip it and say so.
3. **Prove the site survives.** Reload hold around the batch, `node --check` every `.js`, then load
   `/`, `/framework/`, `/framework/ai/` and `/framework/ai/v/3/` headless and confirm 200. Release
   the hold only then. ⚠ **The hold self-expires after five minutes and has lapsed twice tonight
   during exactly this kind of long investigation** — re-take it before each batch of writes, not
   once at the start.
4. **One specific prize worth naming:** `public/framework/core/Page/Page.class.js`. Three otherwise
   perfectly recovered files are being held back because they call a feature on it and no full copy
   was found in the five. If it is in the other 51, restoring it releases those three too — their
   recovered text is already saved in the restore task's log. Check for it early.

## Skip the screenshots

969 of the 1,470 losses are regenerated `.png` files. They are cheap to redo by re-running the tool
that made them and they would dominate your time for no benefit. Ignore them entirely and say so.

## What you must not do

- **Never `git stash`, `git checkout --`, `git reset`, `git restore`, `git add`, commit or push.**
  A wrong git command here turns a recoverable situation permanent. `git show`, `git diff`,
  `git log`, `git ls-files` are reads and are fine.
- **Do not touch `CLAUDE.md` or `.claude/settings.json`.**
- **Never kill or restart the dev server** (port 80 is the owner's and they are asleep with it
  running; 8123; the health watcher; whisper-server). **Never drive the owner's tabs.**
- Do not search from the filesystem root. Do not read a transcript into context.

## Prove it

Two numbers, and a third that checks them: **files newly restored**, **files still gone**, and
**transcripts actually searched (it should be 56)**. Say all three.

Then the same spot-check the earlier task did: pick **three** newly restored files at random, diff
each against the raw transcript content you took it from, confirm identical, and name them. A
restore you have not diffed is a claim.

## Deliverables

1. **The newly recovered files**, with `lost.jsonl` updated in place (append an outcome per entry;
   do not rewrite what the earlier tasks wrote).
2. **`page.js` in your task dir — one screen.** Top line: how many files are back in total now,
   across all the recovery tasks, and how many are gone for good. Then what is still missing,
   grouped so the owner can see whether any of it matters to them. `new-page` for the shape; add it
   to the day page's `children:`.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "reset-deep (in-process agent)"`. Land with `finish-task`.

## Fences

You own the files you restore (name each in your log before writing it),
`public/framework/ai/2026-09-19/reset-recovery/lost.jsonl`, and
`public/framework/ai/2026-09-19/reset-deep/**`. One line in the day page's `children:`, one append
to its `day.jsonl`.

Nothing else is running in the repo. The owner is asleep; the site must be working when they wake.

## Length budget

One screen, led by the two numbers. Landing `outcome`: what is back, what is gone, at most five
sentences.
