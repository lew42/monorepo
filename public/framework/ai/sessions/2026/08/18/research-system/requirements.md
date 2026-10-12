# research-system — ext/Research: the data core, the writers (CLI + MCP)

**Laws: less is more (ASAP) · clarity is the one exception · prioritize.** Length budget: `verbs.js` ≲ 120 lines, `research.mjs` ≲ 200, `Server/plugins/Research.js` ≲ 120. Every doc a screen. Load the `code` skill before writing JS. If a skill misleads you, one line in its `improvements.md` (`skill-improvement`).

## The ask (owner, verbatim, the parts this task serves)

> I keep thinking about a way to design a decision making system, but one that I can SEE THE MINIONS BUILD IN REALTIME … Maybe `.jsonl` is the way? That way, it's append only … We want the ai minions to be able to "dig" into any comment or detail, and argue about it. Give reasoning. Let others weigh in (without overwriting changes) … trying to get the system to be more programmatic than AI-driven … I'm looking at my console.log with "JSONL: unknown verb "status", "timestamp" right now.. The AI isn't always perfect. I was thinking, MCP tools, when called, can trigger precise, javascript-driven outcomes … The AI -> .jsonl -> livereload pathway isn't the way. We want sockets. The MCP is probably the way … Having minions write long walls of text is NOT the objective … we want to be conscious about context pollution. We can't have them all read everything each round.

## What exists (read these first, ~10 min)

- `Server/plugins/SocketServer/Tail.js` — appended `.jsonl` lines already stream to subscribed browser tabs over the socket, no reload. **This is the socket path; nothing to build there.**
- `Server/plugins/MCP.js` — the site's MCP tools (`pages eval shot claim release`), hand-rolled streamable HTTP, loopback-only. `TOOLS` is a module const and `call()` an if-chain: there is **no registration seam yet**.
- `public/framework/ext/JSONL/JSONL.js` — the browser reader: `static verbs`, one verb per line, `assign` merges, others append; unknown verb → warned + dropped. `readme.md`, `doc/task-jsonl.md`.
- `Server/README.md` — the server's shape; `Server/plugins/Shot.js` shows a plugin imported by MCP.

## The design (decided — build to it; dissent goes in your task log, not into a different shape)

**One topic = one dir = one append-only file:** `public/framework/research/<slug>/research.jsonl`. No per-topic `page.js` (the `research/page.js` routes slugs like `ai/page.js` routes days — the UI task owns that). Every line is `{"<verb>": {…}}` with `at` (ISO, local offset, from the clock) inside the value.

| verb | value | who | rule |
|---|---|---|---|
| `assign` | `{title, question, by, at, config:{minions,minutes}, status, summary:[…]}` | orchestrator | merges; `summary` is the report's top block — a whole array each time, ≤ 7 lines |
| `node` | `{id, parent?, kind, text, by, at, why?, refs?, icon?, img?, importance?}` | anyone | the tree; `parent` = a node id or absent (root); `kind` ∈ `question claim evidence support dissent alternative note`; **`text` ≤ 240 chars, `why` ≤ 1000** — refuse longer (this is the no-walls-of-text rule, in code); `support`/`dissent` **require `why`** and a `parent`; `refs` = `["file:line", "https://…"]`; `icon` = a Material Symbols name (`bolt`, `warning`); `img` = url; `importance` 1–5 (author's own guess) |
| `vote` | `{node, by, at, importance:1–5}` | anyone | ranking; score = mean of author importance + votes |
| `verdict` | `{node, by, at, state, why, into?}` | orchestrator | `state` ∈ `accepted rejected parked merged`; latest wins; `merged` names `into` |
| `agent` | `{name, persona, model, at, doing, done?}` | orchestrator | the "minions running" strip; merged by `name` (like TaskJSONL's `agent` merges by `task`); `done` = one-line outcome |
| `log` | `{at, msg}` | anyone | narration: rounds, owner directions (`msg` starting `owner:`) |

`id`: kind letter + 4 random base36 chars (`c7k2q`, `d…` for dissent, `e…` evidence, `s…` support, `a…` alternative, `q…` question, `n…` note) — random, because parallel writers must not coordinate. The writer refuses a `parent` that does not exist in the file (read it — they are small).

## Deliverables (in this order; the CLI is what the LiveReload research minions use in ~30 min)

1. **`public/framework/ext/Research/verbs.js`** — pure ESM, **no DOM, no Node APIs**, importable by the browser and by Node: `VERBS` (the schema above as data: kinds, limits, requireds), `validate(verb, value) → null | "reason"`, `id(kind)`, `line(verb, value) → string` (one JSON line, `\n` terminated). This is the single source of truth the CLI, the MCP plugin **and the UI** import.
2. **`public/framework/ext/Research/research.mjs`** — Node CLI, `node public/framework/ext/Research/research.mjs <cmd> <slug> …` (the repo root is `process.cwd()`). Commands: `open` (title/question/config → the header + mkdir), `say` (`--kind --text [--parent --why --refs a,b --icon --img --importance --by]`), `vote`, `verdict`, `agent`, `log`, **`outline`** (the tree as indented text: `id · kind · score · state · by · text`, `--under <id> --depth n --min <score>` — this is what a minion reads instead of the file: context-pollution control), `summary` (header + top-N roots by score + summary lines). Every value goes through `validate()`; on refusal print the reason, exit 1, write nothing. `at` from the clock. Append with `fs.appendFileSync` (one line per call). Text args may contain quotes/backticks/`$` — document the safe quoting for bash and PowerShell in `--help`.
3. **`Server/plugins/Research.js`** — registers MCP tools `research_say research_vote research_verdict research_agent research_log research_outline research_summary` (same args as the CLI, JSON-schema'd so agents cannot invent verbs) through **a small seam you add to `MCP.js`**: `this.tools = [...TOOLS]; this.handlers = new Map()` in the constructor, `register(tool, handler)`, `tools/list` returns `this.tools`, `call()` falls through to `this.handlers.get(name)`. ⚠ Another session is editing `MCP.js` today (tab awareness) — **read it fresh immediately before your edit, change ≤ 12 lines, reformat nothing.** Wire it in `server.js` the way `MCP` is (read `server.js`; one line). Do not restart the shared `:80` server — verify on a throwaway `PORT=8090` instance (`$env:PORT=8090; node server.js` in a background shell, then POST `tools/list` and one `research_say` to `http://localhost:8090/mcp` with curl; kill it after). Reuse `research.mjs`'s functions — the CLI and the MCP tool call the same code (put the shared Node half in `research.mjs` as exports, or a `store.mjs` if that reads cleaner; ≤ 2 files).
4. **`public/framework/ext/Research/doc/verbs.md`** (the table above, finalised, ≤ 1 screen) and **`doc/writers.md`** (CLI + MCP usage, quoting, the throwaway-port verification, what needs a restart). ⚠ In any `.md` you write, never backslash-escape a backtick.
5. Prove the seam: `node public/framework/ext/Research/research.mjs say livereload --kind note --by core-test --text "seam test"` appends a valid line to `public/framework/research/livereload/research.jsonl` (the file already exists with a hand-written header + seed nodes — do not rewrite it; if the seed disagrees with your `validate()`, make `validate()` right and log the disagreement). Delete nothing — the UI task watches that file render live.

## Fences

Yours: `public/framework/ext/Research/{verbs.js,research.mjs,store.mjs?,doc/verbs.md,doc/writers.md}`, `Server/plugins/Research.js`, the ≤12-line seam in `Server/plugins/MCP.js`, one line in `server.js`. **Not yours:** `Research.js`, `Research.css`, `page.js`, `readme.md`, `doc/decisions.md`, anything under `public/framework/research/` except appending through your own CLI.

## Log as you go

Your task log is `public/framework/ai/2026-08-18/research-system/task.jsonl` — append `{"log": {"at": "<clock>", "msg": "…"}}` at milestones (a decision, the seam done, verification result); never `assign`. Timestamps from `date -Iseconds`. Findings go there, not in a findings.md. When done, your final message: what landed (paths), the one command that proves it, what you left out and why. ≤ 15 lines.
