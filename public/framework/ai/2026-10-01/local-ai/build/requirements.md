# Minion brief: Servex runs llama.cpp as a local model provider

Parent task: `task-mastermind-local-ai`, dir `public/framework/ai/2026-10-01/local-ai/` (read
`requirements.md` there — Phase 2 and Phase 3 — and `report-sonnet.md`, the install inventory).
Load the `minion` skill first, then `code`.

## Already answered — don't re-check these
- **llama-server DOES speak the Anthropic Messages API.** Tested live 2026-10-01: started
  `C:\llama\llama-server.exe -m models\qwen2.5-coder.gguf --port 8999`, then
  `POST /v1/messages` with a normal Anthropic-shaped body → got back a proper Anthropic-shaped
  reply (`"type":"message"`, `content:[{type:"text",...}]`, `stop_reason`). So **no shim** —
  `local/MODEL` is exactly like `openrouter/MODEL`: point `ANTHROPIC_BASE_URL` at
  `http://127.0.0.1:<port>` and the Claude Agent SDK talks to it directly.
- GPU: RTX 4070 SUPER, 12 GB VRAM. All three LLM ggufs fit: qwen2.5-coder (4.7 GB),
  gemma-3-4b (2.5 GB), gemma-4-E4B (5.5 GB). `C:\llama\models\qwen2.5-coder.gguf` exists now;
  the other two are at the Hugging Face cache / LM Studio paths in `report-sonnet.md` §2 — copy
  or symlink is fine, your call, whichever is less code.
- Ollama's CLI (`ollama list`) hangs for 2 minutes instead of failing fast when its daemon
  isn't running — a real rough edge, not yours to fix, just don't let it eat your turn: always
  run ollama commands with a short timeout.

## The pattern to copy
`Servex/ext/openrouter/provider.js` is the OpenRouter half of this exact trick (read it whole —
it's short). `Process.Whisper` in `Servex/Process.js` (bottom of the file) is how Servex already
supervises one GPU/CPU-bound local server the same way you need to supervise llama-server —
read it whole too, and `Servex.js`'s `whisper()` method (~line 399) for how it's wired in.

## Build, in this order — land what works, note what you cut
### 1. Servex supervises llama-server (Phase 3 ask 1)
- A `Process.Llama` (same file as `Process.Whisper`, or its own `Servex/ext/local/` module —
  your call, whichever reads cleaner) that starts `C:\llama\llama-server.exe -m <model> --port
  <port>`, stops it, and **swaps models** (stop the running one, start the new one — only ONE
  model loaded at a time, this GPU can't hold two).
- Unload when idle: track the last request time (the Servex proxy route that forwards to it is
  the one place that sees every request) and stop the process after N minutes idle (pick
  something sane, e.g. 10 — put it in one constant, name it, so the owner can change it in one
  place). Say in your log where you put the knob.
- Wire it into the existing process monitor (`servex.procmon.now` — grep `Global.js` for where
  that's read) so llama-server's RAM shows up there like every other process. VRAM: `nvidia-smi
  --query-gpu=memory.used --format=csv` run on an interval is the straightforward way to attach
  a number to this one process (it's the only thing loading the GPU) — if that's more than a
  quick add, skip it and say so in your log; RAM is the must-have, VRAM is a nice-to-have.
- `C:\llama\models\` holding whichever model is NOT currently loaded is fine; only one process
  may run.

### 2. The `local` provider (Phase 3 ask 2, Phase 2 ask 3)
- New `Servex/ext/local/provider.js` mirroring `openrouter/provider.js`'s shape: `env_for("local")`
  returns `{ ANTHROPIC_BASE_URL: "http://127.0.0.1:<port>" }` (no auth token needed — it's
  loopback only, llama-server has no key). `provider_for()` needs a rule for `local/MODEL` the
  same way it already has one for an OpenRouter slug (a `/` in the model id) — read how
  `Agents.js` calls `provider_for`/`env_for` today (grep it) and add the `local` branch beside the
  `openrouter` one. Whichever model name the caller passes as `local/qwen2.5-coder` etc., your
  Process.Llama's start/swap is what actually has to be loaded first — wire spawn to request
  that swap before (or reuse an existing poll-until-ready, same idea as `stranger()` in
  Process.js).
- Add one example row to `Servex/agents/tiers.js` the way `scan_openrouter` is there as an
  example (not wired to a role) — e.g. `local_qwen: { provider: "local", model:
  "local/qwen2.5-coder" }` with a one-line comment pointing at this task.

### 3. The chat harness at `/framework/ai/local/` (Phase 2 ask 2)
- ONE page, reusing `ux/Dictate` + `ChatPanel` (grep for an existing page that already composes
  them — there should be one chat surface in the framework; **do not build a second chat
  component**, CLAUDE.md law 6). It needs: pick a local model (a small dropdown of the 2-3 gguf
  files), talk to it (which should just be spawning/sending to an agent on the `local` provider
  from step 2), see the reply. Load the `page` skill before writing it, and `new-page` for the
  mechanics.
- Follow `new-page`'s `create_page` tool rather than hand-rolling `page.js`.

### 4. Record local models on the existing test ladder (Phase 3 ask 3)
- The Models page already exists: `/framework/ai/system/models/`, generated by
  `Servex/ext/openrouter/evals/models.mjs` from `Servex/ext/openrouter/evals/results.jsonl`
  (read `public/framework/ai/2026-09-30/openrouter-harness/models-page/requirements.md` for the
  shape). Run the `h1-page` test (`public/framework/ai/tests/h1-page/`) through the `local`
  provider for whichever model(s) you got running in step 1-2, append the results the same way
  the OpenRouter runs did, and re-run `models.mjs` so they show up on the page beside the cloud
  ones. Expect small local models to do worse — that's a finding, not a bug; write what each one
  actually managed (can it read the page spec and produce something, even if rough?).

### If you have turns left after 1-4 (cut these first, in reverse order, if short on time)
### 5. Revisit the Ollama + Qwen tool-use bug (Phase 2 ask 4)
`C:\Code\test\pi-mono\qwen.fix` is a hand-written Ollama Modelfile that patches the chat
template to add `<tools>`/`<tool_call>` tags. Run `ollama show qwen2.5-fixed --modelfile` (give it
a short timeout — see the warning above) and diff against `qwen.fix`. If they match, test one
real tool call against `qwen2.5-fixed` and record whether it actually calls the tool. If they
don't match, re-run `ollama create qwen2.5-fixed -f C:\Code\test\pi-mono\qwen.fix` then test.
Write the result (worked / didn't / exact error) in your log — this has been an open question
since before this task.

### 6. Images (Phase 3 ask 4)
A node tool `generate_image({prompt, page})` calling ComfyUI's HTTP API (SD 1.5 or DreamShaper —
**not** flux1-dev-fp8, it doesn't fit in 12 GB VRAM, don't use it as the default) — but ComfyUI
on this machine is only the Electron desktop app (`C:\Users\mike\AppData\Local\Programs\ComfyUI`),
not a plain server you can just spawn headless; check whether its `resources\` folder has a
python/ComfyUI backend you can start with `--listen` directly (the usual ComfyUI CLI flag) before
assuming you need the desktop shell running. If this turns out to need real exploration, STOP,
write exactly what you found and what the remaining step is, and leave it there — don't burn the
whole budget chasing ComfyUI's packaging.

## What not to do
- Don't touch ComfyUI's checkpoints/models themselves, don't start Stability Matrix, don't start
  LM Studio's desktop app (checked: its own background service needs the desktop app running,
  and CLAUDE.md says no surprise windows popping up).
- Every spawned process: `windowsHide: true` (Process.js already does this for the kinds it
  spawns — check your own code doesn't add a new unhidden spawn anywhere, e.g. in a test script).
- No new npm dependency.

## Fence
Worktree: `C:\Code\lew42\worktrees\local-ai` (branch `worktree/local-ai`, its own dev server
already running on port 52694, proxy `local-ai.localhost`). Write only:
- `Servex/Process.js` or a new `Servex/ext/local/` directory
- `Servex/Servex.js` (wiring, routes)
- `Servex/agents/Agents.js` (the `local` branch beside `openrouter`)
- `Servex/agents/tiers.js` (one example row)
- `public/framework/ai/local/` (the new chat page)
- `Servex/ext/openrouter/evals/models.mjs` (extend, don't fork)
- `Servex/ext/openrouter/evals/results.jsonl` (append local runs)
- `public/framework/ai/2026-10-01/local-ai/` (this task dir: your own log, a readme/doc pass at
  the end)

Hold reloads (`node Server/hold.mjs on "minion-local-ai-build — …"` / `off`) around each batch of
page/site writes. Commit as you land each numbered step — don't wait until the end to commit.

## Land
Write/update `readme.md` + `doc/` for anything new under `Servex/ext/local/` (the `documentation`
skill). Then stop and report back to `task-mastermind-local-ai` (your parent) with: what's
running, the chat page link, the Models page link, and — for anything from 1-6 you cut — one
line saying what and the smallest next step. Don't run `merge.mjs` yourself; your parent does
that after reading your result.
