# Plan: Dictation debug tab, the stall, and web live-transcribe

The brief is [requirements.md](requirements.md); what already exists is [past-work.md](past-work.md). One builder (Opus, high effort) does the steps below in order, in one worktree on branch `task/dictation-debug`, and commits after each working step.

## Order of work

1. **The Debug tab comes first, because it is the tool that finds the stall.** The drawer's Dictation tab becomes Debug. It has one row per layer: mic, Whisper socket, raw transcripts, text sent to the LLM, LLM connected and replying. Each row shows its state live and the real error text when it fails. Read the state from the objects that already exist (`ext/Chat/Mic.js`, `Composer.js`, `ext/Ask/reply.js`); do not build a second pipeline.
2. **The tab is routed.** Pick a subpath or a peer path and write the reason in the module readme.
3. **Reproduce the stall with the Debug tab open, then fix it.** Check whether the mic is released on reload (track `stop()` and stream teardown on `pagehide`) and whether a dead socket or process ever reconnects. If it cannot be fixed, locate it exactly and write down the next step.
4. **Web live-transcribe: bubbles and deltas.** Find where the deltas are applied to chat bubbles. Make each bubble keyed by a stable id, and make applying a delta idempotent and ordered, so a repeated or late delta cannot duplicate or scramble the text. Prove it with a headless test that replays a delta sequence, including duplicates and out-of-order deltas.
5. **Errors, on the one subscription system.** Find what writes `public/framework/ai/errors/`. Extend it so a page or browser error is one line appended to `errors.jsonl` in the module's own folder, which Servex `follow` already delivers. There is no second mechanism and no direct send. Say how the global folder moves to per-module logs. The watcher is a proposal in `doc/`, not built.
6. **The UI rule** goes in `public/framework/doc/rules.md`: anything that can fail tells the user what went wrong.

## Decisions taken now

- One builder, not two: steps 1, 3 and 4 all touch `ext/Chat/`, and two agents in one folder collide. *Alternative:* a second builder on step 5 in parallel. That would win if step 5 grows past a small edit.
- The Debug tab comes before the fix: the owner's complaint is "no error", so making failures visible is part of the fix itself.
