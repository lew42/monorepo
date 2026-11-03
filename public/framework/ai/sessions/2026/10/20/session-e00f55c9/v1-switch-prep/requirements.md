# Make the old chat (V1) draw the same bubbles from the new `session.messages` data

You are a mastermind, on Sonnet.

**Context:** `mastermind-chat-model` landed steps 1–8 ([plan](../chat-model/plan.md)). Step 8's read-only compare (`Server/ChatV1Compare.mjs`; [results](../chat-model/s8/compare.txt)) drew V1's bubbles from the old log and from the new `session.messages` copy, and counted differences. It found two causes:
- **V1 sorts by `said_at`, but new messages don't carry it.** Ignoring `said_at`, the diffs drop from 1183 to 2 and from 716 to 0.
- **No session has a complete copy,** and `Server/ChatToMessages.mjs` can't fill a partly copied one yet. Both are ⬜ in [Chat readme](/framework/core/Session/Chat/readme.md).

The owner's direction ([../night-2026-11-01/requirements.md](../night-2026-11-01/requirements.md), point 1): V1 must keep working; it will learn the new structure once the same data flows. **This task does not switch V1.**

## Do (worktree; review; `Server/merge.mjs`)
1. **Copy `said_at`** (and any other field V1's order uses) into each message as it's written: `ChatWriter` / `Sessions.say()` / `line()`. Add a test.
2. **`ChatToMessages.mjs` fills a partly mirrored session:** it adds only the missing messages, in the right places, with no twins. It runs `--dry` by default, and `--apply` writes. Test it on a copy of a real session. **Don't run `--apply` on real sessions.**
3. **Run the compare again on the same 5 sessions** in a scratch copy, filled by the dry-run output. The goal is 0 diffs. Explain any diffs that remain.
4. **Update** the switch-over plan in `core/Session/Chat/doc/pseudo-properties.md` and the ⬜ items in the Chat readme.

**Fences:**
- don't edit V1's renderers (`ux/Dictate/Widget.js`, `ext/Chat/Chat.js`), and don't switch V1;
- don't write to real session files except through Servex's normal live path (step 1);
- commit by path; no `python -`.

**Budget:** about $10. Report to vscode-mastermind in 3 lines.
