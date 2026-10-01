# Snapshot: the OpenRouter/harness state

The condensed, cited state a fresh mastermind starts from. Built from the closed research round
at [`research.jsonl`](/framework/research/harness/) (203 lines), the build order in
[`plan.md`](/framework/ai/2026-09-28/harness-research/plan.md), and the architect's corrections
in [`architect-review.md`](/framework/ai/2026-09-28/harness-research/architect-review.md).

**Full answer, one line:** don't build a harness first — proxy the Claude Agent SDK through
OpenRouter for non-Claude models, keep Claude on the subscription, and build our own loop only
where that proves broken.

Organized under the plan's six-step build order, since that's the order these get acted on.
Each line: the claim, its credence word (copied straight from the research log — **established**
/ **contested** / **unknown** — never invented), and its source: a research node id, plus a
source-library slug where the research cites a URL that's now saved in
[`sources/`](sources/readme.md).

## Step 1 — Proxy spike, as a real Servex agent

- **established** — The Claude Agent SDK already runs against OpenRouter by setting
  `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN`; Servex already spreads a per-agent `env` into
  `query()`. [`cjuqp`; source: `claude-code-integration-guide-openrouter`]
- **established** — `@openrouter/agent` (OpenRouter's own package) lacks file/shell tools,
  context compaction, session persistence/resume, and CLAUDE.md/skills loading — exactly the
  parts the owner listed as required. [`cs3o9`]
- **contested** — That route keeps sessions/resume/fork/compaction/skills/hooks for free, but
  ties every model to Claude Code's own prompt and tool shapes, which other models weren't tuned
  for; caching may not even apply through the Anthropic skin. Unmeasured. [`ckwc5`]
- **unknown** — Whether a non-Claude model (GPT, Gemini, Grok) finishes a real minion brief
  through the proxy at merge quality is untested; one measured run per model answers it.
  [`q0snn`]
- **accepted in round 2** — opencode (provider-agnostic, OpenRouter-capable, its own sessions +
  auto-compaction) is a ready-made second arm to run beside the SDK proxy in the same spike — if
  it finishes the brief well it may replace most of what we'd build. [`ah7hc`]
- **established** — OpenRouter's `usage.cost` (with cached/reasoning token counts) arrives free
  on every reply; log that number, not the Agent SDK's own `total_cost_usd`, because the SDK
  prices a proxied turn with Anthropic's own price table applied to the wrong model name — it
  will be wrong from run one. [`c4kxq`; architect-review point 3]
- **established (architect correction)** — Run the spike as a real `spawn_agent` with its own
  `env` — not a side script — so the same run proves what Servex actually depends on: resume
  after a Servex restart, a wake when the turn ends, and a turn against the real 50+-tool MCP
  surface (this is where Gemini/GPT tool-schema limits would show up, not on a toy brief). The
  OpenRouter key lives in LOCALAPPDATA, never the repo, and the agent carries no Claude login, so
  a subscription token can never reach OpenRouter. [architect-review points 1–2]

## Step 2 — The provider field goes live

- **established** — `tiers.js` already has a `provider` field nothing reads yet; `Agents.spawn()`
  should pick the backend from it. Its own comment calling this a "one-line change" is untrue
  until a reader exists. [`cx5h6`]
- **established (round-2 correction folded in)** — The SDK import surface to cover is three
  files, not one: `Agents.js`, `jobs.js`, `tools.js` (round 2 rejected the earlier one-file count,
  `cihlr`, as wrong). [`de2ph`; `adijt`]
- **established** — Claude stays on the subscription (usage windows, not dollars); per-token
  Claude through any gateway could cost far more for the same work — this is unmeasured, so
  don't move Claude traffic off the subscription before measuring a token day. [`ca7gw`]

## Step 3 — Cross-family review (not a new build)

- **established** — LLM judges favor their own output and their own model family, and stronger
  models show more of it; this backs the owner's instinct that the writer shouldn't review its
  own code. [`crbjz`]
- **contested** — Mixing model families is the one change that reliably helps debate/review
  quality, per two independent studies — but they measured QA/reasoning benchmarks, not code
  review, so the transfer to our tasks is unproven. [`c0ptu`]
- **contested** — Free-form debate often loses to a simple majority vote at higher cost; the
  design the evidence backs is independent blind drafts, then one reviewer per draft against a
  fixed rubric (true? logical? useful?), then one judge — not open chat. [`cjlpv`; `com6s`]
- **accepted (architect)** — Not a new build: `Server/review.mjs` already takes `--model`, so
  cross-family review is that flag plus the provider from step 2. [architect-review point 5]
- **unknown** — Does mixed-family review actually catch more real defects than a fresh
  same-family Opus review, on OUR tasks (not benchmarks)? Needs a measured A/B on landed tasks
  with known bugs before fleets become the default. [`qaoza`]

## Step 4 — A path fence

- **established** — "Don't edit outside your fence" is enforced only by the minion skill's prose
  today; no tool-layer check stops a Write or Edit outside the brief's stated files. [`cqabo`]
- **established (architect correction)** — Fix with a PreToolUse hook in `Agents.js` (it already
  has one for forks), not `canUseTool` — agents run in `bypassPermissions`, which skips
  `canUseTool` entirely. [`ceq98`; architect-review point 4]
- **established** — Worktrees (their own port, their own dev server) stay the real hard boundary;
  the hook closes the one real gap round 2 found, and every fence miss seen so far was an honest
  mistake, not a malicious escape. [`cbseb`; `ag21n`]

## Step 5 — Model picker on the card

- **established** — The switcher the owner means is the manager/mastermind model per card, not
  the transcription engine (Dictate.js has no model concept) and not the fast assistant, which
  stays cheap and its model stays in config. [`coks7`; `ckkc4`]
- **established** — No per-card model override exists yet (`Layers.js`/`registry.js` grepped
  clean); the picker belongs at card *creation* as well as in the card's existing chrome, with
  OpenRouter model slugs as the options — not the four Anthropic tiers a first pass proposed
  (round 2 rejected that narrower version, `am32f`, for exactly this reason). [`ccnix`; `d9rz5`]
- Last in the build order on purpose: it's AI-2 UI, and that page's owner isn't running yet.
  [`plan.md`]

## Step 6 — Our own loop (build only where the proxy fails)

- **established** — Everything except `query()` itself — skills-as-first-message, node-tool MCP,
  worktree fencing — is already our own code sitting on top of the SDK; only the model call
  underneath is provider-specific. [`aonya`, merged into `adijt`]
- **established** — A full SDK replacement means rebuilding, per provider: the long-lived
  streaming-input session, session-id issuance with resume/fork, and the typed result event
  carrying cost/turns/duration. [`c0lzh`]
- **contested** — A rough engineering estimate, not a measurement: a bare tool loop is about 100
  lines, but compaction, resume, permissions and MCP each took the Agent SDK real work — build
  only the parts the proxy route proves broken. [`cd7rg`]

## Also load-bearing, outside the six steps

- **established** — Sessions, fork, resume, per-turn cost, and MCP-as-in-process-node-functions
  already work through the Agent SDK today — proven in the code (`Agents.js`), not aspirational.
  [`cyigj`; `cgpix`; `cdyvv`]
- **unknown** — Whether any OpenRouter-facing SDK or gateway matches the Agent SDK's automatic
  compaction + CLAUDE.md re-injection, or whether leaving Anthropic means building a summarizer
  ourselves, is unanswered — the opencode arm of the step-1 spike is the first real data point.
  [`q1yg2`]

## Must-haves for any programmatic loop (the owner, dictated 2026-09-28, folded into the review)

- **Events, not timed wakes** — node reacts to an agent message (turn ended, tool called,
  finish-step) the moment it happens.
- **A step loop in code** — node sends step *k*, the agent calls a `finish_step` tool, node sends
  step *k+1*. Which step comes next is node's decision, never the model's.
- **A heartbeat** — check every agent about once a minute, nudge it after 5 silent minutes,
  escalate to "Waiting on you" if it stays silent. Task-loop already builds this for today's SDK
  agents; the harness reuses it rather than building a second one.
- **Model-agnostic** — all of it is plain node reacting to agent messages, so it works the same on
  the Claude SDK, OpenRouter, or a local model.
  [architect-review points 9–12]

## Still open

The `unknown`-credence questions the research never closed:

- `q1yg2` — does any OpenRouter-facing SDK/gateway offer compaction + CLAUDE.md re-injection
  equivalent to the Agent SDK's?
- `q0snn` — does a non-Claude model finish a real brief through the proxy at merge quality? (step
  1's own measured run answers this)
- `qaoza` — does mixed-family review catch more real defects than a fresh same-family review, on
  OUR tasks specifically?
- `q2uix` — exactly where does the model picker live in the UI? Partly answered by the owner's
  own words (at card creation), but the full placement is still open.
