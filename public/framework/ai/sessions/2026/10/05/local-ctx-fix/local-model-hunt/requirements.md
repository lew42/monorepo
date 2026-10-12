# Find and test better local models for this PC

## The ask (owner, 2026-10-04, dictated, excerpts)
> doing our quick logic tests based on some open router models that we're able to actually download ... we need to be careful of the quantization factor ... maybe it maintains 80 percent of the accuracy at 25 percent of the VRAM ... a Sonnet minion ... do some web searches, read into which open source models are best to run locally on my setup with 12 gigabytes of VRAM, and maybe staying ... under the six to eight gigabyte range ... so that Whisper works in parallel ... I would only download one at once ... I should have a gig of download capacity ... if all the tool calls are working, if they're able to use file system reads and properly follow the system instructions

## Facts
- GPU: RTX 4070 SUPER, 12 GB. Whisper runs beside it. Servex serves local models on :8998 as `local/<name>` (`Servex/ext/local/provider.js` MODELS map), unloads after 10 idle min.
- On disk: qwen2.5-coder 7B (4.7 GB, 2026-04-27), gemma-4-e4b, gemma-3-4b.
- The standard test: `node public/framework/ai/2026-10-03/new-brain/runner.mjs` with `MODELS=local/<name>` (docs · reasoning · refine, scored by code, $0 locally). Local qwen2.5-coder: 4/5 · 3/3 · 8/10. A broader OpenRouter sweep is in `eval-results-sweep.json` there.

## Do
1. **Web research (one batch, short):** the best open models that run in ≤ 8 GB VRAM at Q4/Q5 with good tool calling, from Hugging Face model cards and current benchmark tables. For each: params, quant, file size, expected VRAM with 8k context, benchmark scores with links, and what quantization costs in accuracy. Pick the top 2.
2. **Download one at a time** (GGUF from Hugging Face into `C:/llama/models/`), add it to the MODELS map, run the standard test, and a **tool-call test**: through the Claude Agent SDK pointed at the local server, read 3 files and answer a question about them.
3. **Report:** a table vs qwen2.5-coder (score, seconds, VRAM, tool calls yes/no) and a recommendation for the default local model. Add the rows to the Models tab data.

Budget: $4 (a guide)
Model: Sonnet, ONE agent. Never the mcp__playwright tools.
