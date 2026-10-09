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
- **The 82k Context Overflow Lesson (Verified 2026-10-06):**
  - When Servex spawned `task-mastermind-3` with default `sub-mastermind` and `page` skills, the initial prompt ballooned to **82,101 tokens**, immediately crashing `qwen3-8b` with HTTP 400.
  - When benchmarked with a **lean system prompt (< 200 tokens)**, `qwen3-8b` responded in **8.2 seconds** at **$0.00**, delivering sharp, structured analysis.
  - **The Law of Local Spawns:** A local model must NEVER be spawned with multi-skill catalogs. It requires a dedicated zero-tool or single-tool (`UniversalLogTool`) harness capped under 1,500 prompt tokens.
- **The Ideal Paradigm:** Provide a single unopinionated [Universal Log Tool](../../doc/logs/log-tool.md) (~120 tokens). It accepts arbitrary JSON payloads (metrics, parameters, insights) while the server automatically stamps ISO timestamps, elapsed duration (`delta_ms`), and author attribution without hallucination.

---

## 5. Hermes-3 vs. Gemma vs. Qwen 3: When is Each Viable?

| Model | File Size | Context Limit | VRAM Usage | Tool Calling? | Viable Lane |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`qwen3-8b`** | 5.0 GB | 36,864 | 11.7 GB (95%) | **Yes** (Native `<think>`) | Primary agentic worker; needs single-tool logging pattern. |
| **`hermes-3-llama-3.1-8b`** | 4.9 GB | 32,768 | 11.6 GB (94%) | No (skips in proxy) | Fast summarizer (22s turnaround); structured text synthesis. |
| **`qwen2.5-coder`** | 4.7 GB | 32,768 | 11.4 GB (93%) | No (skips in proxy) | Code syntax refactoring, AST cleaning, one-shot prompt repair. |
| **`gemma-4-e4b`** | 5.5 GB | 8,192 | 11.8 GB (96%) | No | High-precision classification on tiny snippets. |
| **`gemma-3-4b`** | 2.5 GB | 8,192 | 8.2 GB (67%) | No | Safe multitasking; leaves 4 GB VRAM headroom for OS and games. |

---

## 6. The VRAM Snapshot Stream (`vram.jsonl`)

To maintain the file system as the sole source of truth for hardware telemetry, VRAM snapshots are recorded in [`public/framework/ai/local/vram.jsonl`](../vram.jsonl) via `UniversalLogger`:
- **Pre-Allocation Observation:** When `llama-server` boots with `--parallel 1`, it immediately allocates the full KV-cache pool for 32k/36k context. There is **no surprise VRAM spike mid-prompt**; all VRAM is reserved upfront.
- **Servex Supervision:** `Servex/Monitor.js` already runs continuous `nvidia-smi` sampling every 5 seconds. When a model unloads after 10 minutes of idle, VRAM drops from ~11.7 GB back to the desktop baseline (~1.6 GB - 3.8 GB).

---

## 7. Context Capacity: Slicing vs. Whole-File Reads

In a 32,768-token window:
- **Available Prompt Budget:** ~20,000 tokens (leaving 12,000 for thinking blocks and generation).
- **Text Capacity:** 20,000 tokens ≈ **15,000 words** ≈ **800–1,200 lines of dense code**.
- **The Slicing Rule:** Never ingest an entire 5,000-line file into a local model. Ingesting 5,000 lines chokes context immediately.
  - Read only the targeted class or function range (`lines 120-240`).
  - Pass the interface signature plus the specific block under edit. This keeps file ingestion under 2,000 tokens, leaving 90% of the window for reasoning.

---

## 8. Usage Limit Tracking: Antigravity vs. Claude Code

- **Claude Code (`claude-usage.py`):** Relies on Anthropic's OAuth endpoint (`https://api.anthropic.com/api/oauth/usage`) using `~/.claude/.credentials.json`, refreshed by `Servex/Usage.js` every 15 minutes into `public/framework/ai/usage.json`.
- **Google Antigravity:** Operates under a separate Google token allotment outside Anthropic and OpenRouter. Antigravity does not expose a public OAuth usage API endpoint on disk.
- **Strategy for Rate Management:**
  1. Monitor active session transcript token growth in `transcript.jsonl`.
  2. Offload bulk, high-volume processing to local models ($0.00) or cheap OpenRouter models (`deepseek-v4.1-flash` at $0.003/M, `qwen3.7-flash` at $0.03/M) to preserve Antigravity and Claude quotas for high-level mastermind decisions.
