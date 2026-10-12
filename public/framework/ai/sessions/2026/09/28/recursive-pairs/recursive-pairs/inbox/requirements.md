# Minion: inbox — a VS Code tab is an agent you can message (D8)

Rules shared by all minions: `../common.md`. Owner's words: `../requirements.md` deliverable 8, and the card dir `public/framework/ai/2026/09/25/one-recursive-agent-system-the-same-pair/`.
**Fence:** a NEW `Servex/agents/External.js` (and its test), `Servex/agents/registry.js`, `Servex/agents/tools.js`, `Servex/agents/Agents.js` (the send path only), `Servex/cards/Cards.js` (only if `by` is not already recorded), `Servex/Servex.js` (one install line), `.claude/skills/servex-mastermind/SKILL.md`, new files under `Servex/agents/doc/`. Private Servex port **8490**, run with `SERVEX_NO_LAYERS=1`.

## Deliverables
1. **Register.** An MCP tool `register_session({id, session_id})`, called from a tab. Servex lists it in `list_agents` as `kind: "external"`, with an inbox at `logs/inbox/<id>.jsonl` (under Servex's own log dir, so SERVEX_HOME moves it).
2. **Deliver.** `send_to_agent` to an external id appends one JSON line to its inbox (`from`, `text`, `reply_to`, `at`). Policy treats it like a live agent of that name.
3. **Card to creator.** `create_card` records `by` (check; cards' page.jsonl already shows `by`). What the owner says into a card goes to its creator's inbox when the creator is external. Subscribe to cards in External.js (`servex.cards.on`), not in Layers.js (another minion's file).
4. **Watch.** A few lines in the `servex-mastermind` skill: a tab runs one `Monitor` on its inbox with no expiry, re-armed at the start of each turn.
5. **Prove it:** a message said into a card reaches the tab's inbox **within 2 seconds**, timestamped, on the private Servex.
