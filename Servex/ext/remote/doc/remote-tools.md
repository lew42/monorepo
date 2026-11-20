# Remote tools: file and shell access for the voice app

Six file/shell tools (plus [`view_image`](#view_image-look-at-an-image-the-cloud-chat-cannot-fetch)) live in the one Servex registry (`Servex/files.js`, class `FileTools`, registered in `Servex/agents/Global.js` next to `page_tools`). The voice app gets them through `POST /mcp/remote` like every other tool; local sessions get them too.

- `read_file`, `write_file`, `edit_file` (one exact string, unique unless `replace_all`), `list_dir`, `glob` (`**`, `*`, `?`), `shell` (`bash` by default, or `powershell`; returns stdout, stderr, exit code; 60 s timeout, max 600 s).
- **Commits through `shell` land on the voice app's record.** `RemoteMCP.intercept` puts the day's record in the tool's context (`ctx.session`, never an argument, so a caller cannot name another record), and `FileTools.env_of` hands it to the command as `SERVEX_SESSION_ID` and `SERVEX_SESSION_RECORD`, which the git hooks read ([Server/git-hooks/readme.md](../../../../Server/git-hooks/readme.md)).
- **Root:** every tool takes `root`: omit it for the monorepo, give a worktree name (`remote-tools` means `C:/Code/lew42/worktrees/remote-tools`) or a full path. Relative paths resolve against it.
- **No lockdown.** The owner accepted the risk. The only gate is the bearer token on the remote path; the local `/mcp` loopback rule is untouched (see the dev-server RCE note).
- **`.jsonl` is refused** by `write_file` and `edit_file` with a pointer to `.claude/hooks/append.mjs` (validated append), so live pages never see a rewrite. Use `shell` to run the hook, or `page_add` / `append_log`.

## `view_image`: look at an image the cloud chat cannot fetch

`Servex/ImageTool.js` (test `Servex/ImageTool.test.mjs`, door test in `RemoteMCP.test.mjs`). The cloud workspace's proxy blocks hosts like `fal.media`; the PC does not, so the PC fetches and the pixels come back **inline** as MCP `image` content blocks.

- **Arguments:** `url` (https) or `urls` (up to 8) or `path` (an image file on the PC); `max_dim` (longest edge px; default the original, never upscaled); `save: true` (also keep the original in `C:\Users\mike\fal-images` as `YYYYMMDD-HHMMSS-<name>.<ext>`; default nothing is left on disk).
- **Result:** per image one text entry (`source`, `width`, `height`, `bytes`, `content_type`, `saved`) followed by the image block. A failure is a text entry `{source, ok:false, why}` and no image.
- **Limits:** 20 s and 30 MB per fetch; PNG, JPEG, GIF, WebP only, decided by the file's own bytes (not the URL, header or extension), so a text file or HTML page is refused and never echoed; https only, redirects re-checked, hosts resolving to loopback or private addresses refused. Returned as the original unless over 4096 px, over about 3.5 MB (less per image when a batch shares 12 MB), or `max_dim` is smaller; then it is scaled down (PNG, else JPEG q88 with alpha flattened to white) and the entry gains `returned: {width, height, bytes, content_type, note}`.
- **No image library, on purpose** (no new npm dependency): sizes come from the file headers; the rare resize runs Windows' own `System.Drawing` through `powershell`. It cannot decode WebP, so an oversized WebP is refused with a message instead of resized.
- **How a handler returns images:** `MCP.call` passes a handler's `{content: [...]}` through as is; any other return is still wrapped as one text block.

## `figma`: call Figma's own MCP through Servex (no spoken yes)

`Servex/FigmaTool.js` (test `Servex/FigmaTool.test.mjs`, registered in `Servex/agents/Global.js`). In live voice the Claude app asks aloud before Figma's destructive `use_figma`, and a spoken yes often fails; a Servex tool is never asked about. So the chat calls Figma **through Servex**: from the cloud chat `call({tool: "figma", args: {...}})`, from a local agent `figma({...})`. It is synchronous (one call, one answer, no agent, no polling) and generic: it forwards `tools/call`, `tools/list`, `resources/*` and `prompts/*` to `https://mcp.figma.com/mcp` and returns Figma's own `content` unchanged (screenshots come back as image blocks). A Figma tool added tomorrow works with no change here.

| Ask | Arguments | Gives |
|---|---|---|
| the tools | `{list: "names"}` (name, `[writes]` mark, first line) · `{list: "use_figma"}` (one full definition) · `{list: true}` (all, about 118 KB) | Figma's live `tools/list` |
| a read | `{tool: "get_metadata", args: {fileKey, nodeId}}` | Figma's `content` as is |
| a write | `{tool: "use_figma", args: {fileKey, sessionId, code, skillNames: "figma-use", description}}`, preceded by `{tool: "create_session", args: {fileKey, description}}` | Figma's `content` |
| a resource | `{resources: true}` (list) · `{resource: "skill://index.json"}` (read) | text |
| a prompt | `{prompts: true}` · `{prompt: "create_design_system_rules", args: {...}}` | text |
| state | `{status: true}` | whether Figma was initialized, tools cached, calls in the last minute and today, the log path |
| override | `force: true` beside `tool` | writes past another agent's claim (below) |

- **Session.** Figma sends no `mcp-session-id` today, so Servex initializes once and reuses that; it initializes again only on a 401 or a lost-session answer. Figma's own `create_session` (a file working session for `use_figma`) is a separate thing and still goes first.
- **Errors are readable text.** Figma's `isError` result is returned as it is; a JSON-RPC error is thrown as `Figma <method> error <code>: <message>`.
- **The login** is read fresh from `%USERPROFILE%\.claude\.credentials.json` (the `mcpOAuth` entry whose `serverName` is `figma`); the file is **never written**, and the token is never logged, echoed or returned. After a 401 it re-reads the file once (Claude Code may have refreshed it), then answers one line: the Figma login on the PC expired, re-authenticate the `figma` MCP in Claude Code. Refreshing the token from Servex is deliberately not built: refresh tokens usually rotate, so using the stored one could invalidate Claude Code's copy and log it out.
- **Claim check** (stops two agents editing one file): a **writing** call (any Figma tool not annotated `readOnlyHint`, so `use_figma`, `upload_assets`, `create_new_file`, ...; `create_session` is exempt) that names a file (`args.fileKey`, or a figma.com URL in `args.url`) is refused when another agent holds a claim whose thing is `figma:<fileKey>` or `figma:<fileKey>/<page id>` ([claims](/Servex/agents/claims.js)). Nothing is sent to Figma; the answer is `{blocked: true, why, holder, since, claim, card, options}`. The caller asks the holder to pause (`send_to_agent`) or repeats the call with `force: true` when the owner says so; the forced call's result ends with "(servex: forced past the claim held by X)". A stale claim (its holder is gone) does not block; a claim held by the voice app (never "live" in `list_agents`) counts for 4 hours. Reads are never blocked. `use_figma` is always a write here, even when its code only reads: for reads use `get_metadata`, `get_design_context` or `get_screenshot`. The convention for agents is in [assistant-access.md](/framework/ext/Figma/doc/assistant-access.md#from-live-voice-call-figma-through-servex-figma).
- **Rate limit** (about 10 a minute and 200 a day for the whole account): every `tools/call` is counted in `%LOCALAPPDATA%\lew42\servex\logs\figma-calls.jsonl` (time, tool, caller, ms, status, blocked-by; never arguments or the login), the count survives a restart, and from 8 in a minute or 170 in a day a warning line is appended to the result.
- **Timing** (2026-11-19, from the cloud door): a read about 0.6 to 1.2 s, a small `use_figma` write about 2 s.

## `fal_usage`: what Fal really billed

`Servex/FalUsage.js` (test `Servex/FalUsage.test.mjs`, registered in `Servex/agents/Global.js`). The Fal MCP connector signs in by OAuth and its pricing tool returns only a base unit price (9x to 14x low on video, 2026-11-19). This tool asks Fal's own **billing-events** feed instead, from the PC, so the cloud chat can read the real cost of a finished job: from the cloud chat `call({tool: "fal_usage", args: {...}})`.

| Argument | Meaning |
|---|---|
| `hours` | window back from now (default 6, at most 2160); ignored when `start` is given |
| `start`, `end` | ISO 8601; `end` is exclusive, default now |
| `request_id` | one id or a list (up to 50); with no window given, searches the last 30 days |
| `endpoint_id` | one endpoint id or a list (up to 50) |
| `view` | `events` (default: one row per billed request) or `summary` (Fal's aggregate per endpoint and unit, no request ids) |
| `max_events` | most rows returned (default 500, at most 2000) |

**Returns** (numbers only, as one JSON text block; a failure also sets `isError`): `{ok, view, source, window:{start,end}, currency, count, total_usd, by_endpoint:[{endpoint, requests, cost_usd}], lines:[{time, request_id, endpoint, unit, quantity, unit_price, cost_usd}]}`, `lines` oldest first. `quantity` is Fal's billed units (not clip seconds), so read it with `unit`. `cost_usd` is Fal's `cost_total` (after any discount). A capped result carries `truncated`; an empty one carries a `note` (billing rows can lag a finished job by a few minutes). A failure is `{ok:false, error}` in one plain line: a missing or empty key file names its path, a 401 says the key was rejected, a 403 says it lacks billing scope.

- **The key: one file, `%LOCALAPPDATA%\lew42\servex\fal.key`** (`C:\Users\mike\AppData\Local\lew42\servex\fal.key`), outside the repo, the key as the file's only content. `Servex/FalKey.js` (`FalKey.read()`) reads it fresh on every call (so a new key needs no restart), strips a BOM, quotes, a pasted `Key ` prefix and whitespace, and throws a line naming the path if the file is missing or empty. It is the one Fal key on the PC: a future Fal module (image generation) should `import FalKey` and call `FalKey.read()`, never add a second key or an environment variable. The old `FAL_KEY` user environment variable (read by the dead `ext/Fal` lab in `C:\Code\frozen-helix`) is not used.
- **The key is never returned, logged or echoed.** It goes only into the `Authorization: Key ...` header of a `GET` to `api.fal.ai` (host fixed in code, not an argument). `fal_usage` makes read calls only (the one POST in this file is `fal_estimate`'s, below). The key may be a FULL-scope key, so treat the file as a spend secret.
- **Scope needed:** the key must carry `billing:usage:read`, `auth:keys:read` and `account:users:read` (Fal's `BILLING` preset, or `FULL`).
- **Grain:** `events` is per request (Fal's [Billing Events API](https://fal.ai/docs/platform-apis/v1/models/billing-events.md)); `summary` is Fal's [Usage API](https://fal.ai/docs/platform-apis/v1/models/usage.md), which is per endpoint and unit only. Fal's [Analytics](https://fal.ai/docs/platform-apis/v1/models/analytics.md) and [requests](https://fal.ai/docs/platform-apis/v1/models/requests/by-endpoint.md) endpoints carry no cost, so they are not used.
- Takes effect at the next Servex restart.

## `fal_estimate`: what a Fal call should cost before it runs

Same file and key as `fal_usage` (`Servex/FalUsage.js`, same test): `call({tool: "fal_estimate", args: {endpoint_id: "heygen/avatar-6/turbo/image-to-video", unit_quantity: 10}})`. Nothing is generated and nothing is charged. It asks Fal's own [pricing](https://fal.ai/docs/platform-apis/v1/models/pricing.md) route (`GET /v1/models/pricing`) and its [estimate](https://fal.ai/docs/platform-apis/v1/models/pricing/estimate.md) route (`POST /v1/models/pricing/estimate`, which only computes a price; the one non-GET in the Fal tools).

| Argument | Meaning |
|---|---|
| `endpoint_id` | one endpoint id or up to 10; an id Fal has no price for is an error that says so |
| `unit_quantity` | billed units to price (at least 0.000001); returns `unit_cost_usd` = units x base price |
| `call_quantity` | calls for the historical estimate (whole number, default 1) |

**Returns** one JSON text block: `{ok, view:"estimate", currency, lines:[{endpoint, unit, unit_price, model_page, call_quantity, typical_cost_usd, unit_quantity?, unit_cost_usd?}], note}`. Two numbers, and neither is "the cost of my settings":
- `unit_price` x `unit_quantity` is exact only if you feed it the **billed** units, multipliers included. Fal's API gives the base rate and nothing about multipliers; they are in the model's page text (`model_page`) and in the `quantity` of past requests in `fal_usage`.
- `typical_cost_usd` is Fal's own average over past calls of that endpoint by all users (MiniMax h3-max lip-sync: $2.688 a call, 2026-11-20), so it ignores your resolution and your clip length.

There is **no estimate from the real input** in Fal's API (the route takes only a call count or unit count), so to price a run: look up the model's formula below (or on its page), work out the billed units, and pass them as `unit_quantity`.

### How three models bill (read from the model pages 2026-11-20; checked against billed rows where marked)

| Endpoint | What one billed unit is | Cost per second of clip | Cheapest settings |
|---|---|---|---|
| `minimax/h3-max/lip-sync/image-to-video` (unit `seconds`, base $0.05) | one second at 480P. Billed seconds = clip seconds **rounded up** to a whole second, x a resolution multiplier: **480P x1, 768P x1.6, 1080P x3.2, 2K x6.4** (so $0.05, $0.08, $0.16, $0.32 a second); a further x1.2 over 15 s (page text, not seen in a row). Input `resolution` default is 768P. | $0.05 / $0.08 / $0.16 / $0.32 | `resolution: "480P"`, and shorter audio |
| `lightricks/ltx-2.5/audio-to-video/fast` (unit `units`, base $0.01) | one cent: **13 units per second of input audio** at 1080p ($0.13 a second). There is no resolution input, only `aspect_ratio` (auto, 16:9, 9:16), so the audio length is the only lever. | $0.13 | shorter audio |
| `heygen/avatar-6/turbo/image-to-video` (unit `units`, base $0.05) | one second of generated video at 1080p; 2K is 1.75 units a second ($0.0875). Input `resolution`: `1080p` (default) or `2k`. | $0.05 / $0.0875 | `resolution: "1080p"`, shorter audio |

Checked against the 2026-11-20 billed rows: MiniMax 768P billed 16 for a 9.34 s clip and 17.6 for a 10.46 s one, which is exactly ceil(9.34) = 10 and ceil(10.46) = 11, each x 1.6 (the "1.7x" is rounding up plus the 1.6 multiplier; this fits whether Fal rounds the output or the audio). LTX billed 121.393454 units for a 9.33 s clip, which is 13 x 9.3379 s. No HeyGen row existed yet, so its formula is the page text only.

### SDK, and what the key can do that the Fal MCP connector cannot

No Fal SDK is installed anywhere in the repo (no `@fal-ai/client`, nothing in either `package.json`), and none is needed: Fal's platform API is plain HTTPS with an `Authorization: Key ...` header, which is how `FalUsage.js` calls it.

| | Fal MCP connector (OAuth, in the chat) | The API key (Servex tools, any HTTPS client) |
|---|---|---|
| Real cost of a finished request | no: `get_pricing` is the base rate | yes: billing-events per request (`fal_usage`), usage per endpoint, FOCUS cost reports (Accounts API) |
| Price before a run | `get_pricing`, `estimate_cost` (could not say what a "unit" is) | pricing and estimate routes (`fal_estimate`); same limit, no input-based estimate |
| Run, queue, cancel, status | yes (`run_model`, `submit_job(s)`, `wait_for_jobs`, `cancel_job`) | yes: `queue.fal.run` submit, status, SSE stream, result, cancel; plus `priority`, `start_timeout`, `X-Fal-No-Retry` headers |
| Webhooks | no | yes: a `fal_webhook` URL on a queue submit delivers the result by POST (needs a reachable URL) |
| Model search, schema | yes, plus `recommend_model` and guidance/docs search (connector-side help) | `GET /v1/models` with `expand=openapi-3.0` for the full input schema (used above) |
| Files and assets | `upload_file`, `library_*` | Storage API (sign URLs, lifecycle for the CDN) and Assets API (browse, search, upload, organise) |
| Serverless apps, compute instances, workflows | no | Serverless, Compute and Workflows platform APIs (workflow metadata and definitions; listed in Fal's docs, not exercised here) |
| Training | only if a training model is exposed as a model | the same training endpoints through the queue; no separate training API was found |
| Multiple accounts | `list_accounts`, `select_account` | one key = one account |
| Media viewer, deliverable packaging | `show_media`, `prepare_media_*`, `prepare_deliverables` | not in the API (a UI of ours would do it) |

What was verified live here: the pricing, estimate, models (openapi), billing-events and usage routes. The Queue and the other platform API groups are from Fal's docs pages, not called. Running a model with the key spends real credits, so neither tool does it.

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
- **Answers ride along.** Every tool result on the remote route, `cloud_voice_log` included, carries an open ask's first sentence and then its answer, each once. Words in between (text after a tool call) are not relayed; `voice_hear` shows what it is doing instead.
- **Never wait on a spawn.** `ask_mastermind({to})` asks any agent. When the connection's own mastermind is queued at the spawn gate, the ask goes to `REMOTE_MCP_FALLBACK` or the file `remote.fallback` beside the token (for example `vscode-mastermind`), and `routed` says so.
- **Attribution rule:** an agent's streamed words belong to its oldest unfinished ask. An ask counts the turns ahead of it when sent (Servex’s `queue.kinds`: the running turn plus every message waiting, including those already handed to the Claude process) and ignores their words; each turn end counts one off, for every waiting ask at once. If the agent goes idle while an ask still counts turns, the count was high, and the last turn’s words become its answer. A turn stopped mid-way closes its ask as "stopped before answering", with no answer.
- Tested in `RemoteMCP.test.mjs` (cases 6–14). It takes effect at the next Servex restart.

## ask_mastermind never loses an answer

`ask_mastermind` waits a few seconds (`wait_ms`, the bridge above). If it times out, or the app cancels the call, `RemoteMCP.ask()` keeps watching the reply file (up to 30 minutes) and, when the answer appears, writes its `chat` line and delivers it to the `voice-app` inbox (`from: voice-mastermind`, `reply_to` = the question id), so the `updates` tool returns it. `wait: false` skips the wait and returns the ticket's state (`ticket`, `to`, `status`, `first`, `answer`, `done`) and a `note` at once; the answer arrives the same way. Every answer goes to the inbox, including one the call returned in time (the app may have dropped that call), so the voice agent skips a `reply_to` it already has. A `notifications/cancelled` for the call id stops the wait at once. Each delivery leaves `remote-replies/<qid>.delivered`; at boot `RemoteMCP.sweep()` delivers any `<qid>.txt` without one (files under 24 h old; the first sweep only marks existing files, replaying nothing). Tested in `RemoteMCP.test.mjs`.
