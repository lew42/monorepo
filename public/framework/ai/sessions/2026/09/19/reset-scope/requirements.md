# reset-scope — finish the manifest the reset-recovery task left incomplete

You are finishing a job a sibling started and deliberately left incomplete. Read its brief and its
output first:
- `public/framework/ai/2026-09-19/reset-recovery/requirements.md` — the situation and the rules,
  all of which still bind you.
- `public/framework/ai/2026-09-19/reset-recovery/lost.jsonl` — 39 entries, 6 marked recoverable in
  full (5 already restored), 2 partial, 31 never searched.
- Its `task.jsonl` in the same directory.

**Your job is to answer one question the owner does not yet have an answer to: what exactly did
the 23:16 reset destroy?** Right now the honest answer is "39 files that we know of, and we never
finished looking." That is not good enough to act on.

## Two things to do, in this order

1. **Complete the manifest.** The obstacle the sibling named: no session today ran a full unscoped
   `git status`, only about sixty *scoped* ones, and the single best snapshot truncates at 2000
   characters partway through `core/Page`. Mine the scoped `git status` calls across today's
   transcripts, plus `git diff`/`git log` output, plus any task's `action` lines naming files it
   edited. A file that a task log says was edited since the 17th, and that now matches the commit
   exactly, lost its changes. Extend `lost.jsonl` with the same line shape. Every entry says how you
   know.
2. **For each file on the completed list, say whether its content is recoverable and from where.**
   `yes` only when a transcript holds the whole file — a complete `Read` result, or a `Write` of the
   full content. `partial` when only edits or fragments exist. `no` otherwise. Never invent content,
   and do not restore anything in this task.

**The number that matters and that you must state plainly: how many files lost uncommitted work,
and of those, how many are gone for good.** If you cannot establish the total with confidence, say
what your lower bound is and what would be needed to close it.

## The rules that still bind you

- Never `git stash`, `git checkout --`, `git reset`, `git restore`, commit or push.
- Read-only over the repo except your own task dir. Do not touch `CLAUDE.md` or
  `.claude/settings.json`.
- Never kill or restart the dev server. Never drive the owner's tabs; headless only. Do not search
  from the filesystem root.

## Deliverables

The completed `lost.jsonl`; an updated `page.js` at `public/framework/ai/2026-09-19/reset-recovery/`
whose top line is the total and the unrecoverable count in plain words — one screen, and it
replaces the sibling's top line rather than appending to it; and your own `task.jsonl` in this dir,
opened with `new-task` before your first write, `"group": "ai-ops"`,
`"session_id": "d6699955-ef6f-466f-bc88-e0a1e4cb1aa1"`, `"worker": "reset-scope (in-process agent)"`.
Land with `finish-task`.

## Fence

`public/framework/ai/2026-09-19/reset-scope/**` and the two files named above inside
`reset-recovery/`.
