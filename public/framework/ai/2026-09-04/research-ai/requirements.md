# research-ai — brief

Read [`../mastermind-platform/research-brief.md`](../mastermind-platform/research-brief.md) first (shared rules, deliverable shape, method). Topic dir: `public/imagine/platform/research/ai/`. Task dir: this one.

**The question (your log's seed line):** What can fal.ai do for topics, images, content and moderation, at what cost, and where must the key never go?

## Start from

- The owner has a fal.ai account: an MCP endpoint (`https://mcp.fal.ai/mcp`) configured in a neighbouring project and a `FAL_KEY` in the environment. ⚠ Never print, copy or write the key or the bearer token anywhere — not in a log entry, a page, a task line or a scratch file. You do not need it: this is research, not calls.
- `public/framework/ext/Ask/readme.md` (the browser → Claude bridge the site already has), `public/framework/ext/Research/readme.md` (the MCP writers), `Server/plugins/MCP.js` — what the site already exposes to an AI.
- The brief §6, §8, §22 (in `../mastermind-platform/requirements.md`).

## Questions — a closed list

1. **fal.ai, the catalogue.** Model families (image generation and editing, video, audio/TTS/STT, 3D, upscaling, background removal, LLM proxies); pricing per call or per megapixel/second for the three or four models that matter here; the queue API (submit → poll/webhook), latency, rate limits; storage of outputs (their CDN retention vs copying to R2); the MCP — what it exposes and whether a browser client could ever use it (no: say why).
2. **Where the key lives.** Server-side only: a Worker secret, a signed short-lived job token for the browser, cost caps per user/day, abuse (a public image generator is a free GPU for the internet). The exact shape of a safe `/api/generate` path.
3. **Topic and subtopic creation.** AI-drafted topic pages (an outline, a 10-minute intro, a subtopic map) from a name — which model (Claude via the API, since Ask already exists?), cost per draft, the human-in-the-loop gate. Duplicate/typo detection at topic creation (embeddings — Workers AI or fal? cost per 10k topics). Wiki generation: the plagiarism/hallucination risk stated plainly.
4. **Content assistance.** Summaries, titles, chapters from a transcript (the video topic hands you transcripts), alt text, translations; cost per 1k posts.
5. **Moderation.** Workers AI Llama Guard, OpenAI moderation endpoint (free tier?), Perspective API, image safety classifiers (fal or Workers AI) — latency and cost on the message path vs async; false-positive handling; what must stay human.
6. **Interactive and visual.** Image generation for topic art and badges (the owner has badge designs — AI as variation, not origin), 3D asset generation for the WebGL idea, and the licensing of generated output (fal's terms; model licenses — commercial use allowed?).
7. **Cost table.** Per 1k users/month at a stated activity mix, for the recommended set.
8. **Cloudflare Workers AI as the alternative** for the same jobs — one comparison table, price and quality.

## Challenge

That fal.ai is the right primary provider (vs Workers AI, vs Replicate, vs direct model APIs). AI-generated wikis. AI moderation as the first line rather than the last. Any AI in the MVP at all.

## Numbers to bring back (url + date)

fal price for one 1024² image on the flagship model and one budget model; fal queue rate limit; Workers AI price per 1k neurons / per image; Llama Guard cost per 1k messages; OpenAI moderation price; embeddings price per 1M tokens.
