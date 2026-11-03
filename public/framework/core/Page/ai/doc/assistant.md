# The fast assistant, per page

[Servex](/framework/servex/doc/roles/) runs one **card assistant** for every card — a
small, fast, low-effort session that answers the owner right away. This page's own part:
**which context it answers in.** A card is a path (`ai/<date>/<slug>/`), and the
assistant's id and session are minted from that path the first time the owner speaks on
it — `Servex/agents/Layers.js`'s `record(card)` — so the SAME assistant keeps answering
that one card for its whole life, not a fresh one per message.

**A plain page (not a card) has no assistant of its own yet.** The drawer's AI tab tries
`POST /api/page-ai` first; that route does not exist yet, so it falls back to the dev
bar's own Ask bridge (`public/framework/ext/drawer/tabs/ai.js`, `send()`). "The fast
assistant per page" the owner describes is really "the fast assistant per CARD" today —
see [the agents list](/framework/core/Page/ai/agents/) for what is actually running.

## The chat room — a deliberate echo, not a bug

Right now **both** the card's assistant and its manager/mastermind hear every single
message the owner sends on a card — not just the assistant. Two independent paths
deliver the same prompt:

1. **The assistant's own path** — `Layers.js`'s `listen()`/`heard()` delivers straight
   to the card's assistant the moment a prompt line lands.
2. **The mastermind's path** — a task mastermind `attach`es itself to its own card
   (`Servex/agents/Dispatcher.js`, the line that calls `cards.attach(folder, agent.id)`),
   and `Servex/cards/Cards.js`'s `forward()` sends the same prompt text to every agent
   `attach`ed to the card, the mastermind included.

The owner's own words for this (09-29): "I kind of like having the echo so that an
assistant and the mastermind both get all of the messages... it's kind of just like a
chat room rather than a direct message... we don't get anything lost in the pipeline."
It stays this way until prompt processing (routing one message to exactly the right
listener) is worked out — see
[Manager / mastermind](/framework/core/Page/ai/doc/manager/) for the other side of it.
