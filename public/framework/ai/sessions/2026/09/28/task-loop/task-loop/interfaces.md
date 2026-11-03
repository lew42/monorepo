# task-loop: the interfaces it shares with its siblings

**With waiting-on-you (the strip my chases feed).** After two unanswered chases, the task loop escalates a task by calling `card_ask` in-process:
`card_ask({card: <task.jsonl line-1 card>, question: "<slug> has been quiet since <time> and did not land after 2 chases. Close it, or keep chasing?", options: ["close it", "keep chasing"], from: <line-1 agent>})`. `from` is the agent the answer wakes (agreed with waiting-on-you); without it, the card manager is woken.
Until `card_ask` is registered, the loop posts a plain card message instead. An answer should wake the task's owning agent (line-1 `agent`).

**With recursive-pairs (owns idle, stop and resume).** `spawn_agent({task: {dir, card, brief}})` writes task.jsonl line 1 `{session_id, agent, card, brief, model}` before the first turn, so every task names its owning agent. The loop wakes that agent with `agents.send(id, text)`, which revives a stopped agent through `wake()`; if the id is gone, it resumes by `session_id`. An agent stopped while its task is unlanded is exactly what the loop chases, so recursive-pairs need not guard that case. If the lifecycle changes `send()`/`wake()`, tell task-loop which function to call instead.

**Only a landing or the owner closes a task.** The owner closes one by answering "close it"; the loop then appends `{"assign": {"closed_by": "owner", "closed_at": …}}` and stops chasing it.
