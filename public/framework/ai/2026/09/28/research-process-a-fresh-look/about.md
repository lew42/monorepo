# Research process: a fresh look

**The run did what was asked, for $10.61 of $15. The fresh-eyes round was worth it, the page is a good start, and the missing piece is "research from any card".**

A cold review of the [harness research run](/framework/ai/2026-09-28/harness-research/) (2026-09-28). Reviewer: `minion-research-process-review`, who took no part in the run.

## 1. Asked vs done

| The owner asked for | Done? | Evidence |
|---|---|---|
| A task, run by a mastermind | yes | [task.jsonl](/framework/ai/2026-09-28/harness-research/task.jsonl) |
| Use the Research system | yes | [/framework/research/harness/](/framework/research/harness/): 7 sub-areas, 111 nodes |
| Use a worktree | partly | Only the page work ran in a worktree (`qf-2`). The research itself wrote no code, so it needed none. |
| OpenRouter or direct: feature parity, cost | yes | [sub-area `qnjkd`](/framework/research/harness/#qnjkd) |
| OpenRouter's agent package or our own harness | yes | [`qgyhm`](/framework/research/harness/#qgyhm) |
| Harness parts: files, skills, MCP, loop, compaction, sessions, cost | yes | [`q2iwg`](/framework/research/harness/#q2iwg) |
| Permissions and sandboxing; node rather than bash | yes | [`q267z`](/framework/research/harness/#q267z) |
| A model switcher for chat and dictation | researched, not built | [`qg9ju`](/framework/research/harness/#qg9ju); step 5 of the [plan](/framework/ai/2026-09-28/harness-research/plan.md) |
| Fleets of models that cross-check each other | researched, not built | [`q6h59`](/framework/research/harness/#q6h59); step 3 of the plan |
| Round 1: one Opus and one Sonnet | yes | two scouts, $2.79 |
| Round 2: fresh eyes judge the plan | yes | one fresh Opus, $1.13 |
| Judge each claim: true? logical? disputable? | yes | every support or dissent has `true:` `logic:` `useful:` |
| The Servex mastermind reviews it | yes | [architect-review.md](/framework/ai/2026-09-28/harness-research/architect-review.md), folded into the plan |
| Build a review process into tasks | yes, by another task | [Server/doc/review.md](/Server/doc/review.md): sizes none, light, full; full has screenshots and the navigation questions |
| A minion designs structured content | running elsewhere | `minion-structured-content-design`, under the Servex mastermind |
| The research page shows structure, not paragraphs | partly | tree first, but see section 3 |
| Document what works, with the Servex mastermind | partly | Gaps were logged in the task log, and the readme got one line. [process.md](/framework/ext/Research/doc/process.md) still describes an older recipe. |
| Research on any card, at any time | no | section 4 below |
| Be efficient | yes | $10.61 of the $15 budget; only the page minion overspent ($3.81 against $2) |

## 2. How the process ran

```
task-mastermind-harness-research   Opus    $2.89   wrote 3 briefs, the verdicts, the summary, plan.md
├─ Round 1 (in parallel, fenced by sub-area)
│  ├─ opus scout     Opus    $1.15   read: owner words + outline + web   wrote: 22 nodes (qnjkd, qgyhm, q6h59)
│  └─ sonnet scout   Sonnet  $1.64   read: owner words + outline + repo  wrote: 28 nodes (q2iwg, q267z, qqtqi, qg9ju)
├─ Round 2 (fresh eyes)
│  └─ fresh-eyes     Opus    $1.13   read: outline only + owner words, spot checks   wrote: 48 support, 3 dissent, 2 new nodes, votes
├─ Verdicts + summary  (the mastermind)   29 verdicts, a 7-line summary, plan.md
├─ Architect review   mastermind-servex   7 points, all folded in (cost not on this task)
└─ Page (in parallel with rounds 1-2)
   └─ research-page  Sonnet  $3.81   read: brief + page   wrote: Research.js + Research.css in worktree qf-2, 4 screenshots
                                     Total $10.61
```

## 3. What worked, what didn't

**Fresh eyes: worked.**
- It read only the outline, so it could not just agree with the scouts' reasoning.
- It found real corrections: CLAUDE.md only loads for some roles; the Windows sandbox question does not arise; `jobs.js` is not pure node.
- Its own mistake (a `canUseTool` fence, which `bypassPermissions` skips) was caught by the architect. So a third, different reader earned its place.
- Watch: it supported 48 of 51 claims (94%). A mostly-"yes" reviewer is cheap to fake. The next run should tell the reviewer that a dissent is a good result.

**True / logical / useful, judged separately: worked, but in the wrong place.**
- The split made reviewers say things like "true but irrelevant". That is the point of it.
- It lives as text inside `why`, because the Research schema has no fields for it. Credence has the same problem. The page parses the text back out, which is fragile.
- The research skill's credence words (`speculation`) and the brief's words (`unknown`) disagree.

**The page as structure: a good first step.**
- The sub-areas come first as a grid, each with a claim count. Clicking one opens its claims, with its own URL.
- All seven icons are the same question mark, so the icons carry no meaning.
- The tallies are bare symbols (`√ 3 · ⏸ 1`) with no labels.
- The summary lines do not link to the sub-area they come from.
- The real outcome, the [build plan](/framework/ai/2026-09-28/harness-research/plan.md), is not on the page at all.
- At 3440 wide, 75% of the page is empty (the layout check).

**Cost: good.** $10.61 for 111 nodes and a build plan. Research cost $5; the page cost $3.81, more than both scouts together.

**Friction:** Servex refused the task mastermind's message to `mastermind-servex-3`, so the review went through `mastermind-servex` instead.

## 4. Research on any card, at any time: the smallest design

**The idea:** a **Research this** button on any card. It makes a sub-card that holds one research topic about that card, and runs a fixed two-round recipe on it. The result appears on the sub-card, and one summary line goes back on the parent card.

```
Research this  (a button on the card, or the MCP tool research_card)
├─ 1. Make a sub-card:  type "research", parent = the card, research.jsonl in its folder
├─ 2. Say the cost first:  "about $4 with 2 scouts + 1 fresh reviewer"; the owner can change it
├─ 3. Round 1, scouts:  one Opus (the web) + one Sonnet (the repo), each fenced to its sub-areas
├─ 4. Round 2, fresh eyes:  one agent of a different model, reads the outline only; true / logic / useful
├─ 5. Verdicts + summary:  the orchestrator; the sub-card shows the tree
└─ 6. Report back:  the summary line is appended to the parent card; "Dig deeper" on any node = another round
```

**What would have to change:**

| Where | Change |
|---|---|
| **ext/Research** | 1. A topic can live in any folder (a card's), not only `research/<slug>/`. 2. Real fields: `credence` on a node, and `true` `logic` `useful` on a support or dissent, instead of text inside `why`. 3. The Research view renders inside a card, from a placed `research.jsonl`. 4. Icons per sub-area; labelled tallies; summary lines link to their sub-area. |
| **Servex** | 1. A `POST /card/research?id=` route and a `research_card` MCP tool: make the sub-card, run the recipe, append the summary to the parent. 2. The recipe as code (a script or Workflow), not a mastermind improvising it; this is the "next step" [process.md](/framework/ext/Research/doc/process.md) already names. 3. Cost is written to the sub-card as it runs. 4. The research orchestrator may message the Servex mastermind (today's refusal). |
| **Skills** | 1. `research`: a section "on a card" with the two-round recipe as the default, one set of credence words, and "a dissent is a good result". 2. `process.md` rewritten to the recipe that actually ran. 3. `minion` and `sub-mastermind`: one line, "when a question would change what you build, call `research_card` on your card". |
| **AI 2 (the dashboard)** | The button, and a `research` card type that shows the tree. |

## 5. Other ways agents can reach a consensus, and web search for other models

Today's recipe is scouts, then a skeptic, then the orchestrator's verdicts. These are other recipes we could offer on a card. Each one fits the same `research.jsonl` tree, so the page needs no change.

| Method | How it runs | Best for | Rough cost vs today |
|---|---|---|---|
| **Debate** | Two agents argue for and against one claim for 2–3 turns. A third agent, which read only the transcript, judges. | A yes/no build decision ("proxy or own harness?") | Similar, but only on one node |
| **Peer read, then revise** | Each scout reads the others' outline and may revise its own claims once. Revisions are new nodes, never edits. | Catching claims two scouts disagree on without noticing | +1 cheap round (Sonnet) |
| **Voting with caveats** | 3–5 agents from different model families each vote on every claim. A vote has to name its condition ("yes, if X"). The caveats become child nodes. | A wide list of claims, where a single reviewer is too agreeable (48 of 51 today) | +$1–3 through OpenRouter's cheap models |
| **Staged naming votes** | Agents propose names, then vote to cut the list to 3, then to 1. The owner sees the final 3. | Names for things (what the owner asked for on layouts) | Small: one-line answers |
| **Red team one claim** | One agent is told only "find why this is wrong". | The 1–3 claims the plan rests on (for example `cjuqp`, the proxy route) | About $0.50 per claim |
| **Mixed-family jury** | The same fresh-eyes brief goes to Opus, GPT and Gemini. We keep only what 2 of 3 agree on, and record the splits as `contested`. | Checking whether one model family has a blind spot | About 3× round 2, before any fleet |

**How web search works for models that are not Claude.** Today our agents search with Claude's own WebSearch tool. A model reached through OpenRouter needs one of these three routes:

| Route | How | Cost | Watch out |
|---|---|---|---|
| **OpenRouter's web plugin** | Add `:online` to the model slug, or turn on the `web` plugin. OpenAI, Anthropic, Google, Perplexity and xAI models use their provider's own search. Every other model gets Exa. | Exa: $0.007 per request with up to 10 results, then $0.001 per extra result. Parallel: $0.001–0.005. Perplexity: $0.005. Provider's own search: the provider's price, set by how much search context you ask for. | It searches once, before the model answers. The model cannot decide mid-task to search again, so this is a poor fit for a research loop. ([docs](https://openrouter.ai/docs/guides/features/plugins/web-search)) |
| **A search tool in our harness** | Our own `web_search` / `web_fetch` tool (a node function, like the other Servex tools) that calls a search API. The model calls it whenever it wants. | The API's price, around $5–8 per 1,000 searches (below) | This is the route that behaves like Claude's WebSearch. It works the same for every model. |
| **A paid search API** (behind the tool) | Brave, Tavily or Exa | Brave: $5 per 1,000, with $5 free each month. Tavily: $5–8 per 1,000. Exa: from $7 per 1,000, plus extras. | Figures come from third-party comparisons, not the providers' own pages. Check them before the tool is built. |

**Recommendation:** build one `web_search` tool in Servex backed by Brave (the cheapest, with a free monthly credit). A research round with ~50 searches then costs about $0.25 for search on any model. Use `:online` only for one-shot questions.
