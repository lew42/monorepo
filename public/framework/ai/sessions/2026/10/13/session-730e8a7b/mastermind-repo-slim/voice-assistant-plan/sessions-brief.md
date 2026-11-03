# Sessions: the voice assistant takes the fast seat (queued brief)

Budget: $4. Sonnet. Work in a worktree; the parent reviews the diff and runs `merge.mjs`. Needs a Servex restart to go live: log `needs_restart`, never restart it yourself.

The plan: [ux/Dictate/doc/voice-assistant.md](/framework/ux/Dictate/doc/voice-assistant.md). The owner's words: `../requirements-17.md`, asks 2 and 4.

## Do

1. In `Servex/agents/Sessions.js`, behind `SERVEX_SESSION_ASSISTANT` (`voice` | `fast`, default `voice` once proven, `fast` until then): spawn the fast seat with `role: "voice-assistant"` and the `voice-assistant` skill as its system text, instead of `session-fast` with `session-fast.md`. Keep the agent's id exactly what `Agents.name()` mints for the row, or it respawns on every sentence (open-mic lesson, 2026-09-22).
2. Per owner sentence, send it the whole prompt so far (each owner line with its `at`) plus the new sentence and the session file's path. It answers by writing one `{"place"}` line with the item tool; it writes no chat reply.
3. Keep the `(new paragraph)` → `{para}` path for `fast` mode untouched.
4. Proof: `Sessions.test.mjs` passes; a private Servex run with three sentences writes three or fewer `{place}` lines, every `re` an owner line's `at`.

## Fence

`Servex/agents/Sessions.js`, its test, this task dir. Not `roles.js` (the row exists), not `ux/Dictate`.
