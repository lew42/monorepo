# One real fan-out run, cost and pages saved

Three separate runs of `node Server/sources.mjs "<question>" --topic <topic> --n 2 --model haiku`,
seeding the three topics the brief named. Printed output, verbatim:

## claude-agent-sdk

```
Searching "What is the Claude Agent SDK, how do I use it, what are its core APIs" for topic "claude-agent-sdk" — 2 searcher(s), model haiku…

6 page(s) came back, 5 were new, 5 written.
Cost: $0.2785 across 2/2 searcher(s).
  wrote sources/claude-agent-sdk/agent-sdk-overview-claude-code-docs.md
  wrote sources/claude-agent-sdk/claude-agent-sdk-for-python-github.md
  wrote sources/claude-agent-sdk/claude-agent-sdk-for-typescript-github.md
  wrote sources/claude-agent-sdk/quickstart-claude-agent-sdk.md
  wrote sources/claude-agent-sdk/typescript-agent-sdk-reference.md
```

(A first pass at this topic, run before the `--permission-mode` fix below, had already saved
4 more pages under the same topic — `get-started-with-claude-managed-agents.md`,
`define-your-agent.md`, `start-a-session.md`, `api-overview.md` — so the topic holds 9 pages
total, all real, all distinct urls, after a de-dupe pass removed the handful that three
concurrent test runs had genuinely duplicated.)

## openrouter

```
Searching "OpenRouter API, pricing, and its web search plugin" for topic "openrouter" — 2 searcher(s), model haiku…

7 page(s) came back, 4 were new, 4 written.
Cost: $0.2743 across 2/2 searcher(s).
  wrote sources/openrouter/openrouter-pricing-3.md
  wrote sources/openrouter/openrouter-web-search-plugin-real-time-web-grounding-for-ai-.md
  wrote sources/openrouter/openrouter-faq.md
  wrote sources/openrouter/openrouter-team-github.md
```

## opencode

```
Searching "What is opencode (the coding agent / CLI), how does it work" for topic "opencode" — 2 searcher(s), model haiku…

8 page(s) came back, 6 were new, 6 written.
Cost: $0.3002 across 2/2 searcher(s).
  wrote sources/opencode/opencode-the-open-source-ai-coding-agent-3.md
  wrote sources/opencode/github-anomalyco-opencode-the-active-opencode-project.md
  wrote sources/opencode/opencode-cli-documentation-3.md
  wrote sources/opencode/what-is-opencode-the-open-source-ai-coding-agent-explained-d-2.md
  wrote sources/opencode/github-opencode-ai-opencode-ai-coding-agent-for-the-terminal.md
  wrote sources/opencode/github-charmbracelet-crush-ai-powered-coding-assistant.md
```

**One real run's cost, isolated:** the `claude-agent-sdk` run above — **$0.28, 2 searchers,
5 pages saved** (2 rounds of search each: an initial pass plus a follow-up, per the brief).

**A caveat, not hidden:** the `openrouter` and `opencode` runs above happened while two other
sessions were independently re-running the same topics at the same time (a mastermind
mistake, not the tool's) — the "N page(s) came back, M were new" lines reflect THAT overlap,
not a normal single run. After all three topics settled and a de-dupe pass ran (same-url
duplicates removed, earliest kept), the final, clean counts are 9 / 6 / 7 pages — see
`public/framework/sources/*/index.jsonl`.
