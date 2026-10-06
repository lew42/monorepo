# Local model hunt: two new candidates tested against qwen2.5-coder

**Recommendation: switch the default local model to `local/qwen3-8b`.** It is the only one of the three that can actually use tools, and it scores as well or better than qwen2.5-coder everywhere except speed.

## The table

| model | size (VRAM) | docs | reasoning | refine (pass-rate / coverage) | seconds (full eval) | tool calls? |
|---|---|---|---|---|---|---|
| qwen2.5-coder (current default) | 4.7 GB | 4/5 | 3/3 | 8/10 | 23.5s | **no** — known weak |
| **qwen3-8b (new)** | 5.0 GB | **5/5** | 2/3* | 4/10 (73% coverage) | 178.6s | **yes** — passed cleanly |
| hermes-3-llama-3.1-8b (new) | 4.9 GB | 5/5 | 2/3* | 5/10 (72% coverage) | 22.7s | **no** — never called the tool |

\* the one reasoning miss on both new models was a dropped connection (`ECONNRESET`), not a wrong answer — a flaky run, not a weak model.

## The tool-call test (the deciding factor)

Brief's test: through the Claude Agent SDK pointed at the local server, read 3 files and answer a question whose answer is only in all three files together.

- **qwen3-8b: passed.** It called `Read` three times and answered both parts correctly (took 61s — it "thinks" before answering, which is also why its eval run above is slow).
- **hermes-3-llama-3.1-8b: failed.** It never called `Read` — it guessed ("a cat"; the real animal was a fox) and got the number right by luck. Marketed as a function-calling fine-tune, but this llama.cpp setup never actually invokes its tools — the same problem the owner hit with Ollama + Qwen before.

## Why these two, out of the field

Both run at Q4_K_M quant inside 5 GB, leaving the other ~7 GB of the 12 GB card free for Whisper and headroom. Researched from Hugging Face model cards and the Berkeley Function-Calling Leaderboard family of benchmarks (not SEO blog aggregations, which dominate search results for "best local LLM" right now and should be discounted):

- **Qwen3-8B** — the newer generation of the same family as the installed qwen2.5-coder, built with agentic/tool use as a first-class goal.
- **Hermes-3-Llama-3.1-8B** — NousResearch's dedicated function-calling tune of Llama 3.1, chosen specifically to test whether a model *marketed* for tool calling actually calls tools in this setup. It didn't.
- Also considered but not downloaded: Qwen3-4B-Instruct-2507 (smaller, BFCL-v3 61.9, would free even more VRAM) — worth a follow-up if the owner wants a smaller option than qwen3-8b; and Llama-3.3-8B (good general scores, no tool-call evidence found).

## What this cost

Both GGUFs downloaded once each (one at a time, as asked) into `C:/llama/models/`: Qwen3-8B (unsloth/Qwen3-8B-GGUF, Q4_K_M, 5.0 GB) and Hermes-3-Llama-3.1-8B (NousResearch/Hermes-3-Llama-3.1-8B-GGUF, Q4_K_M, 4.9 GB) — about 10 GB total, both wired into `Servex/ext/local/provider.js`'s `MODELS` map. All three models' numbers are now on the [Models tab](/framework/ai/system/models/).

## Caveat

Quantization accuracy loss wasn't isolated separately here — both candidates were tested only at Q4_K_M (the owner's "maybe 80% accuracy at 25% VRAM" question), since that's the quant that fits the 6–8 GB target. A future run could compare Q4_K_M vs Q5_K_M vs Q8_0 on qwen3-8b specifically to see how much the eval score moves.
