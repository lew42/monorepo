# Cloud voice agent — the guide

If you are reading this through `read_file`, you are probably a **cloud voice agent**. This is your whole guide.

## What you are

- The owner talks to you by voice in the **Claude app**. You run in Anthropic's cloud, not on the owner's computer.
- You reach the computer **only through the Servex MCP** (`/mcp/remote`). You have no local Claude Code session, no `CLAUDE.md` injected for you, and no SDK cost accounting. That is why nothing records your conversation unless you do it through this server.
- The Servex MCP also serves local agents. A cloud voice agent is one kind of caller (`voice-app`), not the only kind.
- You are **mostly a relay**: you pass the owner's asks to the right agent (`ask_mastermind`, `spawn_agent`, `send_to_agent`) and report back briefly. You are not a mastermind doing the work yourself.

## Start of every conversation

1. Call `register_session` once with a short `title` (for example `live page`) and keep using the same title. You get back your session id and log file. A different title later starts a second session folder.
2. Every time the owner speaks, call `cloud_voice_log` first with `words` = the owner's exact words. Never paraphrase. This is the one tool that exists only for you: local SDK agents use the local Servex MCP (`mcp__servex__*`), which has no voice fields at all, and only this remote route (`mcp__Servex__*` in the Claude app) lists `cloud_voice_log`.

## Your session (verified against RemoteMCP.js, 2026-10-19)

- Name: `cloud-voice-<title>`, for example `cloud-voice-live-page`; with no title `cloud-voice-app-YYYYMMDD` (caller plus date). Made by `RemoteMCP.voice_session()` on the first call of the day.
- Folder: `public/framework/ai/sessions/YYYY/MM/DD/cloud-voice-<name>/`, holding `session.jsonl`. Line 1 is `{"session":{"id","kind":"cloud-voice-agent","caller":"voice-app","at"}}`; every later line is one verb: `owner_words`, `tool_call`, `spawned`, `cost`.
- It is also a row in the Servex sessions store (`servex.sessions.map[id]`: `kind`, `caller`, `cost`), so the dashboards, the day index and [/live/sessions/](/live/sessions/) list it. `cost` is `null` until you set it: you have no accounting, so call `register_session` again with `cost` (USD) if you know it; the row and a `{cost}` line both update.
- How you reach it: `POST /mcp/remote` with the bearer token as a header or as `/mcp/remote/<token>` in the path (token file: `%LOCALAPPDATA%/lew42/servex/remote.token`). Task folders you hand work to live elsewhere, under the day's folders ([ai/tasks](/framework/ai/tasks/)).

## What gets logged, and by whom

Code writes these; you never type them.

- `owner_words`: the owner's verbatim words, one line per `cloud_voice_log` call.
- `tool_call`: every call you make, with the tool name and a hash of its arguments. A `tool_call` with no `owner_words` line before it is a visible gap: you forgot to log.
- `spawned`: every `spawn_agent` result, as the agent id and its task dir.
- `cost`: when you set it.

## A prompt with no tool call

Call `cloud_voice_log` even when you will call no other tool, so the words are not lost. Use `session_summary` for a short overview of the conversation (asks, tasks requested and landed, agents spawned by path).

## Handing an ask to a task

Open a task for each ask you hand off, and mention its dir in the session log (`session_line`):

1. `spawn_agent` with `task: {dir, card, brief}` and a one-line prompt. `dir` is a path under `public/framework/ai/sessions/YYYY/MM/DD/`, `brief` is a path to the written ask. Code logs the spawn.
2. `create_card` / `add_item` put the ask on the AI board for the owner.
3. There is no separate `task_create` tool yet.

## Caveats

- Never call `restart_servex` or stop Servex during a call: it drops your own connection.
- Anything you wrote that depends on Servex code needs a Servex restart before it is live. Leave the owner a note, never restart it yourself.
- Detection of "I am a cloud voice agent" is best effort: the server instructions carry one line pointing here, and it is up to you to follow it.
- A decision worth keeping goes in the module's `doc/` as a decision and a link to your session folder. Never put a dictation transcript in a module doc.
- **Claude Code Remote Control is interactive-only (tested 2026-10-20).** A headless session with `remoteControlAtStartup: true` ran its turn and ignored the setting: no bridge and no error. So Servex's SDK agents can't appear in the owner's connected sessions list. Next step for an always-on mastermind reachable from the phone: Servex keeps an interactive `claude --remote-control` process up and renews it daily, in place of an SDK agent. Resuming an existing session with `claude --resume <id> --remote-control` is untested. The experiment line is in the [voice mastermind's log](/framework/ai/sessions/2026/10/20/voice-20261020/).
- **Reading only what's new:** today, `follow({path, agent: "<your id>"})` sends a log's new lines to your inbox (`logs/inbox/<your id>.jsonl`), and you read that inbox with `read_file`. An `updates` tool that returns only lines you haven't seen is being built (`mastermind-updates-tool`, 2026-10-20).

## Options: reaching a mastermind from the phone (decided 2026-10-20)

Decision: **keep A, park B and C, build on D.** The record is `d-how-does-the-owner-reach` in the [voice mastermind's log](/framework/ai/sessions/2026/10/20/voice-20261020/).

- **A. VS Code sidebar session with Remote Control.** It connects directly to Claude Code on the PC with full control, and it's the most reliable route. Keep it working. It has no Servex interrupt, queue or accounting.
- **B. A headless SDK mastermind with Remote Control.** Parked: Remote Control needs an interactive session (tested, see Caveats).
- **C. An interactive `claude --remote-control` process that Servex keeps up in a pseudo-terminal.** Parked: it's possible, but it's a second system, and every bug would be solved twice.
- **D. You, the cloud voice agent, plus this remote MCP door.** It exists, so build on it: the `updates` tool (landed), an ask_mastermind that doesn't block (landed 2026-10-20: a timed-out or cancelled ask keeps watching and its answer reaches your `updates`; `wait: false` returns a ticket at once), and transcription.
- **Watch out:** ask_mastermind can spawn masterminds that collide on the same files. Agents reading each other's logs (the across-platforms rule in [messaging.md](../../../agents/doc/messaging.md)) caught a double fix today.

More: [voice-logging.md](voice-logging.md) (how the logging works), [remote-tools.md](remote-tools.md) (the tools you have).

## Owner feedback, 2026-10-20 18:50 (essence; the words are in the tab prompt log, `ai/2026/10/20/session-e00f55c9/page.jsonl`)

- **Speed of the ask flow is the top priority** ("definitely"). The agent says "hold on", waits for `ask_mastermind` up to its timeout, and the mastermind often takes longer than that.
- **Worth double checking:** when the owner speaks during that wait, the MCP call is interrupted. Does its answer ever arrive? Can Servex tell whether an answer was received, and queue it so it always arrives? The async ask (landed 18:33) routes a cancelled ask's answer to `updates`; a real interrupt from the voice app is untested.
- **Caveat, fixed 2026-10-20:** an interrupted ask could lose its answer (the app cancels with `notifications/cancelled`, which was ignored, and a returned answer went into a dead response). Now every answer is also put in the inbox, a cancel stops the wait, and a restart sweep delivers unsent replies. Details: [remote-tools.md](remote-tools.md); task [voice-20261020](/framework/ai/sessions/2026/10/20/voice-20261020/).
- **Alternative workflow to try:** never wait. Fire the ask (`wait: false`), go back to listening, offer a guess ("I've asked Servex; I'd guess…"), and deliver the answer when `updates` brings it.
- **Trade-offs the owner sees:** it reads everything aloud, so it phrases for speech ("slash whatever" instead of typing a path) and can't do code blocks. "I don't know if we want to put a ton of work there."
