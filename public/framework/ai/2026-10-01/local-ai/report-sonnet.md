# Local AI report (Sonnet minion)

Read-only search of this PC (user `mike`). One drive (`C:`, 1.2 TB used, 753 GB free).

## 1. Programs

| Program | What it is | Where it lives | How to start | Running now? |
|---|---|---|---|---|
| Ollama 0.21.2 (0.35.0 available) | LLM runner, local API server | `C:\Users\mike\AppData\Local\Programs\Ollama` · models in `%USERPROFILE%\.ollama\models` | `ollama serve`, or it auto-starts on login (tray icon) | **No** — no process, nothing listening on port 11434 |
| llama.cpp (built from source) | LLM runner, CLI + server, CUDA build | `C:\llama` (`llama-server.exe`, `llama-cli.exe`, etc., CUDA 12 dlls) | `C:\llama\llama-server.exe -m <model>.gguf` | No |
| LM Studio 0.4.9 (0.4.25 available) | LLM runner with GUI + local API server | `C:\Users\mike\AppData\Local\Programs\LM Studio` · data in `%USERPROFILE%\.lmstudio` | Launch the app, or its bundled `llama.cpp`/CUDA backends under `.lmstudio\extensions\backends\` | No — nothing on port 1234 |
| ComfyUI (desktop app) | Stable-Diffusion node UI | `C:\Users\mike\AppData\Local\Programs\ComfyUI` · its models/output live in `C:\Users\mike\Documents\ComfyUI` (set in `extra_models_config.yaml`) | Launch the desktop app (Electron) | No — nothing on port 8188 |
| Stability Matrix | Launcher/manager for Stable-Diffusion UIs (Forge, ComfyUI, etc.) | **Not installed** — only sitting as a downloaded, self-extracted folder: `C:\Users\mike\Downloads\StabilityMatrix-win-x64\StabilityMatrix.exe`, with its own `Data\Models` and one package already pulled in: `Data\Packages\forge-neo` (Forge, an Automatic1111 fork) | Run `StabilityMatrix.exe` from that Downloads folder | No |
| whisper.cpp (`whisper-server`) | Speech-to-text server, used by Servex | `C:\Users\mike\AppData\Local\lew42\whisper\bin\whisper-server.exe` | Started/owned by Servex | **Yes** — process 46768, listening on port 8178 |
| "Pi" harness | Coding-agent harness the owner was trying out | `C:\Code\test\pi` (scratch projects: `todo-cli`, `time-zones`, etc.) and `C:\Code\test\pi-mono` (its own scratch area, has `.pi` config, `node-llama` test server, a `vllm-env` Python virtualenv, and `models.json`) | Project-specific; not a single launchable app | No |
| node-llama test server | A small Node server (`server.js`/`server2.js`/`server3.js`) talking to a local model, built while debugging the Pi harness | `C:\Code\test\pi-mono\node-llama` | `node server.js` (reads `package.json` for details) | No |
| vLLM | Python-based LLM server — set up but not clearly used | `C:\Code\test\pi-mono\vllm-env` (a Python venv) | Needs activating the venv then `vllm serve …` | No |

**Not found anywhere on this PC:** Automatic1111 WebUI on its own (only via the Forge package inside the unexecuted Stability Matrix download), Fooocus, InvokeAI, SD.Next, Jan, GPT4All, Piper, Coqui TTS, Open Code.

## 2. Models

| Model | For | Size | Path |
|---|---|---|---|
| `qwen2.5-coder` (Ollama) | Ollama | ~2.49 GB blob | `%USERPROFILE%\.ollama\models\blobs\sha256-be49949e…` |
| `qwen2.5-fixed` (Ollama, a fixed copy — see Notes) | Ollama | shares blobs above | Ollama manifest: `…\manifests\registry.ollama.ai\library\qwen2.5-fixed` |
| `gemma-lmstudio` (Ollama, imported from LM Studio's Gemma files) | Ollama | ~4.68 GB blob | Ollama manifest: `…\library\gemma-lmstudio`; blob `sha256-60e05f21…` |
| `qwen2.5-coder.gguf` | llama.cpp (`C:\llama`) | 4.68 GB | `C:\llama\models\qwen2.5-coder.gguf` |
| `gemma-3-4b-it-Q4_K_M.gguf` | LM Studio | 2.49 GB | `C:\Users\mike\.lmstudio\models\lmstudio-community\gemma-3-4b-it-GGUF\` |
| `mmproj-model-f16.gguf` (Gemma vision adapter) | LM Studio | 0.85 GB | same folder |
| `ggml-org/gemma-4-E4B-it-GGUF` | Hugging Face cache (likely pulled for llama.cpp or LM Studio) | 5.5 GB | `%USERPROFILE%\.cache\huggingface\hub\models--ggml-org--gemma-4-E4B-it-GGUF` |
| `ggml-large-v3-turbo.bin` | whisper-server (speech-to-text) | 1.6 GB | `…\lew42\whisper\models\` |
| `ggml-silero-v5.1.2.bin` (voice-activity detection) | whisper-server | 0.9 MB | same folder |
| `dreamshaper_8` / `DreamShaper_8_pruned` (duplicate) | ComfyUI (Stable Diffusion checkpoint) | 2.1 GB each | `Documents\ComfyUI\models\checkpoints\` |
| `flux1-dev-fp8` | ComfyUI | 17.2 GB | same folder |
| `v1-5-pruned-emaonly-fp16` | ComfyUI | 2.1 GB | same folder |
| ComfyUI LoRAs + VAEs | ComfyUI | 0.29 GB + 0.32 GB | `Documents\ComfyUI\models\loras` / `\vae` |
| Stable Diffusion checkpoints (dreamshaper_8LCM, juggernautXL, realisticVisionV60B1) | Stability Matrix / Forge | ~11 GB together | `Downloads\StabilityMatrix-win-x64\Data\Models\StableDiffusion\` |
| ControlNet (openpose, etc.) | Stability Matrix / Forge | 1.4 GB | `…\Data\Models\ControlNet\` |

## 3. Total disk used by models

**~57 GB**, by store:
- Ollama blobs: 7.5 GB
- LM Studio: 3.2 GB
- Hugging Face cache: 5.5 GB
- llama.cpp (`C:\llama\models`): 4.4 GB
- ComfyUI (`Documents\ComfyUI\models`): 23 GB
- Stability Matrix (`Downloads\…\Data\Models`): 12 GB
- Whisper: 1.6 GB

(This is file size on disk, not deduplicated — the same Gemma weights likely exist in three places: LM Studio's folder, the Hugging Face cache, and the Ollama blob called `gemma-lmstudio`.)

## 4. Notes — what looks half set up or broken

- **The Qwen + tools problem the owner remembered is real and still unresolved.** Two custom Ollama models exist side by side: `qwen2.5-coder` (the stock import) and `qwen2.5-fixed`. A file at `C:\Code\test\pi-mono\qwen.fix` is a hand-written Ollama `Modelfile` that overrides the model's chat **template** to add a `<tools>`/`<tool_call>` block — exactly a system-prompt/template fix for tool calling. It is unclear whether `qwen2.5-fixed` was actually built **from** this file (the `FROM qwen2.5-coder` line matches, but I did not find a `ollama create` log proving it ran) or whether it is an older, abandoned attempt. **What I'd check:** run `ollama show qwen2.5-fixed --modelfile` and diff it against `qwen.fix`; if they match, the fix is already applied and just needs testing with a real tool call; if not, re-run `ollama create qwen2.5-fixed -f qwen.fix`.
- **A second Modelfile** (`C:\Code\test\ollama\Modelfile`) tries to load LM Studio's **Gemma** GGUF files directly into Ollama (`FROM` the LM Studio path, `ADAPTER` the vision mmproj file) with a Gemma-style chat template. This explains the `gemma-lmstudio` model in Ollama's manifest list. It also looks like exploratory/unfinished work, not a working setup.
- **Stability Matrix was downloaded but never installed/run as itself** — it only exists as a self-extracted zip sitting in `Downloads`, not in `Program Files` or `AppData\Local\Programs` like the other apps. It already pulled in one package (**Forge**, under `Data\Packages\forge-neo`) and some models, so the owner got partway through setting it up, then stopped.
- **Automatic1111 / Fooocus / InvokeAI / SD.Next**: none exist on this machine outside of Forge via Stability Matrix. If the owner wants a different Stable Diffusion UI, it isn't here yet.
- **Duplicate/unused model weight:** `dreamshaper_8.safetensors` and `DreamShaper_8_pruned.safetensors` are the same size (2,132,625,894 bytes) in the same ComfyUI folder — almost certainly the same model saved twice.
- **The Pi harness and vLLM venv** (`C:\Code\test\pi-mono\vllm-env`) look like one experiment session that was never cleaned up or landed — multiple scratch folders (`test-1`, `test-project`, `temp-convert`, etc.) with no README tying them together.
- **Nothing is currently running** except the voice stack (`whisper-server`, port 8178) that Servex owns. Ollama, LM Studio and ComfyUI are all installed but idle — none start automatically as a background service on this machine (no Windows service registered for Ollama, despite it usually auto-starting on login elsewhere).

## 5. Unknowns — looked for and didn't find

- **Jan, GPT4All, Piper, Coqui TTS, Open Code, vLLM actually running** — none found installed or running; only the `vllm-env` empty virtualenv shell suggests vLLM was once considered.
- **Whether `qwen2.5-fixed` was ever actually tested against a tool-calling prompt** — no log or transcript found proving it worked or failed.
- **A second drive** — this PC has only `C:`, so "other drives" turned up nothing to check.
- **Any TTS (text-to-speech) program** — the voice task found earlier (whisper-server) is the *speech-to-text* half; I found no Piper/Coqui/other TTS install anywhere, so if the owner wants the AI to *speak*, that part doesn't exist yet on this machine.
