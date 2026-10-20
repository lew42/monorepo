# Voice prompts: log every one, verbatim, by code (open task, 2026-10-19)

**Status: built 2026-10-19; live after a Servex restart.** Owner decisions of the same day: these are *cloud voice agent* sessions, **one folder per day per caller**, `sessions/YYYY/MM/DD/cloud-voice-agent/session.jsonl`, line 1 `{session:{kind:"cloud-voice-agent",caller:"voice-app"}}`, registered as a row in the `Sessions` store (id `cloud-voice-agent-YYYYMMDD`) so `session_summary` and `session_line` work. `RemoteMCP.tools()` adds `owner_words` to every schema; `intercept()` strips it and files `{owner_words:{at,words,tool,caller}}` (once per distinct text); every call gets `{tool_call:{at,tool,args_hash,owner_words:bool}}` (`false` is a visible gap); a `spawn_agent` result gets `{spawned:{agent,task_dir}}`, written by code. `register_session` with no arguments returns the session id to a cloud caller. Separation rule: the session folder holds the discussion and log detail (asks, decisions, anecdotes, spawned agents by task-dir path); a module `doc/*.md` holds only the persistent decision and a link to the session, never a dictation transcript. Without Servex's session layer nothing is filed. Test: `node Servex/ext/remote/RemoteMCP.test.mjs`.

The owner's ask (relayed by the voice agent, repeated from before): the Claude-app voice session (Servex MCP, caller `voice-app`) must land every prompt word for word in a session folder under `public/framework/ai/sessions/YYYY/MM/DD/`, done by code, never by the model's memory. Today 2026-10-19 has no voice folder; 2026-10-16 has `voice-20261016/`.

## What was found (read from the code, 2026-10-19)

- `voice-20261016/session.jsonl` is the voice mastermind's own task log (its `chat` lines come from `ask_mastermind`) plus an `owner-words.md` the voice agent wrote from memory. It was never a tool-side record of the owner's words.
- `RemoteMCP.ask()` appends the question as a `chat` line to the voice mastermind's `task.jsonl` and one index line to `ai/log.jsonl`. It logs only what the voice model chose to pass (a paraphrase), cuts at 4000 characters, and nothing makes the model call it. A voice agent that calls other tools directly leaves no line at all.
- The central store is being built by the voice-opus task: `Sessions.session_path` gives `ai/sessions/YYYY/MM/DD/<id>/session.jsonl` with line 1 `{"session":{..., "kind":"voice"}}`. Build on it; do not make a third store. Earlier finding with more detail: [public/live/doc/owner-2026-10-19-sessions.md](../../../../public/live/doc/owner-2026-10-19-sessions.md) (item 1).

## Plan

1. In `RemoteMCP.tools()` add an `owner_words` property to every tool schema: "the owner's exact words that led to this call, verbatim, every time".
2. `RemoteMCP.post()` strips it before dispatch and appends `{at, words, tool, caller}` (once per distinct text, no length cut) to the day's voice session `session.jsonl`, creating the folder with its `{"session":{"kind":"voice","caller":"voice-app"}}` line when absent.
3. Log every tool call's name and an args hash too, so a call with no `owner_words` shows up as a visible gap instead of silence.
4. Check Servex's day `index.json` picks the folder up, so `/live/sessions/` lists it.
5. Test (`RemoteMCP.test.mjs`), then smoke-test on a private port. It needs a Servex restart to take effect; never restart Servex during a call, leave a `Note:` card for the owner.

## Boundaries

Work in a worktree. Do not touch `Servex/agents/Sessions.js`, `ux/Dictate/chat.js`, `Widget.js`, `Widget.css`, `DictationBar.css` or `session-smart.md` (task-mastermind-voice-opus holds them on worktree qf-6); agree the file shape with it by message.
