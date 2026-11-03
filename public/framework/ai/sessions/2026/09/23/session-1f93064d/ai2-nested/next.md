# AI 2 — round 3, queued (not part of the running brief)

The owner, 2026-09-23 12:08, while round 2 (`requirements.md`) was in flight. Each is its own numbered deliverable for the next brief.

1. **The structure of the system, on the card.** A card shows who touched it and when: whisper → the fast assistant (route, name, card) → the Dispatcher (queued → task-mastermind) → its minions → the landing. One line per hop, with the agent's id and a link to its log. The reader should be able to see the whole chain without leaving the card.
2. **Token cost per card**, summed over every agent that worked on it (the assistant's turn, the task-mastermind, each minion), from the agents' `cost` fields on Servex (`/api/agents`) and the task ledgers. Shown on the card face as one number; the breakdown one click down.
3. **Dispatch state on the card.** When `dispatch.off` exists (see decision `dispatch-pause`), a task card says *queued — dispatch paused* rather than looking stuck.
4. **The fast assistant's context** — design item, not UI: see the ledger note of 12:10 (one base session with a rolling digest of recent cards, forked per card). Belongs to tiers-design; listed here because the card is where the owner will see it working or not.

## Defects seen on the live overview after the merge (2026-09-23 13:00)

5. **The Live column lists stopped agents** from Servex's registry (`fence-proof`, `registry-proof`, `wake-proof-off` — yesterday's proofs). Show only running/working agents; stopped ones behind one word ("3 stopped"), or not at all.
6. **"nothing here" shows under a filled column** — the empty word should hide once a row exists (`$empty.el.hidden = n > 0` is not doing it; find why).
7. **The landed column is empty** because it reads only today's `day.jsonl`; read the last two or three days, newest first, so a morning is never blank.
8. **Prove against a replay of the live log with a late event.** Round 1b's proof passed on a stand-in with no stream, and the first stream event on the live page broke the whole screen (rows built outside a builder landed in the site-wide `.pages`; fixed 13:00 in `overview.js` `draw()`). The stand-in must replay `ai/board.jsonl` and then push one event after paint before any proof counts.
