# Video / YouTube — verdict

## Recommendation (MVP)
1. **Embed only, no upload-through-our-UI.** IFrame Player API (`youtube-nocookie.com`), the pattern the site already ships in `/imagine/youtube/` and `/imagine/feeds/video/` — no quota, no OAuth, no ToS review needed. Read public metadata (`videos.list`, 1 unit, no auth) for title/description/thumbnails; parse chapters from the description text ourselves.
2. **A creator who connects their own YouTube OAuth** gets metadata import and captions (their own videos only — `captions.download` needs the owner's grant) plus our topic structure wrapped around their embed.
3. **Defer `videos.insert` uploads** until a compliance audit has passed — building upload-through-our-UI now means every early video is private-only.

## §33 — build YouTube upload-through-our-UI now, or defer it

| | |
|---|---|
| **Decision** | Do not build `videos.insert` upload in the MVP; ship embed + metadata import first |
| **Problem** | "Users publish video through our interface" was floated as an MVP feature; uploads via unverified API projects land private-only, and OAuth verification for `youtube.upload` has real turnaround time |
| **Options** | (a) build upload now, accept private-only videos until audited — chosen: no · (b) embed + creator-owned metadata now, add upload after verification — chosen · (c) skip YouTube, host natively on Cloudflare Stream/Mux day one |
| **Recommended** | (b) — the hybrid: YouTube embed for creators with channels, Stream/Mux reserved for platform-native short clips later |
| **Why** | Embedding is free and proven today; upload adds an audit + verification dependency with no product value until it clears (see log #4, #10) |
| **Advantages** | Zero quota risk, zero verification lead time, reuses shipped code (`Player`, `cues.js`) |
| **Disadvantages** | No native upload flow at launch; creators must still use youtube.com or a connected OAuth to publish |
| **Security** | No YouTube OAuth token touches our Worker for embeds; a creator's `youtube.upload`/`.readonly` token, once added, must never leave server-side storage |
| **Cost** | $0 for embeds; verification/audit cost is calendar time, not cash, once we do pursue upload (log #8–10) |
| **Scalability** | Embed scales with YouTube's CDN, not ours — no cost concern at any user count |
| **Complexity** | Low — one poster+iframe pattern already exists; upload would add OAuth flow, resumable-upload client, and quota/verification bookkeeping |
| **Migration** | Fully reversible — embedding today does not block adding upload later once verification/audit clears |
| **NOT doing yet** | `videos.insert` upload, browser-direct-to-YouTube CORS uploads (undocumented — log #18), platform-native video hosting (Stream/Mux) |

## The three numbers
- `videos.insert`: **100 calls/day, 1 quota unit each**, its own bucket — [videos/insert](https://developers.google.com/youtube/v3/docs/videos/insert), fetched 2026-09-04
- Unverified projects (created after 28 Jul 2020): **uploads private-only until a compliance audit passes** — same page, fetched 2026-09-04
- Cloudflare Stream: **$5 / 1,000 min stored, $1 / 1,000 min delivered** — [stream/pricing](https://developers.cloudflare.com/stream/pricing/), dated 2026-09-01

## Challenged
- *"Users upload through our UI as an MVP feature"* — no: private-only-until-audited makes it a bad first video experience (log #4).
- *"YouTube hosting is free for us"* — embedding is; anything past that (uploads, reads at scale, retention bookkeeping) brings real engineering and calendar cost (log #38).
- *"Transcripts are obtainable"* — only for videos we hold the owner's OAuth for; scraping third-party transcripts is a ToS violation, stated plainly (log #12, #13).
- Google's own quota-calculator page **contradicts its own table** — the AI summary blurb still says 1600 units, the table says 100/day at 1 unit (log #5) — flagged as `contested`, not smoothed over.

## Cut first if the MVP must shrink
1. Creator OAuth metadata/captions import — start with hand-entered title + description, add OAuth import once a creator actually asks.
2. Automatic chapter parsing from descriptions — a manual chapter list is one text field.
3. The hybrid's Stream/Mux half entirely — YouTube embed alone covers "video is strong" for launch.

Full evidence: [`log.jsonl`](./log.jsonl), 41 entries.
