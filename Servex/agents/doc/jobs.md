# Jobs — background work done by node, answered as a message

A job is work that needs no thinking, or only a little: reading files, searching, waiting for a
line in a log, checking syntax. Servex's own node process does it, so the agent that asked does
not have to sit and wait. The agent calls `start_job`, gets `{job_id}` back straight away, and
ends its turn. While the job runs, the agent can answer the owner, a child, or a sibling. When
the job finishes, the agent gets ONE message: at most 300 characters, plus the path of a file
holding the full result.

```
[from: job-7 · reply to: log agent-mastermind-x]
done: check: all 5 file(s) pass node --check (no page loads) · full: …/servex/logs/job-7.jsonl
```

A caller that is not a Servex agent (a VS Code tab, for example) gets no message. It calls
`job_result({job_id, wait_s})` instead, which waits up to `wait_s` seconds for the job to finish.

## The kinds

| kind | args | what node does | measured |
|---|---|---|---|
| `read` | `files` or `glob`, `find?`, `full?` | reports each file's size, line count and the lines matching `find`; the full text only when `full` is set | 45 ms, 3 files |
| `grep` | `pattern`, `dir`, `glob?` | runs ripgrep in `dir`, or a node search when `rg` is not installed; refuses `/` or a drive root | 46 ms |
| `watch` | `file`, `pattern`, `timeout_s?` | follows the file until the pattern appears in new text, or until the timeout | the wait itself, plus up to 250 ms |
| `check` | `files` or `glob` | runs `node --check` on each file; it does **not** load pages | 65 ms, 5 files |
| `decide` | `question`, `files?` | reads the files, then asks Sonnet ONE question with no tools | about 2.6 s, about $0.05 with a 15 KB file |

Every `start_job` returned in 0–2 ms ([`jobs-proof.mjs`](../jobs-proof.mjs), all five started at once).

## Where a job shows up

- The full result is written to the `job-<n>` log through `host.store()`, Servex's single writer.
- When `from` is given, the caller's own log (`agent-<from>`) gets two lines:
  `{type:"job", state:"started"}` and `{type:"job", state:"done", ms, ok}`.
- A job is not an agent. It gets no registry row and writes nothing to `task.jsonl`.

## Which one to use

- **A job** — you need facts: read, count, search, wait, check. No tokens are spent.
- **`decide`** — you need one small judgment over facts node can gather ("do these three files agree?"). About 2–3 s, and costs roughly the gathered text in fresh tokens.
- **`fork_self`** — the decision needs everything you already know. The fork re-reads your whole context from cache, once for every turn it takes, so hand it facts a `read` job already gathered and let it answer in one turn.
- **A minion** — real work, with its own files to change.

## Traps

- `decide` uses the minimal config: `strictMcpConfig`, `skills: []`, `settingSources: []`, `tools: []`, and slash commands off. Without `strictMcpConfig`, the claude.ai connectors and skills still load, and one call cost **$0.21 (51k tokens)** instead of $0.05.
- A job never writes to repo files, never starts another job, and never starts an agent.
- `args` is an object. `tools.js`'s `server()` maps anything that is not a number, a boolean or an array to a string. So to register these tools in-process, that mapping needs an object case first.
- Wiring: `for (const t of job_tools(servex.agents)) servex.mcp.tool(t)` — not done yet (`MCP.js` is outside this fence).
