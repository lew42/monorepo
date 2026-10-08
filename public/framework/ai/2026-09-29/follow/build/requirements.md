# Minion brief: build follow(path) in Servex

Load the `minion` skill first. The parent brief is [../requirements.md](../requirements.md): read it start to finish, it is the acceptance test. The design it serves: [../../voice-sessions/design.md](../../voice-sessions/design.md) (row "follow(path)"). The owner's words: [../../audio/owner-words.md](../../audio/owner-words.md), sections "Continued (about 6:40 PM)" and "(about 6:55 PM)".

Report to **task-mastermind-follow** (your parent). Your log is `public/framework/ai/2026-09-29/follow/build/task.jsonl` **in the worktree**.

## Where you work

The worktree `C:/Code/lew42/worktrees/qf-7` (branch `worktree/qf-7`). Every edit and commit happens there, never in `C:/Code/lew42/monorepo`. Commit by exact path. Do not merge; I merge.

Fence: `Servex/` only (plus your own task dir). Don't touch `public/` apart from your log.

## Deliverables

1. **`Servex/Follow.js`** (one file, about 150 lines if possible): a class holding subscriptions `{agent, path, gather_ms}`.
   - `follow({agent, path, gather_ms = 2000})`, `unfollow({agent, path})`, `list(agent?)`.
   - `path` is repo-relative, a file or a directory. **Refuse** anything above `public/framework/<module>` or `Servex/<dir>` (so `public/`, `public/framework/`, `Servex/`, the repo root are refused), and anything outside the repo.
   - **One watcher** (chokidar, already a dependency — or reuse any watcher Servex already runs) covering only the union of followed paths, re-scoped when subscriptions change. Nothing followed = nothing watched.
   - **Windows trap:** a file READ fires a "change" event. Keep each file's last size and mtime; send nothing unless one moved.
   - A `.jsonl` file: remember the byte offset; send only the NEW complete lines, verbatim. Other files: send the path.
   - **Bursts:** per agent, collect changes for `gather_ms` after the first one, then send ONE message through the host's normal queue (`agents.send(id, text, {from: "servex-follow"})`, the same path `send_to_agent` uses). Never `priority: now`. Messages that arrive while the agent is busy just queue behind its turn — that's the queue's job, don't add a second one. The message: a header line (`follow: 3 changes under <path>`), then the jsonl lines grouped per file, then the list of other changed paths.
   - **Persist** subscriptions to one small json file in Servex's own state (look at how `keep.json` / the agent registry persist, and do the same), reload them on boot.
   - **End on stop:** when an agent stops, drop its subscriptions (see `Agents.js` line ~41, where `agent.state === "stopped"` already calls lifecycle; hook in the same way).
2. **Tools**: `follow` and `unfollow` (and `list_follows` if cheap) as Servex MCP tools, shaped like `agents/tools.js`, wired so the in-process agents get them too (the same `tools(host)` path hands them to `createSdkMcpServer`). `agent` defaults to the caller (`ctx.caller`, as `caller_is_from` does in tools.js).
3. **Wire it in `Servex.js`**: one `Follow` instance, started at boot.
4. **Proof script** `Servex/proof/follow-proof.mjs` that runs WITHOUT the live Servex: a fake host whose `send()` records messages, a temp dir inside the repo (under `Servex/proof/tmp-follow/`, deleted at the end), and these four checks, each printing PASS/FAIL and a number:
   - 20 lines appended within 1 second arrive as 1 message holding all 20 lines.
   - A change to a file nobody follows reaches nobody (0 messages).
   - After `unfollow`, nothing more arrives (0 messages).
   - After a "restart" (dispose the instance, make a new one from the same state file), the follow still works (1 message).
   - Plus: reading a followed file (`fs.readFileSync`) sends nothing.
   Log each as `{"experiment":{"try","measure","result"}}` in your task.jsonl with `node .claude/hooks/append.mjs <target.jsonl> <lines.json>`.
5. **Docs**: `Servex/doc/follow.md` (what it is, the tool call, the message shape, the traps, the proof command) and one short entry in `Servex/readme.md` that points to it. Plain sentences, readme voice; load the `content` skill first.

## Rules

- Every Node spawn/exec/fork sets `windowsHide: true`.
- Don't restart Servex, don't start/stop dev servers, don't touch the live `C:/Code/lew42/monorepo` tree. Stop any process you start.
- `node --check` every file you touch, and `node -e "import('./Servex/Servex.js')"`-style import check from the worktree root must not throw on syntax (it may fail on ports; that's fine — say so).
- When done: commit in the worktree, then end your turn with one short message: what you built, the proof numbers, the commit hash.
