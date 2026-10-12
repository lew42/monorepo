verdict: fix

Reviewer: a fresh in-process Opus agent, given the masterminds' own bug sentences prefixed "Don't build this. You are reviewing the finished result against it." Reviewed commit 691b1ee9 (spawn queue).

1. [fix] A fresh spawn with the same role+name was merged into a queued one and its prompt dropped: two different jobs could share one reviewer.
2. [fix] The legacy mark also hit rows stopped routinely (assistants, managers, the current mastermind), so messages could no longer wake them.
3. [fix] holder() only looked at live agents; the current mastermind is idle-swept most of the time, so a message for a retired -5 still went to -5.
4. [fix] restore() and drain() did not ask the revive guard: a held spec whose cwd was deleted or whose task landed would still start.
5. [fix] The `a.id !== spec.id` exclusion let a resume of a live agent under its own id start a second process.
6. [note] With SERVEX_NO_MONITOR, nothing drained restored entries.
7. [note] send_to_agent and stop_agent did not know queued ids; when_started hangs to its timeout if spawn_now throws.
8. [note] Rewriting child.parent in wake_parent is harmless.
9. [note] Any caller could pass `finishing: true` to skip the gate.
