# Chat scroll: locked by default, pinned to the bottom, no jumps

Worktree `C:/Code/lew42/worktrees/qf-7`, branch `worktree/qf-7`. Page `/`: Chat V1 (the voice sheet, `ux/Dictate/Widget.js`) and Chat V2 (`ext/Chat/v2`, drawn into `ext/drawer/ChatView.js`). Both use `sticky_scroll()` in `ext/Chat/Chat.js`.

The owner's six asks, each ticked with its proof:

- [x] 1. Locked by default, pinned to the bottom on every update (live whisper line, streaming text, tasks). `sticky_scroll` and `Widget.Thread` MutationObservers; old page-turn anchor deleted. Probe: pinned through child growth.
- [x] 2. Unlocks only on a deliberate scroll-up; re-locks within ~40px of the bottom or on the newest button. Gesture-gated unlock. Probe: unlocked after wheel-up, 0 px moved while unlocked, button relocks.
- [x] 3. Newest button lands the last bubble just above the bottom toolbar and keeps re-pinning. `overlap()` pads the tail by the bar's height. Probe: 4px above a 60px bar after fill, growth, shrink and the button.
- [x] 4. No jumps on re-render or refinement. No scroll write unless locked; one pin per frame. Probe.
- [x] 5. "fast / smart" marks removed. `.chatbox-sent, .chat-v2-sent { display: none }`.
- [x] 6. No horizontal scroll. Probe: `scrollWidth <= clientWidth`.

Docs: `ext/Chat/doc/scroll.md`, `ux/Dictate/doc/voice-assistant.md#nothing-jumps`. `ux/Dictate/test/anchor.mjs` deleted with the page-turn mode it proved.

## Known, not caused by this task

`ux/Dictate/test/earlier.mjs` prints `click 1: the reader moved` on `michael/dev` too (same numbers before and after this commit): "show earlier" keeps the reader's position by a different rule than the lock. Not fixed here; queued in `ai/todo.md`.
