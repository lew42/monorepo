# Local Model Context Budget & Tool Bloat

Why local models fail on MCP tooling, how input/output tokens share the 32k window, and how to use them safely.

## The Total Context Rule: Input + Output <= Window

A model's context window (e.g. 32,768 tokens in `llama-server`) is the **combined sum of input tokens AND output tokens**:

$$\text{Input Tokens} + \text{Output Tokens} \le 32,768$$

- If an input prompt uses 30,000 tokens, the model can only generate 2,768 tokens before it hits a hard stop.
- If the input prompt alone exceeds 32,768 (or 36,864) tokens, the engine rejects the call immediately with `HTTP 400 Bad Request` without generating a single word.

---

## Why MCP Tool Injection Blows the Context

When an agent harness connects to MCP:
- Every tool definition includes its name, long description, and full JSON Schema (properties, types, nested parameters, constraints).
- In this repository, Servex provides 68 tools, and the Dev Server provides 5 tools.
- **Cost of Tool Definitions Alone:** **~75,000 tokens**.
- Because 75,000 > 32,768, any local agent initialized with the default MCP toolset **fails instantly on turn 1**.

---

## The Safe Pattern for Local Models

1. **Zero-Tool Ingestion (`tools: []`):**
   - Provide the model with all necessary data directly in the prompt text.
   - Do NOT declare MCP servers or tool schemas.
2. **Small Focused Snippets (10k tokens or less):**
   - Ideal for:
     - Reviewing a class hierarchy (classes, methods, signatures) and suggesting alternate namings.
     - Cleaning raw transcripts (stripping filler words, punctuation repair).
     - Summarizing a specific markdown document into bullet points.
3. **Leave 4k to 8k Headroom for Thinking & Output:**
   - Keep input prompts under **20k tokens**.
   - This leaves 12k tokens for the model's native internal reasoning (`<thinking>` blocks) and the final response.
