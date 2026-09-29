# Manager / mastermind, per page

[Servex](/framework/servex/doc/roles/) keeps a second, bigger agent on every card: the
**manager** (an Opus session, `Servex/agents/Layers.js`, role `card-manager`). It is
started by the card's own assistant the moment something needs real work
(`ask_manager`), and — unlike the assistant, which answers right away and moves on —
its session is kept for the card's WHOLE life: stopped when quiet, resumed by its saved
session id, so everything asked on that card earlier is still in its memory.

A bigger task (a whole page, a whole system) instead gets a **task mastermind** — the
same role, spawned by the Dispatcher rather than by a card's assistant, and given its own
git worktree. Its brief and its numbered deliverables live in the task's own
`requirements.md`; it splits the work into minion-sized pieces, judges each one, and
lands the task.

- Where a manager and a task mastermind differ, and how each is started:
  [`Servex/agents/readme.md`](/framework/servex/) → "Who's who".
- **The chat room**: a task mastermind hears every owner message on its own card too,
  the same moment the assistant does — see
  [Fast assistant](/framework/core/Page/ai/doc/assistant/) for exactly where that
  doubling happens in the code.
