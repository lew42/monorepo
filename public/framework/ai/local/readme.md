# Local Models — talk to a model running on this machine's own GPU

## What
This page (`page.js`) is a small chat box wired to Servex's **local provider**
instead of Claude or OpenRouter: pick a model from the dropdown, type
something, get a reply. Nothing leaves this machine and nothing costs
anything — the model is a `.gguf` file running through `llama.cpp`
(`llama-server.exe`), which Servex starts the first time you ask it
something and stops again after it's been idle a while.

## Use
- The dropdown lists every model file Servex actually found on disk just
  now (`GET /api/local-chat`) — if it's empty, no model file was found; see
  "Watch out" below.
- Type a message and send it. The first reply after a model has been idle
  takes a few extra seconds (loading the model onto the GPU); after that
  it's fast.
- The chat box itself is `ext/Chat`'s `ChatPanel` — the same widget the
  drawer's AI tab and the mobile ✦ sheet use (CLAUDE.md law 6, one of
  everything) — just pointed at a different `deliver` function.

## Watch out
- **Only one model loads at a time.** This machine's GPU (an RTX 4070
  Super, 12 GB VRAM) can't hold more than one of these at once, so picking
  a different model from the dropdown stops the one currently running and
  starts the new one — a few seconds' wait, same as the first message.
- **A model not in the dropdown yet** means its file wasn't found where
  `Servex/ext/local/provider.js`'s `MODELS` table looks — today that's
  `C:\llama\models\qwen2.5-coder.gguf`, plus a search under the LM Studio
  install and the Hugging Face cache for `gemma-3-4b` and `gemma-4-e4b`. See
  that file's own comment for exactly where.
- **The real plumbing lives in `Servex/ext/local/`**, not here — this page
  is a thin UI on top of it:
  - [`provider.js`](/Servex/ext/local/provider.js) — where the model files
    are, the idle-unload minutes knob, and the env that points a spawned
    agent's `ANTHROPIC_BASE_URL` at Servex's own local proxy.
  - [`llama.js`](/Servex/ext/local/llama.js) — `Process.Llama` (starts,
    stops and swaps `llama-server.exe`, same supervision `Process.Whisper`
    already uses) and `LocalProxy` (the one place every request passes
    through: it makes sure the right model is loaded, then forwards).
  - [`chat.js`](/Servex/ext/local/chat.js) — the one-shot `local_chat()`
    call this page's `/api/local-chat` route runs, the same shape
    `agents/tidy.js`'s `tidy()` uses for its own one-shot cloud calls.
- **Small models do worse, and that's expected** — the Models test ladder
  (below) records what each one actually managed, as a finding, not a bug
  to fix here.

## More
- The task that built this: `public/framework/ai/2026-10-01/local-ai/build/`
- Every model Servex has tried, local and cloud, side by side:
  [`/framework/ai/system/models/`](/framework/ai/system/models/)
