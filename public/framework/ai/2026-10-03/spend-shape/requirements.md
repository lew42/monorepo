Budget: $5. One agent does this itself; no minions (rule 3 below).

# Servex: spend goes where results are, and you can see who spawned whom

**Why:** the owner, 2026-10-03 23:40: "if we're overspending on doing some task way more than we need to, we need to red flag that and figure out a better way ... we're almost out of tokens for this week ... it's still not really clear who's spawning who." vscode-mastermind computed this from Servex's agent logs since Oct 1 ($1,408 in all; [card](/framework/ai/2026/10/03/now/where-this-week-s-claude-spend-went/)):
- minions 49%, task masterminds 26%, masterminds 11%, clarity 6% (187 runs), reviewers 6% (105 runs);
- 474 of this week's 563 agents have no `parent`, so the Sessions tab can't group them by who spawned them.

## 1. Every spawn records who spawned it

- `spawn_agent`'s `parent` is optional today (`Servex/agents/tools.js` about line 240), so most spawns leave it out. Servex already knows who is calling: the in-process tool runs inside the calling agent.
- Record `spawned_by` on **every** spawn, filled by Servex, never by the caller: the calling agent's id; or `owner` for a prompt from the owner's tab; or `servex:<what>` for Servex's own spawns (the heartbeat, the dispatcher, `Server/clarity.mjs`, `review.mjs`).
- Default `parent` to the caller too, unless the caller passes `parent: null` on purpose (`parent` also means "wake me when it ends", so keep the opt-out).
- The Sessions tab groups by `spawned_by`. Find its grouping and add that one key; don't build a new view.
- **Tests:** a spawn with no `parent` gets `spawned_by` set to the caller; a heartbeat spawn gets `servex:heartbeat`.

## 2. Clarity runs only on reports the owner reads

- Today `Server/on-landing.mjs` (line 41) starts `Server/clarity.mjs` on every landing: 187 runs this week.
- Run it only when the landing is owner-facing: the task has a card on the board, or an open line in `public/framework/ai/asks.jsonl`. Skip it when the task is a sub-task (its line 1 has a `parent_task`), or has no card. Compute this from the files (law 7).
- **Tests:** a sub-task landing starts no clarity; a carded task landing still does.

## 3. A small task is one agent doing the work

- Rule: a task whose `Budget:` is under $5 is done by the agent that owns it, with no minion under a task mastermind.
- **In the spawn path:** when a `task-mastermind-*` or `mastermind-*` agent spawns a `minion` for a task dir whose brief's `Budget:` is under $5, refuse with "this task's budget is $N: do it yourself (small tasks are one agent)". Read the `Budget:` line the same way the spend gate does; reuse that reader.
- **In the skill:** add one line to `.claude/skills/sub-mastermind/SKILL.md`, near where it decides whether to split: "Under $5, do it yourself; never spawn a minion for it." Write and Edit can't touch `.claude/`, so use a small node patch script (dry-run first).
- **Tests:** a minion spawn under a $3 task is refused; under an $8 task it's allowed; a mastermind spawning a task-mastermind is unaffected.

## 4. Every spawned task writes its own line in the asks ledger (folded in from spawn-logs-ask)

[day-audit](/framework/ai/2026-10-03/day-audit/) found about half of today's asks missing from `asks.jsonl`. When `spawn_agent` gets a `task`, Servex appends one ask line itself, right after `open_task()` (`Servex/agents/Agents.js` about lines 158 and 711): the card's title (or the brief's `# ` heading), owner = the new agent, words = the brief's path, status `building`. Use the writer in `Servex/asks/` (`Asks.js`). Skip it if that task dir or card already has an open line. **Tests:** one line per spawned task; none on a re-spawn; none without a task.

## Land

`node --check` each changed file, run the tests, commit by exact path, merge. It goes live on the next Servex restart; restart only when `list_agents` shows nobody mid-turn. Post on the card, in plain words, what changes for spend ("clarity now runs on N of last week's 187 landings").

Sonnet, medium effort. Never `stash`, `checkout --` or `reset` in the main tree. Don't wait on the owner.
