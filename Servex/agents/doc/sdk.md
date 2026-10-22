# What the Claude Agent SDK can do here (tested facts)

Servex spawns every agent through the Claude Agent SDK on the Max subscription (no API key). Each line is a tested fact with its date; add to it when a probe answers a question.

- **Web search and fetch work on the subscription** (2026-10-22, a Haiku probe): `WebSearch` and `WebFetch` are deferred tools (loaded with `ToolSearch`); no API key, no error, and the usage counted 0 paid server searches. Cost is the agent's own context, not the search: about $0.20 for a 7-call probe, almost all of it a re-read of its 35k-token startup context. A search returns titles, links and a summary; the agent picks what to fetch, and a fetch returns a summary of the page, not the page.
- **No sampling settings** (2026-10-22): the SDK passes no `temperature`, `top_p` or `top_k`, and newer models reject non-default values anyway; extended thinking needs the default too. For varied answers, vary the prompt and count agreement across agents. Sources in [ai/models](../../../public/framework/ai/models/readme.md).
- **Cloudflare Markdown for Agents** converts a web page to markdown at the edge (beta, free on paid plans; changelog 2026-10-09): a cheap way to save a research source.
