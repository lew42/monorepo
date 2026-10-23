Budget: $6

# TaskLoop: node chases every started task that goes quiet

The model: `public/framework/core/Task/doc/resolution.md` section 8, and the 4th build-list item. What runs today: `public/framework/core/Task/doc/cracks.md`, "What chases a task today". Extend the existing `Servex/TaskLoop.js` `tick()`; do not add a second chaser (also check `Servex/Heartbeat*` so the two don't both message the same agent).

1. **Every started task, no opt-in.** Drop the opt-in date gate. A task is chased when its state is running (started) and its log has no new line for about 5 minutes. Tasks that are proposed (waiting), accepted (idle), paused, stopped or complete are left alone.
2. **Ask for status, not a bare wake.** Send its agent one message: the task title and path, "no line on your log for N min: add a line with where you are, or complete/stop it". If the agent is not live, wake it the usual way.
3. **Escalate.** Three asks in a row with no new line, or the agent's reply/log says it is blocked: one red flag on the board (the card TaskLoop already posts), and keep flagging once per hour after that, not once forever. A new line resets the count.
4. **State lives on disk**, not in memory, so a restart keeps the counts (a small JSONL beside TaskLoop's other state, or lines on the task log; pick the existing pattern).
5. Doc: update the "Node chases started tasks" section of resolution.md if anything differs, tick its build item ✅, and the TaskLoop doc.

Done means: a test with a fake clock and a temp store: a started task quiet for 5 min gets one ask; after 3 asks it is flagged; a new line resets; an idle (accepted) task is never asked. Existing TaskLoop tests pass. Commit in your worktree; do not merge. Final reply: commits, pass counts.
