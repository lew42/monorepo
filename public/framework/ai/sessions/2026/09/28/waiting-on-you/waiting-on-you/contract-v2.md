# Contract v2: one rule for "needs you", shared by the page and Servex (2026-09-29)

This contract replaces `contract.md`. That old contract invented new `ask` and `answer` verbs. But the cards already have widgets for this: the Question and Decision widgets from `ux/Content`, which write `place`, `answer` and `chose` lines. The owner answers with the widget that is already drawn on the card. So `card_ask` places one of those widgets, and one pure function decides what is waiting.

**Worktree:** `C:\Code\lew42\worktrees\needs-you` (branch `worktree/needs-you`, site at http://localhost:53478/). It is current with michael/dev. Commit only your own files (`git add <paths>`, never `-A`). ⚠ The worktree's own server writes stray lines into `public/framework/ai/**/page.jsonl` and `.claude/skills/clarity/flags.jsonl`, so never commit those.

## 1. The rule: `public/framework/ai2/needs-rule.js` (pure, with no DOM and no `/app.js` import)

Minion F makes this file, by MOVING `card_needs()` and `is_blocker()` out of `ai2/needs.js`. `needs.js` then imports them from here. The file is imported by the browser (`./needs-rule.js`) and by Servex (`../../public/framework/ai2/needs-rule.js`, the same way `Cards.js` imports `fold.js`).

`card_needs(id, lines, meta) -> [{card, ask, kind, title, question, options, hint, at, control, from}]`. An item is open when it is one of these:
- a `place` of `…/Decision/Decision.js` with no `chose` line for its id (the control is `decision`);
- a `place` of `…/Question/Question.js` with no `answer` line for its id (the control is `reply`);
- a legacy `{"ask": {id, title, question, options, from}}` line with no `{"answer": {"ask": id}}` line (yesterday's sweep wrote 6 of these; `control` is `decision` when it has options, `reply` when it doesn't);
- a card of `type: "question"` (pseudo-id `card`), or a card whose last non-owner message ends in "?" (pseudo-id `last`), in both cases with no answer, **and no `{"reviewed": {"at"}}` line newer than it**.
- It drops out when the card's status is `done` or `archived`.

The kinds rank as `blocker` → `decision` → `question` → `fyi`. The item's `from` comes from the `place` line or the `ask` line.

## 2. Asking: `card_ask({card, question, options?, title?, from?})` (Servex MCP tool, `Cards.ask()`)

It appends ONE `place` line. With `options`, that is a Decision: `{"place": {"module": "/framework/ux/Content/Decision/Decision.js", "id": "d-<base36>", "ask": question, "options": options, "title"?, "from"?, "at"}}`. Without options, it is a Question: `{"place": {"module": "/framework/ux/Content/Question/Question.js", "id": "q-<base36>", "ask": question, "title"?, "from"?, "at"}}`. It returns `{ok, id: <card>, ask: <place id>}`. Check the real `place` fields that Decision.js and Question.js read, and match them exactly.

## 3. Answering wakes the asker (inside `Cards.append()`)

Any appended `chose: {decision: id, option}`, `answer: {question: id, text}` or legacy `answer: {ask: id, text}` line is matched to the `place` or `ask` line with that id. `agents.send(from, "The owner answered your question on card <card> (\"<ask>\"): <answer>", {from: "owner", reply_to: "card <card>"})`. When there is no `from`, it goes to the card's attached non-minion agents (like `forward()`). The result includes `woke: [...]`.

## 4. The list: `list_waiting()` (MCP tool) and `GET /waiting` (HTTP)

Both run `card_needs` over every card that is not done, and return the items ranked and then newest first. This is the same set the Needs you tab and the rail's "Needs review" filter show.

## 5. Reviewed

The "Reviewed ✓" control on a card appends `{"reviewed": {"at": <ISO>, "by": "owner"}}` through `/card/append`. That clears only the heuristic items (`card` and `last`). A placed Question or Decision is cleared only by answering it.

