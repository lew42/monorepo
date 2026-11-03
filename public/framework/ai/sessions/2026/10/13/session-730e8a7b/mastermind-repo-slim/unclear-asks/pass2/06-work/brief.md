# One question about 18 asks (work)

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files you need. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/06-work/results.json` and stop.

A first pass could not tell whether each ask below is done. For each ask answer ONE question:

> Is this a work item at all? Answer work: "yes" if finishing it would change a file, page or setting in this repo (build, fix, write, check-and-record). Answer work: "no" if it is an opinion, a question, a request for a chat answer or report, a rule about how to work, or a decision only the owner can make; then say in one line what it is.

Be strict: "done" needs a file you opened; a related thing is not the thing. The site serves `public/` as `/`; modules live in `public/framework/<module>/`. Rules for agents are in `CLAUDE.md` and `public/framework/ai/handover.md`. Use Grep/Glob first; `git log` always with `-n 5` and a path.

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/06-work/results.json`

A JSON array, one object per ask, same ids, nothing else in the file:

```json
[{"id":"abc1234567","work":"yes|no","reason":"one line: what it is, or what file it would change"}]
```

## The 18 asks

1. `6c1e4bfbf3` [ext/layout] Stop using the ext/layout tool approach to tune padding, and do not build more agent systems on it.
   first pass said: Both asks are working rules (stop using a tool approach, do not build more agent systems on it), not a testable feature. Still open: public/framework/ext/layout/doc/refined-asks.md:8 marks it ⬜ and ext/layout/inbox.jsonl:1 holds it. No ext/layout code or handover.md line records a stop.
2. `6150f5753b` [ext/layout] Do not continue the ext/layout tool approach of measuring absolute dimensions and having agents optimise padding and hierarchy.
   first pass said: A rule about how agents should work, not a testable feature. Still open: public/framework/ext/layout/doc/refined-asks.md:7 marks it ⬜ and ext/layout/inbox.jsonl:2 holds it. Nothing in the module's code or docs records that the measuring approach was stopped.
3. `93876d47b5` [ext/Refine] Consider a Prompt class as a simple data structure
   first pass said: A design opinion (is Prompt a simple data structure?). Prompt.js exists and holds data plus view (ext/Refine/Prompt.js:23 points to doc/prompt.md), but the ask does not say what would count as done.
4. `0c1a95902e` [ext/Refine] Use a single consistent preview scale or a scale chosen per filter width so grid items fit with labels
   first pass said: An option to consider (one preview scale or a scale per filter width), not a testable build; no preview-scale code found.
5. `ba39e5b3bb` [ext/Refine] Consider grid with per-item column span and row span as an alternative to masonry
   first pass said: An alternative to weigh (grid with column and row span), not a build step; the packed-grid decision in ui/doc/decisions.md:304 does not say whether spans were tested.
6. `c42e88e2b7` [ext/Refine] Get a basic working refinement first, then iterate
   first pass said: A process rule (get a basic version first, then iterate), not a testable feature.
7. `0765b179a6` [ext/Refine] How to get real-time incremental refinement working
   first pass said: A question (how to get real-time incremental refinement working); partly answered by the partial status in ext/Refine/inbox.jsonl:50, so see 75617b4b8f and 76cf20cdd0.
8. `328d10384f` [ext/Refine] Check whether the web offers better equal-height equalization for cards.
   first pass said: A research question (does the web offer better equal-height card equalization?); the answer is research, not a repo change.
9. `6133707312` [servex] Lean into MCP if Servex runs the AI sessions and node tools execute in a separate process
   first pass said: Architecture choice (keep MCP or not); the record holds the in-process decision (Servex/readme.md:37) but no explicit verdict on MCP.
10. `1efc695580` [servex] Pick one communication system for tool calls and stop revisiting the choice
   first pass said: A rule to pick one communication system; the choice is implied (in-process node tools plus MCP for the VS Code session), not written as one decision.
11. `97cb254cbb` [servex] Decide whether node tools run as a sub process or in the parent process so a crash cannot take down the server
   first pass said: Question of sub process vs parent. Agent tools run in-process (Servex/agents/tools.js:67); no crash-isolation analysis found.
12. `1efab422c6` [servex] Confirm whether SDK sessions spawn sub processes or run in the parent process, given each claude.exe has its own process ID
   first pass said: Question about claude.exe process layout; no doc in Servex/ answers it.
13. `237385faba` [servex] Establish whether a critical error in any of these processes can crash the whole system
   first pass said: Question about whole-system crash risk. Partial: Servex/sustain.mjs:9-18 restarts Servex on crash, and Servex/Process.js:17-34 backs off per child; no answer on in-process tool crashes.
14. `614fc0ccbe` [servex] Stop using the owner's workflows; do the work through the Claude SDK via Servex.
   first pass said: A rule about how to work (use SDK via Servex, not owner workflows); no testable artifact.
15. `c8d1cd3094` [servex] Explore publishing an NPM package so Servex can set up servers, with how the framework becomes a base still open.
   first pass said: Open question about publishing an NPM package; no package or decision found.
16. `ca49025079` [ux/Dictate] Have agents add chat cards and other contextual cards through the built-in page tools, not ad hoc.
   first pass said: A rule about how agents work, not a feature: CLAUDE.md 'Pages are live' requires agents to write through the page tools; CardAsk (asks.md:54) is the built path for board cards.
17. `0e80746d45` [ux/Inbox] Find out whether the inbox shows sessions and how its cards are controlled, checking board.jsonl, page.jsonl, the inbox class and the sessions system
   first pass said: A question to answer, not a build; answer found: the inbox shows sessions via the day log (public/framework/ai/rail/inbox.js:204 - new Day({ url: .../sessions/.../day.jsonl })) and board cards (inbox.js:23 BOARD_URL = "/framework/ai/board.jsonl").
18. `7f712d7dac` [ux/Inbox] Decide where inbox card data should be stored, possibly as part of page.jsonl
   first pass said: A decision question, not a build; current state: cards live in the sessions store as cards/<card>/page.jsonl (public/framework/ai/readme.md:8), and the ux/Inbox data is inbox.jsonl (public/framework/ux/Inbox/inbox.jsonl).
