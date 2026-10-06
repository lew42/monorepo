# Token Efficiency & Batching Principles

How to keep context small, stop conversational churn, and minimize cost across all AI harnesses.

## The Core Rule: Cost = Turns × Context Size

An agent generates a fresh API request after every tool step. In a 100k-token session:
- **10 sequential tool calls** = 10 requests × 100k tokens = **1,000,000 processed tokens**.
- **1 batched tool call** of 10 items = 1 request × 100k tokens = **100,000 processed tokens (10x savings)**.

Every extra turn without batching forces the API to re-process and re-bill the entire conversation trajectory.

---

## The Four Practices

1. **Batch Parallel Reads:**
   - When inspecting a module or architecture, read the `readme.md` and its 3–5 referenced doc files in a single turn instead of one turn per file.
   - Do NOT run a file read, wait for a reply, and then read the next.

2. **Relevance vs. Bloat:**
   - Batching 5–10 closely related files that address a specific question is optimal.
   - Dumping 100 unrelated files into context clouds model attention and wastes budget. When only one file matters, target only that file.

3. **Pre-Process Before Ingesting into LLM:**
   - Never feed raw 10MB JSONL logs or massive database dumps directly into an expensive model context.
   - Use deterministic, zero-cost Node.js scripts or regex filters to strip tool outputs, AST noise, and file dumps first, extracting only the human conversation.

4. **Tiered Model Delegation:**
   - **Local GPU (`C:\llama` / `llama-server.exe`):** RTX 4070 Super runs `Qwen3-8B` or `Hermes-3-Llama-3.1-8B` at **\$0.00** for high-volume summarization and file filtering.
   - **Fast Cloud Minions:** Gemini 3.8 Flash or GPT-6 Luna on OpenRouter for structured tool tasks.
   - **Mastermind Executive:** Claude Sonnet / Gemini Pro / Opus solely for high-level judgment and brief drafting.
