# Writing to a topic

Two doors, one code path: `store.mjs`. Whatever the CLI refuses, an MCP tool refuses too.
The schema is [doc/verbs.md](./verbs.md).

## The CLI — for a terminal, a hook, a headless minion

Run from the repo root. `node public/framework/ext/Research/research.mjs --help` prints it all.

```bash
node public/framework/ext/Research/research.mjs open livereload --title "LiveReload" --question "What is conclusively true?" --minions 5 --minutes 30
node public/framework/ext/Research/research.mjs say livereload --kind claim --by m1 --text "Two chokidar watchers, not one." --refs Server/plugins/Directory.js:18 --importance 4
node public/framework/ext/Research/research.mjs say livereload --kind dissent --parent c7k2q --by m2 --text "Directory's is filtered." --why "It ignores .json, so it never fires on the path in question."
node public/framework/ext/Research/research.mjs vote livereload --node c7k2q --importance 5 --by m2
node public/framework/ext/Research/research.mjs verdict livereload --node c7k2q --state accepted --why "Both call sites read."
node public/framework/ext/Research/research.mjs outline livereload --min 4
```

- `open` writes the header, and merges into it when the topic already exists — so
  `open <slug> --status closed` is how a topic closes.
- **`outline` is what a minion reads instead of the file** — `id · kind · score · verdict ·
  by · text`, indented. `--under <id>`, `--depth n`, `--min <score>`. That is the
  context-pollution control: a round costs a screen, not a transcript. `--min` keeps the
  path to a keeper, so a high-scoring child never vanishes under a quiet parent.
- Every value goes through `validate()`. On a refusal it prints the reason, exits 1, and
  **writes nothing**.

### Quoting text that contains quotes, backticks or `$`

Single quotes, in both shells. Nothing inside them expands.

```bash
--text 'a "quoted" $var and `ticks` all survive'
```

```powershell
--text 'a "quoted" $var and `ticks` all survive'      # '' is a literal single quote
```

Double quotes are the trap: bash expands `$var` and runs `` `ticks` ``; PowerShell expands
`$var` and treats a backtick as its escape character. If a value must carry a single quote,
prefer a `--key=value` form or double it in PowerShell.

## The MCP tools — for an agent's turn

`research_say research_vote research_verdict research_agent research_log research_outline
research_summary`, same arguments as the CLI plus `slug`. They are JSON-schema'd, so an
agent cannot invent a verb or a field — the schema refuses the shape, then `verbs.js`
refuses the value.

`Server/plugins/Research.js` registers them through a seam in `MCP.js`:

```js
server.mcp.register(tool, args => this.call(tool.name, args));   // handler answers with a string
```

`tools/list` returns `this.tools` (the built-ins plus everything registered), and `call()`
falls through to `this.handlers`. Any plugin can add tools to the same loopback-only door.

## Restart, and how to verify without one

**Anything under `Server/` needs a server restart.** The shared `:80` instance is the
owner's — never restart it, and never assume your tools are live there: `tools/list`
against `:80` shows five tools until it is restarted.

Verify on a throwaway instance instead, then kill it:

```bash
PORT=8090 node server.js &
curl -s -X POST http://localhost:8090/mcp -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
curl -s -X POST http://localhost:8090/mcp -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"research_say","arguments":{"slug":"livereload","kind":"note","by":"test","text":"seam test"}}}'
```

⚠ A throwaway instance starts its own chokidar watchers on `public/`, which lock every
directory under it against renaming on Windows. Kill it as soon as the check passes.

## What happens after an append

Nothing reloads. `Server/plugins/SocketServer/Tail.js` streams the appended bytes to every
tab subscribed to that file, and the page applies them — the AI writes, the owner watches
it arrive. Nothing on the site depends on this: off localhost there is no socket and the
page just fetches the file.
