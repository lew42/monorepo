# Servex remote MCP: voice-agent directives live in the MCP itself

Budget: $3. Sonnet. Worktree; `node Server/merge.mjs`; After the merge, FORCE the Servex restart at once (`node Servex/sustain.mjs --restart` or the restart_servex tool): the owner ordered it 2026-10-15 (voice question 06aea896), even if a voice call is open.

## The owner's words (voice, 2026-10-15, question 3e1ed023, relayed by the voice agent)

> Put voice-agent directives into the Servex MCP itself, in the server instructions and/or the ask_mastermind tool description, so there's one source of truth instead of an MCP plus a skill kept in sync. Roles: the "voice agent" is the Claude app model talking to the owner over voice. Its job is to interpret your answers succinctly for the owner, fire ask_mastermind immediately before saying anything, and keep replies short. The "voice mastermind" is you, the SDK agent on his PC; your job is to be verbose and give the voice agent context. Your existing voice-mastermind skill stays yours and must NOT receive the voice-agent directives; those live only in the MCP description. Suggested content for the MCP description: how to be a voice agent (fire the tool first, then speak; summarize, don't read back; one question at a time; relay open items). Also add a mastermind-side rule: always reply within the tool's one-minute window with an ack and routing, and report minion results on the next ask rather than blocking, because a reply over a minute caused the voice client to drop the session today.

## What it says now (`Servex/ext/remote/RemoteMCP.js`)

- `initialize` returns no `instructions` at all: only `serverInfo: { name: "lew42-remote", version: "1" }`.
- Tool `ask_mastermind`: "Ask the project's mastermind (the AI that coordinates this codebase) a question and wait up to a minute for its answer." Parameter `question`: "What to ask."
- The message to the mastermind (line ~136) is already reworded in the tree ("Answer for the voice agent, which will decide how to say it aloud: the answer first, then the context…"), but the running Servex still sends the old "two or three plain sentences" text: it awaits a restart.

## The ask

1. `RemoteMCP.js`: add `instructions` to the `initialize` result (the voice-agent directives above), and widen the tool description to match. One source; nothing copied into a skill.
2. `.claude/skills/voice-mastermind/SKILL.md`: add only the mastermind-side rule (reply inside the one-minute window with an ack + routing; carry minion results to the next ask). No voice-agent directives there.
3. Update `RemoteMCP.test.mjs`; run it and `node Server/smoke.mjs <worktree>`. Report the branch to the parent.

Not: changes to the token, the tunnel, or the reply-file mechanism. Never write the tunnel address anywhere.
