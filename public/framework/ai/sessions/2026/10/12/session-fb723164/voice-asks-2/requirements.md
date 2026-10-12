# Voice asks, round 2: build the top open ones

**The list:** [ux/Dictate/doc/asks.md](/framework/ux/Dictate/doc/asks.md), made tonight by [asks-transcription](../asks-transcription/STATE.md). Build, in this order:
1. **duplicate-bubbles** (the owner hit it again on 2026-10-12: transcription worked but showed duplicate bubbles). Reproduce first, fix the cause.
2. **vscode-voice-path** (6x): the VS Code app path (Echo) feeds the same five-stage flow as Refine: one dictation system, one widget.
3. **prompt-to-board-cards** (5x): a refined prompt's cards become board cards and `asks.jsonl` lines.
4. **whisper-status-stream** (2x): Whisper restarts show the moment they happen (stream, not poll).
5. **per-sentence-model-clean** (4x): cheap per-sentence clean with cost per message.

## Done when
- [ ] Each built with a commit and proof (headless check or screenshot), or in `STATE.md` with the real blocker. Re-run the voice walk script ([voice-verify](../voice-verify/STATE.md)) after each change; it must still pass.
- [ ] Entries in `ux/Dictate/doc/asks.md` updated with commit links. Layout-check 400/1200/1920/3440; smoke clean.

Sonnet 5.5, high. Worktree; a Servex change waits for one batched restart proven on a private port. Commit each step; merge. `STATE.md`; land with `finish-task`.
