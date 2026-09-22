# Ask — talk to a Claude Code session from the browser; for pages and tools on the dev server (localhost only)

## Use

```js
import { ask, available } from "/framework/ext/Ask/Ask.js";
if (available()) {
	const { text } = await ask("Name the three widest elements on this page.", { model: "haiku", tools: "" });
	await ask("What is wrong with this card's layout?", { shot: ".preview-card" });   // hands the turn a png
}
```

Ask about **one element on the page**. `pick()` is crosshair mode; what it resolves to carries that page's `readme.md` and `doc/decisions.md`, so the answer can cite them. `mount()` is the same thing as a floating **?** any page can opt into — [`doc/picking.md`](./doc/picking.md).

```js
import { pick, ask } from "/framework/ext/Ask/Ask.js";
import { mount } from "/framework/ext/Ask/chat.js";

const about = await pick({ app });                                    // null if you pressed Escape
await ask("What is this for?", { context: about, model: "haiku", tools: "" });

content(){ mount({ app: this.app }); }     // the floating ?; renders nothing off the dev server
```

Pass `url: this.url` too and the same **?** gains **Approve** / **Improve** for the whole page — the verdict `/layouts/browse/` already gives its 102 catalogued items, cast on any page instead: [`verdict.js`](./verdict.js), [`doc/decisions.md`](./doc/decisions.md).

Reply to **one item**, where it already is — an ask card, a decision row, a task card. Two small buttons under the item, and the answer lands under the same item; you never say which one you mean. The 🎤 dictates into the same box (Chrome only). `dictate()` is the third one: talk, and each thing you name becomes its own ask card — [`doc/reply.md`](./doc/reply.md).

```js
import { reply, dictate } from "/framework/ext/Ask/reply.js";

reply({ m, about: { kind: "ask", id: ask.id, summary: ask.summary, quote: ask.quote } });   // reply + 🎤
dictate({ m, about: { kind: "dictation", id: "asks" } });                                   // talking → ask cards
```

`chat({ task })` is the same thing as a panel; `thread()` opens a thread dir; `start()` spawns a whole session.

Every turn is **bound to the tab that asked** — it is told that tab's id, the `site` MCP tools take it, and the server rings the tab while the turn runs. `context` sends the page's current state along (the dev rail sends the selection).

**`edit.js` is where the site's one edit/production switch lives.** `edit()` is true when the dev socket is live AND the dev rail's "edit" checkbox is on (default on, remembered); every editor control on the whole site — `available()` here, the browse verdicts, the Decisions tab, rank grips, reply/mic, Make's writes — reads this one function instead of checking the socket itself, so turning the rail's checkbox off previews production mode on localhost: [`doc/decisions.md`](./doc/decisions.md).

## Watch out

- A turn is a fresh `claude -p --resume` process, not a live pipe — no permission prompts, no mid-turn steering: [`doc/process.md`](./doc/process.md)
- A turn drives one tab and only that one; its claim overwrites a hand-made one on that tab: [`doc/decisions.md`](./doc/decisions.md)
- The first message on a task forks the session; every later one resumes the fork: [`doc/fork.md`](./doc/fork.md)
- `reply()` is the considered exception: a reply thread starts a FRESH session, because forking a day-long one cost $0.18 and answered "Prompt is too long": [`doc/reply.md`](./doc/reply.md)
- `task` is a path under `public/` and it is the fence — browser input reaches a file write: [`doc/task.md`](./doc/task.md)
- Appending to `task.jsonl` live-reloads every open tab; the asking socket is muted for 5s: [`doc/record.md`](./doc/record.md)
- `shot` reloads the url in a fresh headless browser — dragged-open state is not what it photographs: [`doc/shot.md`](./doc/shot.md)
- The page a pick reports and the folder that explains it are two different addresses — a `Doc`'s content lives in a synthetic child page that owns no files: [`doc/picking.md`](./doc/picking.md)
- `mount()` is opt-in per page and never site-wide; inside a rail or a columns host the `?` pins to that region's corner: [`doc/decisions.md`](./doc/decisions.md)
- Off localhost `ask()` rejects; guard with `available()`, never let a page depend on a reply. A turn costs money (~$0.02 haiku): [`doc/decisions.md`](./doc/decisions.md)
- Tool scoping is per-call and opt-in (`tools`); the production chat paths pass none — `reply()` is the one that passes `""` and lets the browser do the writing: [`doc/decisions.md`](./doc/decisions.md)
- A reply's turn writes nothing itself; the browser appends its `ask`/`decision`/`log` lines, so a malformed block is dropped, not half-written: [`doc/reply.md`](./doc/reply.md)
- 🎤 is the browser's own `SpeechRecognition` — Chrome desktop and Android only, and the button is not drawn elsewhere: [`doc/reply.md`](./doc/reply.md)

## More

- [Overview](/framework/ext/Ask/) · [`doc/reply.md`](./doc/reply.md) (reply in place, the mic, dictation) · [`doc/picking.md`](./doc/picking.md) (pick an element, and what the turn is told) · [`doc/decisions.md`](./doc/decisions.md) (record, traps, open) · [`doc/task.md`](./doc/task.md) (the path and the fence) · [`doc/process.md`](./doc/process.md) (a turn is a process) · [`doc/fork.md`](./doc/fork.md) (fork then resume) · [`doc/shot.md`](./doc/shot.md) (the picture) · [`doc/record.md`](./doc/record.md) (the `chat` verb)
- Files that matter: `Ask.js` (the RPCs), `pick.js` (the picker and the context it gathers), `chat.js` (the panel, and `mount()`), `reply.js` (reply in place, and dictation), `mic.js` (the microphone), `Server/plugins/Ask.js` (the turn), `Server/plugins/Start.js` (the spawn), `Server/plugins/Shot.js` (the png)
