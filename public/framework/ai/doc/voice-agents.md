# Voice agents: who talks to whom when the owner speaks

There are **two separate voice systems**. The Claude app on the phone (the **cloud voice agent**) and the website's own dictation (Whisper in the browser, with its **fast and smart seats**). They share nothing but Servex. This page says which agent is which, how each one reaches the others, and which path to use when speed matters. Read it if you are a voice agent, or an agent a voice agent talks to.

The file-by-file maps it builds on: [system-map.md §3f, "three voice things"](../system-map.md#3f-what-a-v-id-voice-session-is-and-the-three-voice-things-audited-2026-10-26) (the whole stack) and the [dictation map](../sessions/2026/10/20/session-e00f55c9/dictation-map/map.md) (one spoken sentence, step by step, in the web system).

## 1. The two systems, side by side

| | **Cloud voice agent** (the Claude app) | **Web dictation** (the site's mic) |
|---|---|---|
| What it is | The Claude Android app in voice mode, with the Servex connector | Whisper in the browser ([ux/Dictate](/framework/ux/Dictate/readme.md)), the chat views ([ext/Chat](/framework/ext/Chat/readme.md)), read-aloud ([audio/Recite](/framework/audio/Recite/readme.md)) |
| Where the model runs | Anthropic's cloud. No files, no bash, no Claude Code session: only Servex tools, through the tunnel `servex.lew42.com/mcp/remote` | On the PC: two SDK agents Servex spawns per voice session |
| Its record | `sessions/YYYY/MM/DD/cloud-voice-<title>/session.jsonl` (written by `RemoteMCP.js`) | `sessions/YYYY/MM/DD/v-<id>/session.jsonl` (written by `Sessions.js`) |
| Good at | A natural voice; it listens and can be interrupted | Seeing every word on screen as you speak; full repo access |
| Bad at | Waiting. It can only **pull**: nothing can push to it. A call it waits on sits silent, and a loud sound cancels it | Speaking back: the reply is text, read aloud by Recite's local voice |
| Its guide | [cloud-voice-agent.md](/Servex/ext/remote/doc/cloud-voice-agent.md) | [dictation map](../sessions/2026/10/20/session-e00f55c9/dictation-map/map.md) |

## 2. The three ways the owner talks

| Way | What happens | Can | Can't |
|---|---|---|---|
| **Live voice mode** (the app's voice button) | A spoken conversation. The app transcribes, the model answers aloud | Hands-free, phone in a pocket, interrupt it mid-sentence | Wait well: a tool call is a silent pause, noise cancels it; no artifacts; everything is read aloud, so no code or paths |
| **Tap-to-send mic** (the app's dictate button in a normal chat) | The words become a typed message; the reply is text | Long tool calls with a visible spinner, artifacts, reading a long answer | Hands-free: you tap to send and read the reply |
| **Web dictation** (the site's mic, on the phone sheet or the PC) | Whisper writes your words live into a voice session; the fast seat places them, the smart seat replies | See every word, every task and reply on the session page | A natural voice: Recite's voice is local and plainer than the app's |

## 3. Which agent is which

| Agent | Id | Made by | Reaches others with | Reached by |
|---|---|---|---|---|
| **Cloud voice agent** | caller `voice-app` | the owner opening the app | any Servex tool (`ask_mastermind`, `send_to_agent`, `spawn_agent`) | nothing pushes; it reads `updates` (its inbox, `logs/inbox/voice-app.jsonl`) |
| **Voice mastermind** | `mastermind-voice-<8 hex>` | `RemoteMCP.spawn()` on the first `ask_mastermind` of an app connection; skill [voice-mastermind](/.claude/skills/voice-mastermind/SKILL.md) | `spawn_agent`, writing the reply file it is told | `ask_mastermind` (a message naming a reply file) |
| **Web fast seat** | `voice-assistant-v-<id>` | `Sessions.wake()` when a web voice session opens | the `item` tool only | each sentence, from `Sessions.voice_say()` |
| **Web smart seat** | `session-smart-v-<id>` | `Sessions.wake()` on the first sentence | every Servex tool, `send_to_agent` included | batches of sentences, from `Sessions.feed_smart()` |
| **VS Code tab** | `vscode-<8 hex>` or a name it registered (`vscode-mastermind`) | the owner opening a tab; `register_session` makes it a Servex row | `spawn_agent`, `send_to_agent`, Claude Code's own `SendMessage` | its inbox file `logs/inbox/<id>.jsonl`, which the tab must tail with a Monitor; or a peer `SendMessage` |
| **SDK agents** (masterminds, minions) | `<role>-<name>` | `spawn_agent` (Servex) | every Servex tool | `send_to_agent` (queued into its next turn) |

## 4. Reaching a mastermind from the phone, and how fast (measured 2026-11-01)

Numbers from [measure.mjs](../sessions/2026/10/20/session-e00f55c9/voice-bridge/measure.mjs) (the remote door, called the way the app calls it) and from the 75 past question/answer pairs in the voice masterminds' logs.

| Path | Ack | Answer | Use it? |
|---|---|---|---|
| `ask_mastermind` (waits up to 60 s) | none until the answer | median **13.5 s**, p90 45 s, 2 of 75 over the minute, 4 never answered | Only for a quick question; noise cancels the wait (the answer then comes through `updates`) |
| `ask_mastermind wait:false`, then `updates` | **64–89 ms** (a ticket) | when the app next polls; nothing tells it to | Yes, today's best: fire, keep talking, call `updates` each turn |
| `send_to_agent` to a running agent | at once | only if that agent answers by `send_to_agent`, then via `updates` | For a named agent you know is live |
| `wait_for_agent` | none | blocks until the agent's turn ends | Never from voice: it is a long blind wait |
| A VS Code tab, through its inbox file (`send_to_agent` to `vscode-mastermind`) | at once (the line is written) | the tab **saw it 9 s later** (its Monitor), then answers in its own turn | Yes for the tab, while it keeps a Monitor armed (at most 30 min each, re-armed every turn; filter out `servex-follow` lines) |
| Claude Code's peer `SendMessage` to a tab | at once ("queued") | **never arrived**: the idle tab `e00f55c9` showed no message and no approval prompt after 12 min | No. Local agents only (the cloud agent has no `SendMessage`), and a tab in another permission mode holds it unseen |

**Today's blocker (2026-11-01, 23:10Z):** every new agent waits at Servex's spawn gate while free memory is under 2.5 GB (`SERVEX_MIN_FREE_MB`, `Global.admit`); it was 1.2 GB, with 137 `node` processes holding 6.7 GB. So an `ask_mastermind` that must spawn its mastermind gets a ticket in 0.1 s and then **no answer at all** until memory frees. Two voice masterminds sat queued that way.

## 5. "Switch your voice"

- **The web read-aloud** is [Recite](/framework/audio/Recite/readme.md): seven Kokoro voices (`Voice.PERSONAS`), chosen in the Recite bar's voice menu and saved per browser (`localStorage["lew42.recite.voice"]`). An agent cannot switch it from outside today.
- **The Claude app's own voice** is chosen by the owner in the app's settings. Nothing we build can change it, so a cloud voice agent asked to "switch your voice" says so.

## 6. Rules for a cloud voice agent, in short

- Never wait on a slow call: fire it (`wait: false`), say "looking into it", keep talking, and call `updates` at the start of every turn.
- Never call `restart_servex` during a call: it drops your own connection.
- Log the owner's words first (`cloud_voice_log`), every turn. The full guide: [cloud-voice-agent.md](/Servex/ext/remote/doc/cloud-voice-agent.md).
