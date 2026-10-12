# Local AI: everything installed on this PC: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). **A head-to-head test:** two minions get this SAME brief, one on Sonnet and one on a FREE OpenRouter model. Each writes ONLY its own report file (named below). Read-only: change nothing, install nothing, start or stop nothing.

## Find
Every local AI program and model on this Windows PC (user `mike`). Look at least for:
- **Image tools:** Stability Matrix, ComfyUI, any Stable Diffusion UI (Automatic1111, Forge, Fooocus, InvokeAI, SD.Next).
- **LLM runners:** Ollama, llama.cpp (the owner built it from source somewhere), LM Studio, Jan, GPT4All, vLLM.
- **Harnesses and agents:** "Pi" (the owner has project folders for it under `C:\Code`), Open Code, others.
- **Voice:** whisper-server and whisper.cpp (Servex runs whisper-server), Piper, Coqui, any TTS.
- **Model files:** `.gguf`, `.safetensors`, `.ckpt`, `.bin`, `.pt` (Whisper). Typical places:
  - Ollama: `%USERPROFILE%\.ollama\models`;
  - Stability Matrix: its `Data\Models`;
  - ComfyUI: `models\`;
  - LM Studio: `%USERPROFILE%\.lmstudio`;
  - Hugging Face cache: `%USERPROFILE%\.cache\huggingface`;
  - plus any custom folders you find.

**How:** use cheap, bounded searches: `where`, `winget list`, Program Files, AppData, `C:\Code`, `C:\` top level, and other drives. Don't walk whole drives file by file. For model folders, list the files with their sizes.

## Report (one screen, then detail)
1. A table: program, what it is, where it lives, how to start it, and whether it's running now (check processes).
2. A table: model, what program it's for, file size, path.
3. **Total disk used** by models.
4. **Notes:** what looks half set up or broken. For example, the owner remembers fighting to get Ollama plus a Qwen model to use TOOLS, and thinks it was the system prompt or template. Say what you'd check.
5. **Unknowns:** what you looked for and didn't find.

## Output
- The Sonnet minion writes `report-sonnet.md` in this folder. The free-model minion writes `report-free.md`. Nothing else.
- When done, append one line to this task's `task.jsonl` through `node .claude/hooks/append.mjs` (not the shell): your id, the file you wrote, and how long it took.


## Phase 2 (the owner, 2026-10-01 15:55), after the two reports
- **Smoke-test** each runner the reports found: is it really there, does it start, does a model answer? Get the working ones working.
- **A chat harness on /framework/ai/local/:** pick a local model and talk to it, reusing the ONE chat component (ux/Dictate + ChatPanel), not a new chat.
- **A LOCAL PROVIDER,** like OpenRouter: Ollama, llama.cpp-server and LM Studio all expose OpenAI-compatible endpoints on localhost. Servex treats `local/MODEL` as a provider (tiers.js), the same way Whisper is local for voice. Then the test ladder and task routing work across cloud and local alike. Free, private, and limited by RAM and GPU, so measure it.
- **Revisit the old Ollama + Qwen tool-use trouble:** tool calling needs the model's chat template to support tools (and a tools-capable build). Test with one known tool call.


## Phase 3 (the owner, 2026-10-01 19:45): llama.cpp as the local LLM runner, and images on any page
**Facts (checked):**
- GPU: RTX 4070 SUPER, **12 GB VRAM**.
- llama.cpp is a CUDA build at `C:\llama` (from 2026-04-29), with `llama-server.exe` and `llama-cli.exe`.
- LLM models: qwen2.5-coder.gguf (4.7 GB), gemma-3-4b (2.5 GB), gemma-4-E4B (5.5 GB). All fit in VRAM.
- Image checkpoints (ComfyUI): SD 1.5 and DreamShaper 8 (2.1 GB each, fit easily), and **flux1-dev-fp8 (17.2 GB, does NOT fit in 12 GB VRAM**; it would offload into system RAM, slow and RAM-hungry, so don't use it by default).

**Asks:**
1. **Servex runs llama-server** as a managed process, the way it runs whisper-server: start, stop, swap the model, ONE model loaded at a time, unloaded when idle, and its RAM and VRAM counted on the process monitor.
2. **The same Claude Agent SDK harness talks to it.**
   - FIRST check whether this llama-server build serves the Anthropic Messages API (`/v1/messages`); recent llama.cpp builds have added it.
   - If it does, a `local/MODEL` provider = `ANTHROPIC_BASE_URL=http://127.0.0.1:PORT`, exactly like OpenRouter.
   - If not, a tiny node shim (Anthropic to OpenAI chat-completions) in Servex. No new npm dependency.
3. **Run the same test ladder** (h1-page first) on the local models through it. Record the results beside the cloud ones on the Models page. Expect small models to struggle with multi-step tool use; find what they CAN do (search, list, summarise, brainstorm, a redundant vote).
4. **Images on any page:**
   - a node tool `generate_image({prompt, page})` that calls ComfyUI's HTTP API (SD 1.5 or DreamShaper by default);
   - it saves the PNG into THAT page's folder (data lives with its page) and appends an image card line to its page.jsonl;
   - an assistant can call it from the voice chat ("make an image of…").
   - Cloud fallback: OpenRouter's image models (11 today, e.g. google/gemini-2.5-flash-image, about $0.0003 an image, read live from /models), behind the spend guard.
5. **RAM:** a model or ComfyUI only loads on demand and unloads after idle, because RAM is the bottleneck (see the process monitor).

6. **A cloud image BATCH test** (the owner, 2026-10-01 20:40): cheap enough that batches of 4–8 can lead to better results.
   - **Prices, live from /models:** image output is billed per output TOKEN: flash-lite $0.00003/token, 2.5 flash (Nano Banana) $0.00003, 3.1 flash $0.00006, 3 Pro (Nano Banana Pro) $0.00012. A Gemini image is about 1,290 output tokens, so roughly **$0.04 per image** on flash-lite and Nano Banana, **$0.08** on 3.1 flash, and **$0.15+** on Pro. Confirm with the REAL per-request cost from OpenRouter's generation stats.
   - **The test:** 3 prompts relevant to the site (an icon, a hero illustration, a UI mockup) × a batch of 4 on `google/gemini-3.1-flash-lite-image`, then the same on Nano Banana. Save them into a page (`/framework/ai/images/`, data with its page) as a grid, with the cost per image and per batch under each. About $1 in total; stays under the spend guard.
   - Compare with a local SD 1.5 or DreamShaper batch (free) on the same prompts.
