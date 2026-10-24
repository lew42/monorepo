# Models: which agent runs on what

The table is drawn from `now.json`, which `node Server/ModelsNow.mjs --write` computes (roles.js, the live registry, the OpenRouter spend log, `usage.json`). The switch between Claude and OpenRouter is explained in [Servex/ext/openrouter/readme.md](/Servex/ext/openrouter/readme.md). Benchmarks (which model is best value) are at [ai/doc/models.md](../doc/models.md).

- **Review, 2026-10-13** ([review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/review.md)): the page drew its tables after an `await`, so they landed outside the page; now the box is captured first. The AI tab bar still lights INBOX on this page (it is not a tab).

**Temperature (checked 2026-10-22):** the Agent SDK we spawn with passes no `temperature`, `top_p` or `top_k`, and Anthropic's newer models reject non-default values with a 400 (only 1.0 is accepted); extended thinking also requires the default. The default 1.0 is not a low-randomness setting: repeated runs already differ. For varied answers, vary the prompt or framing and count the answers several independent agents agree on. Sources: [Anthropic extended thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking), [Bedrock extended thinking](https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-extended-thinking.html), [ComfyUI #13923](https://github.com/Comfy-Org/ComfyUI/issues/13923).

## Who builds a slice (current verdict, weak: one run each, different tasks)

- **Opus high, one builder that designs and builds:** use it when the builder must make design calls, such as a page's shape or where data is read from. On the review page ([experiment line](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/review-page/)), it cost $13.83 over about 35 minutes, of which about 10 were lost to a course change. It made sound calls on its own (approvals read from one file per day) and fixed a bug it found (a row link drawn outside its row). It reached 293k tokens of context, so it relies on compaction before sleep.
- **Sonnet medium, building a design already decided in the brief:** use it when the brief settles the design. The triage of the 241 proposals cost $10.72, plus $1.99 of Haiku. It skipped two tests the brief asked for and needed one round trip, so **write tests as numbered steps with their proof**, not as a sentence in "How".
- **Not measured yet:** an Opus planner with Sonnet builders on the *same* task. The task queue's first slice (Sonnet, design partly open) is the next data point.

## Later

- ⬜ **"Echo": a planner sidecar.** The same prompt goes to a fast coordinator (Opus, medium or high) and to an extra-high planner that writes only plans in its own folder; the coordinator compares them, keeps what they agree on and decides the rest. Try it once on a planning task and measure cost against what the plan caught. ([your words](/framework/ai/sessions/2026/10/20/session-e00f55c9/), prompts.jsonl 2026-10-24T00:20:16Z)
