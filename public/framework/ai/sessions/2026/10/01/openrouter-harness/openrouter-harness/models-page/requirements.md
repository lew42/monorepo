# Minion brief: the Models page (value = performance ÷ cost)

Parent: `task-mastermind-openrouter`. Read the parent's `requirements.md` "Phase 8". Load the
`page`, `code`, `new-page` and `dataviz` skills before you write.

## What
ONE page that answers "which models are best for what?" with a link:
`/framework/ai/system/models/`. It's a part under the AI page's System tab
(`public/framework/ai/overview.js`, `SYSTEM_PARTS`); add it there the way the other parts are
declared.

- **Data:** read `Servex/ext/openrouter/evals/results.jsonl` (the newest line per
  model × effort × test wins) at build time, plus the price multipliers. Don't copy numbers into
  the page by hand. If the page can't fetch a file outside `public/`, write a small generator,
  `evals/models.mjs`, that writes `public/framework/ai/system/models/models.json`, and run it.
- **Performance:** great = 1, ok = 0.5, terrible or fail = 0; for rule tests, pass = 1.
  **Cost:** dollars per run. Claude is priced at Anthropic's LIST prices (the SDK's own cost
  figure), and OpenRouter models at their real billed cost. **Value** = mean performance ÷ mean
  $/run.
- **Above the fold:** one chart, value per configuration (model × effort), grouped by task kind,
  best first. Under it, one table: kind · model · effort · performance · $/run · ×Sonnet ·
  value. Then one line that says which model is best value per kind, in plain words.
- One screen, shown not told (CLAUDE.md "Presentation"). Check it at 400, 1200, 1920 and 3440.

## Fence
The qf-7 worktree. Write only `public/framework/ai/system/models/`, the one `SYSTEM_PARTS` entry
in `overview.js`, `evals/models.mjs`, and this task dir. Hold reloads while you write
(`node Server/hold.mjs`). Claude spend: keep it small, about $4.

## Reply
The page link, a screenshot at 1200, and the best-value model per kind in one line each.

## Addition (Phase 9): "How thinking works", a short note linked from the Models page
A sibling page `/framework/ai/system/thinking/` (or a Docs-tab doc; pick what the AI page already
uses), one screen with one picture. It explains what runs on the PROVIDER's server (the model's
thinking, inside one API response; the thinking level sets how much) and what runs on OUR
machine (the harness's tool loop: the model asks for a tool, the harness runs it and sends back
the result, and each round trip is one more billed model call). Say what that means for cost: a
turn with 8 tool calls is about 8 model calls. The Models page links it beside "effort".

## Addition (Phase 10): how thinking spends tokens, in the same thinking note
Four points, each checked against the provider's own docs (Anthropic's extended-thinking docs
and OpenRouter's reasoning-tokens docs), with the link, and marked where an OpenRouter model
differs:
1. Thinking is billed as OUTPUT tokens.
2. In a tool loop, earlier thinking is sent back as input: mostly cached, often trimmed.
3. Streaming can be cancelled, but a thought can't be steered mid-way.
4. With interleaved thinking, the model thinks between tool calls (e.g. after each web search).
Also: the Models page reads test runs from `public/framework/ai/tests/*/page.jsonl` (one line per
run, after line 1) as well as results.jsonl. minion-test-library is moving the tests there.
