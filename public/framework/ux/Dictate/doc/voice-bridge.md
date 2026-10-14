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
