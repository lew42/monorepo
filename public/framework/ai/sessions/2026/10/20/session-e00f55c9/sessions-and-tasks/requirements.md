# Sessions and tasks: three jobs

A spawned agent is a **session**; a **task** is something to finish. Three things are open:

- [ ] Document who creates sessions and tasks, in `framework/ai/readme.md`.
- [ ] Make spawned agents start with `session.jsonl`, not `task.jsonl` (slice 3).
- [ ] Keep the Servex tunnel up, so the connector URL never goes stale.

The owner's words (VS Code tab, 2026-10-20, verbatim):

> you are my vs code mastermind, you will work autonomously and help me get shit done.
>
> one of the most important things to fix, is our session and task systems. they should be documented thoroughly via our readme system, in framework/ai/readme.md. look into that now.
>
> give me a very short and sweet overview, preferably in OOP simplified pseudo code (class hierarchy, core api), of who/how/when tasks are created.
>
> yesterday, it seemed tasks were being created for sub-agents (minions), which are "sessions", not "tasks". each minion might have one or more tasks, but I want to make sure we've fixed that part.
>
> help bring clarity to how/when/who/where sessions and tasks are created.
>
> also, make sure servex is up and running, namely the servex MCP

Mid-turn:

> Servex mcp can't connect, might be an issue with the cloudflare tunnel?

> When I click the Servex MCP connector in the Claude app here, and I click the connect button, it says couldn't start sign in, try again. But every time I click it, it says that. I don't know if I need to remove the connector and re-add it. I don't know if it's because the server, you know, on the PC there isn't running. I don't know if it's because the tunnel needs to be kind of updated. I think there was something about, you know, maybe the tunnel goes, like, dies at some point and then might get a new IP, or I don't know. I'm not sure what's going on there.

## What was found (2026-10-20 15:00)

- The local Servex and its MCP were up (`system_health` answered). The Cloudflare **quick tunnel** was down: `remote.tunnel.json` named a pid from 2026-10-15 that no longer existed, and no `cloudflared` process ran. Nothing supervises it (Servex does not start `Server/Tunnel.mjs`). A quick tunnel gets a **new random hostname** every time it starts, so the connector URL saved in claude.ai goes stale on every restart. Brought up by hand at 15:05 (new host, same token).
- The decision "a spawned agent is a session, a task is something to finish" (ai/doc/sessions-and-tasks.md, 10-19) had landed only as a plan. Yesterday's task-system agent then did most of slice 2 (readers go through `SessionRecord`). Slice 3 (a spawned agent's folder starts as `session.jsonl`) was not done: every spawn on 10-19 still got a `task.jsonl`. `SessionRecord.start_file` gives `session.jsonl` only to a folder directly under a day.

## Deliverables

1. `framework/ai/readme.md`: a "Sessions and tasks" section in simplified OOP pseudo code (class hierarchy, core API, who/how/when/where creates each), verified against the code, with the fix status. The mastermind writes this.
2. Slice 3 built and merged, Servex restarted so it is live: `session-record/requirements.md` (a Sonnet helper).
3. Servex keeps the tunnel up and the owner can always find the current connector URL: `tunnel-keeper/requirements.md` (a Sonnet helper).

Fences: the mastermind owns `public/framework/ai/readme.md` and `ai/doc/sessions-and-tasks.md`. `session-record/` owns `Server/SessionRecord.mjs`, its test, `Servex/agents/Agents.js` (open_task/default_task only), `public/framework/core/Task/TaskPage.js`, `.claude/hooks/prompt-relay.mjs`, `.claude/hooks/naming-guard.mjs`, `Server/Steps.mjs`. `tunnel-keeper/` owns `Server/Tunnel.mjs`, `Servex/Servex.js` (boot wiring only), `Servex/ext/remote/`.
