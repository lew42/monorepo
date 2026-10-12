# Waiting on you: nothing the owner is asked gets buried

The owner, 2026-09-28: "for things that you're waiting on me for, this is what the dashboard is for. We need to create a way where I don't, even if I miss something, I don't actually miss it forever… I'll find it in the dashboard." The standing rule this serves (already in the mastermind, sub-mastermind, minion and every-prompt skills): agents write to files and cards, not to the chat, and anything they need from the owner goes on a card as a question.

## What the owner sees

At the top of [/framework/ai2/](/framework/ai2/), a **Waiting on you (N)** strip. Each item is one row: an icon, a title of about five words, the question in one sentence, how long it has waited, and a box to answer by typing or dictating. Answering removes the row. Nothing expires; a row older than a day is marked so. Clicking a row opens its card. The strip has its own route, `/framework/ai2/waiting/`, so a reload or the back button lands there.

## Deliverables

1. **One way to ask.** A Servex tool `card_ask({card, question, options?})` appends `{"ask":{"id", "question", "options"}}` to the card's log. A card of type `question` counts as an ask too. Agents use this instead of a chat question.
2. **One way to answer.** The owner's answer appends `{"answer":{"ask": id, "text"}}` to the same card, and wakes the agent that asked (the card's manager or the task mastermind), through the same path a card message already takes.
3. **One list.** Servex keeps the open asks in its card index (the static index it already builds), and a tool `list_waiting()` returns them, so agents can check what the owner still owes before asking again. There is no new datastore: the card logs are the source of truth.
4. **The strip and its route** in AI 2, described above. It follows the card standard and the `page` skill; it shows at 1280 without pushing the inbox below the fold (at most 5 rows, then "N more").
5. **A one-time sweep.** Every question already waiting on the owner becomes an ask on the card it belongs to (make a card when none exists): the "owner's call" items in [todo.md](/framework/ai/todo.md), the "waiting on the owner" list in [today's checkpoint](/framework/ai/2026-09-28/servex-mastermind/checkpoint.md) and [handover.md](/framework/ai/handover.md), and open `question` cards.
6. **Skills:** once `card_ask` exists, the "Where your words go" paragraph in the four skills names it (one word changed in each).
7. **Docs:** `/framework/ai2/doc/waiting.md`, one screen, the strip's screenshot first.

## Proof

- Screenshots of the strip at 1280 and 1920, with the swept items in it.
- Answer one item: it leaves the strip, the answer is on its card, and the asking agent was woken (its log line).
- A reload of `/framework/ai2/waiting/` lands on the strip.

## Fence

Yours: a new `public/framework/ai2/waiting.js`, the strip's lines in `ai2/page.js` and `inbox.js`, `ai2/doc/waiting.md`, the ask and answer tools and index lines in Servex. Anything else in AI 2 or Servex: ask mastermind-servex-3 first. Servex changes are proved on a private Servex (see the checkpoint) and restarted once, when no agent is working.
