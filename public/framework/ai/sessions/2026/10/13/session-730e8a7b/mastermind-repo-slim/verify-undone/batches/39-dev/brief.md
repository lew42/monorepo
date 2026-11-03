# Check 1 asks against the repo: dev

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/39-dev/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `dev`, folder `public/framework/dev` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/dev/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/dev/readme.md`)

# Dev — the local-only tier: live reload, the DevBar rail, tab claims. For whoever runs `node server.js`.

## Index
[Claim](./Claim/) — a ring and label around a browser tab an agent has claimed, so you can see which tab is theirs
[DevBar](./DevBar/) — the right-hand rail of dev chrome (log, history, hold, ask), opened with Ctrl + backslash
[Socket](./Socket/) — the one WebSocket to the dev server that live reload and every dev-only feature ride on


## Use

```js /app.js
socket: Socket.singleton(),   // once, unconditional — inert off localhost
```

Save a file under `public/`; every tab that loaded it reloads. That is the whole tier.

## Watch out

- The one rule: dev-only, connects on localhost only, nothing here may ship behaviour to production (LAW#2, LAW#6). The check lives inside `Socket`, never at a call site: [Socket/doc/localhost.md](./Socket/doc/localhost.md)
- Windows: `pkill -f "node server.js"` matches nothing and the orphan pins a core — `taskkill //F //PID <pid>`: [doc/decisions.md](./doc/decisions.md)
- `claim.js` must not import `/app.js` — it closes a circle that only breaks on a deep reload: [doc/decisions.md](./doc/decisions.md)
- A tab reloads only for files it loaded; a stale tab is usually a file it never touched, not a bug: [doc/decisions.md](./doc/decisions.md)

## More

- [Overview](/framework/dev/) · [doc/decisions.md](./doc/decisions.md) — the boundary rules (dev may import ext, core may not), cross-module traps, the open DesignTool question
- [Socket](/framework/dev/Socket/) — reload + RPC bridge · [DevBar](/framework/dev/DevBar/) — `Ctrl + \` rail · [Claim](/framework/dev/Claim/) — agent's tab ring
- Files that matter: `Socket/Socket.js` (localhost check, RPC), `DevBar/DevBar.js` (tier's one mount), `Server/` (Node half, dev-only)

## Also here (readme audit, 2026-10-13)
- [DevShell](./DevShell/) — DevShell — Ctrl + \ opens a dark shell around the whole site: page tree left, the dev bar's own tabs right
- [mobile](./mobile/) — Mobile — How to open this site on a phone, why the microphone and the socket behave differently there, and wha


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/39-dev/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 1 asks

1. `b619bab1d3` (4 days old): Add a screenshots tab to the dev shell sidebar on any page that has screenshots, to browse the history of design changes.
