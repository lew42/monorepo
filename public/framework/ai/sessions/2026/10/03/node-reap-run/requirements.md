Budget: $3.

# Servex: free the RAM held by idle dev servers, now

One step: run the reaper that's already written, and record what it freed. The lasting fix (Servex starts every server, with leases and idle stops) is the bigger brief, `public/framework/ai/sessions/2026/10/02/node-reap/requirements.md`, and isn't part of this step.

1. `node public/framework/ai/sessions/2026/10/02/node-reap/node-reap.mjs`: a dry run. Read its plan. It stops only these:
   - whole server trees in worktrees with no working or idle agent;
   - extra copies of the main server;
   - orphans with no parent.
   If the plan names a server that a live agent is using, stop and say which one; don't apply.
2. The same command with `--apply`. It writes `result.json` (node.exe count and MB, before and after).
3. Append the before and after figures from `result.json` as an `experiment` line in this task.jsonl, copied from the file, never typed from memory. Then land it.

Sonnet, medium effort. Never kill a process the script doesn't name. Don't wait on the owner.
