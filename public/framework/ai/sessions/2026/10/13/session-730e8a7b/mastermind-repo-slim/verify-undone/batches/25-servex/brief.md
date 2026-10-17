# Check 17 asks against the repo: servex

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/25-servex/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `servex`, folder `public/framework/servex` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/servex/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/servex/readme.md`)

# Servex

The always-on process on this machine (port 80). It runs the Claude agents, starts the dev servers, and owns every log file. It is not the dev server: this site's `Server/` only reloads pages, while Servex runs everything around it.

- **Agents & roles** — who the agents are and how each is set up: [roles](/framework/servex/doc/roles/)
- Start it with `node Servex/sustain.mjs`; the detail is in `Servex/readme.md` and `Servex/agents/readme.md`.
- **Read the real source** — the [FS tab](/framework/servex/fs/) browses `Servex/` and `Server/` themselves, dev server only (`Server/plugins/DevSource.js`). Everything else on the site reads `/directory.json` (`public/` only); these two folders sit outside it, so they get their own small route instead.

## Also here (readme audit, 2026-10-13)
- [lifecycle](./lifecycle/) — Lifecycle — how much is left running


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/25-servex/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 17 asks

1. `5acad4bdb0` (13 days old): Servex: worktree pool stuck (qf-6, qf-9 held 17h by finished agents)
2. `02d6a3f094` (5 days old): Use Node tool functions for all tool calls instead of MCP
3. `1ec7d01891` (5 days old): Decide whether the headless instance runs on the Servex server or through the dev socket
4. `6133707312` (5 days old): Lean into MCP if Servex runs the AI sessions and node tools execute in a separate process
5. `1efc695580` (5 days old): Pick one communication system for tool calls and stop revisiting the choice
6. `97cb254cbb` (5 days old): Decide whether node tools run as a sub process or in the parent process so a crash cannot take down the server
7. `1efab422c6` (5 days old): Confirm whether SDK sessions spawn sub processes or run in the parent process, given each claude.exe has its own process ID
8. `237385faba` (5 days old): Establish whether a critical error in any of these processes can crash the whole system
9. `0f24f655a0` (5 days old): Decide how a crashed Servex or process restarts, given Servex is set to come back up
10. `81d5b849f9` (4 days old): Shade a layout red by CSS when it needs padding inside an unpadded container, and log to console for the smoke test
11. `3f267fe4d0` (4 days old): Investigate wiring an MCP for Fal, Higgs Field or another AI image generator to create photos for video slides
12. `aef5cfaba7` (3 days old): Support backups to an external hard drive or Google Drive
13. `09eeb410fe` (3 days old): Evaluate Cloudflare Durable Objects, D1 and KV for real-time storage, choosing per page type while watching costs and API usage
14. `614fc0ccbe` (3 days old): Stop using the owner's workflows; do the work through the Claude SDK via Servex.
15. `c8d1cd3094` (3 days old): Explore publishing an NPM package so Servex can set up servers, with how the framework becomes a base still open.
16. `398ffd3dc3` (1 days old): Servex remote MCP: voice-agent directives in the MCP server instructions + ask_mastermind description; mastermind replies inside the one-minute window
17. `734f3da1f5` (1 days old): Servex restart plan: a restart must not drop the voice call; a fresh mastermind may answer the next ask
