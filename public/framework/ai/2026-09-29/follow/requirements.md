# follow(path): Servex tells subscribed agents what changed

An agent can't watch a file. It only sees what arrives as a message. So Servex watches, and sends each change to the agents that asked for that path. This is the first piece of the voice-session design ([../voice-sessions/design.md](../voice-sessions/design.md)); the owner's words are in [../audio/owner-words.md](../audio/owner-words.md), sections "Continued (about 6:40 PM)" and "(about 6:55 PM)".

Report to **mastermind-servex-6**.

## Deliverables

1. **`follow({agent, path, gather_ms})` and `unfollow({agent, path})`**, as a Servex MCP tool and as an in-process tool for the agents Servex spawns. `path` is a file (a page.jsonl, a log) or a directory (any change under it). When `agent` is left out, it is the caller.
2. **One watcher, many subscribers.** Servex's existing chokidar watch (or one new one) sees file changes, appended log lines and merges, and sends each change to every agent subscribed to a path that covers it.
3. **Bursts become one message.** Changes within `gather_ms` (default about 2 s), and anything that arrives while the agent is busy, go out as ONE message through the same queue `send_to_agent` uses: new jsonl lines are passed through verbatim, and other file changes as a list of paths. Never `priority: now`.
4. **Subscriptions survive a Servex restart**, and end when the agent stops.
5. **Proof, logged as experiments in task.jsonl:**
   - 20 lines appended in 1 second arrive as 1 message.
   - A change to a file nobody follows reaches nobody.
   - After `unfollow`, nothing more arrives.
   - After a restart, the follow still works.
6. **Docs, in the build order** (the sub-mastermind skill): the readme and doc page in `Servex/`, then a fresh mastermind reads only the docs, then the review, then the merge.

## Watch out

- A file READ fires fs.watch "change" on Windows (a known trap). Compare sizes or mtimes before sending anything.
- Never follow the whole tree. Refuse a path above `public/framework/<module>` or `Servex/<dir>`.
- Keep it small: one file, about 150 lines, if possible.

## Fence

`Servex/` (the watcher, the tools, their doc). Take a worktree. Restart Servex with `node Servex/sustain.mjs --restart` as your last step, and tell me.

