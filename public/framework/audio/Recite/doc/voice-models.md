# Voice models for read-aloud: what Kokoro costs, and what sounds better

**The answer:** Kokoro is cheap to run (about 1.3 GB of RAM, no GPU, 1.2 s to speak a 21-word sentence) but it is a small 82M-parameter model, so "robotic" is expected. Your 12 GB RTX 4070 SUPER has about 8 GB free beside Whisper. **Try Chatterbox next** (local, MIT licence, voice cloning, an emotion dial). If you want a cloud fallback, use **OpenAI gpt-4o-mini-tts** (about $0.70 an hour of speech, steerable tone).

## 1. Kokoro, measured on this machine (2026-11-01)

recite-server runs `kokoro-onnx` as python process 33500 on port 8177, with the CPU: Intel Core i7-14700K (20 cores, 28 threads).

| What | Measured |
|---|---|
| RAM idle | 1.26 GB working set, 2.18 GB private (committed) |
| RAM peak while rendering | 1.27 GB working set (it does not grow; the model is already loaded) |
| CPU idle | 0 % |
| CPU while rendering | about 16 cores busy for 1.7 s (29 CPU-seconds in 1.75 s wall) = roughly 59 % of the whole CPU, a short burst |
| One 21-word sentence | 7.2 s of audio rendered in 1.16 s (1.6 s with the HTTP round trip), so about 6x faster than real time |
| Size on disk | `kokoro-v1.0.onnx` 326 MB (full-precision float32 weights) + `voices-v1.0.bin` 28 MB (54 voices), in `%LOCALAPPDATA%/lew42/recite/models/` |

**Why the CPU?** `recite_server.py` calls `Kokoro(model, voices)` with no device choice, and the venv has the plain `onnxruntime` package, which only has the CPU engine. `/health` confirms: `CPUExecutionProvider`. **Would the GPU help?** Not for quality; the model is the same, so it would sound the same. For speed it is already faster than real time, so it is not needed. Installing `onnxruntime-gpu` would use about 1 GB of VRAM and shave a fraction of a second. The robotic sound comes from the model's size, not the hardware.

## 2. Local GPU options (the card has about 8 GB free)

Figures come from blogs and model cards, not from running them here; treat them as rough. Arena Elo comes from the [Artificial Analysis open-weights leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard/provider-voice/open-weights); the older models below are not on its top five, so their quality word is a reviewer's.

| Model | Quality | VRAM | First audio | Controls | Licence | Windows notes |
|---|---|---|---|---|---|---|
| Kokoro-82M (now) | Clear, flat | 0 (CPU) | about 1 s per sentence | speed, 54 voices, no cloning | Apache 2.0 | Works today |
| **Chatterbox** (Resemble AI) | Good, beat ElevenLabs in a vendor-run blind test ([findskill](https://findskill.ai/blog/best-open-source-tts-2026/)) | about 6.5 GB ([Modal](https://modal.com/blog/open-source-tts)); the 350M Turbo is 4-8 GB ([pinggy](https://pinggy.io/blog/best_open_source_self_hosted_text_to_speech_models/)) | not found (one blog lists 48 s for a single Turbo synthesis, which looks wrong; measure it) | cloning from 5-10 s, `exaggeration` 0-2 for emotion | MIT | Plain `pip` and PyTorch CUDA; no special build |
| Orpheus 3B | Good, emotional | about 12 GB, or about 8 GB quantized ([localaimaster](https://localaimaster.com/blog/orpheus-tts-setup-guide)) | about 200 ms streaming | emotion tags (`<laugh>`), a few voices, cloning | Apache 2.0 weights on a Llama base (read Meta's licence too) | Wants vLLM or llama.cpp; vLLM is awkward on Windows (use WSL) |
| Sesame CSM-1B | Natural in a conversation, uneven alone | 2-4 GB ([codersera](https://codersera.com/blog/orpheus-3b-tts-vs-sesame-csm-1b-ai-speech-synthesis-for-emotion-conversational-depth/)) | 50-150 ms claimed | prompt with earlier audio for context; cloning from a clip | Apache 2.0 | PyTorch; needs the gated Llama-3.2-1B tokenizer download |
| Dia 1.6B | Strong on dialogue and laughs, one speaker per take is unstable | about 8-10 GB bf16 ([codersera](https://codersera.com/blog/nari-dia-1-6b-vs-sesame-csm-1b-which-is-the-best-tts/)) | slow, not real-time on small cards | `[S1]/[S2]` speakers, non-verbal tags, cloning | Apache 2.0 | PyTorch; tight beside Whisper |
| F5-TTS | Good, a little plain | 4.2 GB | 180 ms, total 1.8 s per sample ([gigagpu](https://gigagpu.com/best-tts-models-2026/)) | cloning from a clip; speed | code MIT, weights CC-BY-NC | Works; the non-commercial weights matter only if you ship |
| XTTS-v2 | Dated but dependable | 3.8 GB | 250 ms, total 2.4 s ([gigagpu](https://gigagpu.com/best-tts-models-2026/)) | cloning, 17 languages | Coqui licence, non-commercial | Easy; the project is no longer maintained |
| Breeze TTS 2 (new, 2026) | Top open-weights rank: Elo 1228 vs ElevenLabs v3 at 1177 ([ranking](https://offlinetts.com/blog/tts-model-ranking-2026/)) | 7.7 GB eager ([pinggy](https://pinggy.io/blog/best_open_source_self_hosted_text_to_speech_models/)) | not found | not found | not found | Not tested; it would nearly fill your free VRAM |
| Fish Audio Drama 3 / S2 Pro (new, 2026) | Elo 1278 and 1109, the highest open-weights scores | not found | not found | not found | check before use (Fish models have carried non-commercial terms) | Not tested |

## 3. Cloud options

| Service | Price | Latency | Controls | Source |
|---|---|---|---|---|
| Claude app voice | Not billed separately | unknown | You pick a voice | Press reports that ElevenLabs is the speech provider and a listed Anthropic subcontractor ([Engadget](https://www.engadget.com/2221938/claude-voice-mode-just-got-smarter/), [Weesper](https://weesperneonflow.ai/en/blog/2026-02-23-claude-ai-voice-mode-2026-features-vs-dedicated-dictation/)); Anthropic has not said so on a page I found, so call it "reported, unconfirmed" |
| ElevenLabs | $40 per million characters (Flash) or $80 (v3, Multilingual v2); about $1.80-$3.60 an hour | Flash about 75 ms | speed, stability, style, cloning, audio tags in v3 | [pricing](https://elevenlabs.io/pricing/api), [comparison](https://www.pkgpulse.com/guides/elevenlabs-vs-openai-tts-vs-cartesia-text-to-speech-2026) |
| OpenAI gpt-4o-mini-tts | about $15 per million characters, so about $0.70 an hour | about 200 ms | a text "instructions" field steers tone and pace, 13 built-in voices, no cloning | [comparison](https://futureagi.com/blog/best-text-to-speech-providers-2026/) |
| Cartesia Sonic | about $38 per million characters, about $1.75 an hour | 40 ms (Sonic 4) | speed, emotion, cloning | [pkgpulse](https://www.pkgpulse.com/guides/elevenlabs-vs-openai-tts-vs-cartesia-text-to-speech-2026) |
| Gemini 3.1 Flash TTS | not found | not found | not found | leads the Artificial Analysis arena at Elo 1214 ([leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard)) |

An hour of speech is about 45,000 characters (750 a minute), so the hourly figures are the per-million price times 0.045. Prices are from comparison articles dated 2026; check the vendor page before relying on them.

## 4. Recommendation

- **Local, try next: Chatterbox.** It fits in the free VRAM beside Whisper, is MIT-licensed, and its `exaggeration` dial and cloning are the controls most likely to cure "robotic". The alternative is Orpheus 3B, which may sound more natural but needs about 8-12 GB and a harder Windows setup.
- **Cloud fallback: OpenAI gpt-4o-mini-tts.** It is the cheapest per hour and its instructions field lets you say "warm, unhurried", which suits read-aloud. The alternative is ElevenLabs, the best-known quality and likely what the Claude app uses, at 2-5 times the price.
- **First step either way:** keep Kokoro as the default and add the new model as a second engine behind the same `/speak` route, so `Recite` stays unchanged and you can compare by ear.

*Caveat: I did not run any model except Kokoro. The leaderboards are vendor-neutral but the VRAM and latency figures are secondary sources.*
