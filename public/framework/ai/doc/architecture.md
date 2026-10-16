# AI system architecture — files are the memory, code runs the loop

The AI system is everything that lets agents do work here and lets the owner see it: Servex runs the agents, the readme chain tells them what exists, each task is a folder with a JSONL log, and the cards on `/framework/ai/` are the owner's surface. Terms: a card is one row on the AI board, a mastermind is the agent that owns a task, a minion is an agent it hands a piece to. The pattern: state lives in appended files, node drives the sequence, the model supplies judgment. Components, one line each, computed from the readme index: the System tab, [`/framework/ai/system/`](/framework/ai/system/). An earlier, shorter version of this file is in git history (it also said the System tab shows class cards: it still does). Servex's own decisions: [Servex/doc/architecture.md](/framework/servex/doc/architecture.md).

## Direction lives in the module's docs, not in task folders (the owner, by voice, 2026-10-16)
**Decided:** the essence of an owner prompt (the why, the ask, who said it and when) goes into the direction or decisions doc of the module it concerns, such as [live/doc/notes.md](../../../live/doc/notes.md) or this file, linked back to the source prompt. A task folder holds only the work. **Why:** the owner's prompts were getting buried in task folders, where no later agent finds them.

## Fewer tools, a generic `call` first (recommended 2026-10-16, not built)
**Recommended:** collapse the ~81 Servex tools; step one is one `call(tool, args)` that dispatches by name and validates against each handler's schema. **End state (direction, 2026-10-16):** Servex as an `Item`, so `Item.set` is the one call for tools and page deltas alike. **Detail:** [doc/tool-collapse.md](tool-collapse.md#recommendation-the-owner-by-voice-2026-10-16)

## The readme chain is the AI's memory
**Decided:** every agent reads CLAUDE.md, then the readmes root to leaf; each readme is a short index (under ~100 lines) pointing into `doc/`.
**Why:** a fresh agent pays only for the context it needs, and nothing depends on a chat that will not be read again.
**Instead:** handoff files written per session (stale the day after) or one big context file (every agent pays for it).
**Detail:** [readmes](/framework/ai/readmes/), [doc/readmes.md](readmes.md)

## A task is a folder with a JSONL log
**Decided:** `ai/sessions/<Y>/<M>/<D>/<session>/<task>/` holds `task.jsonl` and `requirements.md`; children nest inside parents.
**Why:** the committed repo is the source of truth; a vanished agent's state is its log.
**Instead:** a database (needs a server, production is static) or chat history (lost).
**Detail:** [doc/task-folders.md](task-folders.md)

## Append, never rewrite
**Decided:** data is one JSON line per event, written by one writer (Servex, or `append.mjs`).
**Why:** two writers cannot tear a line; read-modify-write loses lines; git is the undo.
**Instead:** whole-file rewrites (measured: lose most concurrent updates).
**Detail:** [system/data](/framework/ai/system/data/)

## Cards are the owner's surface; chat is not
**Decided:** every task reports on its card; anything important is also a `Note:` card or `owner_note`.
**Why:** the owner mostly does not read chat.
**Instead:** long chat replies (unread).
**Detail:** [rail/](/framework/ai/rail/), [cards/](/framework/ai/cards/)

## Three tiers: assistant, mastermind, minion
**Decided:** assistants answer fast and keep their hands free (fast = Haiku, smart = Sonnet); a mastermind owns one task end to end; minions build in parallel. The tier-to-model map is one file, `Servex/agents/tiers.js`. Roles are a default, not a fence.
**Why:** a busy mastermind queues prompts; a free assistant relays them at once.
**Instead:** one agent for everything (blocks on its own tools) or hard role fences (stops a capable minion).
**Detail:** [Servex roles](../../../../Servex/doc/skills.md), [skills](/framework/ai/system/skills/)

## Claude by default; OpenRouter only by the switch
**Decided:** voice assistants and refine run on Claude; one file (`session-backend.txt`) moves them, and every spawned agent's tier too, to OpenRouter (Servex reads it at start, so restart it after a change); a Claude refusal moves that one session by itself.
**Why:** OpenRouter spend is waste while Claude tokens are paid for; the switch is for the day the Claude usage limit is hit.
**Instead:** OpenRouter first (the pre-2026-10-12 order).
**Detail:** [doc/models.md](models.md), [Servex/ext/openrouter](/framework/servex/)

## Work happens in a worktree and lands through a gate
**Decided:** builds run in a git worktree; `Server/merge.mjs` smoke-tests, holds reloads, and merges; pages are checked at 400, 1200, 1920 and 3440.
**Why:** the owner edits the live site; a broken file reloads every open tab.
**Instead:** editing the main tree (one bad write breaks the live site).
**Detail:** [Servex/doc/pool.md](/framework/servex/doc/pool.md)

## The step runner is the loop: code reprompts, memory does not
**Decided:** a mastermind approves the plan once; node then answers each finished step with the next step's text, logs each step with timestamps, and nudges (`TaskLoop`) a step that runs past twice its estimate. The agent is never trusted to remember the next skill or to close its worktree.
**Why:** an agent that must remember to log, close or move on forgets; code does not.
**Instead:** skills the agent must call in order from memory. Today the step runner covers task steps and landing; closing worktrees and moving to the next task are still prompts (open, see below).
**Detail:** [Servex/doc/steps.md](/framework/servex/doc/steps.md), [doc/agents/autonomy.md](agents/autonomy.md)

## Logs are persistence; no handoff files
**Decided:** an agent logs as it goes, so its state survives if it vanishes; a successor reads the log.
**Why:** a handoff written at the end is exactly what a crashed agent never writes.
**Instead:** end-of-session handoff files (still read by hand: [handover.md](../handover.md)).
**Detail:** [Servex/doc/never-lose-a-wake.md](/framework/servex/doc/never-lose-a-wake.md)

## Fresh sessions after a round of work
**Decided:** start a new session when a round winds down or the topic changes; reuse one only while its cache is fresh and the topic continues.
**Why:** a new agent reading the readmes and the code sees the current state without the bloat that built it.
**Instead:** resuming everything (cheap per turn, but context grows and carries stale beliefs).
**Detail:** [CLAUDE.md](../../../CLAUDE.md) "Cost and roles"

## Token directives
**Decided:** (1) never copy a file by reading and rewriting it: use `git mv` or `cp`; (2) batch reads into one turn; (3) a script computes, the model reads the summary; (4) audits and scans go to Haiku under 100k tokens; (5) check pace before a spawn.
**Why:** every turn re-reads the whole context; output tokens are the dearest.
**Detail:** [CLAUDE.md](../../../CLAUDE.md) "Cost and roles", [doc/tokens/tokens.md](tokens/tokens.md)

## Open (not decided; do not invent an answer)
- **How many minions, which model, which effort, what they get done.** Evidence so far: [doc/models.md](models.md) (27-task known-answer suite: cheap models pass simple jobs; judgment stays on Sonnet or Opus); [model testing past work](/framework/ai/past-work-index.md) (`node Server/PastWork.mjs "model testing eval"`); spend per session at [sessions/](/framework/ai/sessions/). No measurement ties agent count or effort to outcome yet.
- **Fast and smart assistant split.** Direction: fast cleans the transcript per chunk and rarely speaks; smart replies, refines and hands off. Map: [dictation-refine connection map](design/dictation-refine-connection-map.md).
- **Confidence weights.** Whether 0.5 is neutral or 1.0 is a multiplier is undecided; until then every number needs its meaning printed beside it.
- **Automating the remaining AI duties** (close worktree, start next task) in the step runner.
- Raw words behind these: [dictation 7](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-5.md).

## Still-to-convert function bags

The ranked list of lowercase function-bag files, the five already made classes, and a ten-module "done properly" spot check: [code/patterns/doc/oo-census.md](../../code/patterns/doc/oo-census.md).
