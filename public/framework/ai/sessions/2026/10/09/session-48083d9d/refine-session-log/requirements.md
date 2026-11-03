# Refine: keep every dictated prompt in its session's log

**Goal:** when the owner dictates a prompt, the session's own log keeps it in three stages, and the page shows each sentence as the words arrive.

From the mastermind, 2026-10-10 (owner words condensed): transcribing on the site worked. This is the next slice, priority 2 in [`handover.md`](/framework/ai/handover.md), with the three addenda in [`ext/Refine`](/framework/ext/Refine/md/doc/vision-2026-10-08/). Duplicate chat bubbles belong to `mastermind-dup-chat-bubbles`, not this task.

## The asks

1. **Three stages in the session log.** Raw (the words as heard, never changed), then clean (final text, numbered sentences), then refined (cards that cite sentence numbers).
2. **Live per sentence.** Each sentence appears in the UI as its words arrive.
3. **Alternates, names and tags.** One Haiku 5.5 pass adds them, under 60k tokens.
4. **Echo stays off.** Smallest working slice first, in a worktree, a commit per working step, then review and merge.

## Where to work

- [`ai/AISession`](/framework/ai/AISession/): new `PromptLog.js`
- [`Servex/ext/refine`](/framework/servex/)
- [`ext/Refine`](/framework/ext/Refine/)
- This directory

Not the chat-bubble files.
