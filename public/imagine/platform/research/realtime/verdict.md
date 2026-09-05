# Real-time substrate — verdict

## Recommendation (MVP)
1. **Text chat only.** One hibernating Durable Object **per channel** (SQLite-backed), the shape `durable-objects.md` already designed, applied one level finer than a topic.
2. **Client change is one line** (`Socket.js` swaps `window.location.host` for the DO's url) plus a row-id in place of a byte offset — both already opaque values the client only echoes (`wire.md`). Nothing else in the JSONL stack changes.
3. **No voice, no recording, no transcription in the MVP.** First voice cost is Cloudflare Realtime's flat **$0.05/GB egress** (1,000GB free/mo) — cheaper to reason about than any per-minute vendor before a room shape is proven.

## §33 — one DO per channel, not per topic (the expensive-to-reverse call)

| | |
|---|---|
| **Decision** | Shard chat state as one Durable Object per **channel**, not per topic |
| **Problem** | A topic (§18) can hold many channels — text, voice, wiki, docs, subtopics. Something must own each channel's message order; the question is the blast radius of that ownership |
| **Options** | (a) one DO per channel — chosen · (b) one DO per topic, fanning every channel through it (the `research/cloudflare` verdict's pick) · (c) one DO per topic, with channels as in-object logical partitions |
| **Recommended** | (a) |
| **Why** | Cloudflare's own anti-pattern rule is "never route all traffic through one Durable Object instance." A topic's chat, wiki edits and voice presence sharing one object means a viral text channel's ~1,000 req/s soft ceiling and 32,768-connection cap are shared with every other channel in the topic, and one deploy drops the whole topic instead of one room |
| **Advantages** | Failure/load isolation per channel; a quiet wiki-talk channel never queues behind a busy voice-chat channel; matches the connection-cap math per room, not per topic |
| **Disadvantages** | More objects to reason about; no single object holds "this topic's" full activity for a cross-channel query; **directly conflicts with `research/cloudflare`'s verdict** (one DO per topic) — unresolved, needs the owner or a tie-break pass |
| **Security** | Same as per-topic: no visitor holds a DO-scoped token, every write is through the Worker |
| **Cost** | Same $/message math either way (request billing is per-message, not per-object); per-channel adds near-zero idle-object cost since hibernation makes an unused channel free but for storage |
| **Scalability** | Per-channel isolates a hot room from a hot topic; a single wildly-popular channel still eventually needs its own re-sharding — not solved here (see the log's skeptic question) |
| **Complexity** | Same hibernation-API + alarm-compaction shape as per-topic; one more routing key (channel id, not topic id) |
| **Migration** | DO storage type is immutable once created; per-channel vs per-topic is a routing-key choice made before the first message, not cheaply reversible after |
| **NOT doing yet** | Sharding *within* one hot channel; a cross-channel query layer; resolving the conflict with `research/cloudflare` |

## The three numbers
- DO requests **$0.15/M**, WS inbound bills **20:1**, duration **$12.50/M GB-s** — [durable-objects/platform/pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/), re-verified 2026-09-04
- Cloudflare Realtime SFU/TURN: **$0.05/GB** egress, 1,000GB free/mo — no per-minute charge — [realtime/pricing](https://developers.cloudflare.com/realtime/pricing/)
- All-party (two-party) consent US states: **about a dozen, contested at the edges** (12 by one careful count, sources disagree on which 12) — [recordinglaw.com](https://www.recordinglaw.com/party-two-party-consent-states/)

## Cut first if the MVP must shrink
1. Presence/typing indicators — nice-to-have over the same socket, add after chat itself works.
2. Cold-history-to-R2 compaction — SQLite alone holds months of a normal room; add the alarm later.
3. Live AI moderation (500ms/msg, Llama Guard) — start with rate-limit + mute/ban only, both free and already inline in the DO's message handler.

**Unresolved and load-bearing:** this verdict picks one-DO-per-channel; `research/cloudflare`'s verdict picks one-DO-per-topic. Same evidence, different scope assumption (a topic *is* mostly one channel there; here it explicitly is not, per brief §18). The owner needs to settle which topic model is real before either ships.

Full evidence: [`log.jsonl`](./log.jsonl), 36 lines.
