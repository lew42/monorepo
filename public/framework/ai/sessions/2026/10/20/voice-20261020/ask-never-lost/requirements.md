# ask_mastermind: every answer always arrives

Budget: $3, Sonnet. Parent: [voice-20261020](/framework/ai/sessions/2026/10/20/voice-20261020/). Asked by the owner (18:50, relayed by vscode-mastermind). The finding is the `experiment` line of 18:49 in `../session.jsonl`.

## The problem

`RemoteMCP.ask()` (`Servex/ext/remote/RemoteMCP.js`) only notices that the app dropped a call when `res.destroyed` or `res.socket.destroyed` is true. An MCP client cancels a call with `notifications/cancelled`, and `post()` answers that with 202 and ignores it (around line 99). Behind cloudflared, the socket may stay open.

So when the owner interrupts and the answer still arrives inside the minute, `deliver(false)` marks it sent and returns it into a dead response, and it never reaches the inbox. Also, the watchers live in memory, so an answer written while Servex restarts is never delivered.

## Build (all in `Servex/ext/remote/`)

1. **Every answer goes to the inbox.** `deliver()` puts every answer in the caller's inbox with `reply_to = qid`, whether it was returned or not (`servex.external.ensure(CALLER).deliver(...)`, as the late path does now). Nothing can be lost.
2. **Cancels are noticed.** `notifications/cancelled` with `params.requestId` marks that call cancelled. Keep a map from the JSON-RPC id of each open `ask_mastermind` call to its `used` object, and have `used.cancelled()` check it too.
3. **Answers survive a restart.** Keep a small delivered record (for example `remote-replies/delivered.json`, or a `<qid>.delivered` marker; pick the simplest). At boot, any `remote-replies/<qid>.txt` that isn't marked delivered goes to the inbox once. Don't redeliver the old ones: mark everything older than this change as delivered on first run, or only consider files newer than 24 h that have no marker.
4. **Tell the voice agent.** Add one sentence to `RemoteMCP.INSTRUCTIONS`: every answer also arrives through `updates` with `reply_to` = its ticket, so skip one you already have.
5. **Test.** Add cases to `RemoteMCP.test.mjs`:
   - A `notifications/cancelled` while waiting stops the wait, and the answer reaches `updates`.
   - An answer returned in time is also in the inbox.
   - The boot sweep delivers an undelivered reply file.
6. **Doc.** One caveat line in `doc/cloud-voice-agent.md`: an interrupted ask could lose its answer, found 2026-10-20, fixed by this task. Link `/framework/ai/sessions/2026/10/20/voice-20261020/`. Also update `doc/remote-tools.md` if it describes delivery.

## Land

- Work in your worktree and commit each step.
- Run `node Servex/ext/remote/RemoteMCP.test.mjs` until it passes.
- Merge with `MSYS_NO_PATHCONV=1 node Server/merge.mjs <worktree> --skip-smoke`. The change is server-side only and there is no page to check.
- **Never restart Servex.** vscode-mastermind restarts it when nobody is working.
- Append a landing line to this folder's log, then stop.
