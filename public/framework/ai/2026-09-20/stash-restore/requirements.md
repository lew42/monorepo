# stash-restore — the whole pre-reset tree is in a stash; put it back

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** This is mechanical. Do not improvise.
2. **Clear beats brief — by far.** The owner needs to know exactly what came back.
3. **Prioritize.** Correctness over speed. One clobbered file undoes the whole point.

## What we got wrong, and what is actually true

Last night the repo appeared to suffer a destructive reset at 23:16 on 2026-09-19. Four tasks spent
the night reconstructing files from session transcripts, and about 154 files were written off as
gone for good.

**That was wrong.** It was a `git stash`, not a destructive reset — and `git stash` runs a
`reset --hard` internally, which is why the reflog showed two "reset: moving to HEAD" entries and
why nobody suspected a stash. **`stash@{0}`, timestamped 2026-09-19 23:16:39, holds the entire
pre-reset working tree: 1,389 files.** It has been sitting there all night. Nothing was ever
destroyed.

Verified already: the stash holds the lost design studies, and it holds `--pad-card` in
`framework.css` at line 303. A sibling task restored 138 files from it and every one parsed, with
three files that had survived on disk matching the stash byte-for-byte.

**877 of the stash's files are still absent from disk right now.** Your job is to put them back.

## How to take files out of a stash without risking anything

**Read from it. Never apply it.**

- `git show 'stash@{0}:<path>'` prints one file's pre-reset content. That is the whole mechanism.
- **Never `git stash pop`, `apply`, `drop`, `clear` or `branch`.** `pop` and `apply` try to MERGE
  into the current tree and can conflict or overwrite the last twelve hours of recovery work;
  `drop` and `clear` destroy the only copy. The sibling task restored 138 files with `git show`
  alone and that is the proven path.
- Everything else on the never-list still binds: no `git checkout --`, no `reset`, no `restore`, no
  `add`, no commit, no push.

## The two rules that decide each file

**1. Absent from disk → restore it.** That is the 877.

**2. Present on disk → look before you write.** Three cases, and only one of them restores:
- The disk copy is **byte-identical to the stash** — nothing to do.
- The disk copy still matches commit `8b4ced8e` (it was reverted and nobody has touched it since) —
  **restore from the stash.**
- The disk copy matches **neither** — something newer is there. **Skip it and list it.** Twelve
  hours of recovery work, this run's own task logs, the handover and `CLAUDE.md` are all newer than
  the stash, and overwriting them would be a real data loss caused by the cure. This is the rule
  that matters most; when in doubt, skip.

Work out the counts for all three cases and report them.

## Watch for these specifically

- `public/framework/ai/2026-09-19/**` and `public/framework/ai/2026-09-20/**` — last night's task
  dirs. Much of this is **newer** than the stash. Be careful here.
- `public/framework/ai/2026-09-19/reset-recovery/lost.jsonl` — written and updated after the stash.
  **Do not overwrite it**; it is the record of the whole incident.
- `CLAUDE.md` — had a section restored by hand after the stash. Out of bounds entirely.
- `.claude/settings.json` — out of bounds entirely.
- Screenshots (`.png`, `.jpg`) are a large share of the 877. They are cheap but they are also
  genuinely part of pages that display them, so restore them; just do not let them dominate your
  reporting.

## Prove it

Three numbers that must account for all 1,389: **restored + already-identical + skipped-as-newer.**

Then: `node --check` every `.js` you wrote, and load `/`, `/framework/`, `/framework/ai/`,
`/framework/ai/v/3/` and `/framework/styles/system/studies/` headless — all 200, no console errors.
Take the reload hold around the batch and **re-take it before each batch**; it self-expires after
five minutes and has lapsed twice during long jobs this run.

And hand-diff **three** restored files against `git show 'stash@{0}:<path>'` output, name them.

## Deliverables

1. **The files back.**
2. **`page.js` in your task dir — one screen.** Top line in plain words: the tree was never lost, it
   was stashed, and here is what is back. Then the three counts. Then, briefly, what is still not
   restored and why. `new-page` for the shape; add it to `public/framework/ai/2026-09-20/`'s
   `children:` (that day dir exists already).
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, plus
   `"worker": "stash-restore (in-process agent)"`. Land with `finish-task`.

## Fences

You own every path listed in `git stash show --name-only 'stash@{0}'` **except** the four exclusions
named above, plus `public/framework/ai/2026-09-20/stash-restore/**`. One line in that day page's
`children:`, one append to its `day.jsonl`.

**Never kill or restart the dev server** — port 80 is the owner's and they are awake and using it;
also 8123, the health watcher, whisper-server. **Never drive the owner's tabs.** Headless only. Do
not search from the filesystem root.

## Length budget

One screen, led by the three counts. Landing `outcome`: a headline plus at most five sentences.
