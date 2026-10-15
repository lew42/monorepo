# Where "partially done, need X from the owner" goes

Short answer: it lands in the task's own outcome text and in the parent's inbox file. No code path turns it into a card the owner sees. Only an agent that calls `card_ask` or `owner_note` itself reaches the board.

## The chain

1. **Child ends its turn.** `Agents.js:1317` sends a `result` event. `Agents.js:1318` picks the wake kind: `"blocked"` only if the last text starts with `BLOCKED`, else `"done"`. A "partially done" message is therefore `done`.
2. **Parent wake.** `Agents.js:707` `wake_parent()` builds `done: <last_text>` (up to 4000 chars). It writes the inbox first (`Agents.js:720`), then sends to the parent (`Agents.js:~745`). A stopped-on-purpose parent is skipped and logged as `wake-skipped` (`Agents.js:~731`).
3. **Parent inbox file.** `Agents.js:739-744` appends `{at, from, kind, text}` to `inbox.jsonl` in the parent's task dir. Readers: `Agents.js`, `Servex/agents/ModuleInbox.js`, `Heartbeat.js`, `Server/AskIndex.mjs`, and `public/framework/ai/AITask/tree.js` (tree structure only).
4. **Dispatcher log.** `Dispatcher.js:161-170` `woken()` writes a `task` line with state `"blocked"` only for `BLOCKED`, otherwise `"landed"`, with text cut to 200 chars. **So a "partially done" final message is logged as `landed`.** That is the first place the wording is lost.
5. **Task landing.** `finish-task/SKILL.md:41-49` puts "what was deliberately left, in one line each" inside the `outcome` markdown. The outcome is a plain string on the `landed_at` line.
6. **Board card row.** `Server/Ai2Overview.mjs:302-315` shows only the first line of `outcome` (stripped, 140 chars). The "left" section sits below that line, so the board row never shows it.
7. **owner_note.** `Server/on-landing.mjs:90-105` posts one `owner_note` digest per landing, built only from `decision` lines (`e.decision.chose` / `question`). It never reads `left`, `waiting` or `outcome`.
8. **Owner-visible paths that do exist:**
   - `card_ask` / `card_reply` (`Servex/cards/Cards.js`), which create a Decision or Question placed on a card.
   - `owner_note` (`Cards.js:182`), a `note` card tagged `owner-note`.
   - `list_waiting` / `GET /waiting` (`Cards.js:356`, `:607`).
   - The rail's "Needs you" view: `public/framework/ai/rail/NeedsRule.js` `card_needs()` reads only placed Decisions/Questions, legacy asks, and a card whose last message ends in `?` (kind `fyi`). `rail/Needs.js:23` adds asks-ledger rows with status `stalled`.
9. **Escalations are hidden on purpose.** `NeedsRule.js` drops TaskLoop/Heartbeat escalations (`close it` / `keep chasing`, `look into it` / `close it`) from aggregate views. They still draw on their own card.

## Where it breaks

- **Break 1 (step 4):** a `partially done` message is logged as `landed` (`Dispatcher.js:161-170`). Anything that reads the dispatcher log sees a finished task.
- **Break 2 (step 6):** the `left` section is below the first line of `outcome`, and the board row shows only that first line.
- **Break 3 (step 7):** `on-landing.mjs` turns only `decision` lines into owner notes. A `left` item never becomes one.
- **Break 4 (step 3):** the parent inbox is a file, not a card. Nothing puts it on the board unless the parent agent chooses to act on it.
- **Break 5 (step 9, `NeedsRule`):** a "need X from the owner" that is not a placed Decision/Question and does not end in `?` is not in `card_needs()`, so it is not in "Needs you" or `list_waiting`.

## Real data (last 14 days, `scan-left.mjs`)

Measured by `public/framework/ai/sessions/2026/10/15/voice-20261015/loose-ends/scan-left.mjs`. The phrase matching is a regex, so counts are approximate.

| Measure | Count |
|---|---|
| task.jsonl files touched | 688 |
| landed (`landed_at` present) | 342 |
| not landed | 346 |
| contain owner-wait phrase (`partially done`, `need X from the owner`, `waiting on the owner`, `BLOCKED`) | 63 |
| outcome has a "left" heading (`**Left`, `Left:`, `left open`, `left deliberately`) | 57 |
| landed with either of the above | 94 |
| `owner_note` lines inside those task.jsonl files | 0 |
| page.jsonl files with an `owner_note` line (cards, any date) | 88 |
| page.jsonl files with a `place` line (placed Decision/Question) | 37 |

Samples of landed tasks with "left" or waiting text, all with no owner note in the task file: `sessions/2026/09/29/dictate-lag/task.jsonl` ("Left as it was: after a full stop the wait is still 2.5 s"), `sessions/2026/09/29/ca56812f-.../item-ui/c-views/task.jsonl` ("Left open: `ui/item/readme.md` says seven variants"), `sessions/2026/09/29/7eedf4fd-.../chip-context-fix/task.jsonl` ("Left deliberately: no review ran").

Asks ledger (`public/framework/ai/asks.jsonl`, 272 rows): 65 `stalled`, 30 `queued`, 15 `routed`, 64 `landed`. A `stalled` row is the only path that reaches the rail's "Needs you" from the asks ledger (`rail/Needs.js:23`).

## What this means

- Left items are text in outcomes, and the board shows only the first line of an outcome. They are not a queue.
- The owner sees a "need X" only when the agent chose `card_ask` or `owner_note` itself, or when the ledger marks it `stalled`.
- The wake text and the parent inbox are the closest things to a queue, and they are files, not views.

The fix is a decision for the owner or the Servex owner: a landing line for `left` items that creates a placed Question (or an `owner_note`) through `on-landing.mjs`, and a `Dispatcher` state of `partial` instead of `landed`. Neither is built here.

## Not verified

- Joining tasks to their cards was not done, so "landed with left, no owner note" means no `owner_note` line in that task file, not that no card exists anywhere.
- The regexes are heuristic. Read the sample lines before trusting any count.
