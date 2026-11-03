# Plan: make agent context visible (2026-10-22)

The maps: [agent-context.md](/framework/ai/doc/agent-context.md) (roles, loading, what is logged) · [tools-map.md](/Servex/doc/tools-map.md) (about 100 tools, compacted set) · [Item map](/framework/core/Item/doc/map.md). Nothing is built. Each slice below is the smallest first step; all of them are Servex-side (one restart each, grouped into three).

## What the maps found

- The chain follows the task folder, so a task agent never gets its module's readme (this agent: 4 readmes, 8,149 tokens, none about `Servex/agents`). The spawner naming extra readmes is the fix and is slice 2.
- The 12,000-token cap is not needed: of 403 readme folders measured by [`chain-sizes.mjs`](chain-sizes.mjs), the largest chain is 10,420 tokens, median 5,129, p90 6,945, none over 12,000, 13 over 8,000. The cost is the same top four readmes for everyone (`ai/readme.md` 3,301 tokens, `ai/sessions/readme.md` 1,883). Keep the cap as a safety at 15,000 or drop it; shrinking the `ai` readme saves more than any cap.
- `log` (stamped, schema-checked) and `item` already exist; only node-side logging of context is missing.
- A hook can inject text: `additionalContext` on PreToolUse/PostToolUse, in the SDK types.

## Slices, in order

| # | Slice | Smallest first step | Cost | Lives in |
|---|---|---|---|---|
| 1 | **Log context at spawn** (node, no model) | In `Agents.spawn`, after `first_prompt`, append one line to the task's `session.jsonl`: `{context:{readmes:[{path,tokens}], skills:[…], role, claude_md:bool, tools:N}}` through `LogLine`; add the `context` verb to `jsonl-schema.mjs` and to `SessionRecord.TAG_VERBS` | about 1 hour; one restart | `Agents.js`, `readme-chain.js` (return the parts, not only text), `.claude/hooks/jsonl-schema.mjs` |
| 2 | **Spawner names extra readmes** | `spawn_agent` gets `readmes: ["Servex/agents", …]`; `Agents.spawn` appends each (whole) after the chain as `## <path>`, logged in the same `context` line; unknown path refused with the reason | about 1 hour; same restart | `tools.js` (schema), `Agents.js`, `readme-chain.js` `first_prompt(dir, extras)` already takes extras |
| 3 | **One generic `log` kind** | Extend the existing `log` tool: `{kind, data}` besides `{path, line}`; `kind` is `context`, `read`, `spawn`, `skill`, validated by the same schema; node callers (slice 1) use `LogLine` directly, agents rarely need it | half a day | `tools.js` `log_tools`, `Server/LogLine.mjs`, `jsonl-schema.mjs` |
| 4 | **Log readme reads** | A PostToolUse hook in `Agents.options()` (Servex agents) and `.claude/settings.json` (tabs) matching `Read` on a path ending `readme.md`; appends `{read:{path,tokens}}` through `LogLine`. Node, not memory | about 2 hours | new `Servex/agents/ReadLog.js` (class), a one-line `.claude/hooks/read-log.mjs` for tabs |
| 5 | **Readme page** | `/framework/ai/readmes/?path=Servex/agents`: type a path, see the chain (it uses `readme_chain` through a small server route or a static `chains.json` built by `chain-sizes.mjs`), then the readmes each links, in layers, with tokens; total under each module. Slice zero: the static JSON, a table page, no route | about half a day | `ai/readmes/` (new page; CLAUDE.md links `/framework/ai/readmes/` but the folder does not exist yet), `chain-sizes.mjs` moves to `Server/ReadmeChains.mjs` |
| 6 | **Session "Context" view** | In the session page, read the `context` and `read` lines (slices 1 and 4) and the SDK `contextUsage` categories (call `query.getContextUsage()` once after the first turn; log `{context_usage:{system,claude_md,readmes,tools,memory,messages}}`); show each as a share of the window. First: the readme list and total tokens from slice 1 only | about a day | `AISession` detail page, `Agents.js` |
| 7 | **Hook injection test** | In a scratch dir run `claude -p` with a PreToolUse hook that prints `{hookSpecificOutput:{hookEventName:"PreToolUse",additionalContext:"X"}}`, ask the model to run `ls` and repeat X; repeat for PostToolUse. Answers the question for real | 10 minutes, under $0.05 | scratch |
| 8 | **`improvements.md` per folder** | Add the file beside a readme that has had a stumble (start with `Servex/agents`, `core/Page`, `ai`); the readme links it in one line; a mastermind's startup reads it (add to slice 2's extras: the spawner names it); a line proposed twice is fixed. Seed it from the existing skill `improvements.md` lines | about 2 hours | each folder |
| 9 | **Tools: scope by role, then the item RPC** | See the "compacted set" and first slice in [tools-map.md](/Servex/doc/tools-map.md) | about a day each | `tools.js`, `Agents.js` |
| 10 | **Role readmes live** | Merge `task/readme-roles` (its own card), then update the roles table in `agent-context.md` | its own task | `roles.js`, `roles/` |

**Order and restarts:** slices 1, 2, 3 in one change and one `sustain.mjs --restart`; 4 and 5 next; 6 after 1 and 4 have produced real lines; 7 is free and first if wanted; 8 is docs only. The cap is a constant. `## More` no longer cuts anything, but 266 readmes still carry that heading; the owner wants them reorganised (link the big chunks, split the module), which is the systems audit, not this plan: `grep -rl "^## More" --include=readme.md` lists them.

## Decided here (the alternative named)

- **Measure first, keep a cap:** keep `TOKEN_CAP` but raise to 15,000 as a safety; the alternative (remove it) loses the guard against one runaway readme.
- **Log through the existing `log`/`LogLine`, not a new tool:** the alternative, one tool per kind, is what the owner wants fewer of.
- **Hooks for read logging, not the model:** a hook sees every `Read`; asking the agent to log it is the memory-based record-keeping law 7 forbids.

## Open for the owner

- Whether the chain should also include the working module's readme automatically (derive the module from the task's `module` field when present) instead of only the spawner naming it. The plan assumes the spawner names it, as you said.
