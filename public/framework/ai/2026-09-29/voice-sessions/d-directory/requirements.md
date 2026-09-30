# The directory mastermind: a fresh mastermind for one folder, started from its readmes

Load the `minion` and `code` skills first. Your parent is task-mastermind-voice-sessions. The whole task is [../requirements.md](../requirements.md), items 8, 10 and 12. The roles table is [/framework/ai/2026-09-22/tiers-design/doc/roles.md](/framework/ai/2026-09-22/tiers-design/doc/roles.md) (the "Directory mastermind" row, marked "Not yet": that's you).

## The owner's words (6:40 to 6:55 PM, `../audio/owner-words.md`)

The per-page manager goes. In its place, a tool spawns a FRESH mastermind for a path, loading CLAUDE.md, the readme chain root → dir, the skills and the tools, with the prompt "you're a mastermind working in <dir>". The smart assistant routes technical questions to it. It is fresh by default and never forked, with a deterministic opening prompt so the cache is shared. The same mastermind is reused for follow-ups in one voice session. Questions change nothing; merges update the docs. Loading uses only plain files (the readme chain, CLAUDE.md or AGENTS.md, the skills), with as little config as possible, so it works whatever the model or provider.

## Where you work

Worktree `C:/Code/lew42/worktrees/qf-9`. A sibling minion is editing `Servex/agents/Sessions.js`, the `session-*.md` briefs, `Servex/agents/tools.js`, `ServexProxy.js` and `ext/Session/` right now, so don't touch those.
**Fence:** `Servex/agents/directory.js` (new: the logic and its tool), one registration line in `Servex/Servex.js` (next to `agent_tools`, line ~594), a `directory-mastermind` row in `Servex/agents/roles.js`, `Servex/agents/doc/directory.md` (new), one line in `Servex/agents/readme.md`, and the "Built today?" cell of the Directory mastermind row in roles.md.
Reuse, don't rebuild: `Servex/agents/readme-chain.js` (`readme_chain`, `first_prompt`) and `experts.js` (`load_module`, `readme`). Note that `ask_expert` FORKS a checkpoint, which the owner rules out here. Say in doc/directory.md how the two differ and when to use each.

## Deliverables

1. **`ask_directory({dir, question, session?})`, a Servex MCP tool.** `dir` is a repo path (`public/framework/core/Page`) or a site path (`/framework/core/Page/`). It spawns a fresh agent, role `directory-mastermind` (the posture of a task mastermind: Opus, medium, `sub-mastermind` + `page` skills), cwd = the repo, whose FIRST message is byte-for-byte deterministic for that dir: `You're a mastermind working in <dir>.` + the readme chain for the dir + the skill-load line. The question goes in as the SECOND message, so the first turn is identical every time and cached. It returns at once with `{agent, dir}`. The answer reaches the caller as the child's normal parent message (set `parent` to the caller). With `session`, a second question on the same dir in the same session is sent to the SAME agent (keep the map in memory, plus a small json in `place()`), unless that agent is stopped; a new dir gets a new agent.
2. **Plain files only (item 12).** Loading reads the readme chain, CLAUDE.md (or AGENTS.md if CLAUDE.md is missing), and the skill files. No Servex-only config goes into the prompt. Write the opening prompt builder as one pure function, `opening(dir)`, that a future OpenRouter harness can call.
3. **Questions change nothing.** For a question (not a task), the second message says: answer from the readmes and code, change no files, and name any readme that was wrong or missing so a task can fix it.
4. **Idle stop.** Stop an ask_directory agent after 10 minutes with no message (it's resumable by session id, like the others).

## Proof (each one an `experiment` line)

Using a harness on a private port (see `../a-slice1/task.jsonl` for how slice 1 ran real SDK sessions off the live Servex, with `SERVEX_HOME` in a scratch dir), or by calling the module directly from a node script:
1. `opening("public/framework/core/Page")` returns the same string twice. Log its length.
2. Ask "what are a Page's children and how is a page reached?" about `/framework/core/Page/`. Show the answer, and show that it cites that folder's readme.
3. A follow-up question in the same session reaches the same agent id, and the second answer's cache-read tokens are above zero.
Stop every agent and process you start. Reply with the commits and the proofs.
