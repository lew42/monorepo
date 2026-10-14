# Minion A: Servex, the ask, the answer and the list

Load the `minion` skill first. Then read `contract.md` beside this file. It is your spec, and siblings build against it right now.

The owner's words, 2026-09-28: "for things that you're waiting on me for, this is what the dashboard is for. We need to create a way where I don't, even if I miss something, I don't actually miss it forever… I'll find it in the dashboard." The whole brief is `requirements.md`, and the card's conversation is at `public/framework/ai/2026/09/28/waiting-on-you-never-buried/`.

**Work in:** `C:\Code\lew42\worktrees\waiting-on-you`, and commit there on its branch.
**Fence:** `public/framework/ai2/fold.js` (the ask and answer folding, plus `waiting` in summary), `Servex/cards/Cards.js`, `Servex/cards/test.mjs`, `Servex/cards/readme.md`. Touch nothing else.

## Deliverables
1. `fold.js`: `ask` and `answer` lines fold into `state.asks`. An open `question`-type card counts as ask `"card"`. `summary()` adds `waiting` only when it is non-empty. All of this is in the contract.
2. `Cards.js`: add `ask()`, `waiting()`, the answer wake inside `append()`, the MCP tools `card_ask` and `list_waiting`, and the route `GET /waiting` (with its OPTIONS, like the others). The tools register themselves through `Servex.js:519`, which loops over `cards.tools()`.
3. Tests in `Servex/cards/test.mjs`: ask, then list, then answer, then the ask is gone. An answer calls a fake `agents.send` with the asker's id, and with no `from` it reaches the attached agents. Run the file, and paste the pass line into your log.
4. **Prove it on a private Servex** from the worktree root. Use the Bash tool with `run_in_background`:
   `SERVEX_PORT=8191 SERVEX_PROXY_PORT=8192 SERVEX_NO_GATE=1 SERVEX_NO_LAYERS=1 LOCALAPPDATA=<your scratchpad> node Servex/index.js`
   Then `curl` these on port 8191: create a card, `/card/append` an ask, `GET /waiting` (it shows up), `/card/append` an answer (it comes back with `woke`), and `GET /waiting` again (it is gone). Check that `public/framework/ai/cards.jsonl` in the WORKTREE carries `waiting` on that card. Then kill your private Servex (by its pid only) and delete the test card folder and its listing line from the worktree (`git checkout` the day page.jsonl if you changed it).
   ⚠ Never restart or stop the live Servex (port 8090/80). Any process you start sets `windowsHide: true`, so no window may pop up.
5. Update `Servex/cards/readme.md` with two lines, one naming `ask`/`answer` and one naming the tools.

Log to `task.jsonl` beside this file (`node .claude/hooks/append.mjs`, with `{"log": {"at": "NOW", "msg": "minion-A: …"}}`). When you're done, commit in the worktree and end your turn with: the commit hash, the test pass line, and the curl transcript (in short).
