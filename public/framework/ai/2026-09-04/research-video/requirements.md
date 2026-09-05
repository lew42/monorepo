# research-video — brief

Read [`../mastermind-platform/research-brief.md`](../mastermind-platform/research-brief.md) first (shared rules, deliverable shape, method). Topic dir: `public/imagine/platform/research/video/`. Task dir: this one.

**The question (your log's seed line):** Can users publish video via the YouTube API through our UI, within quotas, verification and terms, or should we host it?

## Start from

- `public/imagine/youtube/` and `public/imagine/feeds/video/` — the site already has YouTube labs (embeds, marks, a player). Read their readme/page.js; say in one entry what exists and what it uses (IFrame API? Data API?).
- The brief §21 (in `../mastermind-platform/requirements.md`).

## Questions — a closed list

1. **Uploading through the YouTube Data API v3.** `videos.insert` quota cost vs the default daily quota → uploads per day per project; the quota extension process; the resumable upload protocol; uploading from the browser straight to YouTube with the user's OAuth token (CORS?) vs through our Worker (Workers request-body limits by plan — bring the number).
2. **OAuth and verification.** `youtube.upload` is a sensitive/restricted scope: app verification, the security assessment (cost and time — verify, do not guess), the "unverified app" screen, and the rule that uploads from unaudited API projects are set private until an API compliance audit — quote the exact terms.
3. **Reading.** `videos.list`, playlists, channels — quota costs; `captions.download` needs the owner's OAuth; third-party transcript scraping violates the ToS — state it plainly; chapters parsed from descriptions; thumbnails.
4. **Embedding.** IFrame Player API — no quota; the ToS constraints (no overlays, no downloading, attribution, minimum player size); privacy-enhanced mode (youtube-nocookie) for GDPR.
5. **Alternatives.** Cloudflare Stream (per 1000 minutes stored / delivered; direct creator uploads; signed urls; live), Mux, Bunny Stream — cost at 1k and 10k hours stored and watched; R2 + HLS without transcoding (say why not).
6. **The hybrid.** YouTube as host for creators who have channels (embed + metadata import + our structure) and Stream for platform-native short content (the 10-minute intro?) — or one of them only. The §33 record.
7. **Automatic structuring.** Title, description, chapters, captions → topic sections; what AI adds (leave the model choice to the ai topic).
8. **Legal.** Copyright/DMCA for user video, COPPA "made for kids" flags, the YouTube API Services terms on caching and data retention (the 30-day rule — verify).

## Challenge

"Users upload through our interface via YouTube" as an MVP feature. That YouTube hosting is free for us in any sense that matters. That transcripts are obtainable.

## Numbers to bring back (url + date)

Quota units per upload; default daily quota; Stream price per 1000 min stored and delivered; Worker request body limit by plan; verification assessment cost range; the API data retention limit in days.
