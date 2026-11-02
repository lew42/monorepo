# Morning report: the night of 2026-11-01 to 11-02

The plan was [requirements.md](requirements.md). Every item below was merged to `michael/dev` and pushed. The week is 52% used with 61% gone (85% of pace).

## Your five decisions (none blocks other work)
1. **Free about 4.8 GB of memory:** run `node Server/worktree-servers.mjs --stop-stale`. About 61 old worktree dev servers are still running, and Claude Code's safety check won't let the tab stop them. Then run `node Servex/sustain.mjs --restart`, which loads the staggered revive and the 1.5 GB gate default.
2. **Git:** say "go" to steps 1–2 in [/framework/doc/git.md](/framework/doc/git.md): drop the pull-request rule on `main`, then push dev to `main` (the fast-forward-only routine).
3. **`List.add` default** (task `f7-add-default` on the chat-model record): should adding an item that already has a parent make a Ref? The caller audit found nothing that relies on the move.
4. **When to switch V1** to `session.messages`. The compare now shows 0 differences on your 5 biggest sessions; the plan is in [pseudo-properties.md](/framework/core/Session/Chat/doc/pseudo-properties.md).
5. **Still open from yesterday:** the session-twins "go", and merging voice-bridge.

## Landed
- **Chat data**, all 8 steps:
  - safe saving;
  - `list.ref()` and `Chat.resurface()`;
  - tasks and child sessions as Refs in the chat;
  - the list view redraws only what changed;
  - a timestamp on every sentence, and the raw prompt rebuilt exactly;
  - a prompt shown as a card with items;
  - the ✓/🧠 marks on the message;
  - "Session tasks done: N of M";
  - the V1 compare.

  Then the V1 switch prep: `said_at` is copied, partly copied sessions can be filled, and both sources match with 0 differences.
- **The views:**
  - V3 and then V2 draw from `session.messages`, with V2 now built on V3;
  - your raw text never disappears from V1;
  - a reply never lands above your newest line;
  - dictation sends sentence by sentence;
  - a dimmer guess, the live guess in V2, paragraphs at pauses;
  - docs for the ✓/🧠 icons and the person icon.
- **Read-aloud:**
  - stop when you speak, resume after quiet, queue replies;
  - echo and phantom filtering;
  - the thinking cue;
  - the highlight no longer drops out, and read words stay lit;
  - no flood (2.5 s of quiet, agent updates as one line);
  - tap to pause.
- **Tests:**
  - `TestRunner --browser` runs 34 browser scripts headless;
  - `run-all.mjs` runs everything;
  - all 12 red dictation scripts pass;
  - browser tests are fenced off from the live Servex.
- **Servex:**
  - the 00:31 crash is fixed (an unhandled rejection);
  - it revives agents after a crash (proven live at 03:47);
  - revives are staggered;
  - the spawn-parent bug is fixed;
  - worktree servers stop after 30 minutes idle.
- **Docs:**
  - [background-work.md](/framework/ux/Dictate/doc/background-work.md): every job that runs on a spoken sentence;
  - `PastWork --built` lists everything built since 10-20;
  - [turn-taking.md](/framework/ux/Dictate/doc/turn-taking.md).

## Still open
- **Servex's native crashes** (`0xC0000409`): four tonight, cause unknown. They need Windows crash dumps (admin). See `Servex/doc/restart.md`.
- **Parked, as you asked:** paced word streaming, heard-only context, the fast seat's comma feed (a step after V1 switches), and Chatterbox.
- **Read-aloud follow-ups** are filed in `audio/Recite/improvements.jsonl`. For example, "tap to hear it" doesn't do what it says yet.

**Dictation and read-aloud detail** (13 landings with commits, open items): [../dictation-v3/handover.md](../dictation-v3/handover.md).
