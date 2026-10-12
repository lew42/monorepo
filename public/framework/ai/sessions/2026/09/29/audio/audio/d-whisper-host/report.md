# How should we run Whisper? — research only, nothing built

**Question:** keep POSTing to `whisper-server`'s HTTP `/inference` (today's design), or move to a
child process, in-process node bindings, or a real streaming engine — and how should the audio
reach it from the browser?

**Answer, in short:** keep (a), and stop routing anything through a project's dev server — build
the socket transport on **Servex itself**, once, so every project's page reaches Whisper the same
way. Details below.

## The table

| Option | Latency (measured) | Control (events, prompt, local agreement) | Seam quality | CPU/GPU cost | Complexity | New dependency? |
|---|---|---|---|---|---|---|
| **(a) `whisper-server` HTTP, resend every ~0.9s** (today) | **76–98ms** per 10s-window `/inference` call, measured on this machine's RTX 4070 SUPER (`ux/Dictate/doc/decisions.md`); a separate 20-sample run measured 67ms average, 283ms max. Well under the ~0.9–1.5s resend tick. | Request/response only — no event stream, no way to push partial words as they form; "control" means whatever `Transcriber.Whisper` builds on top (segments, `prompt` continuity — already built). One request in flight at a time (whisper-server serializes). | Whatever cut point the caller picks (today: quietest-point cut); re-transcribes the whole growing segment each tick, so a word can flip between resends. | GPU-bound, ~100ms per call — negligible load, already proven stable for hours of real dictation. | **Lowest.** Already built, already managed (`Server/plugins/Whisper.js` spawns/restarts it), already proxied. | None. |
| **(b) node spawns `whisper-stream`/`stream.exe` as a child, reads stdout** | Not measured here — whisper.cpp's own docs describe it sampling every `--step` ms (default 500ms) and re-running on a sliding window; a VAD mode (`--step 0`) waits for a real pause. Comparable order of magnitude to (a), not obviously faster. | Real per-line events over stdout (a new line per committed/partial segment) — closer to a live feed than polling HTTP, but stdout text is whisper.cpp's own log format, not a designed API: parsing it is fragile to a whisper.cpp version bump. No in-process access to change parameters mid-run; a new mode needs a new child. | Same sliding-window seam problem as (a) — `stream`'s window boundary can still cut a word. | One extra long-lived process per active dictation (today's design keeps exactly one shared `whisper-server`; this would be one child per session, or a job-queue in front of a shared one — real design work). | **Medium.** A second process-management story next to the one `Server/plugins/Whisper.js` already runs; stdout parsing; no HTTP surface to reuse for the LAN/phone route Whisper.js already built. | None (same binaries, already installed at `%LOCALAPPDATA%\lew42\whisper\bin\whisper-stream.exe`). |
| **(c) node bindings in-process** (`nodejs-whisper`, `whisper-node`, `@kutalia/whisper-node-addon`, `smart-whisper`, `whisper-cpp-node`, or whisper.cpp's own `addon.node`) | Not measured — same underlying whisper.cpp engine, so raw inference speed should match (a)/(b) once warm; no HTTP or process-spawn overhead to add or remove (both already sub-100ms next to the model's own run time). | **Best in this column.** In-process means real callbacks (`whisper-cpp-node`'s `on_new_segment` fires per segment as it's generated), direct control of every whisper.cpp parameter, and no serialization boundary — the actual thing minion A's brief is asking for ("configure it, listen to events, respond in real time"). | Same sliding-window problem unless the binding also implements a local-agreement policy (none of the ones found do out of the box). | Runs inside the Servex/Node process itself — a crash in the native addon can take the host process down with it, which today's spawned-child design (a) and (b) do not risk. | **Highest.** A native addon must be prebuilt for this machine (or built with a C++ toolchain) and kept updated against whisper.cpp releases; several of the candidate packages are one- or two-person projects, not actively maintained. | **Yes.** None of these ship in the repo or in `%LOCALAPPDATA%\lew42\whisper\` today — first use needs an owner OK. |
| **(a) + a Servex socket, no local-agreement** | Same ~80ms `/inference` cost; the socket only removes the HTTP round-trip's connection setup (small — HTTP/1.1 keep-alive already avoids most of it) and lets Servex push a partial the instant it is ready instead of the browser polling on a timer. | Same as (a) — the transport doesn't add local-agreement or events by itself, it only changes who calls whisper-server and how the words get back to the tab. | Same seam behaviour as (a); a socket doesn't fix this on its own. | Same as (a) — Whisper's own cost is unchanged; the socket is just carrying bytes. | **Low-to-medium**, entirely inside Servex (see next section) — no change to `Transcriber.Whisper`'s Whisper-calling code, only to how the browser reaches it. | None (`ws` is already a root dependency — see below). |
| **`whisper_streaming` (UFAL) — true local agreement** | Published **~3.3s** latency for a stable, committed word (ACL Anthology paper) — far above the ~0.9s felt-latency budget this site is tuned to. | The only option here with a **principled fix** for the seam problem: a word is held back until several consecutive re-runs agree on it, rather than committed and possibly wrong. | **Best** — this is what "seam quality" means for this technique. | A Python reference implementation (not whisper.cpp) — a third stack next to Node/whisper.cpp, not evaluated further here. | **High** — new process, new language runtime, new protocol to bridge into Node. | Yes — not whisper.cpp-based. |

## The transport: put ONE socket on Servex, not on any project's dev server

**What exists today:** the dev server already runs a real two-way websocket
(`Server/plugins/SocketServer/SocketServer.js`) built on the `ws` package, attached with
`new WebSocketServer({ server: this.server.http })` — it listens for the `"http"` event that
`Server/Server.js` emits right after creating `this.http`. Servex's own dashboard
(`Servex.Dashboard`, in `Servex/Servex.js`) **is that same `Server` class** (`class Dashboard
extends Server`) — it already emits the identical `"http"` event when it boots. So the exact
same plugin (or a close variant, since Servex's dictation needs are one-directional-plus-audio
rather than live-reload) can be attached to Servex's own server with no new mechanism invented —
only a new plugin file under `Servex/` that does what `SocketServer.js` already does.

**The `ws` package needs no new install.** It's a dependency of the repo ROOT
(`package.json`: `"ws": "^8.19.0"`, present in the root `node_modules/`) — Servex's own
`package.json` doesn't list it, but Servex lives inside this same repo tree, so Node's module
resolution walks up from `Servex/` and finds the root `node_modules/ws` the same way any other
subfolder's `import "ws"` would. Worth adding `"ws"` to `Servex/package.json`'s own
`dependencies` as documentation of the real dependency, but no `npm install` is needed.

**The proxy already passes upgrades through by hostname, not by path.** `Servex/ReverseProxy.js`
handles a websocket the same way it handles a GET: `server.on("upgrade", ...)` calls
`this.upgrade()`, which resolves the target port from the request's `Host` header
(`this.name(req)` → `this.ports[name]`) and calls `this.proxy.ws(req, socket, head, { target })`
— exactly the same routing table an HTTP GET uses. That means `wss://servex.localhost/...` (or
`ws://` locally) reaches Servex's own dashboard process — including from a phone, since
`*.localhost` resolves to loopback on the phone the same way `Dictate.js`'s existing
`default_whisper_url()` already assumes for the HTTP route.

**What Servex would need, concretely:** one new file (say `Servex/Whisper.js` or a `Sound.js`
plugin) that (1) attaches a `WebSocketServer` to `this.dashboard.http` the way
`SocketServer.js` does, (2) on each connection, receives audio chunks and calls whisper-server's
existing `/inference` exactly as `Server/plugins/Whisper.js`'s `/whisper/inference` proxy route
already does today (or, later, swaps in (b)/(c) behind the same socket without the browser
noticing), and (3) sends partial/committed text back down the same socket instead of the browser
polling. This is new code, not a new concept — every piece it is built from (the `Server` class,
the `"http"` event, the `ws` package, the hostname-routed proxy) already exists and already works
this exact way for the dev server's own live reload.

## Recommendation

**Keep whisper-server over HTTP (a) as the engine — it is already fast (under 100ms per call,
well inside the ~0.9s resend budget) and already the least code to run and supervise.** Move the
*transport* only: build one small websocket plugin on Servex's own dashboard server (reusing the
existing `Server`/`ws`/`ReverseProxy` machinery, zero new dependencies) so every project reaches
Whisper the same way, instead of each dev server hosting its own copy. Do **not** adopt node
bindings (c) or a child-process stream (b) right now — neither measurably beats (a)'s latency on
this hardware, and both cost real supervision complexity minion A's `doc/streaming.md` already
weighed and declined for the same reason. `whisper_streaming`'s local-agreement idea is the right
fix for word-splitting seams *if* they turn out to matter after the cheaper quietest-point cut is
re-measured — but its ~3.3s latency and separate Python stack make it a future `Transcriber`
engine to prototype on its own, never a replacement for today's fast path.

## Sources and confidence

- **whisper-server HTTP latency (76–98ms, then 67ms avg/283ms max)** — established: directly
  measured on this machine by a prior task and re-confirmed by another
  (`public/framework/ux/Dictate/doc/decisions.md`). I tried to re-run this measurement myself
  against the WAV files already sitting in `%LOCALAPPDATA%\lew42\whisper\` (whisper-server was
  already running); three `curl` calls all returned `400 Invalid request` in under 25ms — a
  multipart field mismatch on my end (not a server problem: the two prior measurements in that
  same doc, from two different tasks, both succeeded against the same server), and not worth
  more of this task's budget to debug when a real, twice-repeated number already exists.
- **whisper.cpp `stream` example behaviour (`--step`, `--length`, VAD mode)** — established:
  the project's own docs and examples describe this directly. [ggml-org/whisper.cpp —
  `examples/stream`](https://github.com/ggml-org/whisper.cpp/tree/master/examples/stream)
- **`whisper-stream.exe` and CUDA DLLs are present in this machine's install** — established,
  directly listed: `%LOCALAPPDATA%\lew42\whisper\bin\` has `whisper-stream.exe`, `stream.exe`,
  `ggml-cuda.dll`, `cublas64_12.dll` and friends — this is the CUDA build
  (`ux/Dictate/doc/decisions.md` names it as the `whisper-cublas-12.4.0-bin-x64` release asset).
- **`whisper_streaming`'s ~3.3s latency and local-agreement design** — established (a published,
  peer-reviewed description of the method and its own reported number), but note it is a
  different tradeoff (a stable committed word) than this site's ~0.9s "keep the caption moving"
  goal, so the number isn't directly comparable to (a)'s. [Turning Whisper into a Real-Time
  Transcription System (ACL Anthology)](https://aclanthology.org/2023.ijcnlp-demo.3.pdf),
  [ufal/SimulStreaming](https://github.com/ufal/SimulStreaming)
- **Node binding options and their event-based control** — contested: these are community
  packages of varying maturity, not something whisper.cpp itself ships as a first-class API; I
  did not run any of them, only read their own descriptions. [whisper-cpp-node on
  npm](https://www.npmjs.com/package/whisper-cpp-node), [nodejs-whisper on
  npm](https://www.npmjs.com/package/nodejs-whisper), [Kutalia/whisper-node-addon on
  GitHub](https://github.com/Kutalia/whisper-node-addon)
- **WhisperLive's "near real-time" claim** — fringe/unverified: a single blog post, not a
  benchmark I could check, and it's a different server stack (`faster-whisper`, Python) from
  what this site already runs. [Scaling Real-Time Transcription: A Guide to
  WhisperLive](https://lukeosborne.au/2026/07/scaling-real-time-transcription-a-guide-to-whisperlive/)
- **Servex's Dashboard reusing the `Server` class, the `"http"` event, and `ws` being a
  root-level dependency already resolvable from `Servex/`** — established: read directly from
  `Servex/Servex.js`, `Server/Server.js`, `Server/plugins/SocketServer/SocketServer.js`,
  `package.json`, and confirmed `node_modules/ws` exists at the repo root while
  `Servex/node_modules/ws` does not (Node resolves it by walking up).
- **ReverseProxy routes websocket upgrades by hostname, same as HTTP** — established: read
  directly from `Servex/ReverseProxy.js`'s `upgrade()`/`target()`/`name()` methods.

## What minion A is already doing, and how this fits

`public/framework/audio/Transcriber/` (worktree `qf-6`) already builds the local-agreement idea
in spirit — `Transcriber.Whisper` resends the growing segment on a fixed tick and passes
committed text as `prompt` — and its own `doc/streaming.md` already surveyed the same three
engine options and reached the same "don't switch yet" verdict on the *engine*. This report
adds the piece that brief didn't cover: the *transport* (Servex socket) is worth building now,
independently of which engine answers on the other end, because it is the one place today's
design genuinely doesn't scale — every project hosting its own copy of Whisper.
