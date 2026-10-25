# Dictation: no flicker, words in place

Budget: $15. Load the `minion` skill first. A new worktree off current `michael/dev` (`node Server/worktree-up.mjs dictation-flicker`), branch `worktree/dictation-flicker`; commit each working step; `node Server/smoke.mjs <worktree>` must show no FAIL. I review and merge.

The owner's words are in the parent brief, [section "The owner, on the whole chain from Whisper to the bubble"](../requirements.md#the-owner-on-the-whole-chain-from-whisper-to-the-bubble-2026-10-24). The Debug tab, both stall fixes and the bubble deltas already landed from [the parent task](../requirements.md). The owner wants website dictation to an SDK agent that always works and never jumps.

## Do, in this order

1. **Reproduce the flicker first.** Press dictate and talk: raw text flashes in, vanishes, and comes back later (perhaps when the cleaned text replaces it). Find which step removes text the owner was reading. Record each step's timing on the Debug tab rows, not in a new place.
2. **Fix it at the cause.** While dictation is on, each word appears **in place in the chat bubble, as if already sent**. There is no text area the words move out of, and nothing jumps. A later stage (cleaning, refining) may change a word only in place, a little at a time, never by clearing and redrawing the bubble.
3. **Prove it with a burst of shots:** a headless run that streams a stub sentence sequence (raw, then cleaned) and shoots every ~150 ms. The proof is two numbers that must agree: every word visible in shot N is still visible in shot N+1, unless the cleaned text really changed it. Save the shots and the numbers in `flicker/shots/`.
4. **Then the polish list** in [polish/requirements.md](../polish/requirements.md) (items 1–4), on the same branch. Do it only if the flicker fix has landed in a commit and the budget allows. Otherwise leave it and say so.

Out of scope here, written down only: chunking by sentence into ONE refine step that writes item-tool cards (flow steps 1–4 in the owner's section). If the fix shows that chunking is the cause, say so in one log line with what it would take, and do not build it.

## Check

Re-run `ux/Dictate/test/stall.mjs`, `deltas.mjs` and `debug-tab.mjs` with your worktree URL as the first argument (the default is the live site). All must pass.

## Never

Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`, never push. Write `.jsonl` only through `node .claude/hooks/append.mjs`.

## Report

One screen as your task's outcome line: the cause of the flicker in one sentence, the fix, the burst numbers, the tests, and which polish items were done.
