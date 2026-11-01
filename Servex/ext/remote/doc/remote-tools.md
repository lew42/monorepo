# Remote tools: file and shell access for the voice app

Six tools live in the one Servex registry (`Servex/files.js`, class `FileTools`, registered in `Servex/agents/Global.js` next to `page_tools`). The voice app gets them through `POST /mcp/remote` like every other tool; local sessions get them too.

- `read_file`, `write_file`, `edit_file` (one exact string, unique unless `replace_all`), `list_dir`, `glob` (`**`, `*`, `?`), `shell` (`bash` by default, or `powershell`; returns stdout, stderr, exit code; 60 s timeout, max 600 s).
- **Root:** every tool takes `root`: omit it for the monorepo, give a worktree name (`remote-tools` means `C:/Code/lew42/worktrees/remote-tools`) or a full path. Relative paths resolve against it.
- **No lockdown.** The owner accepted the risk. The only gate is the bearer token on the remote path; the local `/mcp` loopback rule is untouched (see the dev-server RCE note).
- **`.jsonl` is refused** by `write_file` and `edit_file` with a pointer to `.claude/hooks/append.mjs` (validated append), so live pages never see a rewrite. Use `shell` to run the hook, or `page_add` / `append_log`.

## Adding tools without the app asking again

What is **known**: the registry is built at Servex boot, so a new tool needs a Servex restart, and the Claude app caches the tool list per connection (see [tool-collapse](../../../../public/framework/ai/doc/tool-collapse.md)). What is **not known**: whether the app re-asks approval when `tools/list` changes; it could not be tested from here.

Built (cheapest that works): a generic **`call`** tool in `RemoteMCP.js`. `call({tool, args})` dispatches to any registry tool, and `call({tool:"list"})` returns every name, description and schema. Its own schema never changes, so a tool added later is reachable through it with no new approval, once Servex has restarted.

Not built, for the record:
- `notifications/tools/list_changed`: the endpoint is plain POST/JSON with no SSE stream to push it on, and it only helps if the app honours it.
- Advertise `capabilities.tools.listChanged: true`: useless for the same reason.
- Collapse all tools to `call` alone: it would also shrink the 81-tool list, but the model then loses the typed schemas; that trade is helper-tool-collapse's plan.

Takes effect at the next Servex restart.

## Where an owner prompt from the Claude app lands (answered 2026-10-17)

Handover question: "is `append_prompt_event` / `log_session` already the door for a per-prompt hook?" **No, and the door that exists is `ask_mastermind`.** Every call writes the question and the reply as stamped `chat` lines in the voice mastermind's own `task.jsonl` (`RemoteMCP.ask()`), plus one `remote_mcp` index line in `public/framework/ai/log.jsonl` (`RemoteMCP.log()`, the first 200 characters, never the token). `append_prompt_event` is the browser dictation log (Assistant.js, the voice sessions' prompt cards); `log_session` writes tags and notes into a Claude session's `session.jsonl` and needs a session uuid, which a cloud app session does not have. What is not caught: words the voice model never forwards through `ask_mastermind`. No Servex code sees them, and a Claude-app session has no hook to install, so a two-line change cannot close that. Should the owner want them, the voice agent's directives (`RemoteMCP.INSTRUCTIONS`) are the place to say "forward every owner request verbatim".

## The bridge: an ack at once, first words by themselves (voice-bridge, 2026-11-01)

Built in `RemoteMCP.js` (one class); plan and measurements: [plan.md](../../../../public/framework/ai/sessions/2026/10/20/session-e00f55c9/voice-bridge/plan.md).

- **Say first.** The message to the mastermind asks for one plain sentence before any tool call. RemoteMCP wraps `agents.watch` (the host's seam for every agent event, as `Sessions.listen` does) and keeps a **ticket** per ask: `first` (the text before its first tool call), `words`, `doing` (its latest tool), `answer`, `done`. A turn that ends with no reply file makes its words the answer.
- **Short wait.** `ask_mastermind` waits `wait_ms` (8 s, `REMOTE_MCP_WAIT_MS`; it was 60 s). It returns the answer, or "Not answered yet" with the ticket, the status ("waiting to start: only 1200 MB of memory is free…", "working (Read handover.md)") and the first words.
- **`voice_hear({ticket, wait_s})`** (remote route only): returns at the first change, at `wait_s` (8, at most 20), or when the app hangs up. Every reply is the whole state, so a call cut off by noise loses nothing.
- **Answers ride along.** Every tool result on the remote route, `cloud_voice_log` included, carries what an open ask of that connection said since the caller last heard it, once.
- **Never wait on a spawn.** `ask_mastermind({to})` asks any agent. When the connection's own mastermind is queued at the spawn gate, the ask goes to `REMOTE_MCP_FALLBACK` or the file `remote.fallback` beside the token (for example `vscode-mastermind`), and `routed` says so.
- **Attribution rule:** an agent's streamed words belong to its oldest unfinished ask. A voice mastermind serves one app connection, one question at a time, so this holds; two quick asks to one busy agent can share a turn.
- Tested in `RemoteMCP.test.mjs` (cases 6–10). It takes effect at the next Servex restart.

## ask_mastermind never loses an answer

`ask_mastermind` waits up to a minute. If it times out, or the app cancels the call, `RemoteMCP.ask()` keeps watching the reply file (up to 30 minutes) and, when the answer appears, writes its `chat` line and delivers it to the `voice-app` inbox (`from: voice-mastermind`, `reply_to` = the question id), so the `updates` tool returns it. `wait: false` skips the wait and returns `{ticket, note}` at once; the answer arrives the same way. Every answer goes to the inbox, including one the call returned in time (the app may have dropped that call), so the voice agent skips a `reply_to` it already has. A `notifications/cancelled` for the call id stops the wait at once. Each delivery leaves `remote-replies/<qid>.delivered`; at boot `RemoteMCP.sweep()` delivers any `<qid>.txt` without one (files under 24 h old; the first sweep only marks existing files, replaying nothing). Tested in `RemoteMCP.test.mjs`.
