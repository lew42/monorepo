# Real-time streaming on the web (late 2026): transports, media, voice chat, streaming speech AI

Scope: research notes for a builder of a vanilla-JS framework (Item/List/Page objects, deltas over his own WebSocket server, JSONL persistence) who wants to add Discord-like voice, text and presence, Figma-like multiplayer, games, and a talking AI. He already runs Whisper STT via chunked HTTP POSTs, wants TTS read-aloud, and leans toward Cloudflare. Research date: 2026-10-29. Browser-support dates are given wherever a source states them.

Labels used below: "vendor claim" means the figure comes from the vendor and was not independently measured. "Background knowledge" (Inferences sections only) means widely known and not re-verified in this session.

---

## Q1. Transports: what each is, what runs underneath (TCP/UDP/QUIC), latency, browser support, server needs, uses, direction

### Takeaway
Underneath, the real split is TCP (HTTP/1.1, HTTP/2, SSE, long polling, WebSocket, WebSocketStream) versus UDP: QUIC/HTTP/3 and WebTransport run over QUIC on UDP, and WebRTC runs SCTP or SRTP over DTLS over UDP. On TCP, one lost packet stalls every byte behind it (head-of-line blocking). On UDP-based transports, loss stalls only the affected stream, or nothing at all with unreliable datagrams or channels. WebTransport became Baseline in March 2026 when Safari 26.4 shipped it, but Cloudflare Workers and Durable Objects cannot terminate WebTransport, and Cloudflare says that is "not on the agenda". For a Cloudflare-leaning stack, that leaves WebSockets on Durable Objects for state and deltas, and WebRTC through Cloudflare Realtime SFU when he needs UDP semantics in the browser.

### Cited Findings

**Head-of-line (HOL) blocking, TCP vs QUIC**
- HTTP/2 multiplexes requests over one TCP connection, but TCP's loss recovery can't see that parallelism. A lost or reordered packet stalls every active transaction, including ones the packet didn't touch. QUIC multiplexes natively, so "lost packets only impact the streams where data has been lost." — [Wikipedia: HTTP/3](https://en.wikipedia.org/wiki/HTTP/3)
- Cloudflare's version: on TCP, one lost packet blocks all data behind it and causes stalls. QUIC streams are independent, so a lost audio packet doesn't block video. — [Cloudflare blog: MoQ (Aug 22, 2025)](https://blog.cloudflare.com/moq/)
- Cloudflare argues that WebRTC's UDP transport avoids HOL blocking and that Opus adapts to network conditions, which is why it uses WebRTC for voice AI. — [Cloudflare blog: Realtime voice AI (Aug 29, 2025)](https://blog.cloudflare.com/cloudflare-realtime-voice-ai)
- LiveKit says ChatGPT Advanced Voice uses WebRTC from client to server because it handles lossy networks such as WiFi and cellular better than WebSocket. — [LiveKit blog: OpenAI partnership (Oct 3, 2024)](https://livekit.com/blog/openai-livekit-partnership-advanced-voice-realtime-api)
- OpenAI recommends WebRTC rather than WebSockets for browser and mobile clients of the Realtime API "for more consistent performance." — [OpenAI docs: Realtime WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)

**HTTP/2 vs HTTP/3**
- HTTP/3 became a Proposed Standard (RFC 9114) on 6 June 2022. As of Sept 2024 it was supported by more than 95% of browsers in use and used by 34% of the top 10M websites. Browser support: Chromium since April 2020, Firefox on by default since Firefox 88 (April 2021), Safari for all users on 16+ since Sept 2024. — [Wikipedia: HTTP/3](https://en.wikipedia.org/wiki/HTTP/3)
- QUIC was standardized in 2021 and HTTP/3 in 2022. HTTP/3 removes cross-resource HOL blocking, needs fewer handshake round trips, keeps connections alive across network changes (Wi-Fi to cellular) via connection IDs, and supports datagrams. — [MDN: WebTransport API](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)
- Cloudflare Workers accept inbound HTTP/3 when it is enabled for the zone (Speed > Settings > Protocol Optimization). The docs list inbound WebSockets, outbound TCP via `connect()`, and no WebTransport. — [Cloudflare Workers: Protocols](https://developers.cloudflare.com/workers/reference/protocols/)

**HTTP request/response, chunked transfer, fetch streams**
- Streaming request bodies: pass a `ReadableStream` body with `duplex: 'half'`. Chromium has supported this since 105. It is rejected over HTTP/1.x and works only over HTTP/2 or HTTP/3. Half-duplex means the browser won't deliver the response until the request body finishes. Safari doesn't support the `duplex` option with fetch. Streaming requests always trigger a CORS preflight. Suggested uses include gradually sending client-generated audio and video and "recreating WebSockets over HTTP/2 or HTTP/3." — [Chrome for Developers: Streaming requests with fetch](https://developer.chrome.com/docs/capabilities/web-apis/fetch-streaming-requests)

**Server-Sent Events (SSE)**
- `EventSource` with `Content-Type: text/event-stream`, using `event`, `data`, `id` and `retry` fields. It reconnects automatically. Limits: text only (UTF-8), one direction (server to client), and on HTTP/1.1 a cap of 6 connections per browser per domain that Chrome and Firefox mark "Won't fix". Over HTTP/2 the cap is the negotiated stream limit, 100 by default. Baseline Widely available since January 2020. — [MDN: Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)

**WebSockets and WebSocketStream**
- Classic WebSocket has full desktop support (Chrome 16 in 2011, Firefox 11, Safari 7) and more than 99% global coverage. Node.js has no built-in WebSocket server (use `ws`); Deno and Bun have one. — [websocket.org: Browser support](https://websocket.org/reference/browser-support/)
- WebSocketStream is a promise-based WebSocket with Streams-API backpressure. MDN marks it Experimental and Non-standard ("Not currently a part of any specification"); standardization is tracked in whatwg/websockets PR #48. — [MDN: WebSocketStream](https://developer.mozilla.org/en-US/docs/Web/API/WebSocketStream)
- WebSocketStream support per caniuse: Chrome 124+, Edge 124+, Opera 110+. No Firefox version through 162 and no Safari version through 27.2 (desktop or iOS). Global usage is 72.05%. — [caniuse: WebSocketStream](https://caniuse.com/mdn-api_websocketstream)
- Cloudflare Durable Objects can be WebSocket servers for "thousands of clients per instance." The Hibernation API (`ctx.acceptWebSocket`, `webSocketMessage`) keeps clients connected while the object is evicted from memory, and no duration (GB-s) charges accrue during hibernation. The runtime answers ping frames without waking the object. Per-connection attachments are capped at 16,384 bytes. A deploy restarts every Durable Object and drops every WebSocket. Cloudflare recommends batching about 10–100 logical messages per frame, or flushing every 50–100 ms, because every message adds context-switch overhead. — [Cloudflare docs: Durable Objects WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)

**WebTransport (HTTP/3/QUIC)**
- WebTransport offers reliable bidirectional streams, reliable unidirectional streams, and unreliable datagrams, which suit "game state updates where each message supersedes the last". It supports many streams per session with priorities. It needs an HTTPS URL with an explicit port, an extended CONNECT with a `:protocol` pseudo-header, and a server-side Origin check, and it works only in secure contexts. Server libraries: webtransport-go, aioquic, wtransport (Rust), @fails-components/webtransport (Node). MDN status: Baseline 2026, "Newly available" since March 2026. — [MDN: WebTransport API](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)
- caniuse: Chrome 97, Edge 98, Firefox 114, Safari 26.4, iOS Safari 26.4. Global usage is 91.64%. The spec is still a W3C Working Draft. Chrome 91–94 had it disabled by default. — [caniuse: WebTransport](https://caniuse.com/webtransport)
- Ship dates: Chrome M97 (Jan 2022), Firefox 114 (June 2023), Safari 26.4 (March 2026, which made it Baseline). The article cites reports of about 30–50% lower latency jitter than WebSocket on residential mobile networks. That figure is a secondary-source citation and was not verified here. Its advice: use WebTransport if you control both ends, your CDN supports HTTP/3, and you can fall back where UDP is blocked. — [Utsubo: Frontier Web APIs 2026 (Apr 29, 2026)](https://www.utsubo.com/blog/frontier-web-apis-2026-production-ready)
- Press coverage of the Safari 26.4 release (dated March 25, 2026) confirms WebTransport shipped in it. — [Apfelpatient: Safari 26.4](https://www.apfelpatient.com/news/apple-safari-26-4-44-features-and-191-bugs-fixed)
- **Cloudflare Workers do not support WebTransport.** A tracking issue opened Mar 27, 2026 was converted to a discussion. Cloudflare's jasnell replied (Mar 28, 2026) that it is "not currently on our priority list" with no timeline, that Workers has no QUIC/HTTP/3 implementation, and that WebTransport semantics fit the Workers invocation model poorly. Any future support would likely look like the Socket API tunneling through a proxy. — [workerd issue #6451 (mirror)](https://vat.pages.dev/cloudflare/workerd/issues/6451)

**WebRTC data channels (reliable vs unreliable)**
- `RTCDataChannel` options: `ordered` (default true), `maxRetransmits` and `maxPacketLifeTime`; the spec says not to combine the last two. Setting `ordered:false, maxRetransmits:0` gives UDP-like delivery. The stack is SCTP over DTLS over UDP, with TCP as a fallback ("UDP/DTLS/SCTP" or "TCP/DTLS/SCTP"). It has `bufferedAmount` and `bufferedamountlow` for backpressure, and up to 65,534 channel IDs per connection. Baseline Widely available since January 2020. — [MDN: RTCDataChannel](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel)
- Cloudflare Realtime SFU forwards DataChannels as well as audio and video. Its cloud-gaming example sends keyboard and pointer input back to a container over DataChannels. — [Cloudflare docs: Realtime SFU](https://developers.cloudflare.com/realtime/sfu/index.md)
- OpenAI's Realtime API carries all JSON control events over a DataChannel named `oai-events`, alongside the audio media track. — [OpenAI docs: Realtime WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)

### Inferences
- **Transport taxonomy (synthesis).** Rows marked (bk) use background knowledge for latency or underlying protocol.

| Transport | Underneath | Direction | Typical added latency | Browser support (date) | Server needs | Best uses | Headed |
|---|---|---|---|---|---|---|---|
| HTTP req/resp + chunked/fetch streaming responses | TCP (H1/H2) or QUIC (H3) | Request then streamed response; upload streaming is half-duplex | One RTT per request; streaming responses are near-instant once open | Response streaming universal (bk); upload streaming Chrome 105+, not Safari | Any HTTP server; upload streaming needs H2/H3 | AI token streaming, chunked STT uploads, file streams | Stable; `duplex:'full'` is speculative |
| Long polling (bk) | TCP | Simulated push | ~1 RTT plus reconnect per message | Universal | Any HTTP server; holds requests open | Legacy fallback | Legacy |
| SSE | TCP (H1/H2) or H3 | Server to client, text only | Low once open; auto-reconnect | Baseline Jan 2020 | Any HTTP server; use H2 to avoid the 6-connection cap | LLM token streaming, notifications | Stable and very common for LLM APIs |
| WebSocket | TCP (bk: RFC 6455 upgrade over HTTP/1.1) | Full duplex, messages | Low; HOL stalls under packet loss | ~Universal since 2011–2013 | WS server (`ws`, Bun, Deno, Durable Objects) | Deltas, chat, presence, signaling, server-to-AI audio | Stable workhorse |
| WebSocketStream | TCP | Full duplex with backpressure | Same as WS | Chromium 124+ only; no Firefox or Safari as of late 2026 | Same as WS | Backpressure-heavy binary streams | Unstandardized; can't rely on it cross-browser |
| WebTransport | QUIC/UDP over HTTP/3 | Multi-stream plus unreliable datagrams | Lowest of the client-server options; no cross-stream HOL | Chrome 97, Firefox 114, Safari 26.4 (Baseline Mar 2026) | HTTP/3 + WebTransport server (Go, Rust, Python, Node libraries); **not Workers/DO** | Games, MoQ media, multiplexed real-time | Rising; base for MoQ |
| WebRTC DataChannel | SCTP/DTLS/UDP (TCP fallback) | P2P or via SFU; reliable or unreliable per channel | Lowest for P2P; needs ICE/STUN/TURN | Baseline Jan 2020 | Signaling server + STUN/TURN; an SFU for many-to-many | Game input/state alongside voice, P2P data | Stable; WebTransport covers more client-server cases |

- The TCP vs UDP difference matters most for **audio and fast-changing game state**. Under packet loss, TCP turns one dropped packet into a stall of all later data plus a retransmit RTT, so audio playback hiccups. UDP lets late audio be skipped and concealed by Opus. For **document deltas**, ordered reliable delivery is exactly what you want, so TCP's guarantees help and HOL blocking only costs some latency.
- WebSocketStream is Chromium-only, so his framework should keep the classic WebSocket API and implement its own backpressure by checking `bufferedAmount`.
- On Cloudflare, a "UDP for the browser" design means WebRTC through Realtime SFU (DataChannels plus media), not WebTransport. WebTransport would require a separate non-Cloudflare QUIC server (for example a Go or Rust service on a VPS) or the MoQ relay for media.
- Durable Objects with hibernating WebSockets map closely onto his existing per-document delta server. One DO per Page or document gives a single ordering authority and built-in SQLite. The Figma and tldraw evidence in Q7 shows the same pattern.

### Gaps
- No primary source was fetched for long polling or for RFC 6455 and RFC 8441/9220 (WebSocket over HTTP/2 and HTTP/3) browser support. Whether browsers run WebSockets over HTTP/2 or HTTP/3 in practice was not confirmed.
- The "30–50% lower jitter" WebTransport figure comes from a secondary article citing unnamed reports.
- No current measured percentage of web traffic on HTTP/3 in 2026 was found. The newest figure is 34% of top-10M sites in Sept 2024.
- Exact Durable Object limits (maximum WebSockets per object, maximum message size) were not stated on the fetched page.

---

## Q2. Media streaming: HLS, LL-HLS, DASH, CMAF, RTMP, SRT, WebRTC, WHIP/WHEP, MoQ, WebCodecs, and latency tiers

### Takeaway
Latency tiers are roughly: HLS/DASH 15–30 s, LL-HLS about 2–3 s, RTMP ingest 2–5 s, WebRTC under 500 ms, and MoQ targeting sub-second at broadcast scale. WHIP became RFC 9725 in March 2025. WHEP is at draft-05 and in IESG AD evaluation as of Oct 2026. MoQ transport is at draft-22 (Oct 1, 2026), still a WG document with no WGLC date. Cloudflare's MoQ relay launched as a free tech preview in Aug 2025, supporting a subset of draft-07. Cloudflare Stream's WebRTC (WHIP/WHEP) went GA, with billing from Oct 15, 2026.

### Cited Findings

**Latency tiers**
- Cloudflare's comparison figures: RTMP about 2–5 s, HLS 15–30 s, LL-HLS about 3 s, WebRTC under 500 ms. MoQ targets sub-second latency at broadcast scale. — [Cloudflare blog: MoQ](https://blog.cloudflare.com/moq/)
- Standard HLS with 6-second segments starts about three segments behind live, roughly 18 s of buffer. Chunked-transfer approaches (LHLS, DASH-IF low latency) reach "a latency of say 2 seconds or less." — [AWS M&E blog: LL-HLS explained](https://aws.amazon.com/blogs/media/alhls-apple-low-latency-http-live-streaming-explained)
- Amazon IVS, "built on the same technology that powers Twitch": low-latency channels are usually under 5 s, sometimes under 3 s, and Real-Time Streaming can be under 300 ms from host to viewer. — [AWS: IVS FAQ](https://aws.amazon.com/ivs/faqs)

**HLS / LL-HLS / DASH / CMAF**
- LL-HLS mechanisms: partial segments (`#EXT-X-PART`, e.g. 0.33 s parts inside 6 s segments), blocking playlist reload (`_HLS_msn`/`_HLS_part`, where the origin holds the request open for up to 3x segment duration, which some CDNs may not tolerate), delta playlist updates (`_HLS_skip=YES`), and rendition reports for fast switching. LL-DASH uses SegmentTemplate with MP4 fragments delivered by HTTP chunked transfer. The key difference is that LL-HLS signals discrete parts and never exposes incomplete segments. — [AWS M&E blog: LL-HLS explained](https://aws.amazon.com/blogs/media/alhls-apple-low-latency-http-live-streaming-explained)
- HLS/DASH trade latency for scale by delivering small files over HTTP. — [Cloudflare blog: MoQ](https://blog.cloudflare.com/moq/)

**RTMP and SRT (ingest)**
- SRT has no native browser support, which limits it to ingest. — [Cloudflare blog: MoQ](https://blog.cloudflare.com/moq/)
- SRT is a user-level protocol over UDP, derived from UDT. It uses ARQ selective retransmission and optional FEC, timestamp-based delivery for constant latency, and AES-128/192/256. Modes are caller-listener and rendezvous. It gives better bandwidth use than RTMP over long distances, so it is used for contribution. Authors are from Haivision and SK Telecom. The IETF document is an expired individual Informational draft (draft-sharabayko-srt-01, Sept 2021), not a standard. — [IETF: draft-sharabayko-srt-01](https://datatracker.ietf.org/doc/html/draft-sharabayko-srt-01)

**WebRTC media, WHIP/WHEP**
- WHIP (WebRTC-HTTP Ingestion Protocol) was published as RFC 9725 in March 2025. — [RFC Editor: RFC 9725](https://www.rfc-editor.org/rfc/rfc9725.html)
- WHEP (egress/playback) is at draft-ietf-wish-whep-05 (Oct 12, 2026). Its WG state is "Submitted to IESG for Publication", its IESG state is "AD Evaluation::Revised I-D Needed", it targets Proposed Standard, and it has no RFC number yet. — [IETF datatracker: WHEP](https://datatracker.ietf.org/doc/draft-ietf-wish-whep/)
- Cloudflare Stream WebRTC: the page says GA, with billing from Oct 15, 2026, though its URL still says "beta". Ingest is WHIP (browsers, OBS 31.0+, FFmpeg 8.1+, Larix) and playback is WHEP, with "less than 500 milliseconds" latency and no fixed limit on concurrent viewers. Codecs are VP9, VP8 and H.264 Constrained Baseline. Limitations: WHIP and WHEP must be used together, WHIP inputs can't be recorded or played as HLS/DASH, and there is no simulcast restreaming. Price is $1 per 1,000 minutes delivered. — [Cloudflare docs: Stream WebRTC](https://developers.cloudflare.com/stream/webrtc-beta/)

**Media over QuIC (MoQ)**
- Model: named **tracks**, **groups** (independently decodable, typically a GOP starting at a keyframe, where new subscribers join) and **objects** (the units on the wire). Relays forward objects without parsing or transcoding and fan out one upstream subscription to many viewers. Newer drafts add push-style `PUBLISH` for ingest. Native apps use raw QUIC; browsers must use WebTransport. — [Cloudflare blog: MoQ](https://blog.cloudflare.com/moq/)
- Cloudflare's MoQ relay (announced Aug 22, 2025) runs on every server in 330+ cities as a tech preview. It implements a subset of draft-ietf-moq-transport-07, without `FETCH`. It is free during the preview, with GA self-serve pricing expected at $0.05/GB outbound and free inbound. — [Cloudflare blog: MoQ](https://blog.cloudflare.com/moq/)
- moq.dev (Luke Curley, whose moq-rs Cloudflare forked) says the preview has no auth (so use unguessable broadcast names), no ANNOUNCE (so no discovery), no Safari support at the time, and no optimization yet. The endpoint is relay.cloudflare.mediaoverquic.com. He estimated RFC status was "at least another 3 years" away and noted a smaller alternative, draft-lcurley-moq-lite. — [moq.dev: First CDN (Aug 2025)](https://moq.dev/blog/first-cdn/)
- IETF status: draft-ietf-moq-transport-22, dated 2026-10-01, WG Document, IESG state "I-D Exists". — [IETF datatracker: moq-transport](https://datatracker.ietf.org/doc/draft-ietf-moq-transport/)
- At IETF 126 (July 20, 2026): draft-18 interop showed regressions versus draft-16, mainly from the move to bidirectional streams. Plans were a draft-18 virtual interop in early Sept and draft-20 by the Seattle meeting. Companion drafts are LOC, MSF/CMSF (streaming formats and catalog), secure-objects (being readied for WGLC but frozen until core transport stabilizes), and auth drafts. No transport WGLC date was set. — [IETF 126 MoQ minutes](https://datatracker.ietf.org/meeting/126/materials/minutes-126-moq-202607201200-01)

**WebCodecs**
- Chrome/Edge since M94 (Sept 2021). Safari got VideoEncoder/Decoder in 16.4 (Mar 2023) and audio plus the rest in Safari 26 (Sept 2025). Firefox desktop has been largely complete since 2024; Android is missing. AV1 encode is Chrome-only as of 2026. Called "near-Baseline". Named users: Zoom Web Client, Loom, Twitch, Discord, Adobe Premiere Web (beta). — [Utsubo: Frontier Web APIs 2026](https://www.utsubo.com/blog/frontier-web-apis-2026-production-ready)

### Inferences
- **Media taxonomy (synthesis; (bk) = background knowledge).**

| Tech | Underneath | Latency tier | Browser | Server needs | Typical use | Headed |
|---|---|---|---|---|---|---|
| HLS | HTTP over TCP/QUIC | 15–30 s | Native in Safari; hls.js elsewhere (bk) | Any CDN/HTTP | VOD, mass live | Stable default |
| LL-HLS | HTTP, partial segments, blocking reload | ~2–3 s | Same as HLS (iOS 13+) | CDN that tolerates held requests | Sports, live with chat | Stable |
| MPEG-DASH / LL-DASH | HTTP, chunked transfer of fMP4 | Seconds; LL about 2 s | Via MSE players (dash.js etc.) (bk); not native on iOS | CDN | Non-Apple OTT | Converging with HLS via CMAF |
| CMAF (bk) | Container format (fragmented MP4), not a transport | n/a | via MSE / native HLS | n/a | One set of segments for both HLS and DASH | Standard packaging |
| RTMP(S) | TCP | 2–5 s | None (ingest only) | Media server/ingest | OBS to platform ingest | Legacy ingest, being displaced by SRT/WHIP |
| SRT | UDP + ARQ | Sub-second to a few seconds (configurable buffer) | None | Media server | Pro contribution over the internet | Stable in broadcast |
| WebRTC media | SRTP/UDP (TCP/TURN fallback) | < 500 ms | Universal | SFU + TURN | Calls, voice chat, AI voice, real-time stages | Mature |
| WHIP/WHEP | HTTP signaling for WebRTC | Same as WebRTC | Any WebRTC browser | WHIP/WHEP endpoint | OBS to WebRTC ingest; sub-second playback | WHIP is an RFC; WHEP nearly |
| MoQ | QUIC / WebTransport | Sub-second target at CDN scale | Needs WebTransport (Baseline Mar 2026) | MoQ relay (Cloudflare preview, moq-rs) | Future unified live, real-time and broadcast | Draft-22; years to RFC; interop still churning |
| WebCodecs | Codec API, no transport | Adds near-zero | Chrome 94, Safari 16.4/26, Firefox desktop | n/a | Custom pipelines (WebTransport/MoQ + WebCodecs), editors | Near-Baseline |

- For his use cases (voice chat, AI voice, maybe screen share), the only media tier that matters near-term is **WebRTC**. HLS or LL-HLS matter only for one-to-many broadcast (a "Stage"/stream feature). MoQ is worth watching for a later "Go Live" style feature, but with draft churn (draft-07 at the Cloudflare preview versus draft-22 now) it isn't a foundation to build on in late 2026.
- WebCodecs plus WebTransport is the "build your own media stack" path that MoQ formalizes. It is too much work for a solo framework author versus using WebRTC.

### Gaps
- No 2026 update on the Cloudflare MoQ relay was found (which draft it supports now, whether it is GA, whether Safari works with it now that Safari has WebTransport). The Aug 2025 post is the latest primary source found.
- A "Media over QUIC with Bitmovin and Cloudflare" post exists (Bitmovin blog) but was not read.
- No primary source was fetched for CMAF specifics, DASH browser support, or RTMP's TCP basis. These are background knowledge.
- The SRT default latency buffer (often quoted as 120 ms) was not confirmed by the fetched draft.

---

## Q3. Voice chat: how Discord does it, mesh vs SFU vs MCU, open-source SFUs, hosted options

### Takeaway
Discord runs its own C++ SFU fleet. It had 850+ voice servers in 13 regions as of 2018. Browsers use standard WebRTC; native clients use a modified WebRTC stack that skips ICE and DTLS. A WebSocket gateway handles signaling and presence. Since early March 2026, all calls are end-to-end encrypted with DAVE (MLS plus WebRTC encoded transforms, with the SFU still forwarding the encrypted frames). For anyone not at Discord scale, the practical choice is a hosted SFU. Cloudflare Realtime SFU costs $0.05/GB egress with 1,000 GB/month free; RealtimeKit costs $0.0005/min per audio-only participant. LiveKit, the open-source Go/Pion SFU that also powers ChatGPT voice, is the main alternative, self-hosted or on LiveKit Cloud.

### Cited Findings

**Discord**
- Architecture (2018 post): the Discord Gateway is a WebSocket for guild, channel, message and presence events. Discord Guilds assigns a voice server per guild, picking the least-utilized one in the region via etcd service discovery. Discord Voice runs signaling (Elixir) plus a **C++ SFU** media relay that forwards audio and video, handles RTCP and bridges native and browser clients. Browser clients use standard WebRTC (SDP, ICE, DTLS, SRTP). Desktop and mobile apps use a custom C++ media engine on the WebRTC native library: they skip ICE, exchange about 1,000 bytes of connection info, encrypt with Salsa20 instead of DTLS/SRTP, and send periodic pings to keep firewalls open. Failover: a crashed SFU restarts and rebuilds state; a dead server leaves discovery and clients reconnect to a new one. Scale then: 850+ voice servers, 13 regions, 30+ data centers, 2.6M concurrent voice users, 220 Gbps egress. — [Discord blog: 2.5M concurrent voice users (Sept 10, 2018)](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc)
- DAVE E2EE: MLS for group key exchange, with the voice gateway acting as MLS delivery service. Each sender has its own key ratchet. Frames are encrypted with **WebRTC encoded transforms** before packetization using AES-128-GCM with a truncated tag. Encryption is codec-aware (Opus fully encrypted; VP8, VP9, H.264/H.265 and AV1 keep some headers in the clear so the RTP packetizer still works). **The SFU forwards encrypted frames without decrypting them** and can inject silence packets. — [DAVE protocol whitepaper](https://daveprotocol.com/)
- Timeline: experiments Aug 2023, DAVE introduced Sept 2024, all platforms in 2025, migration finished early March 2026. E2EE is now the default for DMs, group DMs, voice channels and Go Live. Stage channels are excluded because they are broadcast. Unencrypted fallback code is being removed. Discord helped fix an upstream Firefox bug that broke DAVE. The libdave implementation is open source and was audited by Trail of Bits. — [Discord blog: Every call is E2EE (May 18, 2026)](https://discord.com/blog/every-voice-and-video-call-on-discord-is-now-end-to-end-encrypted)

**Mesh vs SFU vs MCU**
- Mesh (P2P): each peer uploads a copy of its media to every other peer, so it works for 2–3 peers. MCU: the server decodes, mixes and re-encodes into one composite stream per subscriber, which saves bandwidth but limits per-track control and scales poorly. SFU: the server forwards encoded streams without transcoding, so apps keep per-track control. Simulcast lets the SFU pick the quality layer that fits each subscriber's bandwidth. — [LiveKit docs: SFU](https://docs.livekit.io/concepts/livekit-sfu/)

**Open-source SFUs**
- LiveKit is written in Go on **Pion** (a Go WebRTC implementation). A single node has no external dependencies; multi-node uses Redis for room-to-node mapping. Self-hosted rooms must fit on one node, while LiveKit Cloud runs a "globally distributed mesh" with "unlimited participants" per room. — [LiveKit docs: SFU](https://docs.livekit.io/concepts/livekit-sfu/)
- ChatGPT Advanced Voice runs on LiveKit: the client SDK sends audio over WebRTC to LiveKit Cloud, and a server-side agent relays it to GPT-4o over WebSocket. The target is about 300 ms. — [LiveKit blog: OpenAI partnership (Oct 3, 2024)](https://livekit.com/blog/openai-livekit-partnership-advanced-voice-realtime-api)

**Hosted options**
- **Cloudflare Realtime SFU** routes WebRTC audio, video and DataChannels. The model is sessions and tracks: the app decides who publishes and subscribes, using HTTPS APIs called from your own backend (Workers or anything else). For conferencing UI it recommends **RealtimeKit**; choose the raw SFU when you need direct control. — [Cloudflare docs: Realtime SFU](https://developers.cloudflare.com/realtime/sfu/index.md)
- Cloudflare SFU/TURN pricing: $0.05/GB egress, with 1,000 GB/month free. SFU, TURN and STUN run together on anycast across 330+ cities. — [Cloudflare: TURN/SFU product page](https://www.cloudflare.com/products/turn-sfu/); the free tier is shared across SFU, TURN and the WebSocket adapter per [Cloudflare Realtime pricing](https://developers.cloudflare.com/realtime/pricing/)
- RealtimeKit (announced Apr 2025 as closed beta) combines the SFU, STUN and TURN with SDKs and server-side services. — [Plushcap summary of Cloudflare blog (Apr 9, 2025)](https://www.plushcap.com/content/cloudflare/blog/cloudflare-introducing-cloudflare-realtime-and-realtimekit). Pricing (page updated Sept 3, 2026): $0.002/min per A/V participant, $0.0005/min per audio-only participant, recording/RTMP/HLS export $0.010/min ($0.003 audio-only), raw RTP to R2 $0.0005/min, and transcription at Workers AI rates. — [Cloudflare docs: RealtimeKit pricing](https://developers.cloudflare.com/realtime/realtimekit/pricing/)
- RealtimeKit SDKs include UI kits for Web Components, React, Angular, React Native, iOS and Android plus a Core SDK. Features include chat, polls, breakout rooms, stage management, screen share, livestreaming, recording and AI transcription. — [Cloudflare docs: RealtimeKit](https://developers.cloudflare.com/realtime/realtimekit/)
- **LiveKit Cloud**: Build tier free (5,000 WebRTC participant-min, 1,000 agent-min, 50 GB, 100 concurrent connections). Ship from $50/mo (150k min, then $0.0005/min; 250 GB, then $0.12/GB). Scale from $500/mo. — [LiveKit pricing](https://livekit.com/pricing)
- **Daily**: 10,000 free participant-min/month. Audio-only $0.00099/min (first tier), down to $0.00036 at volume; video $0.004/min. Any video track bills the whole session at video rate. — [Daily pricing](https://www.daily.co/pricing/video-sdk/)
- **Agora**: $0.99 per 1,000 audio participant-minutes, 10,000 free/month (service is suspended past the cap on the free bundle). It runs on its proprietary SD-RTN network, which falls back to TCP/TLS 443 when UDP is blocked. — [Agora voice pricing](https://www.agora.io/en/pricing/voice-calling)

### Inferences
- **Discord-like voice on Cloudflare (sketch).** Text, presence and signaling go over his own WebSocket (already in place; Durable Objects are a fit), mirroring the Discord Gateway. Voice goes from browser to Cloudflare Realtime SFU over WebRTC with Opus, mirroring Discord Voice. His backend calls the SFU HTTPS API to publish and subscribe tracks per "channel" Item, and the channel's member list drives subscriptions. That copies Discord's split (WebSocket gateway plus SFU) without running media servers.
- **Rough cost.** Opus voice runs about 32–48 kbps per stream (bk), or about 0.25–0.35 MB per minute per subscribed stream. A 5-person room where everyone hears the other four costs about 5×4×0.3 MB ≈ 6 MB/min of SFU egress, so 1,000 GB/month free covers about 160,000 room-minutes of that shape. That is a back-of-envelope estimate only; verify against real bitrates.
- Open-source SFUs beyond LiveKit (background knowledge, not verified here): **mediasoup** is a C++ media worker driven by a Node.js or Rust API, low-level, with no built-in signaling. **Janus** (Meetecho) is a C gateway with a plugin model (VideoRoom, AudioBridge, which is MCU-style audio mixing). **Pion** is a Go WebRTC library, not an SFU by itself, and LiveKit is built on it. **Jitsi Videobridge** is a Java SFU.
- E2EE pattern: DAVE shows that SFU-forwarded media can be end-to-end encrypted using encoded transforms (insertable streams). That option stays open later without changing the SFU.

### Gaps
- No primary 2026 sources were fetched for mediasoup, Janus or Jitsi architecture or licenses. The comparison article that would have covered them failed to load.
- Discord's current (2026) voice server count and regions are not public in the sources found. The 2018 figures are the latest. Whether Discord still skips ICE and DTLS in native clients after DAVE was not confirmed.
- RealtimeKit GA status and free tier were not stated on the fetched pages.
- Pipecat Cloud and Daily agent pricing were not fetched.

---

## Q4. Streaming speech AI: STT, TTS, full-duplex agents, and streaming TTS audio into the browser

### Takeaway
Whisper is not natively streaming. Wrappers like whisper_streaming (LocalAgreement-2, about 3.3 s latency on an A40 GPU), now superseded by SimulStreaming, fake it by re-transcribing a rolling buffer. Production voice agents use streaming STT with built-in turn detection over WebSocket (Deepgram Flux, which is WebSocket-only on Workers AI). They feed sentence-chunked LLM output into streaming TTS (ElevenLabs Flash about 185 ms, Deepgram Aura-2 about 290 ms perceived time-to-first-audio on an independent leaderboard), or they use a speech-to-speech model (OpenAI gpt-realtime-2: WebRTC in browsers, WebSocket server-side; Gemini Live: WebSocket). Cloudflare now covers the whole cascade natively. Workers AI hosts Whisper, Nova-3, Flux, Aura and MeloTTS, and `@cloudflare/voice` (Apr 2026) runs an STT→LLM→sentence-chunked TTS loop inside a Durable Object over one WebSocket. In the browser, the robust playback path for streamed audio is PCM into an AudioWorklet ring buffer with an 80–200 ms prebuffer.

### Cited Findings

**Streaming STT: Whisper approaches**
- Whisper-Streaming uses the **LocalAgreement-2** policy: it emits only the longest common prefix of two consecutive re-transcriptions of a growing buffer (capped about 30 s and trimmed at sentence ends), and passes the last 200 confirmed words as a prompt. VAD is optional. Latency averaged **3.3 s** for English (A40 GPU, 1 s MinChunkSize), 4.4 s German and 4.8 s Czech, with WER about 2 points worse than offline for English. The backend is faster-whisper (CTranslate2), about 4x faster than reference Whisper. — [arXiv: Turning Whisper into Real-Time Transcription System](https://arxiv.org/html/2307.14743)
- The repo says "WhisperStreaming is becoming outdated in 2025" in favor of **SimulStreaming** (same author; "much faster and higher quality"; MIT license; torch backend only). Whisper-Streaming backends are faster-whisper (recommended), whisper-timestamped, the OpenAI API and MLX. Silero VAD options are `--vac` (recommended) and `--vad`. It runs a TCP server mode. A WebSocket/FastAPI demo called WhisperLiveKit exists; despite the name it is not the LiveKit company. — [GitHub: ufal/whisper_streaming](https://github.com/ufal/whisper_streaming)
- A SimulStreaming paper exists for the CUNI IWSLT 2025 submission. — [arXiv 2506.17077](https://arxiv.org/html/2506.17077v1)

**Streaming STT: hosted**
- Workers AI ASR models: `whisper`, `whisper-large-v3-turbo`, `whisper-tiny-en` (beta), Deepgram `nova-3`, and Deepgram `flux` ("the first conversational speech recognition model built specifically for voice agents"). Also `smart-turn-v2` (Pipecat) for turn detection. — [Cloudflare Workers AI models](https://developers.cloudflare.com/workers-ai/models/)
- Flux on Workers AI (Oct 2, 2025) is **WebSocket-only**: `env.AI.run("@cf/deepgram/flux", {encoding:"linear16", sample_rate:"16000"}, {websocket:true})`. It needs live bidirectional streaming to detect speech activity. — [Cloudflare changelog: Deepgram Flux](https://developers.cloudflare.com/changelog/2025-10-02-deepgram-flux)
- Workers AI added WebSocket support for models, launching with smart-turn-v2, which returns `is_complete` and `probability`. — [Cloudflare blog: Realtime voice AI](https://blog.cloudflare.com/cloudflare-realtime-voice-ai)
- Vendor-claimed streaming STT figures (as of Feb 2026): Deepgram under 300 ms, $0.46/hr streaming, Flux with built-in turn detection. AssemblyAI Universal-Streaming 90 ms transcript delivery, about 300 ms end-to-end, $0.0025/min. Gladia Solaria-1 partials under 103 ms. Mistral Voxtral real-time under 200 ms. The article says OpenAI "does not offer a dedicated real-time API" for Whisper, which predates gpt-realtime-whisper below. — [Fast.io: transcription APIs (Feb 12, 2026)](https://fast.io/resources/best-transcription-apis-ai-agents/)
- OpenAI GPT-Realtime-Whisper (streaming STT for live captions) costs $0.017/min. — [iClarified (dated May 7, 2026 in body)](https://www.iclarified.com/100797/openai-launches-gptrealtime2-to-power-smarter-voice-apps)
- LiveKit Inference per-minute STT rates: Deepgram Nova-3 $0.0048, Flux $0.0065 (Build/Ship tiers). — [LiveKit pricing](https://livekit.com/pricing)

**Streaming TTS**
- Independent Coval leaderboard, read Sept 8, 2026, reporting median *perceived* time-to-first-audio (round trip plus leading silence): ElevenLabs Flash v2.5 **185 ms** (noted as HTTP chunked), Inworld Realtime TTS-2 170 ms, Gradium 214 ms, Rime Mist v3 256 ms, Cartesia Sonic 3.5 269 ms, Deepgram Aura-2 **290 ms** (WebSocket), ElevenLabs v3 Conversational 320 ms, Cartesia Sonic 3.6 440 ms. OpenAI gpt-4o-mini-TTS had a **P95 of 3,927 ms**. Prices: ElevenLabs $50/1M chars, Aura-2 $0.030/1k chars. The source (Gradium) is a competitor, but the figures are third-party. — [Gradium: Best low-latency TTS APIs 2026 (updated Sept 10, 2026)](https://gradium.ai/content/best-low-latency-tts-apis-2026)
- Deepgram **Flux TTS** (Aug 13, 2026) is "conversation-native": it keeps tone and pacing across turns. Vendor claim: it starts responding in as little as 80 ms. It uses the `/v2/speak` WebSocket and accepts streamed LLM output. It reports `text_spoken` / `text_remaining` on barge-in, so you know what the user actually heard. $0.045/1k chars from Sept 13, 2026. Integrations: Vapi, Pipecat, LiveKit, Jambonz, Cloudflare. — [audioXpress (Aug 13, 2026)](https://audioxpress.com/news/deepgram-launches-flux-tts-conversation-aware-text-to-speech-model-for-voice-agents)
- Workers AI TTS models: Deepgram `aura-1`, `aura-2-en`, `aura-2-es`, and MyShell `melotts`. Kokoro is not in the catalog. — [Cloudflare Workers AI models](https://developers.cloudflare.com/workers-ai/models/)
- Local/in-browser: **kokoro-js** runs Kokoro (82M parameters, Apache-licensed weights) fully client-side through Transformers.js on `webgpu` or `wasm`. `tts.stream()` with a `TextSplitterStream` yields audio chunks as text arrives. It has 28 English voices. — [kokoro-js README](https://cdn.jsdelivr.net/npm/kokoro-js@1.2.0/README.md)
- LiveKit Inference TTS rates: Aura-2 $0.0180/min, Cartesia Sonic 3 $0.0300/min (Build/Ship). — [LiveKit pricing](https://livekit.com/pricing)

**Full-duplex voice agents / speech-to-speech**
- OpenAI Realtime GA (`gpt-realtime`, Aug–Sept 2025): `/v1/realtime/calls` takes the SDP offer and session config in one request. Events travel on a DataChannel. Audio is Opus with in-band FEC (PCMU/PCMA fallback). Candidates are host-only (no STUN/TURN), with TCP candidates on 443 for UDP-blocked networks. Three Azure endpoints were advertised. Video goes in as snapshots (image inputs), not as streamed video. — [webrtcHacks: How OpenAI does WebRTC in gpt-realtime (Sept 23, 2025)](https://webrtchacks.com/how-openai-does-webrtc-in-the-new-gpt-realtime/)
- Current OpenAI docs: WebRTC for browsers, WebSocket for servers. Browser auth uses either an ephemeral secret from `POST /v1/realtime/client_secrets` or a server-proxied SDP exchange. The code sample uses `gpt-realtime-2.1`. — [OpenAI docs: Realtime](https://developers.openai.com/api/docs/guides/realtime); [OpenAI docs: Realtime WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)
- GPT-Realtime-2 is OpenAI's first voice model with GPT-5-class reasoning. Context grew from 32K to 128K tokens. Price: $32/M audio input tokens and $64/M audio output tokens. It launched alongside GPT-Realtime-Translate ($0.034/min) and GPT-Realtime-Whisper ($0.017/min). — [iClarified](https://www.iclarified.com/100797/openai-launches-gptrealtime2-to-power-smarter-voice-apps). Date conflict: the article body says May 7, 2026, but a search-result title for the same URL shows June 21, 2026.
- **Gemini Live API** is a raw WebSocket to `BidiGenerateContent` carrying JSON messages. Input is 16-bit PCM at 16 kHz, base64-encoded; video is sent as JPEG/PNG frames. Browser clients use ephemeral tokens via `BidiGenerateContentConstrained`. The docs' example model name is `gemini-3.8-live`, read from a localized docs page; verify before use. — [Google AI: Live API WebSocket quickstart](https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket?hl=it). A forum thread reports a native-audio preview model returning WebSocket code 1011 mid-turn at high rates starting 2026-05-27, which points to reliability churn. — [Google AI forum](https://discuss.ai.google.dev/t/gemini-live-api-gemini-2-5-flash-native-audio-preview-12-2025-returns-code-1011-mid-turn-at-80-rate-started-2026-05-27/167186)
- **LiveKit Agents** is event-driven and handles orchestration, state and interruptions for you. It has a transformer turn detector (99%+ true-positive, 85–96% true-negative), SIP telephony, and observability. **Pipecat** is a static frame pipeline where you wire interruptions yourself. Its turn detection is Smart Turn v3, and its transports are Daily (first-class; core contributors work at Daily), LiveKit, Twilio, local and SmallWebRTC. Both are Python-first. — [LiveKit field guide: LiveKit vs Pipecat](https://livekit.io/field-guides/guide/livekit-vs-pipecat)
- **Cloudflare Realtime Agents** (Aug 2025, open beta, runtime free during beta): a `RealtimeAgent` class chains transport → STT (Deepgram) → your text handler → TTS (ElevenLabs). The SFU converts WebRTC Opus to PCM and streams it to any WebSocket you specify, bidirectionally. The latency budget is under 800 ms total: about 40 ms mic, 300 ms STT, 400 ms LLM, 150 ms TTS. That is a target, not a benchmark. — [Cloudflare blog: Realtime voice AI](https://blog.cloudflare.com/cloudflare-realtime-voice-ai)
- Cloudflare Realtime **WebSocket adapter** (beta) bridges SFU WebRTC tracks and WebSocket endpoints in either direction. Payloads are PCM 16-bit LE, 48 kHz, stereo; WebRTC tracks are Opus 48 kHz stereo. Ingest messages are capped at 32 KB. Video egress is JPEG at about 1 fps. Stream mode retries the same endpoint for up to 5 s. It is free in beta, then $0.05/GB egress to the WebSocket endpoints, with ingest free and usage counting toward the 1,000 GB free tier. — [Cloudflare docs: WebSocket adapter](https://developers.cloudflare.com/realtime/sfu/media-transport-adapters/websocket-adapter/)
- **Cloudflare `@cloudflare/voice`** (Agents SDK, experimental, Apr 15, 2026): voice runs in the agent's Durable Object "over a single WebSocket connection". It is WebSocket-native today, with SFU/WebRTC adapters planned. The browser streams 16 kHz mono PCM. STT is `WorkersAIFluxSTT` (conversational turns) or `WorkersAINova3STT` (dictation); TTS is `WorkersAITTS` (Aura, returns MP3). **If `onTurn()` returns a stream, the pipeline splits it into sentences and synthesizes each as it completes.** `context.signal` aborts the LLM on interruption. The client is `VoiceClient` (framework-agnostic) or React hooks. There is a Twilio adapter, but telephony needs mulaw 8 kHz, so a different TTS is recommended there. — [Cloudflare blog: Add voice to your agent (Apr 15, 2026)](https://blog.cloudflare.com/voice-agents/)

**Playing streamed TTS in the browser while LLM text is still streaming**
- Transport options: an HTTP body stream (chunked/SSE) is simpler to proxy and debug; a WebSocket with JSON events carrying base64 PCM deltas is better when you need bidirectional control such as barge-in. Codec: **PCM/WAV for immediate playback**, since an AudioWorklet can consume it directly. Partial **MP3** streams may stall until enough frames arrive, so MP3 is acceptable only with a 1–2 s startup tolerance. Playback: an **AudioWorklet ring buffer** (128 samples per `process()` call) is recommended for gapless output, with MediaSource as an alternative. **Prebuffer 80–200 ms.** Use a bounded queue with backpressure. **Match the AudioContext sample rate to the provider's**, because a 44.1 vs 48 kHz mismatch distorts pitch and tempo. — [Smallest.ai: Streaming TTS transport, codec & buffering (Oct 5, 2026)](https://smallest.ai/blog/streaming-tts-in-nodejs-transport-codec-and-buffering-guide)
- Chunking text for TTS: split at clause and sentence boundaries (`.`, `?`, `!`, `;`, comma plus conjunction), optionally capping at about 100 characters with at least 3 words per sub-chunk. Smaller chunks cut latency at some cost to naturalness. — [Deepgram docs: Text chunking for TTS](https://developers.deepgram.com/docs/text-chunking-for-tts-optimization-copy)
- On Safari, `ManagedMediaSource` (the MSE variant whose buffers the browser can evict at any time) only opens if `disableRemotePlayback = true` is set or an AirPlay/HLS alternative is provided. Otherwise `sourceopen` never fires. — [MDN: ManagedMediaSource](https://developer.mozilla.org/en-US/docs/Web/API/ManagedMediaSource)

### Inferences
- **His Whisper setup.** Chunked HTTP POSTs to Whisper amount to a hand-rolled version of the Whisper-Streaming idea. Expect seconds of latency and no real turn detection. To move toward conversation, the cheapest Cloudflare-native upgrade is Flux on Workers AI over a WebSocket, which adds turn detection. Alternatively, keep Whisper for dictation and add Silero VAD to cut chunks at pauses.
- **TTS read-aloud recipe:**
  1. Stream LLM tokens.
  2. Buffer them to sentence or clause boundaries.
  3. Send each sentence to TTS (Aura-2 on Workers AI, ElevenLabs Flash, Cartesia, or Kokoro in-browser for free/offline).
  4. Request raw PCM (linear16) where possible.
  5. Stream it over his existing WebSocket as binary frames.
  6. Play it through an AudioWorklet ring buffer with about 100–200 ms prebuffer.
  7. On barge-in, flush the ring buffer, abort the LLM, and (with Flux TTS) use `text_spoken` to trim chat history to what was actually heard.

  This is the same shape as Cloudflare's own `@cloudflare/voice` pipeline.
- Taken together: speech-to-speech models (gpt-realtime-2, Gemini Live) are the lowest-effort route to natural full duplex but are pricier per minute and lock in the model. A cascade (STT→LLM→TTS) keeps model choice and text transcripts, which fits his Item/JSONL persistence model, since every turn becomes text he can store.
- For one user talking to one AI, WebSocket audio is an acceptable concession; Cloudflare's own voice SDK ships that way. WebRTC matters more on lossy mobile networks and when the AI joins a multi-party voice room. In that case, the Realtime SFU WebSocket adapter lets a Durable Object or Worker hear the room as PCM and inject TTS as a WebRTC track.
- Piper (local TTS, background knowledge): a fast local neural TTS from the Rhasspy/Home Assistant ecosystem, typically run server-side. Not verified this session.

### Gaps
- No primary source was fetched for Piper, OpenAI TTS streaming formats (e.g., the `pcm` response format), or Cartesia/ElevenLabs WebSocket input-streaming APIs. Their latencies come from the Coval leaderboard via Gradium.
- Workers AI per-model pricing for Flux, Nova-3 and Aura in late 2026 was not found. The Flux free promo ended Oct 31, 2025, and later pricing wasn't captured.
- The Gemini Live output sample rate (commonly 24 kHz) was not confirmed on the fetched page, and the `gemini-3.8-live` model name is unverified.
- Whether `WorkersAITTS` can return PCM instead of MP3 was not confirmed.
- SimulStreaming latency numbers were not extracted.

---

## Q5. Which transport for which job (one-page recommendation)

### Takeaway
Use reliable, ordered WebSockets, ideally on Durable Objects, for collaborative deltas, chat, presence and AI token streaming, the way Figma and tldraw do. Use WebRTC through a hosted SFU (Cloudflare Realtime) for voice and video, the way Discord and ChatGPT voice do. For game state, use WebSockets for turn-based or slow games, and WebRTC unreliable DataChannels (or WebTransport datagrams on a non-Cloudflare QUIC server) for fast action games. For AI voice, a WebSocket to a Durable Object is the simplest path for 1:1, and WebRTC (SFU plus WebSocket adapter, or OpenAI Realtime over WebRTC) is the robust one.

### Cited Findings
- Figma multiplayer runs over WebSockets to a separate server process per document. The server is authoritative, conflicts resolve last-writer-wins per object property, Figma rejected OT as too complex, and offline edits are replayed on reconnect. — [Figma blog: How multiplayer works (Oct 16, 2019)](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- tldraw sync uses WebSockets to one authoritative `TLSocketRoom` per document. The recommended deployment is one Cloudflare Durable Object per room with SQLite storage and R2 for assets, "the same setup as tldraw.com." — [tldraw docs: sync](https://tldraw.dev/docs/sync)
- WebTransport datagrams suit game state updates where each message supersedes the last. — [MDN: WebTransport API](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API)
- Unreliable/unordered DataChannels: `ordered:false` with `maxRetransmits:0` or `maxPacketLifeTime`. — [MDN: RTCDataChannel](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel)
- OpenAI recommends WebRTC for browser clients and WebSocket for servers. — [OpenAI docs: Realtime](https://developers.openai.com/api/docs/guides/realtime)
- Cloudflare Workers have no WebTransport and none is planned. — [workerd #6451](https://vat.pages.dev/cloudflare/workerd/issues/6451)
- SSE is one-way, text-only, and on HTTP/1.1 limited to 6 connections per domain. — [MDN: SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)

### Inferences

| Job | Recommended now (Cloudflare-leaning) | Why | Upgrade path / notes |
|---|---|---|---|
| **Collaborative document deltas** (Figma-like) | WebSocket to one Durable Object per Page/document (hibernation, SQLite), server-authoritative ordering; keep JSONL as an export/append log | Deltas need reliable ordered delivery; HOL blocking costs only latency, not correctness. This is the Figma and tldraw pattern. | Batch deltas every 50–100 ms per Cloudflare guidance; per-property LWW like Figma; CRDTs (Yjs/Automerge) only if offline-first text editing is needed |
| **Presence / cursors** | Same WebSocket, throttled (e.g., 10–20 Hz), last-value-wins, never persisted | Cheap; stale cursor positions can be dropped | Move to an unreliable DataChannel only if the cursor feel is laggy on bad networks |
| **Text chat** | Same WebSocket plus persistence | Discord does text and presence over its WebSocket Gateway | n/a |
| **Game state, turn-based/slow** | WebSocket | Simplicity wins | n/a |
| **Game state, fast action** | WebRTC DataChannel `{ordered:false, maxRetransmits:0}` P2P or via Realtime SFU, with WebSocket for authoritative events | Avoids HOL blocking for snapshot-style state | WebTransport datagrams need a non-Workers QUIC server (Go/Rust); Baseline since Mar 2026 |
| **Voice chat** (Discord-like) | WebRTC (Opus) via Cloudflare Realtime SFU, or RealtimeKit for prebuilt UI; signaling over the existing WebSocket | UDP, packet-loss concealment, TURN fallback, no media servers to run | E2EE later via encoded transforms (DAVE pattern); LiveKit if he wants open source or self-hosting |
| **Video / screen share** | Same SFU with simulcast | Same as above | One-to-many broadcast: Cloudflare Stream WHIP/WHEP (< 500 ms) or LL-HLS (~3 s) for scale; watch MoQ |
| **AI token streaming** | Over his existing WebSocket (already full duplex), or SSE/fetch streaming for stateless endpoints | Text is tiny; HOL blocking is irrelevant | n/a |
| **AI voice (talk-back)** | Phase 1: browser mic as 16 kHz PCM over WebSocket to a DO, Flux STT, LLM stream, sentence-chunked Aura/ElevenLabs TTS, PCM back to an AudioWorklet (the `@cloudflare/voice` shape). Phase 2: WebRTC via Realtime SFU with the WebSocket adapter feeding the DO | Phase 1 reuses his WS stack; Phase 2 is robust on mobile and lets the AI join voice rooms | Or skip the cascade with OpenAI gpt-realtime over WebRTC (ephemeral key) or Gemini Live over WebSocket |
| **TTS read-aloud only** | Sentence-chunked TTS requests, streaming PCM to an AudioWorklet; or in-browser Kokoro (WebGPU) for zero server cost | Lowest complexity | n/a |

### Gaps
- No source benchmarked WebSocket vs WebRTC DataChannel vs WebTransport latency for game state on the same network. The recommendation rests on protocol properties, not measurements.

---

## Q6. Simplifying concessions: common simple setups, what each gives up, and when you don't need more

### Takeaway
Most of the stack can stay simple. WebSockets for everything except multi-party media is how Figma, tldraw and even Cloudflare's own voice SDK ship. A hosted SFU replaces Discord's 850-server fleet for cents per GB. Sentence-by-sentence non-streaming TTS is the standard way pipelines start speaking before the LLM finishes. The concessions to watch are real-time audio over TCP on lossy mobile networks, and chunked-Whisper latency (seconds, with no turn detection) once he wants back-and-forth conversation.

### Cited Findings
- **"WebSockets for everything."** Figma multiplayer is WebSocket-only. — [Figma blog](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/). So is tldraw.com sync, on Durable Objects. — [tldraw docs](https://tldraw.dev/docs/sync). Discord's text and presence run on a WebSocket Gateway. — [Discord 2018](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc). Cloudflare's voice-agent SDK runs voice "over a single WebSocket connection", WebSocket-native today with WebRTC adapters planned. — [Cloudflare: Add voice to your agent](https://blog.cloudflare.com/voice-agents/). What it gives up: on TCP a lost packet blocks everything behind it. — [Cloudflare: MoQ](https://blog.cloudflare.com/moq/). LiveKit and OpenAI pick WebRTC for client audio because it handles lossy WiFi and cellular better. — [LiveKit blog](https://livekit.com/blog/openai-livekit-partnership-advanced-voice-realtime-api); [OpenAI docs](https://developers.openai.com/api/docs/guides/realtime-webrtc)
- **"Hosted SFU instead of own media servers."** Discord built its own C++ SFU fleet at 850+ servers and 2.6M concurrent users. — [Discord 2018](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc). Hosted alternatives: Cloudflare $0.05/GB with 1,000 GB free. — [Cloudflare TURN/SFU](https://www.cloudflare.com/products/turn-sfu/). RealtimeKit $0.0005/min audio-only. — [RealtimeKit pricing](https://developers.cloudflare.com/realtime/realtimekit/pricing/). Daily $0.00099/min audio-only after 10k free. — [Daily](https://www.daily.co/pricing/video-sdk/). Agora $0.99/1k min. — [Agora](https://www.agora.io/en/pricing/voice-calling). LiveKit free tier of 5,000 participant-min. — [LiveKit](https://livekit.com/pricing). What it gives up: control over routing and codecs (Discord's custom native stack skips ICE/DTLS for faster setup), plus vendor lock-in at the API level.
- **"Mesh P2P instead of an SFU"** works for 2–3 peers; each peer uploads a copy per peer. — [LiveKit docs](https://docs.livekit.io/concepts/livekit-sfu/)
- **"Chunked HTTP to Whisper."** Even a well-engineered streaming wrapper reaches about 3.3 s average latency. — [arXiv 2307.14743](https://arxiv.org/html/2307.14743). Turn-aware streaming STT (Flux) requires a bidirectional WebSocket. — [Cloudflare changelog](https://developers.cloudflare.com/changelog/2025-10-02-deepgram-flux)
- **"Non-streaming TTS per sentence."** This is exactly what Cloudflare's pipeline does: it splits the LLM stream into sentences and synthesizes each as it completes. — [Cloudflare: Add voice to your agent](https://blog.cloudflare.com/voice-agents/). Deepgram recommends clause and sentence chunking. — [Deepgram docs](https://developers.deepgram.com/docs/text-chunking-for-tts-optimization-copy). What it gives up: MP3 per chunk can add 1–2 s startup. — [Smallest.ai](https://smallest.ai/blog/streaming-tts-in-nodejs-transport-codec-and-buffering-guide). Cross-sentence prosody is the gap that conversation-aware TTS such as Flux TTS claims to close (vendor claim). — [audioXpress](https://audioxpress.com/news/deepgram-launches-flux-tts-conversation-aware-text-to-speech-model-for-voice-agents)
- **"Speech-to-speech API instead of building a cascade."** OpenAI gpt-realtime-2 costs $32/M audio-in and $64/M audio-out tokens. — [iClarified](https://www.iclarified.com/100797/openai-launches-gptrealtime2-to-power-smarter-voice-apps). A cascade on LiveKit Inference is in the cents-per-minute range (sample pipeline $0.0479/min, including telephony). — [LiveKit pricing](https://livekit.com/pricing)
- **"Skip WebTransport."** It is unavailable on Workers anyway. — [workerd #6451](https://vat.pages.dev/cloudflare/workerd/issues/6451)
- **"SSE for AI streaming."** Fine for one-way text; use HTTP/2 to avoid the 6-connection cap. — [MDN: SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- **"Stream / LL-HLS instead of WebRTC for broadcast."** HLS 15–30 s, LL-HLS ~3 s. — [Cloudflare: MoQ](https://blog.cloudflare.com/moq/). Cloudflare Stream WHIP/WHEP gives < 500 ms but can't record or output HLS for WHIP inputs. — [Cloudflare Stream WebRTC](https://developers.cloudflare.com/stream/webrtc-beta/)

### Inferences

| Concession | Gives up | You don't need more when… | Upgrade trigger |
|---|---|---|---|
| WebSockets for all data (deltas, chat, presence, AI text, game state) | HOL stalls under loss; no unreliable mode | Turn-based or slow games, docs, chat, presence, AI text | Fast action game feels rubber-bandy on mobile, so add an unreliable DataChannel |
| WebSocket audio for 1:1 AI voice | Loss resilience, Opus FEC, echo-cancelled WebRTC pipeline | Desktop/WiFi users, push-to-talk, demos | Mobile users complain of choppy audio, or the AI must join group voice: switch to WebRTC + SFU adapter |
| Hosted SFU (Cloudflare/LiveKit/Daily) | Deep control, custom codecs and routing, no vendor dependency | Anything below Discord scale | Cost at very high volume, or special routing needs |
| Mesh P2P | Scales past ~3 peers poorly | DMs and 1:1 calls | Group voice channels |
| Chunked HTTP Whisper | Seconds of latency, no partials, no turn detection | Dictation, push-to-talk, transcripts | Hands-free back-and-forth conversation: Flux/Nova-3 over WebSocket |
| Sentence-at-a-time TTS (non-streaming requests) | ~1 sentence of startup latency; prosody resets per sentence | Read-aloud of text that already exists | Conversational agent wanting <500 ms first audio: streaming WebSocket TTS |
| MP3 instead of PCM | Startup stall, decode complexity for gapless play | Read-aloud with a play button | Live conversation: PCM into an AudioWorklet |
| Speech-to-speech API | Model choice, text-first persistence, cost | Prototype or "wow" demo | Need for his own LLM, memory or tools in text form |
| Skip MoQ/WebTransport | Future-proof scalable live media | Everything in his list today | Large-audience live streaming |

### Gaps
- No source measured actual packet-loss stall durations for WebSocket audio versus WebRTC in the same conditions; the trade-off is qualitative in the sources.

---

## Q7. Named companies and products using each technology, and how

### Takeaway
Real deployments back the recommendations above. WebSockets underpin Figma, tldraw.com (on Cloudflare Durable Objects), Discord's gateway, Gemini Live and server-side OpenAI Realtime. WebRTC with SFUs underpins Discord voice, ChatGPT Advanced Voice (LiveKit), OpenAI Realtime in the browser and Cloudflare Realtime/Stream. WebCodecs is used by Zoom Web, Loom, Twitch, Discord and Adobe. MoQ's main production-ish deployment is Cloudflare's preview relay.

### Cited Findings
- **Figma**: WebSockets, one server process per document, server-authoritative LWW. — [Figma blog](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- **tldraw.com**: WebSocket sync, one Durable Object per room, SQLite storage, R2 assets. — [tldraw docs](https://tldraw.dev/docs/sync)
- **Discord**: WebSocket Gateway for text and presence; Elixir signaling; C++ SFU; WebRTC in browsers; modified native WebRTC; DAVE E2EE (MLS plus encoded transforms) on DMs, voice channels and Go Live since March 2026. — [Discord 2018](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc); [Discord 2026](https://discord.com/blog/every-voice-and-video-call-on-discord-is-now-end-to-end-encrypted); [daveprotocol.com](https://daveprotocol.com/)
- **OpenAI ChatGPT Advanced Voice**: LiveKit client SDK, WebRTC to LiveKit Cloud, and an agent bridging to GPT-4o over WebSocket. — [LiveKit blog](https://livekit.com/blog/openai-livekit-partnership-advanced-voice-realtime-api)
- **OpenAI Realtime API**: WebRTC (Opus + FEC, DataChannel events, TCP/443 fallback) for browsers; WebSocket for servers. — [webrtcHacks](https://webrtchacks.com/how-openai-does-webrtc-in-the-new-gpt-realtime/); [OpenAI docs](https://developers.openai.com/api/docs/guides/realtime)
- **Google Gemini Live**: bidirectional JSON over WebSocket with base64 PCM. — [Google AI docs](https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket?hl=it)
- **Cloudflare**: Realtime SFU, TURN and RealtimeKit (WebRTC); Realtime Agents and `@cloudflare/voice` (WebSocket into Durable Objects); Workers AI Deepgram Flux (WebSocket STT); Stream WHIP/WHEP; MoQ relay preview. — [Cloudflare docs: SFU](https://developers.cloudflare.com/realtime/sfu/index.md); [Cloudflare: voice agents](https://blog.cloudflare.com/voice-agents/); [Cloudflare: MoQ](https://blog.cloudflare.com/moq/); [Cloudflare Stream WebRTC](https://developers.cloudflare.com/stream/webrtc-beta/)
- **Amazon IVS** (Twitch technology): low-latency HLS-style channels under 5 s, and Real-Time stages under 300 ms. — [AWS IVS FAQ](https://aws.amazon.com/ivs/faqs)
- **WebCodecs users**: Zoom Web Client, Loom, Twitch, Discord, Adobe Premiere Web (beta). — [Utsubo](https://www.utsubo.com/blog/frontier-web-apis-2026-production-ready)
- **Deepgram Flux TTS integrations**: Vapi, Pipecat, LiveKit, Jambonz, Cloudflare. — [audioXpress](https://audioxpress.com/news/deepgram-launches-flux-tts-conversation-aware-text-to-speech-model-for-voice-agents)
- **Pipecat**: maintained by Daily contributors; transports Daily, LiveKit, Twilio, SmallWebRTC. — [LiveKit field guide](https://livekit.io/field-guides/guide/livekit-vs-pipecat)
- **Agora**: proprietary SD-RTN network with TCP/TLS 443 fallback. — [Agora pricing](https://www.agora.io/en/pricing/voice-calling)
- **SRT**: originated by Haivision (with SK Telecom co-authors). — [IETF draft](https://datatracker.ietf.org/doc/html/draft-sharabayko-srt-01)
- **MoQ**: Cloudflare relay (fork of moq-rs); moq.dev / Luke Curley's moq-lite. — [moq.dev](https://moq.dev/blog/first-cdn/)

### Inferences
- The closest analogue to his architecture is **tldraw.com**: a WebSocket per document on a Durable Object, with SQLite and blob storage. The closest analogue to his voice ambitions is **Discord's gateway-plus-SFU split**, which he can reproduce with his WebSocket server and Cloudflare Realtime SFU. Twitch's use of WebCodecs and IVS points the same way: big platforms mix transports per job rather than using one for everything.

### Gaps
- No primary sources were fetched on which companies use mediasoup, Janus or Jitsi in production, or on Bitmovin's MoQ work. GitHub and npm stats were excluded per instructions.
