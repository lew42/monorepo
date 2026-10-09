# How the AI system evolved — main events only

One line each: the problem, what we did, where to read more. Links only; nothing copied. Dates are the task folder's date.

- **Context windows fill up** → long sessions re-read everything every turn. We keep sessions short, hand off by note, and treat Haiku's 100k line as a hard budget. [../tokens/context-window.md](../tokens/context-window.md)
- **Agents wrote raw JSON by hand** → torn lines broke live pages. Writes now go through one validating tool (`append.mjs`, `append_log`, the page tools). [Servex/doc/inbox.md](/Servex/doc/inbox.md), [../design/tooling-architecture.md](../design/tooling-architecture.md)
- **Model latency and cost** (2026-09-19) → we measured Sonnet against Haiku and chose per job. [model-latency](/framework/ai/2026-09-19/model-latency/)
- **OpenRouter trial** (2026-09-29 to 09-30) → we tried cheaper routed models, kept a research brain and a test harness. [openrouter-brain](/framework/ai/2026-09-29/openrouter-brain/), [openrouter-harness](/framework/ai/2026-09-30/openrouter-harness/), [Servex/ext/openrouter](/Servex/ext/openrouter/)
- **Voice dictation** → the owner talks instead of types, so dictation became a pipeline (Whisper, Dictate, Refine). [prompt-refine](/framework/ai/2026-09-29/prompt-refine/), [ux/Dictate](/framework/ux/Dictate/)
- **The usage wall** → weekly and 5-hour limits stopped work. Pace (used share over elapsed share) is now checked before every spawn by `node Server/usage-now.mjs`. [usage skill](/framework/ai/2026-08-15/usage-skill-pacing/)
- **Opus spend** → most spend was Opus, so Sonnet is the default and Haiku does scans. [../tokens/tokens.md](../tokens/tokens.md), [../tokens/tokens.md](../tokens/tokens.md)
- **Two card stores, two dashboards** → AI 2 and AI overlap; the data is merged, the UI is not. [../ai2/ai2-vs-ai.md](../ai2/ai2-vs-ai.md)
- **Polling instead of streaming** → stale screens. Converging on `ext/JSONL` `live()`. [../logs/inbox-log-streaming.md](../logs/inbox-log-streaming.md)
- **Readmes too long to scan** (2026-10-08) → the iceberg rule: short index per system, detail one click down. [systems-map.md](../systems-map.md), [architecture.md](architecture.md)

Add a line when something changes how the system works; keep it to the problem, the fix and a link.
