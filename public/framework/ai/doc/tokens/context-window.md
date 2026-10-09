# Context Windows & Attention Dynamics

How context windows, token sequences, and transformer attention mechanisms govern model behavior across chat, voice dictation, and agent harnesses.

---

## 1. How Context is Submitted to LLMs

Under the hood, every LLM API endpoint (OpenAI, Anthropic, OpenRouter, llama-server) receives a flattened sequence of tokens formatted into standardized message roles:

```
[System Message]       -> High-level behavior, constraints, tools, persona
[User Message 1]       -> User instruction or query
[Assistant Turn 1]     -> Model response (or tool_use call)
[Tool Result 1]        -> Returned data from tool execution
[User Message 2]       -> Subsequent user prompt or clarification
...
[Final User Message]   -> Immediate target ask
```

When MCP or function calling is enabled, tool definitions (JSON schemas with argument types and descriptions) are prepended or injected directly into the system context.

---

## 2. Transformer Attention: Primacy and Recency

Why do LLMs pay close attention to the very beginning and very end of a prompt, while missing details in the middle? This is not arbitrary; it is a mathematical property of the transformer architecture and positional encoding.

### Primacy Bias (The Start)
- **Token Index 0 & KV Priming:** Autoregressive processing begins at token 0. The initial tokens (system prompt, behavioral laws) establish the root representations in the Key-Value (KV) cache.
- **Positional Encoding Anchor:** Encodings like RoPE (Rotary Position Embedding) anchor relative distances from the sequence beginning.
- **Global Attention Sink:** Early tokens act as "attention sinks" that subsequent tokens across every attention layer attend back to for sequence grounding. This ensures foundational directives remain active.

### Recency Bias (The End)
- **Autoregressive Generation Mechanics:** A decoder-only transformer generates token $T_{N+1}$ conditioned directly on the hidden states of tokens $T_N, T_{N-1}, \dots$.
- **Direct Output Steering:** The immediate prompt tokens dictate the query vector ($Q$) used to generate the very first output token. Whatever is placed at the end exerts maximum steering force over the immediate next steps and response format.

### The "Lost in the Middle" Phenomenon
- In multi-head self-attention over long sequences (e.g. 16k–100k tokens), attention weights are distributed across thousands of tokens.
- Middle tokens lack the positional salience of token 0 and the autoregressive proximity of token $N$.
- Without explicit pointers or repeated references, critical details buried deep inside middle chunks receive lower attention weights and are frequently overlooked.

---

## 3. Practical Context Structuring Rules

To counteract attention decay and maximize model adherence, structure prompts according to the **Primacy-Middle-Recency** rule:

| Section | Position | Purpose | Example Contents |
| :--- | :--- | :--- | :--- |
| **Top (Primacy)** | Beginning (Tokens 0 – 2,000) | Persona, non-negotiable laws, output format contracts | CLAUDE.md laws, system role, tool definitions |
| **Middle (Neutral)** | Intermediate (Tokens 2,000 – N-1,000) | Passive context, reference logs, raw source files | Transcript excerpts, code files, background history |
| **Bottom (Recency)** | End (Tokens N-1,000 – N) | Immediate task, specific question, targeted focus | "Based on the above, answer X and output as JSON" |

> [!TIP]
> Never place the critical ask in the middle of reference files. Always sandwich reference material between the system rules at the top and the specific instruction at the bottom.

---

## 4. Context Windows Across Model Tiers

Context capacity dictates architectural design and tooling strategy:

### Local Tier (32k Window, e.g. Qwen3-8B / Qwen2.5-Coder)
- **Budget:** Total $\text{Input} + \text{Output} \le 32,768$ tokens.
- **Tooling:** Zero MCP tools (`tools: []`). 68 Servex MCP tools inject ~75,000 tokens, which immediately exceeds the context limit on turn 1.
- **Use Case:** Small, laser-focused tasks (cleaning transcripts, analyzing single class hierarchies, summarizing short text). Input capped under 20k to reserve 12k for native thinking and generation.

### Cloud Large-Context Tier (131k – 1M Window, e.g. Qwen 3.5 Flash, Sonnet 3.5, Gemini 1.5)
- **Budget:** 131,072 to 1,000,000+ tokens.
- **Tooling:** Full MCP tool catalogs, extensive file embeddings, multi-turn history.
- **Cost Tradeoff:** Extremely cheap on high-efficiency models (e.g. `qwen/qwen3.5-flash-02-23` at \$0.065/1M input via OpenRouter). Ideal for wide repository sweeps without consuming local GPU VRAM.

---

## Related Documentation

- [Token Efficiency & Batching](tokens.md) — Pre-processing and minimizing input tokens before submission.
- [Local Context Budget & Tool Bloat](../local/doc/context-budget.md) — Exact math on local 32k limits and MCP tool avoidance.
- [Local Model Strategy](../local/doc/strategy.md) — VRAM allocation, 8B vs 3B performance, and prompt design.
