# The contract the three minions share

Read this before your own brief. All three of you build against it at once, so do not change it. If it is wrong, tell your parent, `task-mastermind-waiting-on-you`.

**Worktree:** `C:\Code\lew42\worktrees\waiting-on-you` (branch `worktree/waiting-on-you`; its site runs at http://localhost:59512/). Minions A and B write only there. Minion C writes card data through the LIVE Servex, and skill edits in the worktree.

## Two new card lines (in a card's `page.jsonl`, appended through Servex only)

```json
{"ask": {"id": "a-mg3x9k2", "title": "Commit the main tree?", "question": "72 files are uncommitted from several agents; may I commit them as one checkpoint?", "options": ["commit", "wait"], "from": "mastermind-servex", "at": "2026-09-28T14:10:00-05:00"}}
{"answer": {"ask": "a-mg3x9k2", "text": "commit", "by": "owner", "at": "2026-09-28T15:02:00-05:00"}}
```

- `id` is `"a-" + Date.now().toString(36)` plus 2 random chars, and Servex fills it in. `at` is filled in by Servex too (use `stamp()` from `Servex/home.js`).
- `title`: about five words. When it is left out, the card's title is used.
- `options` and `from` are optional. `from` is the agent the answer wakes. When there is no `from`, the answer goes to the card's attached non-minion agents, the same way `Cards.forward()` sends an owner prompt.
- **A card of `type: "question"`** whose status is not `done` counts as one open ask, with id `"card"`. Its question is the text of the card's first message, or its title when it has none. `{"answer": {"ask": "card", …}}` answers it.
- An ask is open until an `answer` line names its id. Nothing expires.

## Folding (`public/framework/ai2/fold.js`, shared by Servex and the browser)

- `state.asks` is every ask in order. An answered one carries `answer: {text, by, at}`.
- `summary(s)` adds `waiting: [<open asks>]` **only when there is at least one**. So the static index `public/framework/ai/cards.jsonl` carries the open asks, and every other row stays the same size.

## Servex (`Servex/cards/Cards.js`)

- `ask({card, question, title?, options?, from?})` appends the ask line and returns `{ok, id: <card>, ask: <ask id>}`. MCP tool: **`card_ask`**.
- `waiting()` flattens every open ask across all cards, newest first: `{card, card_title, url, id, title, question, options, from, at}`. MCP tool: **`list_waiting`**. HTTP: `GET /waiting`.
- **Answering** is the existing `POST /card/append?id=<card>` with body `{"answer": {"ask": "<id>", "text": "…"}}`. `append()` fills in `by: "owner"` and `at`, and then wakes the asker with `agents.send(from, text, {from: "owner", reply_to: "card <card>"})`. `send()` revives a stopped agent. The result includes `woke: [<agent ids>]`.
- The wake message reads: `The owner answered your question on card <card> ("<question>"): <text>`.

## The strip (`public/framework/ai2/waiting.js`)

It reads `cards.jsonl` (static), not Servex, and keeps the rows that have `waiting`. It answers through `/card/append` as above. Its route is `/framework/ai2/waiting/`.
