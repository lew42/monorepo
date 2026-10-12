# research-realtime — brief

Read [`../mastermind-platform/research-brief.md`](../mastermind-platform/research-brief.md) first (shared rules, deliverable shape, method). Topic dir: `public/imagine/platform/research/realtime/`. Task dir: this one.

**The question (your log's seed line):** What real-time substrate serves text chat first and grows to voice, recording and transcripts — legally?

## Start from (read before searching)

- `public/imagine/stream/doc/durable-objects.md` — DO WebSockets, hibernation, the $20 vs $142 worked example, the row-id resume. Verify its citations are still current; build on it, do not repeat it.
- `public/framework/dev/Socket/doc/wire.md` and `Server/plugins/SocketServer/` — the wire protocol the client already speaks (subscribe with an offset, batches of lines, replay, re-subscribe). `public/framework/ext/JSONL/readme.md`.
- The brief §18, §20 (in `../mastermind-platform/requirements.md`).

## Questions — a closed list

1. **Text chat on Durable Objects.** One DO per channel (not per topic — argue it), hibernatable WebSockets, the connection cap per object, fan-out cost at 100 / 1k / 10k concurrent in one room, history in DO SQLite with cold history moved to R2, presence, typing indicators, reconnect-and-resume by row id. What the framework's client would actually change (the doc says "one url" — check `public/framework/dev/Socket/Socket.js`).
2. **Voice.** Cloudflare Realtime (formerly Calls: SFU + TURN) pricing and limits; RealtimeKit; alternatives (LiveKit Cloud, Daily, Agora) with per-minute cost; what "streaming audio to a room" needs versus "a call".
3. **Recording.** Server-side (does the Cloudflare SFU record or egress?) vs client-side upload to R2; storage cost per hour of Opus at 32 kbps; transcription per audio hour (Workers AI Whisper, Deepgram, AssemblyAI); a searchable transcript index.
4. **Consent and the law.** US one-party vs all-party consent states (list them), GDPR, the notice-and-consent UI, retention policies, the right to erasure of a "persistent public knowledge record", minors. What the brief's public record can lawfully be, and the default you recommend.
5. **Live moderation.** Rate limits, slow mode, mute/ban enforced at the DO, report flow, AI moderation on the message path (latency and cost per message), retaining logs for appeals.
6. **Local development.** DO WebSockets under `wrangler dev`, multi-tab tests, Playwright with several browser contexts, WebRTC locally.
7. **The MVP recommendation.** Text only; the DO shape; the client change; what voice adds later and its first cost.

## Challenge

Recording by default. Voice in the MVP. One DO per topic for chat. That WebSockets beat SSE + POST for a text-first MVP.

## Numbers to bring back (url + date)

DO WebSocket connections per object; DO price per million messages (requests) and GB-s; Realtime SFU price; Whisper cost per audio minute on Workers AI; R2 cost per hour of 32 kbps audio; the count of all-party-consent US states.
