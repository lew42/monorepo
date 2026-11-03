# Minion D: research: how should we run Whisper? (no building)

Load the `minion` skill first, then `research`.

## The owner's question (relayed by servex-mastermind-opus, verbatim in spirit)

For the `Whisper` class: **whisper-server's HTTP /inference, or our OWN node process around whisper.cpp?** Compare:

- (a) today's `whisper-server` over HTTP (a POST per guess, about every second);
- (b) node spawning whisper.cpp's `whisper-stream` / `stream` example as a child process, reading its stdout;
- (c) node bindings (whisper-node, nodejs-whisper, or whisper.cpp's own `addon.node`) called in-process, so we can configure it, listen to events and respond in real time.

Then a **socket path to the browser**: the dev server already has a websocket server (`Server/plugins/SocketServer*`, on the `ws` package, already a dependency), and Servex's ReverseProxy passes socket upgrades through. Servex has no socket server of its own. Could streaming audio in and words out ride the existing dev-server socket?

Compare **latency, control (events, the prompt/context, local agreement), seam quality, CPU/GPU cost, and complexity** as ONE table, plus a recommendation. Constraints: it must stay local and hidden (no popup windows), and add NO new npm dependency without asking the owner (say which options would need one).

Context: the owner has already chosen a local-agreement rolling window (re-run the last 10–15 s every ~1 s, commit words that agree across two runs, pass committed text as `prompt`); minion A is building it on (a) in `public/framework/audio/Transcriber/` in worktree `C:/Code/lew42/worktrees/qf-6`. Read its code and its `doc/streaming.md` if present; don't edit them.

## Read first

- `Server/plugins/Whisper.js` (how whisper-server is found and started today; the install is under `%LOCALAPPDATA%\lew42\whisper\`: list what binaries it has, e.g. is `whisper-stream.exe` there, and is it a CUDA/Vulkan build?)
- `Server/plugins/SocketServer*` and `Servex/ReverseProxy*`
- `public/framework/ux/Dictate/doc/decisions.md`
- whisper.cpp's docs for `server`, `stream`, and the node addon; whisper_streaming (ufal) for local agreement. Save sources per the `research` skill.

## Deliverable (write only this)

`C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\audio\d-whisper-host\report.md`: one screen. The table first (rows a, b, c; plus a row for "(a) + socket" if it differs), then the recommendation in two or three plain sentences, then sources with a confidence on each claim. Measure what you cheaply can: e.g. time one whisper-server /inference call on a 10 s WAV (make it with Windows TTS, hidden window) to put a real number in the latency column. Log it as {"experiment":{try, measure, result}}.

Log in `...\d-whisper-host\task.jsonl` (Servex opened it) with `node C:\Code\lew42\monorepo\.claude\hooks\append.mjs`. Every process you start: `windowsHide: true`, and stop it after. Budget: about $2. Land with an outcome line, then end your turn.

## Correction from the owner (19:05): the transport is a SERVEX socket, not the dev server

Don't route it through the dev server: every project has its own dev server, and each would have to host Whisper. There should be ONE place: a **Servex socket** (a websocket on Servex, reached through the proxy the way Servex's HTTP routes are, including same-origin from the phone), which runs Whisper (whichever option wins) and serves every project's pages. Servex's MCP at /mcp is Streamable HTTP (POST + an SSE stream back), not a websocket, so it isn't a fit for streaming audio up. Put the Servex socket in the table as the transport, and say what Servex would need to host one (it has no socket server today; `ws` is already a dependency of the repo, so check whether Servex can use it without a new package, and how the ReverseProxy passes upgrades).
