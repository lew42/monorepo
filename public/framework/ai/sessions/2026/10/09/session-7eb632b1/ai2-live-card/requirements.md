# ai2-live-card

## The ask, verbatim

> figure out why the framework/ai2/ new card -> dictation, which works, but the fast assistant isn't able to respond?  my statements properly appear (and even get encapsulated as their won "page", however switching to the sub-item's card caused double recordings that both went to the parent card.
>
> this was because clicking the mic on the nested card didn't stop the mic on the first card.  and, the destination for the dictation failed for the nested card, because they both appeared on the first card.
>
> i want the fast-assistant to be able to respond.  and shouldn't he be able to spawn minions that can also respond?
>
> here's what i want on the framework/ai2/ page.  i want to be able to create cards, that don't originate from the ai/board.jsonl.  so, we want framework/ai2/live/, where this is a card (with preview and full content) that appears in the rail, and also can be selected as a route.  that card should, in the preview, show the usage progress bars (look at the framework/ai/ page, i think they are there), and any currently running agents and major tasks.  this preview card should get bumped to the top of the list, whenever there's an update to any of it's children.  ai or me should be able to clear items from the "live" card.  when an update to any live task? happens, we should be able to click into the card, and at the bottom, see a log of recent updates.  that log is where dictations should go.  it's like, each page is a chat room, with a log, by default.  at least these ai2/ cards...

## Deliverables

1. Why the assistant "can't respond" — found and fixed (its replies never reached the card's own log).
2. One microphone at a time — starting one stops every other.
3. A sentence spoken into a sub-card lands in that sub-card's own chat, and never becomes a stray card.
4. Spawned agents (the Dispatcher's task masterminds, and a new light "helper") can reply into a card.
5. `/framework/ai2/live/` — a card not from board.jsonl: rail preview with usage bars, running agents, major tasks; bumps to the top on any update; items clearable by you or an AI.
6. Every card's page ends in a chat log — your words and every agent's replies; on `live/`, the updates too.

## Fence

`public/framework/ai2/**`, `Servex/agents/Assistant.js`, `Servex/agents/Dispatcher.js`, `Servex/agents/assistant.md`, `Servex/Servex.js` (routes only), this task dir.
