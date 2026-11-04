# Voice system, 2026-11-03: what is live, what to try, what is open

Source of the asks: [owner-feedback-2026-11-03b.md](owner-feedback-2026-11-03b.md). The rules behind them: [principles.md](/framework/ux/Dictate/doc/principles.md). Each ask has a folder here with its `report.md`.

## Live now (merged to `compliance/dev`)

| Ask | What you get | Folder |
|---|---|---|
| 1, 2a-2c | The seat answers with `say` only, newest thing first, in a rewritten shorter brief; replies wait until you pause. | `ask1-origin`, `ask2a-say-tools`, `ask2b-newest-first`, `ask2c-brief-rewrite` |
| 3 | Cards are found by id, not by guessing from text. | `ask3-cards-by-id` |
| 5/6 | Moving a sentence to a new topic is one move, mirrored in the chat list. | `ask5-move-mirror` |
| 7 | A question card stays in place; the answer shows on it; a far-off answer gets a small reference near the end; a repeated question links to its card. | `ask7-question-cards` |
| 8 | Each voice session gets its own idle mastermind (`mastermind-<session id>`), costs nothing until the seat hands it something. | `ask8-session-mastermind` |
| 9 | Tap your own bubble to see the raw words. | `ask9-raw-tap` |
| 10 | Three bleeps while a hand-off to the mastermind is being worked. | `ask10-thinking-sound` |
| 4, 5, 6 remainder | An answer is never drawn above words you already saw (the cause of the "out of order" messages: 14 of 117 replies in one real session). Your next sentence starts a new bubble when a card sits below the open one. A rough title after two or three sentences; a task gets a `☐` before its title. | `ask456-placement` |
| Research | Telling the read-aloud voice from yours: [readaloud-voice-vs-owner.md](/framework/ux/Dictate/doc/readaloud-voice-vs-owner.md). Locked phone and installed app: [locked-phone-and-pwa.md](/framework/ux/Dictate/doc/locked-phone-and-pwa.md) (probably does not survive; the sources were not fetched, so the numbers are unverified). | `research-notes` |

**Servex must be restarted once more** for the last row: it changes `ChatWriter.js` and `Sessions.js` (asks 1-10 above were live after the 01:33Z restart).

## What to try, on your phone

1. Say a few sentences, then a new topic. The new topic should open a new card in one step and your words should stay one bubble per topic.
2. While you are still talking, let the assistant answer. Its answer should wait and land below your open bubble.
3. Ask a question that needs the repo. Listen for the three bleeps. If you cannot hear them on the phone, that is open item 1 below.
4. Tap your own bubble: the raw words appear.
5. Lock the phone mid-session (the locked-phone note's cheapest test) and see whether it keeps listening.

## Still open

1. **The thinking sound** is built but not checked on a real phone, and the "..." dots row on Chat V3 is only proposed ([thinking-sound.md](/framework/ux/Dictate/doc/thinking-sound.md)). The browser tests for the sound belong in the Test view, `/framework/core/Test/`.
2. **Stored paragraphs** that refer to sentence ids: declined (changes every stored Prompt); proposal in [placement-defaults.md](/framework/ux/Dictate/doc/placement-defaults.md).
3. **V1 still draws from its own `{chat}` lines,** not `session.messages`, and is still the default view. Kept on purpose as the raw log; listed in `ai/todo.md`.
4. **The task checkbox** is a `☐` in the title, not tickable; no browser test ([todo.md](/framework/ai/todo.md)). Raw tap has no keyboard access yet (same list).
5. **Not built, by your direction:** batching (one sentence per send stays the default) and log mode (a separate later task).
6. **Earlier-approved, unbuilt:** the prompt-close fix for mingled chat (`Sessions.js` `prompt_close_ms`), paragraph-by-paragraph generation, a larger `skip_stale`, a `reading` flag, mute, heard-only context, per-session `single_pause_ms`, ChatWatch (proposal only), view modes.
7. **Three tests already fail on the base,** not from this work: `ext/Chat/send-count.test.mjs`, `Servex/agents/landing-check.test.mjs`, `ext/Chat/v2/ChatV2.test.mjs`.
8. **Housekeeping left:** the locked `voice-research` worktree, an unconfirmed whisper process on port 8178, the qf-2 and qf-5 pool trees held by ledger noise, untracked `ask1-origin/` and `ask2c-brief-rewrite/` records.
