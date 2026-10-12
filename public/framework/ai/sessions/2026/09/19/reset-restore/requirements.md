# reset-restore — put back the 216 files a transcript holds in full

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Restore exactly what is proven. Nothing else.
2. **Clear beats brief — by far.** The owner needs to know precisely what came back.
3. **Prioritize.** Correctness over count. A wrong restore is worse than a missing file.

## The situation

At 23:16 on 2026-09-19 a hard reset destroyed the uncommitted work in this repo. The damage is now
measured: **1,470 files**, listed in
`public/framework/ai/2026-09-19/reset-recovery/lost.jsonl`. Read that file first — it is your work
order, and it carries a `recoverable` field and a `source` naming where each file's content lives.

**216 of them are marked `recoverable: yes`**, meaning a session transcript under
`C:/Users/mike/.claude/projects/c--Code-lew42-monorepo/` holds the *complete* file — a full `Read`
result or a `Write` of the whole content, cited by name. Your job is to put those 216 back.

Two earlier tasks established all this and restored five files by hand;
`public/framework/ai/2026-09-19/reset-recovery/` and `.../reset-scope/` hold their reasoning.

## The three rules that make this safe

**1. Byte-for-byte from the record, or not at all.** You are copying content out of a transcript,
not reconstructing it. If what you find is a diff, a fragment, a summary, or a file you have to
stitch from two places, that file is not in your 216 — downgrade it in `lost.jsonl` to `partial`
and move on. **Never write a plausible version of someone's file.** A reconstruction nobody can
tell from the original is worse than the gap, because nobody will ever know to check it.

**2. Never clobber something newer.** Before writing any file, check its current state. Restore it
only if it is **absent**, or if its content **exactly matches the commit** `8b4ced8e` (that is, it
still carries the reverted content and nothing has touched it since). If it differs from both the
commit and your recovered copy, something newer is there — **skip it, and list it** as
`skipped: newer content on disk`. Several files were legitimately edited after the reset, including
by the recovery tasks, and overwriting those would be a second data loss caused by the cure.

**3. Prove the site survives.** Take the reload hold around the whole batch
(`node Server/hold.mjs on "reset-restore"`), restore, then before releasing: `node --check` every
`.js` you wrote, and load `/`, `/framework/`, `/framework/ai/` and `/framework/ai/v/3/` headless
and confirm 200 with no console errors. Then `node Server/hold.mjs off "reset-restore"`. If
anything breaks, the safest move is to remove the file you just added, not to patch it at 1am.

## Order

Do the most valuable first, so that if you run out of room the important things are back:
`public/framework/` source and CSS · docs and readmes · `Server/` · task data · everything else.
**Skip screenshots entirely** — 969 of the losses are regenerated `.png` files, cheap to redo, and
they would dominate your time for no benefit.

## What you must not do

- **Never `git stash`, `git checkout --`, `git reset`, `git restore`, `git add`, commit or push.**
  Tonight of all nights. If you think you need a git command that writes, stop and tell me instead.
  `git show`, `git ls-files`, `git diff` and `git log` are reads and are fine.
- **Do not touch `CLAUDE.md` or `.claude/settings.json`.**
- **Never kill or restart the dev server** (port 80 is the owner's; 8123; the health watcher;
  whisper-server). **Never drive the owner's tabs.** Headless only.
- Do not search from the filesystem root.

## Prove it

Three numbers that must add up to 216: **restored + skipped-as-newer + downgraded-to-partial.**

And one spot-check you must do by hand and report: pick **three** restored files at random, and for
each, diff your restored copy against the transcript content you took it from and confirm they are
identical. Name the three in your log. A restore you have not diffed is a claim, not a result.

## Deliverables

1. **The files back**, with `lost.jsonl` updated in place so each entry now says what happened to it
   (append a `restored_at` and an `outcome` field; do not rewrite the file's other content).
2. **`page.js` in your task dir — one screen.** Top line, plain words: how many files are back and
   how many are still gone. Then what is still missing, grouped so the owner can see whether any of
   it matters. One click down for the detail. `new-page` for the shape; add it to the day page's
   `children:`.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "reset-restore (in-process agent)"`. Land with `finish-task`.

## Fences

You own the 216 files named `recoverable: yes` in `lost.jsonl`,
`public/framework/ai/2026-09-19/reset-recovery/lost.jsonl`, and
`public/framework/ai/2026-09-19/reset-restore/**`. One line in the day page's `children:`, one
append to its `day.jsonl`. Nothing else.

Nothing else is running in the repo right now, so you have it to yourself.

## Length budget

One screen, led by the two numbers. Landing `outcome`: how many are back, how many are gone, and at
most five sentences.
