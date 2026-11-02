# Recite: cue only on a long lookup, and a visible play icon

The owner's two asks (voice, 2026-11-02 16:45):

1. Stop the automatic thinking cue after every owner line in `audio/Recite/Recite.js`. Add an explicit trigger the voice agent fires only for a long lookup: the session line `{"thinking":{"by":"smart"}}`. It plays the cue once, repeats while the agent works, stops when the reply arrives (and after 60 s if none does). Keep the `thinking_cue` setting. Docs: `audio/Recite/readme.md`, one line in `Servex/agents/session-smart.md`.
2. The Recite play/pause icon on its orange circle was invisible. Fix: readable ink, at least 4.5:1 in light and dark, one CSS place, shot at 360x740.

Process: worktree `recite-cue`, headless test, `Server/review.mjs`, `Server/merge.mjs`. Review: `review.md` here.
