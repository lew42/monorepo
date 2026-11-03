# Brief F: Servex asks the owner with the card's own widgets

Load the `minion` skill first. Then read `contract-v2.md` beside this file. It is your spec, and minion G builds the page side against it at the same time.

The owner, 2026-09-28: "for things that you're waiting on me for, this is what the dashboard is for… even if I miss something, I don't actually miss it forever… I'll find it in the dashboard." The whole brief is `requirements.md` (deliverables 1, 2, 3 and 6). The card's conversation is at `public/framework/ai/sessions/2026/09/28/cards/waiting-on-you-never-buried/`.

**Work in:** `C:\Code\lew42\worktrees\needs-you`. Commit only your own files.
**Fence:** a new `public/framework/ai2/needs-rule.js`; the import lines in `ai2/needs.js` (moving the function out, nothing else); `Servex/cards/Cards.js`, `Servex/cards/test.mjs`, `Servex/cards/readme.md`; the four skills in deliverable 5 below.

Yesterday's first try is on branch `worktree/waiting-on-you`, commits `739709f7` (Servex) and `61c36a85` (skills). Read them for ideas, but do NOT merge or cherry-pick them: they are 100+ commits stale, and they use the old `ask` verb.

## Deliverables (do them in this order, and commit after step 1 so minion G can import the rule)
1. Create `needs-rule.js` by moving `card_needs` and `is_blocker` out of `needs.js`. Add what contract-v2 §1 adds: the legacy `ask`/`answer.ask` lines, `from` on each item, and `reviewed` clearing the `card`/`last` items. `needs.js` imports them. Load http://localhost:53478/framework/ai2/ headless and check there are no console errors. Commit.
2. In `Cards.js`: `ask()` plus the `card_ask` tool (§2), the wake inside `append()` (§3), and `waiting()` plus the `list_waiting` tool and `GET /waiting` with OPTIONS (§4). Tools register through the loop in `Servex.js` over `cards.tools()`. ⚠ Two callers already call `card_ask` in-process, `Servex/TaskLoop.js` and `Servex/Heartbeat.js` (`mcp.handlers.get("card_ask")`). Read how they call it, and keep that working.
3. `Servex/cards/test.mjs`: ask with options, then list it, then a `chose` line, then it is gone, and a fake `agents.send` got the asker. Do the same for a Question plus its `answer`, the no-`from` fallback to attached agents, and `reviewed` clearing a question-type card. Run the file.
4. **Private Servex proof** from the worktree root, run in the background:
   `SERVEX_PORT=8195 SERVEX_PROXY_PORT=8196 SERVEX_NO_GATE=1 SERVEX_NO_LAYERS=1 LOCALAPPDATA=<your scratchpad> node Servex/index.js`
   Use `curl` on port 8195: create a throwaway card, append an ask, `GET /waiting`, append a `chose`, `GET /waiting` again. Then stop it by its pid only, and delete the throwaway card folder and its listing line (`git checkout` the day's page.jsonl). ⚠ Never stop or restart the live Servex (8090/80). Every process you start sets `windowsHide: true`.
5. **Skills:** in the "Where your words go" paragraph of `.claude/skills/mastermind/SKILL.md`, `sub-mastermind/SKILL.md`, `minion/SKILL.md` and `every-prompt/SKILL.md`, name `card_ask` as the way to ask the owner. Change a few words, no more.
6. Add two lines to `Servex/cards/readme.md`: one for `card_ask` and `list_waiting`, one for the wake.

Log to `task.jsonl` beside this file with `{"log": {"at": "NOW", "msg": "minion-F: …"}}` via `node .claude/hooks/append.mjs`. End your turn with: the commit hashes, the test pass line, and the short curl transcript.
