# Where AI code lives: a proposal for the owner to approve

**Status: proposal (2026-10-22). Nothing has moved.** This is the system architect's answer to the owner's [Follow-up 2](readme-system.md) in readme-system.md: the front end lives in `public/framework/ai/`, the server side lives in `Servex/`, and the AI part of the server is gathered in one folder. Nothing moves until the owner approves. After that, the move is one scripted commit (a dry run plus a manifest of every old and new path, as CLAUDE.md requires).

## The rule

- **Shared by the browser and node: `public/framework/core/`.** These classes have no DOM, so both sides import the same file: Item, [Task](/framework/core/Task/), [Session](/framework/core/Session/) and [Process](/framework/core/Task/doc/process.md). A class both sides use never lives in `Servex/`.
- **What the owner sees about AI: `public/framework/ai/`.** This holds the pages, the views (AIDashboard, AISession, AITask, cards, rail) and the records they draw (sessions, asks, cards, usage).
- **What runs on the machine: `Servex/`.** It has two parts:
  - **The host** (`Servex/` root): the HTTP and MCP door, the dev servers (`Process.js`, `Processes.js`, `PortRegistry.js`, `ReverseProxy.js`), logs (`Log.js`, `LogSweeper.js`, `Stream.js`), worktrees, and the machine monitor.
  - **The AI part** (`Servex/agents/`): the SDK sessions and everything that runs them.

## The AI part: keep the name `agents/`, give it subfolders, and move the AI loops into it

Today `Servex/agents/` already is the "Servex/ai-like folder" the owner described. It holds:

- the SDK wrapper (`Agents.js`) and the SDK facts ([doc/sdk.md](/Servex/agents/doc/sdk.md));
- the sessions (`Sessions.js`, `Registry.js`), the roles (`roles/`) and the tools (`page_tools.js`);
- the readme chain and dispatch.

But it is 87 files in one flat folder, and the loops that drive agents sit outside it in the `Servex/` root. The proposal:

```
Servex/agents/
  readme.md        what the AI part is, and this tree
  sdk/             Agents.js (the SDK wrapper), Sessions.js, Registry.js, claims.js, Chain.js
  tools/           page_tools.js (item, page_*), ops.js, the tool registry, readme-chain.js
  dispatch/        Dispatcher.js, Fixer.js, Promote.js, Jobs.js, Experts.js, Assistant.js
  loops/           TaskLoop, ProcessRunner, Heartbeat, Landed, Lifecycle   <- moved from Servex/
  spend/           Budget, Usage                                            <- moved from Servex/
  asks/  cards/                                                             <- moved from Servex/
  roles/  doc/     unchanged
  test/            the 41 *.test.mjs / *proof.mjs files, beside nothing they do not test
```

**Cost of the move.** About 70 import lines change. For example, TaskLoop is imported by 12 files, Lifecycle by 14 and Heartbeat by 10. Docs link these paths too. The script rewrites every import and doc link from the manifest, then runs every test.

**The alternative: rename `agents/` to `Servex/ai/`,** the owner's own word. It is the same script with a different target. I do not recommend it, for two reasons:

- `Servex/ai/` already exists as data: `Sessions.js` writes `Servex/ai/log.jsonl`, the decision log of the Servex "site", just as every site has its own `ai/log.jsonl`. A code folder with the same name would mix code with data.
- "agents" says what the code runs.

If the owner prefers `ai`, the data log moves aside first.

**Not moved:** `Pool.js` and `Worktrees.js` (16 and 3 importers). They manage git worktrees for anyone, not only agents, so they stay with the host.

## Item tool or a raw log: settled

- **`item`** is for files a class reads: Task, Session, Process, Page, and a folder's improvements list. Node replays the file into one instance of its class, checks the delta (or the method call) against that class, writes the line, and answers with the computed state. Today this already runs on the server: `live_root` in `page_tools.js` keeps one live instance per file.
- **`log`** (the Servex MCP `log` tool) is the plainly named raw log: it appends one line to any other JSONL record. Node adds the time, the author and the session, and checks the line against that log's schema.
- In neither case does the model write the bookkeeping (no times, ids or authors typed by hand). Long form: [Servex/doc/item-tool.md](/Servex/doc/item-tool.md).

## Markdown or JSONL

- **Records are JSONL**, written through `item` or `log`. They are structured, so the site can draw, filter, search and total them live.
- **Prose is markdown**: readmes, docs, briefs and plans. The site shows a `.md` file only through the markdown route, with no live widgets.
- That is why a folder's improvements are `improvements.jsonl` (written through `item`), not the `improvements.md` first named. The rule is in [the mastermind role readme](/Servex/agents/roles/mastermind.md), "Improvements".

## Should an agent that reads a doc also tail it?

**Not by default; only for the files that steer it.**

- Every edit pushed into every reader costs tokens in every agent that once read the file. Docs change often and mostly in ways that do not matter to a given agent.
- **Proposed (not built):** an agent follows its own brief (`requirements.md`) and its task or process log. When one of those changes, it gets one line at its next turn boundary, saying what changed and where, through the existing `follow({path, agent})` and `updates` tools. It does not get the whole text.
- A rule change that must reach every agent is a line in the role readme. The next session gets it through its readme chain. A running agent is told by the editor, by message.
