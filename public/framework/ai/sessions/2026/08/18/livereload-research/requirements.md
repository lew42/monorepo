# livereload-research — the LiveReload report, produced through ext/Research

**Laws: less is more · clarity · prioritize.** You are one minion among several writing into ONE append-only file through ONE tool. Every node is one line ≤ 240 chars; reasoning goes in `--why` (≤ 1000). No walls of text. **No nitpicking — but write nothing off that could matter: say when it would matter.**

## The ask (owner, verbatim)

> write a report about LiveReload with respect to: .js updates, css updates, .json and .jsonl updates, parallel work sessions, chokidar, my fans that often wake me up, etc. What are the conclusive findings, framed SIMPLY, easy to NAVIGATE. Interactive Research Reports should be highly navigatable. Bury the details, start with the conclusions.

## The tool — read this before anything

```
node public/framework/ext/Research/research.mjs --help          # the verbs, quoting rules
node public/framework/ext/Research/research.mjs outline livereload   # the current tree: id · kind · score · state · by · text
node public/framework/ext/Research/research.mjs say livereload --by <you> --kind claim --text "…" --refs "Server/plugins/X.js:12,https://…" --importance 4 --icon bolt
node public/framework/ext/Research/research.mjs say livereload --by <you> --kind evidence --parent <id> --text "…" --refs "file:line"
node public/framework/ext/Research/research.mjs say livereload --by <you> --kind dissent  --parent <id> --text "…" --why "…"     # why is REQUIRED for support/dissent
node public/framework/ext/Research/research.mjs vote livereload --by <you> --node <id> --importance 2
node public/framework/ext/Research/research.mjs agent livereload --name <you> --persona <persona> --model <model> --doing "what you are on right now"   # update as your focus moves; --done "one line" when you finish
```

Kinds: `claim` (an assertion, root or under a claim) · `evidence` (a fact + `--refs file:line` or a url; measured or read, never guessed) · `support` / `dissent` (with `--why`) · `alternative` (a different way, with cost) · `question` (what nobody knows yet) · `note`. `--importance` 1–5 is your honest guess of how much this matters to the owner's question; the orchestrator ranks by it. **Read `outline` first, and again before each node — someone may already have said it; then support/dissent/evidence THAT node instead of a duplicate root.** Do not read `research.jsonl` raw. Do not edit any file. Do not restart the server. Do not touch the owner's browser tabs.

## Where the truth is (all read-only)

`Server/plugins/SocketServer/LiveReload.js` `Tail.js` `Directory.js` `SocketServer.js` `Socket.js` `Runtime.js` `Tab.js` · `Server/README.md` · `Server/doc/spin.md` (the fans) · `public/framework/dev/Socket/Socket.js` (the browser half — what it DOES with `changed`) + `dev/Socket/doc/wire.md` · `public/framework/ext/JSONL/live.js` + `doc/live.md` · `package.json` (chokidar version) · `.claude/skills/new-task/SKILL.md` (claims "every append reloads the owner's tab" — true?) · `.claude/skills/check-claude-usage/SKILL.md` (claims `usage.json` reloads the dashboard — but `.json` is ignored by the watcher?).

## Personas and fences — round 1 (parallel, ≤ 8 nodes each, ~10 minutes)

- **scout-server** — the server side of every path: what happens on a `.js` change, a `.css` change, a `.json` write, a `.jsonl` append, a new file, a delete; the two watchers; the mute; the debounce. Claims with `file:line`.
- **scout-browser** — the browser side: `dev/Socket/Socket.js` — on `changed([paths])` does it hot-swap css? re-import js? full reload? what does `jsonl`/`jsonl_reset` do in `ext/JSONL/live.js`? Settle "every append reloads the tab" with evidence.
- **scout-fans** — the fans: `Server/doc/spin.md`, the memory of ~4-day spins, chokidar version + a **web search** for chokidar Windows CPU spin / ENOENT retry loop / directory-handle locks / `usePolling` / `awaitWriteFinish`; write what is KNOWN vs SUSPECTED as separate nodes; propose ≤ 2 `alternative`s with their cost.

## Round 2 (after round 1 lands)

- **skeptic** — for every root claim: verify against the code; `support` or `dissent` with `--why` and refs; `vote` importance on each root honestly (a thing that never happens in practice is a 1 even if true); for anything low, say in `--why` when it WOULD matter.
- **builder** — for the top 3 problems by score: `alternative` nodes — the simplest fix, its cost, what it could break.

The orchestrator writes verdicts and the summary. Log nothing elsewhere; your task log is this dir's `task.jsonl` only if you must (a `log` line); your work IS the research file.
