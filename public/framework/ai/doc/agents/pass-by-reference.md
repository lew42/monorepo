# Pass-by-Reference Messaging & Queue Latency

Architectural principles for zero-waste agent communication, fast relays, and emergency bypass queues.

---

## 1. The Problem: Output Token Bleed in Relay Agents

When a user dictates a long train of thought, architectural lecture, or bug report, it often forms a large wall of text (3–5 paragraphs, 500–1,500 tokens).

In a multi-agent system, an orchestrator, triage agent, or conversational assistant often needs to route that request to a specialized worker or minion.

### The Naive Antipattern: Pass-by-Value
The relay agent calls a dispatch tool by re-emitting the user prompt verbatim:
```json
{
  "name": "send_to_agent",
  "arguments": {
    "agent_id": "minion-refactor-42",
    "text": "It seems like this antigravity thing is queuing up my messages, which is interesting and good in a way... [500 words repeated verbatim]"
  }
}
```

### Why Pass-by-Value is Disastrous:
1. **Asymmetric Token Pricing:** Output tokens are **3× to 5× more expensive** than input tokens across every model tier. Generating 1,000 output tokens to forward a prompt wastes high-value quota.
2. **Autoregressive Generation Latency:** Models generate output tokens serially (~30–50 tokens/sec). Re-generating 1,000 tokens introduces an unnecessary **20–30 second delay** before the target minion is even notified.
3. **Transcription & Semantic Drift:** Even if a model reproduces 99% of words correctly, a 1% hallucination or subtle paraphrasing drift can silently alter constraints, paths, or edge-case specifications.

---

## 2. The Solution: Pass-by-Reference Messaging

Because the framework already adheres to **the file system as the sole source of truth**, every incoming prompt from voice dictation, the web UI, or the CLI is immediately written to disk upon arrival (e.g. `public/ai/v-*.jsonl`, `log.jsonl`, or `inbox.jsonl`) with an immutable identifier (`msg_id`, `ts`, or `seq`).

### The Pattern:
Instead of transcribing the text, the relay agent emits only a **reference pointer**:

```json
{
  "name": "notify_agent",
  "arguments": {
    "agent_id": "minion-refactor-42",
    "msg_id": "msg_20261005_232334",
    "file": "public/ai/v-yxnts4l.jsonl"
  }
}
```

### The Efficiency Math:
| Metric | Pass-by-Value | Pass-by-Reference | Efficiency Gain |
| :--- | :--- | :--- | :--- |
| **Relay Output Tokens** | ~850 tokens | ~15 tokens | **98.2% reduction** |
| **Relay Latency** | ~25 seconds | < 1 second | **25× faster** |
| **Target Ingestion** | Full input cost | Discounted cache read | **10× cheaper via prompt caching** |
| **Fidelity** | 99% (risk of drift) | 100% (raw original bytes) | **Zero drift** |

When the target minion wakes up, it reads the exact raw text directly from the referenced file/database entry.

---

## 3. The Queue Latency & Emergency Bypass Dilemma

### The Problem: Single-Thread FIFO Blockout
In single-agent harness loops (including Antigravity and Claude Code sessions), tool calls execute sequentially:
- When an agent is mid-execution running several file searches, edits, tests, and git commands, user prompts are placed into an incoming message queue.
- If an urgent event occurs (e.g., dev server crash, broken production build, white screen on mobile, human abort), the urgent message sits trapped in the FIFO queue for 3 to 10 minutes while earlier commands finish.

### The Architectural Solution:
1. **Two-Tier Fast / Smart Relay:**
   - **Fast Assistant (`tools: []`):** A lightweight, zero-tool listener model (or local Qwen 3 running without tools). Because it never invokes long-running tools, its response latency is consistently 1–2 seconds. It can triage and immediately acknowledge human input.
   - **Smart Worker (`tools: [...]`):** Executes complex, deep reasoning and code modifications in worktrees.
2. **Out-of-Band Priority / Interrupt Channel:**
   - Standard task updates are marked `priority: "normal"`.
   - Emergency system notifications (crash alerts, human interrupt commands) are stamped `priority: "emergency"`.
   - The queue processor prioritizes emergency messages to immediately preempt or break into active loops rather than waiting behind long-running command pipelines.
3. **Reference-Based Triage:**
   - The Fast Assistant uses Pass-by-Reference: when the human speaks an urgent 5-paragraph intervention, the fast listener logs the message, stamps it `msg_id`, and fires an interrupt tool call carrying `{ interrupt: true, msg_id }` in under 2 seconds.

---

## 4. Framework Guidelines for Agents

1. **Never Re-Echo Full Context into Spawned Minions:**
   - When spawning a sub-agent or minion via `spawn_agent` or `invoke_subagent`, point to the task card, `requirements.md`, or log line.
   - Do not duplicate walls of text across tool calls.
2. **Log to File First, Forward by Reference:**
   - Every input message must exist on the file system before an agent acts on it.
   - Hand off file paths and IDs (`path: "public/framework/ai/2026-10-05/task/requirements.md"`).
3. **Keep Relay Prompts Under 50 Output Tokens:**
   - A pure routing decision requires only: target agent ID, message reference ID, and an optional 1-sentence intent tag.
