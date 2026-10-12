# ask-tab-binding — the DevBar's AI turn is bound to the tab that asked, always

Laws: less is more · clarity · prioritize. **Deliverable: the binding, working and proven with one real turn against TWO tabs on the same path; ≤ 25 lines added to `ext/Ask/doc/decisions.md`; readme lines updated. Final message ≤ 20 lines.** Opus: the design is small but a wrong shape here is expensive; get it right once.

The owner (2026-08-18), verbatim:

> I've been testing the DevBar's AI (Ask) tab, which is pretty cool. I was able to get the page-specific threads to connect via MCP, but that's kind of a big runaround. The Ask widget responds via the socket, so we might not need MCP? Or build somethign similar? Or maybe it's easier to just use the MCP? Anyway, the DevBar's AI needs a reliable way to connect (via mcp or otherwise) to that specific tab, so that if you ask it to do something, it doesn't accidentally do it on the wrong tab, for example.

And, later: *"One note on the selection - we probably want to integrate that into the DevBar's AI context."*

## How it works today (verified by the mastermind, read these files first)

- Browser: `dev/DevBar/ask.js` (the AI tab: threads per page, `chat()`), `ext/Ask/chat.js` → `ext/Ask/Ask.js` `ask()` → `rpc:ask` over THIS tab's dev socket (`dev/Socket/Socket.js`).
- Server: `Server/plugins/Ask.js` receives `rpc:ask` on that socket and spawns one `claude -p --output-format stream-json --model … [--resume …] [--tools …]` turn (`turn()` at ~line 32). It already holds `this.socket` — the asking tab's socket — and `socket.tab` is a `Server/plugins/SocketServer/Tab.js` (page path via `rpc:hello`, `eval(code)` channel).
- The turn reaches the browser ONLY through the `site` MCP (`.mcp.json` → `http://localhost/mcp`, `Server/plugins/MCP.js`; `.claude/settings.json` has `enabledMcpjsonServers: ["site"]` and `defaultMode: bypassPermissions`, so a `-p` turn in the repo cwd gets the tools without prompts — verify). Its tools `pages` / `eval` / `claim` / `release` pick a tab by **`path`** — *"omit for the first connected one"*. That is the defect: two tabs on one path are indistinguishable, the default is arbitrary, and the model has to guess. The dev server was restarted 15:52 today, after `MCP.js`'s claim/release landed, so those tools are live.
- The MCP `eval` answer already ends with a state line (visibility/focus/size) — keep that.

## Build (the shape the mastermind proposes — validate it, change it if the code says otherwise, and say why)

1. **A tab has an id.** `Socket.js` mints one per tab in `sessionStorage` (`crypto.randomUUID()`; survives reload, unique per tab, dies with it) and sends it in `hello` beside the path — `this.rpc("hello", pathname, id)`. `Tab.js` keeps `this.id`. `MCP.js` `pages` lists `id · path · since · claimed-by`; `eval` / `claim` / `release` accept **`tab: <id>`** (preferred) or `path`; when `path` matches more than one tab, return an error naming the ids instead of picking the first. Nothing else about the wire changes (`dev/Socket/doc/wire.md` — update it).
2. **The turn is told its tab.** In `Server/plugins/Ask.js`, the asking socket's `tab.id` + `tab.page` go into the spawn as `--append-system-prompt` (verify the flag with `claude --help`; fall back to prepending to the prompt if absent): *"This conversation is bound to browser tab `<id>` at `<path>`. For anything about this page use the `site` MCP tools with `tab: "<id>"`; never target another tab; `pages` shows the others."* The server also **claims the tab itself** at turn start (`tab.eval` of `dev/Claim`'s `claim("ai", "<thread slug>")`) and releases at turn end — no model involvement, so the owner sees the orange ring the moment the AI is working on that tab. If `dev/Claim` is stale for that behaviour, the smallest change wins.
3. **Selection into the context (stretch, only if 1–2 land clean):** if the page has a current selection (`ext/drawer` / Panel `properties.js` — find the one contract, likely a `panel-focus`-style document event or a `data-` attribute), the browser passes its selector/outerHTML head (≤ 500 chars) with `rpc:ask` and the server appends *"The owner has selected: …"* to the same system prompt. Skip if it needs a new contract — say so.
4. **Prove it.** Open TWO headless Playwright tabs (global playwright; import as `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`) on the same path, e.g. `http://localhost/framework/ext/Panel/`, each with `document.title` set differently via eval; from tab B call `ask("Using the site eval tool on the tab you are bound to, return document.title and the tab id you were told. Nothing else.", { model: "haiku", task: "framework/ai/2026-08-18/ask-tab-binding/ai/proof" })` — the reply must name tab B's title and id, and `pages` must show B claimed during the turn. Log the raw reply and the two ids as a `log` line. ⚠ A turn costs ~$0.02 on haiku; three turns maximum. ⚠ Server plugins are not hot-reloaded: **the owner runs the dev server in their own terminal; never restart it hidden.** If your Server changes need a restart to test, write the proof script into your task dir (`proof.mjs`), run what you can against the running server (the browser side, `pages`), and say plainly in the outcome which half is verified and which awaits the owner's restart + one command.

## Fences

You own: `Server/plugins/Ask.js`, `Server/plugins/MCP.js`, `Server/plugins/SocketServer/Tab.js`, `public/framework/dev/Socket/Socket.js` (+ `doc/wire.md`), `public/framework/dev/DevBar/ask.js`, `public/framework/ext/Ask/*` (Ask.js, chat.js, readme.md, doc/), `public/framework/dev/Claim/*`, and this task dir. Nothing else. Do not touch `ext/Panel/`, `ext/drawer/` (another minion is reading them) — read only.

## Rules

- Load the `code` skill once before editing JS. Run `new-task` first (dir + brief exist; write `task.jsonl` line 1 and the `day.jsonl` line; group `web-ui`); the ledger hook logs your edits; `documentation` then `finish-task` at the end (`"tokens": null`). A skill that misleads you gets one line in its `improvements.md` (`skill-improvement`).
- Timestamps from the clock (`date -Iseconds`), never typed; forward slashes; never Out-File a `.jsonl`. Never a person's name — say "the owner".
- Wait in the foreground; never end a turn on a background monitor. Keep the diff small: no new dependency, no new module unless two files clearly need a third; ASAP.
