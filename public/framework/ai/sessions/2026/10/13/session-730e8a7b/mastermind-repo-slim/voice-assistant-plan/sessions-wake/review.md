verdict: fix
1. [fix] Deliverable 6's live proof was never run: `proof.mjs` is in the diff, but `task.jsonl` has no result line (no PASS/FAIL, no place count), and the session ended "without landing". Run `sessions-wake/proof.mjs` in the voice-wake worktree and log its JSON output before merging. The unit half does pass: `node Servex/agents/Sessions.test.mjs` gives 21 checks passed, run by this reviewer.
2. [note] `say()` and `hold()` choose the message shape from `this.voice_seat()`, the process-wide switch, but `heard()` drops the reply only when `s.fast_seat === "voice"`, which is set per session (Sessions.js ~859/1005 vs ~1240). If an agent from the old seat is still awake when the switch flips, it gets the voice-shaped prompt and its reply is still posted as chat. Using one test for all three would be simpler.
3. [note] The voice spec leaves out `mcp_url: ""`, so the agent loads the whole Servex door (100+ tool schemas) next to `local.item`, on every per-sentence low-effort turn (Sessions.js ~1084). If it only needs `mcp__local__item`, an `allowed_tools` list or `mcp_url: ""` would keep it as lean as session-fast was. This may need `local` to stay attached on its own, so check Agents.js ~1110.
4. [note] `voice_seat(s)` is called with an argument at Sessions.js ~340 but is defined with none (~363). It is harmless, but it reads as though the switch were per session, and it is not.
5. [note] `last_owner_text()` stays as a wrapper, and nothing in the diff calls it any more (Sessions.js ~360). Remove it unless something outside the fence uses it.

## Requirements
- 1 "spawns the fast seat as role voice-assistant … behind SERVEX_SESSION_ASSISTANT (fast default, voice)" — yes — `pick_assistant`, the `voice` spec branch with `system: voice_brief()`, and the test "the voice-assistant role is spawned".
- 2 "agent id stays exactly what Agents.name() mints" — yes — `name: s.id` with no `id`, and the test checks `voice-assistant-<session>`; the id is reused through `s.fast`.
- 3 "whole prompt so far (each owner line with its at), the new sentence, and the session file path" — yes — `voice_say()`, covered by two tests (one sentence, and a held thought of two).
- 4 "writes one {place} line with the item tool and no chat reply" — partly — the text is dropped in `heard()` and the item tool comes from the local in-process server. Whether a `{place}` line really gets written is only shown by the proof, which was not run (finding 1).
- 5 "fast mode path unchanged" — yes — the else branches are untouched, and the test "fast mode is untouched" passes.
- 6 "Sessions.test.mjs passes; private Servex, three sentences, ≤3 {place}, every re an owner at" — no — the tests pass (21), but there is no recorded proof run.
- Fence — yes — the diff touches only Sessions.js, Sessions.test.mjs and the task dir.

## Words
- Comments are short and point to `ux/Dictate/doc/voice-assistant.md` — yes.
- The prompt text sent to the assistant is plain and says exactly what to do ("one {place} line each, `re` = its `at`") — yes.

No page changed, so there are no shots, and only Requirements and Words are answered.
