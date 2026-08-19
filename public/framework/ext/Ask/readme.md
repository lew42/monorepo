# Ask — talk to a Claude Code session from the browser; for pages and tools on the dev server (localhost only)

## Use

```js
import { ask, available } from "/framework/ext/Ask/Ask.js";
if (available()) {
	const { text } = await ask("Name the three widest elements on this page.", { model: "haiku", tools: "" });
	await ask("What is wrong with this card's layout?", { shot: ".preview-card" });   // hands the turn a png
}
```

`chat({ task })` is the same thing as a panel; `thread()` opens a thread dir; `start()` spawns a whole session.

Every turn is **bound to the tab that asked** — it is told that tab's id, the `site` MCP tools take it, and the server rings the tab while the turn runs. `context` sends the page's current state along (the dev rail sends the selection).

## Watch out

- A turn is a fresh `claude -p --resume` process, not a live pipe — no permission prompts, no mid-turn steering: [`doc/process.md`](./doc/process.md)
- A turn drives one tab and only that one; its claim overwrites a hand-made one on that tab: [`doc/decisions.md`](./doc/decisions.md)
- The first message on a task forks the session; every later one resumes the fork: [`doc/fork.md`](./doc/fork.md)
- `task` is a path under `public/` and it is the fence — browser input reaches a file write: [`doc/task.md`](./doc/task.md)
- Appending to `task.jsonl` live-reloads every open tab; the asking socket is muted for 5s: [`doc/record.md`](./doc/record.md)
- `shot` reloads the url in a fresh headless browser — dragged-open state is not what it photographs: [`doc/shot.md`](./doc/shot.md)
- Off localhost `ask()` rejects; guard with `available()`, never let a page depend on a reply. A turn costs money (~$0.02 haiku): [`doc/decisions.md`](./doc/decisions.md)
- Tool scoping is per-call and opt-in (`tools`); the production chat paths pass none — open: [`doc/decisions.md`](./doc/decisions.md)

## More

- [Overview](/framework/ext/Ask/) · [`doc/decisions.md`](./doc/decisions.md) (record, traps, open) · [`doc/task.md`](./doc/task.md) (the path and the fence) · [`doc/process.md`](./doc/process.md) (a turn is a process) · [`doc/fork.md`](./doc/fork.md) (fork then resume) · [`doc/shot.md`](./doc/shot.md) (the picture) · [`doc/record.md`](./doc/record.md) (the `chat` verb)
- Files that matter: `Ask.js` (the RPCs), `chat.js` (the panel), `Server/plugins/Ask.js` (the turn), `Server/plugins/Start.js` (the spawn), `Server/plugins/Shot.js` (the png)
