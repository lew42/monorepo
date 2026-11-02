# V1 chat: replies in arrival order, below everything already shown

Budget: $6. Load the `minion` skill first, then `code`. You own this one fix end to end, one merge. The owner's words: [../owner-notes-2026-11-01-2040.md](../owner-notes-2026-11-01-2040.md), item 19 (the prompt itself is line 1616 of the session below).

**The bug.** In the V1 chat view (`ux/Dictate/v1/`), a smart reply that was spoken after the owner's newest line is drawn ABOVE it, and the owner's line stays pinned at the bottom.

**The owner's rule.** Dictation appends at the bottom; replies appear in arrival order, below everything already shown. Nothing already on screen jumps above or below a later arrival.

**The repro (real data).** `public/framework/ai/sessions/2026/11/01/v-u48msei/session.jsonl`, lines 1562–1640 (21:04:02–21:06:11). The smart reply `m-1793588646440` (at 21:04:06, `re` the 21:04:02 line) was being read aloud while the owner said "Oh, yeah, I mean..." (21:04:10), "Thank you." (21:04:27, probably an echo phantom) and "Yeah, forget about the icons…" (21:05:11). Copy these lines into a fixture; do not edit the session file.

**Find the cause first, then fix it; log the cause as a `log` line in this dir's `task.jsonl`.** Suspects, none confirmed:
- V1 places a reply next to the line it answers (`re`) instead of at arrival;
- V1 sorts by an earlier timestamp (the reply's `at`, or the answered line's), or a later `clean`/`place` edit of an owner bubble, or a streamed reply, moves things;
- the "open bubble stays last" rule (tested in `ux/Dictate/test/order.mjs`) keeps the owner's open bubble pinned below a reply that arrived after it opened.

Whether the owner's perception ("spoken after") or the arrival time is the right key is part of the finding: the reply may have arrived before an owner line but still been playing when that line came. Say which, and fix toward the owner's rule (what is shown never jumps; new things go below).

The per-sentence send (`ca1f68c00`, `ext/Chat/Mic.js`) now makes many short owner bubbles, so this case comes up more often: test on current `michael/dev`.

**Prove it:** extend `ux/Dictate/test/order.mjs` (or a sibling test) with the fixture: after replaying lines 1562–1640, the order V1 renders is arrival order, and no owner line sits below a reply that arrived after it. Every existing case still passes, and the full suite. One headless shot at 400x860 of V1 with the fixture, in `shots/` here; read it yourself.

**Land:** worktree via `node Server/worktree-up.mjs v1-order`; commit by exact path; `node Server/review.mjs <this dir> <worktree>`; answer every finding as `{"review":{"answer":{"n","reply"}}}` in this dir's `task.jsonl` (`node .claude/hooks/append.mjs`); `MSYS_NO_PATHCONV=1 node Server/merge.mjs <full worktree path> --review-dir <this dir>`; `node Server/smoke.mjs` shows no FAIL; `git log michael/dev..worktree/v1-order` is empty. Update `ux/Dictate/readme.md` (or its ordering doc) in the same commit.

**Fence.** `mastermind-ink-check` edits `ux/Dictate/` views in `worktree/views-fix` (guess colour, V2 live text, paragraph breaks). If your fix touches a file it also changes, message it first (`send_to_agent`) and agree. `mastermind-read-aloud-next` owns `audio/Recite/`; do not edit there.

**Report** once, after the merge, to `mastermind-dictation-v3`, in 3 lines: the cause, the proof, the commit.

**Never:** restart or kill any server or Servex, run `python`, drive the owner's tabs, use git's stash, or `git add` the generated `files.jsonl`. Resolve, don't park: decide, and write the alternative beside it.
