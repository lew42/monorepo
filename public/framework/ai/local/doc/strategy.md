# Local Model Strategy: VRAM Math, Context Windows, and Attention Dynamics

The concrete numbers for your RTX 4070 Super (12 GB VRAM), the two competing strategies, and how LLM attention behaves over large context windows.

## 1. The VRAM Breakdown (Real Numbers)

Your graphics card has **12,282 MB (~12.0 GB)** total VRAM.

```
[ Total 12.0 GB VRAM ]
├── Windows & Desktop Apps: 3.8 GB  (Chrome, VS Code, OS display compositor, Whisper)
├── Model Weights:          4.7 GB  (Qwen3-8B-Q4_K_M.gguf)
└── 32k KV Cache Pool:      3.2 GB  (Pre-allocated context window in llama-server)
─────────────────────────────────────────────────────────────────────────────
    Total Used:            11.7 GB  (95.4% capacity — leaving ~300 MB free)
```

**Why 95% is high:**
If another desktop application (a browser tab playing video, Photoshop, or a 3D app) demands more than 300 MB of VRAM while Qwen is loaded, Windows begins paging GPU memory into system RAM, slowing inference dramatically.

---

## 2. Strategy Comparison: Big 8B Model vs. Small 3B Model

### Strategy A: Current 8B Model (Qwen3-8B)
- **Model Weight:** 4.7 GB
- **Context Window:** Capped at 32k tokens (KV cache takes 3.2 GB).
- **VRAM Total:** ~11.7 GB (95% full).
- **Best For:** Highest reasoning quality, complex instruction following, single-tool execution.
- **Weakness:** Cannot load more than ~20k tokens of code files at once without choking.

### Strategy B: Light 3B/4B Model (e.g. Qwen2.5-3B or Gemma-4-E4B)
- **Model Weight:** ~2.2 GB
- **KV Cache per token:** Drops by ~55% (fewer attention heads and layers).
- **VRAM with 32k Context:** 2.2 GB (weights) + 1.5 GB (KV cache) + 3.8 GB (OS) = **7.5 GB (62% full)**.
- **VRAM with 64k Context:** 2.2 GB (weights) + 3.0 GB (KV cache) + 3.8 GB (OS) = **9.0 GB (75% full)**.
- **Best For:** Safe multitasking, loading 30–50k tokens of source files into memory simultaneously without touching the 12 GB ceiling.
- **Weakness:** Lower reasoning depth; weaker at intricate multi-step logic.

---

## 3. Does Position in the Context Window Matter? ("Lost in the Middle")

**Yes, profoundly.**

Modern LLMs exhibit two proven attention biases:
1. **Primacy Bias:** The very beginning of the context (system instructions, initial files) receives strong attention weights.
2. **Recency Bias:** The very end of the context (the last 1–2 messages and final prompt) receives the strongest attention.
3. **The "Lost in the Middle" Effect:**
   - In a 32k or 100k context window, information placed between 30% and 70% depth is recalled with significantly lower accuracy.
   - If you load 20 files and ask a question about File #10, the model is much more likely to hallucinate or miss details than if File #10 is placed directly before your final instruction.

### Best Practice for Large Prompts:
- Place core constraints at the top.
- Place background files in the middle.
- Place the **specific target file and your exact question at the very bottom** directly before the generation trigger.

---

## 4. Tool Calling Verdict: Qwen 2.5 vs. Qwen 3

- **Qwen 2.5:** Used an older ChatML template that struggled with structured tool calls under standard OpenAI/Anthropic proxies unless custom JSON grammars were injected.
- **Qwen 3 (Verified Live):** Natively supports Anthropic-style tool calling. When tested with a single `get_weather` tool, it generated internal reasoning and cleanly emitted:
- **The Rule:** Qwen 3 can execute tools, but **only 1–3 targeted tools at a time**, never a massive 68-tool MCP bundle.
- **The Ideal Paradigm:** Provide a single unopinionated [Universal Log Tool](../../doc/log-tool.md) (~120 tokens). It accepts arbitrary JSON payloads (metrics, parameters, insights) while the server automatically stamps ISO timestamps, elapsed duration (`delta_ms`), and author attribution without hallucination.
