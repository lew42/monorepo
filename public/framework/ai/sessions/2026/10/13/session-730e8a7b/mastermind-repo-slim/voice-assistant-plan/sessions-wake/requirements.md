# Sessions wakes the voice assistant (requirements)

The full brief is [sessions-brief.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/sessions-brief.md); the plan is [voice-assistant.md](/framework/ux/Dictate/doc/voice-assistant.md).

## Deliverables

1. `Servex/agents/Sessions.js` spawns the fast seat as `role: "voice-assistant"` (the `voice-assistant` skill as its system text) instead of `session-fast`, behind `SERVEX_SESSION_ASSISTANT` (`fast` default, `voice`).
2. The agent id stays exactly what `Agents.name()` mints, so it does not respawn on every sentence.
3. Per owner sentence the assistant is sent the whole prompt so far (each owner line with its `at`), the new sentence, and the session file path.
4. The assistant writes one `{"place"}` line with the item tool and writes no chat reply (its final text is dropped).
5. The `fast` mode path (`(new paragraph)` becomes `{para}`) is unchanged.
6. Proof: `Sessions.test.mjs` passes; a private Servex with three sentences writes three or fewer `{place}` lines, every `re` an owner line's `at` (`sessions-wake/proof.mjs`).

## Fence

`Servex/agents/Sessions.js`, `Servex/agents/Sessions.test.mjs`, and this task dir. Not `roles.js`, not `ux/Dictate`. Needs a Servex restart to go live; the minion never restarts it.
