# Talking to the mastermind through the Claude app's voice mode

**The ask (2026-10-14, the owner):** the Claude app's live voice mode is very helpful, but a Claude Code session opened through Remote Control only has a dictate button (the orange up arrow sends; there is no live-mode button). Could the mastermind connect to a normal voice session so the two agents talk in the background, and the owner just talks? One idea: the mastermind drives a browser tab logged into claude.ai, reads the voice transcript and types replies in.

## The short answer

Live voice mode is not offered on Remote Control sessions; the app shows a different composer for them. The browser-tab bridge is the wrong road: it is fragile, and automating the claude.ai web app counts as automated access under the consumer terms, so the account could be flagged. Two roads do work.

## Road 1 (recommended): give the voice chat a tool that reaches the mastermind

A claude.ai chat can use a custom connector (a remote MCP server). Servex already exposes `send_to_agent`, `read_card`, `inbox` and `list_agents` as MCP tools on this machine. Expose a tiny read-mostly subset through a Cloudflare tunnel with a bearer token, add it as a connector in the app, and the voice session can ask the mastermind a question and read the answer, read the handover, or read the "waiting on you" list. The owner talks to the voice session; it calls the tool; the mastermind answers in the background.

- Needs: a Cloudflare tunnel (the owner has Cloudflare), one token, a `Servex/ext/remote-mcp` endpoint with four tools.
- Risk: voice mode's tool support on mobile is narrower than text chat. Test with one tool before building four.
- Cost: an hour of Sonnet to build, a minute of the owner to add the connector.

## Road 2: spoken replies in our own phone sheet

The phone sheet and the drawer already have Whisper in and a smart assistant (Sonnet, repo access, Servex tools). What is missing is a spoken reply. The browser's own `speechSynthesis` reads the smart reply aloud for free; a toggle on the sheet turns it on. That gives a hands-free loop with full repo knowledge and no second agent, at the cost of a robotic voice and a slower turn than the app.

- Needs: a `speak` option on the smart reply, one toggle in the sheet, nothing on the server.
- Trade: no interruption handling, no natural voice; the app's voice mode stays better for a conversation.

## Why not the browser bridge

- Chrome 136+ blocks automating the real profile; a second profile logged into claude.ai works but is a session the owner must keep alive.
- Voice mode runs as a modal in the app; the web conversation shows the transcript after each turn, not live, so replies arrive a turn late.
- A typed message from another client lands as a user turn; whether voice mode reads it, ignores it or interrupts is undocumented, and the owner's words and the mastermind's would be indistinguishable to the voice agent.
- Automated use of the consumer web app is against the consumer terms.

## Decision

Build Road 1 as a one-tool test first (`ask_mastermind`: send a question, wait up to 60 s, return the answer). If voice mode on the phone can call it, add the three read tools. Road 2 is a half-day fallback. The browser bridge is not built.

## Try it

Built: `Servex/ext/remote/RemoteMCP.js` (`class RemoteMCP`, `POST /mcp/remote`, one tool `ask_mastermind`, bearer token) and `Server/Tunnel.mjs` (`up`, `down`, `status`: a free Cloudflare quick tunnel). The tunnel points at a small gateway that passes only `/mcp/remote`; every other path is a 404. The token is `%LOCALAPPDATA%\lew42\servex\remote.token`. Because the app's connector dialog likely has no header field, `remote.url` holds the whole URL with the token already in its path (`.../mcp/remote/<token>`); the endpoint also accepts `Authorization: Bearer <token>`. The URL changes each time the tunnel starts, and anyone holding it can ask the mastermind a question: do not paste it anywhere public. `Tunnel.mjs up` runs in the foreground (leave that terminal open; `down` stops it). The mastermind to ask is one per voice session (see "One mastermind per voice session" below), unless `remote.target` or `REMOTE_MCP_TARGET` names a fixed agent. Replies are files in `remote-replies/` beside the token.

1. In the Claude app: Settings, Connectors, Add custom connector. Paste the whole URL from `remote.url` (token included). If the dialog does offer a bearer or header field, use the URL without the last path part and send `remote.token` there.
2. In a voice chat, say "ask the mastermind what landed today".

**Unknown:** whether voice mode on the phone can call a custom connector at all. Look for the chat showing a tool call to `ask_mastermind`; if voice mode answers without one, try the same sentence typed. Each call is one line in `ai/log.jsonl` (`remote_mcp`), and the question and the answer land in the mastermind's `task.jsonl`.

## Who is calling? (the owner asked, 2026-10-15)

The address today is a 256-bit random secret: nobody guesses it; the only risk is a leak. But every caller looks the same in the log, and one leak means a new address for everyone. MCP has a real answer for both: remote MCP servers authenticate with **OAuth**, and the Claude app's connector dialog supports it (client id and secret), so each call carries an identity.

- **Now, twenty minutes:** one secret per person or device (a small `remote.keys.json` beside `remote.token`, each key named), so `ai/log.jsonl` says which key called, and one key can be revoked without touching the others.
- **When the connector stays around, about an hour:** Cloudflare Access in front of the tunnel (free for 50 users; needs the owner's domain on Cloudflare). Access is the login (Google or an emailed one-time code), speaks OAuth to the Claude app, and the gateway reads the signed identity header, so the log names the person and the address stops being secret at all.
- Either way the gateway keeps its own line per call (who, tool, when, ms) in `ai/log.jsonl`, and the owner can read it on the log page.

## One mastermind per voice session

- **How it is chosen:** `initialize` mints a session id (the `Mcp-Session-Id` header); the first `ask_mastermind` in a session spawns an Opus mastermind (loading the `voice-mastermind` skill) `voice-<short id>` (sleeps after 10 minutes, wakes on the next question); later questions go to it. No header means the day's session, `voice-YYYY-MM-DD`. `remote.target` / `REMOTE_MCP_TARGET` still force one fixed agent for every session.
- **What survives a restart:** the map session to agent lives in `remote.sessions.json` beside the token; a stopped or landed agent is replaced by a fresh one for that session.
- **Where it logs:** the agent's own `task.jsonl` under `ai/sessions/YYYY/MM/DD/voice-<short id>/` holds every question and answer as `chat` lines (written by the gateway) plus the agent's work; each call is also one `remote_mcp` line in `ai/log.jsonl` with the session and agent ids.
- **Finding it:** open the Sessions page (`/framework/ai/sessions/`) and look for the card "Voice session <date time>"; when an answer takes over a minute the reply names that task page.
- **Tests:** `node Servex/ext/remote/RemoteMCP.test.mjs`.
