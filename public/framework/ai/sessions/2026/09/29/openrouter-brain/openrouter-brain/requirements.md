# OpenRouter brain: a knowledge base that outlives the research

**Card:** 2026/09/29/openrouter-brain-a-knowledge-base-that-o (read owner-words.md there first).
**Goal:** one folder a fresh "openrouter" mastermind reads to become the expert on our OpenRouter system: every source, decision and conclusion, with citations and a confidence.

## Where it lives
`Servex/ext/openrouter/` (Servex-side; the front end needs nothing OpenRouter-specific).
- `readme.md`: the iceberg. First, the 5–7 core concepts, each named simply (e.g. *Proxy route*, *Provider field*, *Proxied cost*, *Restart env*, *Own loop*), each one sentence plus a link down. Then "What's here" (one line per subfolder). Then "Open questions", ranked.
- `snapshot.md`: the condensed state a fresh mastermind starts from. Every conclusion carries a credence and a cited source id. Build it from `public/framework/research/harness/research.jsonl` (202 lines) and `ai/sessions/2026/09/28/11e3ca4d-25f2-443f-bd31-a9f638890021/harness-research/{plan,architect-review,owner-words}.md`.
- `sources/readme.md`: an index into the ONE source library at `public/framework/sources/` (openrouter, opencode, claude-agent-sdk). Don't copy the files: the library stays the single store. Each row gives the id, title, domain, author, date, url, and which conclusions cite it.
- **Missing sources:** save every URL the research cites that has no markdown copy yet, through the source-library's own writer (read `public/framework/sources/readme.md`). The first one: openrouter.ai/docs/cookbook/coding-agents/claude-code-integration, the basis for "the Agent SDK runs on OpenRouter".
- `decisions/`: empty with a readme for now. The decide-tool task writes it later.
- A skill `.claude/skills/openrouter/SKILL.md`, a few lines: "You are the OpenRouter mastermind. Read Servex/ext/openrouter/readme.md, then only the readme below it that your question needs."

## Land
The readme fits one screen. A test: spawn a fresh Haiku with only the skill, ask it "Can the Claude SDK run GPT through OpenRouter, and what breaks?", and check its answer cites the snapshot correctly. Report on the card. Run finish-task.
Model: Sonnet, medium. Fence: Servex/ext/openrouter/**, public/framework/sources/** (new files only), .claude/skills/openrouter/**.

