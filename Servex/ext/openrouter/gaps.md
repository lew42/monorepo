# Provider gaps: what breaks when a model runs through OpenRouter

Each gap below says what fails, why it fails, how we work around it, and where the evidence is.
Every workaround applies to OpenRouter agents only (`provider === "openrouter"`). Claude agents,
meaning the masterminds, the assistants and Claude minions, see exactly the tools and settings
they always had.

| # | Gap | Models | Workaround | Status |
|---|---|---|---|---|
| 1 | Gemini refuses one built-in tool's schema | `google/*` | that tool is turned off for Gemini only | worked around |
| 2 | The SDK's own cost figure is wrong | all | we ask OpenRouter for the real cost | worked around |
| 3 | The real cost arrives 5–20 s after a turn ends | all | read it from the ledger, not at turn end | worked around |
| 4 | Gemini 3.8 Flash stalled on the append test | — | it was our test's bug, now fixed | not a gap |
| 5 | Long sessions: compaction through the proxy | all | none | untested |
| 6 | Does `effort` reach a non-Claude model? | all | none | untested |

## 1. Gemini refuses the ArtifactData tool's schema

- **What fails:** every Gemini turn ends before it starts, with a 400 error
  (`tools[..].items.items` missing).
- **Why:** the Claude CLI's built-in `ArtifactData` tool describes one array with `prefixItems`
  and no `items`. Gemini's API requires `items` on every array. Anthropic and OpenAI accept it.
- **Workaround:** `disallowed_tools_for()` in [`provider.js`](./provider.js) returns
  `["ArtifactData"]` for `google/*` models. `Agents.js` `options()` adds it only when
  `this.provider === "openrouter"`. Gemini agents lose ArtifactData, which our minions don't use.
- **Evidence:** the spike: 0 tools before the fix, 3 tools plus edit plus resume after
  ([`spike.jsonl`](../../../public/framework/ai/2026-09-30/openrouter-harness/spike.jsonl)).

## 2. The SDK's `total_cost_usd` is wrong for proxied turns

- **What fails:** the SDK prices every token at Anthropic's rates, whatever model actually ran.
- **Workaround:** `real_turn_cost()` adds up OpenRouter's `GET /api/v1/generation?id=` for every
  model call in the turn. If any call is missing, it falls back to the difference in the key's
  total spend. A turn often makes many calls: one review turn made 45. Costs recorded before
  2026-10-01 05:00Z counted only the last call, so they are too low.

## 3. The real cost settles a few seconds after the turn

- **What fails:** anything that reads an agent's `cost` the moment its turn ends gets 0 or the
  previous turn's figure. The first rule-test reruns recorded `cost_usd: 0` this way.
- **Workaround:** the settled figure is written one line per turn to Servex's `openrouter` log
  (`%LOCALAPPDATA%\lew42\servex\logs\openrouter.jsonl`, keyed by agent id). Eval scripts read it
  from there.

## 4. Not a gap: the Gemini 3.8 Flash stall

- The `rule-append` test asked for a line with a key that task.jsonl's schema doesn't allow, so
  `append.mjs` refused it for every model. Gemini ran the right command, was refused, and spent
  its 3-minute turn working out why. After the test was fixed in `rules.mjs`, all 7
  model × effort combinations passed 5 of 5.

## 5 and 6. Untested

- **Compaction:** no proxied session has run long enough to compact, so we don't know whether the
  summary call works through OpenRouter.
- **Effort:** we pass `effort` and the low and high runs cost differently, but we haven't checked
  that OpenRouter maps it to each model's own reasoning setting.
