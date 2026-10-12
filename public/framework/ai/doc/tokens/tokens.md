# Tokens: how AI cost is counted, and how to spend less

<!-- merged from token-accounting.md (original kept in archive/) -->
## How AI cost is counted

### You pay per request, not per token
A **request** is one call to the model's API: send everything so far, get one reply back.

- The model reads the whole input **once** per request.
- It writes the reply one token at a time, reusing what it already worked out (its working memory, the "KV cache"), so earlier tokens are **not** re-billed for each new token.
- The bill for one request = input tokens × input price + output tokens × output price.

### Why an agent reads millions of tokens
An agent makes a **new request after every tool call** (read a file, run a command), and each request re-sends the whole conversation so far.

- 100 tool calls × ~110k of context ≈ **11M input tokens**: the median minion this week.
- So cost grows with **turns × context size**. Fewer turns and shorter sessions are the biggest saving.

### The cache discount
Each request starts with the same text as the one before. Providers bill that repeated start at a **cached price**:

- Claude: about a tenth of the normal input price; writing to the cache costs a little more than normal input.
- OpenRouter models vary: some discount cached input, some don't (gpt-oss-120b's cheapest host doesn't).
- 93–99% of what our agents read is cached. Only the newest part (the last tool result and the reply) is billed in full.

### Where the numbers come from
Every request's token counts (input, cache write, cache read, output) come back from the API itself, and its cost from those counts × the model's prices. One source of truth, everything else computed from it: being settled by [token-accounting](/framework/ai/sessions/2026/10/04/token-accounting/token-accounting/). Prices and context windows per model: the Models tab.


---

<!-- merged from token-efficiency.md (original kept in archive/) -->
## Token Efficiency & Batching Principles

How to keep context small, stop conversational churn, and minimize cost across all AI harnesses.

### The Core Rule: Cost = Turns × Context Size

An agent generates a fresh API request after every tool step. In a 100k-token session:
- **10 sequential tool calls** = 10 requests × 100k tokens = **1,000,000 processed tokens**.
- **1 batched tool call** of 10 items = 1 request × 100k tokens = **100,000 processed tokens (10x savings)**.

Every extra turn without batching forces the API to re-process and re-bill the entire conversation trajectory.

---

### The Four Practices

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

5. **Pass-by-Reference Message Forwarding:**
   - Never force a relay agent to re-generate multi-paragraph prompts or dictations verbatim in tool arguments (output tokens cost 3–5× more and generate slowly).
   - Pass an immutable message ID or file reference (`notify_agent({ to, msg_id, file })`). Reduces relay output tokens by >98% with zero transcription drift.
   - See [Pass-by-Reference Messaging & Queue Latency](../agents/pass-by-reference.md).
