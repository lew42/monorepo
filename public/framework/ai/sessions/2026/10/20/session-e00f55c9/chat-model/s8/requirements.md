Budget: $6. Load the `minion` skill first.

# chat-model step 8: V1 side by side (read-only) + the switch-over plan

You build STEP 8 ONLY of [builder.md](../builder.md) (line 27). The card and the owner's words: [requirements.md](../requirements.md).

Worktree: `C:/Code/lew42/worktrees/chat-model` (branch `worktree/chat-model`). Work and commit there only, by exact path.

## Deliverables

1. **An adapter** in `core/Session/Chat/` (one small class, e.g. `V1Bubbles.js`): turns `session.messages` into the bubble list V1 draws. First find how V1 reads `{chat}` lines into bubbles (look in `ext/Chat/Chat.js` and `ux/Dictate/chat.js`: READ ONLY) and match that bubble shape.
2. **`Server/ChatV1Compare.mjs`** (read-only): for N real voice sessions, it builds V1's bubbles two ways (from the `{chat}` lines the V1 way, and from `messages` through the adapter) and prints where they differ, one line per difference plus a count per session. A session with no `messages`: copy its file to the session scratchpad, run `node Server/ChatToMessages.mjs` on the COPY as a dry run (no `--apply` ever) and compare from that.
3. **Run it on the 5 largest voice sessions.** Save the raw output as `chat-model/s8/compare.txt` in the MAIN tree's task dir. Give two numbers that must agree: bubbles via V1 and bubbles via the adapter, per session.
4. **"How V1 switches over"**: a section in `core/Session/Chat/doc/pseudo-properties.md` with the steps in order, and what the compare must show before each step (e.g. 0 differences on the 5 sessions). Plain sentences, short.
5. A test of the adapter (`core/Session/Chat/V1Bubbles.test.mjs` or beside the existing Chat tests) on the fixture `core/Session/Chat/fixture/v-u48msei-session.jsonl`.

## Never

- Never edit `ext/Chat/v3`, `ext/Chat/v2`, `ux/Dictate`, `ext/Chat/Chat.js` or `ux/Dictate/chat.js`. Never switch V1 over. Never run the migration with `--apply`.
- Never write into a real session record: copies in the scratchpad only.
- Never kill or restart the dev server or Servex, never drive the owner's tabs, never `git stash`, never `find /`. Never write the owner's name anywhere.
- Leave `files.jsonl` / `session-links.jsonl` / `results.jsonl` churn alone.

## Done

Commit, then reply with one screen: what the compare found (the numbers), the commit hash, and the test counts. Log findings as `log` lines in your own `task.jsonl`.
