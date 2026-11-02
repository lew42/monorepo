# Raw Whisper text: fast again, and readable dim-to-strong (you are a mastermind)

**The owner (2026-11-01, 18:21, relayed by the web voice session):**
1. "Raw Whisper text used to appear very quickly; now it looks delayed or mangled."
   - Trace the path of a raw Whisper final from the page to the screen in V1, V2 and V3, timing each hop: the Whisper final (`ai/whisper/bucket.jsonl` has `t` and `ms`), the `Sessions.say` write into `session.jsonl`, and the view's draw.
   - Find where the delay or the mangling comes in.
   - Context:
     - [../dictation-map/map.md](../dictation-map/map.md) (the path);
     - today's merges from `mastermind-dictation-v3` (`git log --since=16:00 michael/dev -- public/framework/ux/Dictate public/framework/ext/Chat`), which may have caused it;
     - the session `v-u48msei` (`public/framework/ai/sessions/2026/11/01/v-u48msei/`).
2. **Dim-to-strong colour, asked for at the start of this session:** raw or temporary text clearly readable (not near-invisible), turning full strength once finalized, in all three views. One CSS token pair, shared by the three views.

## Do

- **Measure with a node script** on the real logs; add a headless check if needed. Fix it in a worktree, then `node Server/review.mjs <this dir> <worktree>`, then merge with `node Server/merge.mjs` (the owner said to merge voice work that works). Restarts are fine.
- **Coordinate:** `mastermind-dictation-v3` is changing the same files, `ux/Dictate/chat.js` and `ext/Chat/v3`. Before editing them, message it with `send_to_agent` and say which lines you'll touch. Don't revert its work.
- **Report to vscode-mastermind:** each hop's time before and after, and the cause, in 4 lines.

**Fences:**
- No `python -`. Commit by path.
- **Budget:** about $15.
