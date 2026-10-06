# The Single Universal Log Tool

How a single unopinionated logging tool solves the context-window crisis for local and cheap models while enforcing the file system as the sole source of truth.

---

## 1. The Core Law: The File System is the Ground Truth

Whenever an agent or minion is running—whether paying cloud API rates (Opus, Sonnet, GPT-6) or running free local GPU cycles (Qwen 3 8B, Hermes 3)—compute, memory, and time are consumed.

Ephemeral chat bubbles and conversational transcripts are not lasting state:
- Context windows roll over or truncate.
- Chat sessions crash or are abandoned.
- Humans frequently dictate long streams of thought without reading intermediate agent chat output.

Therefore, **any valuable work, parameter change, measurement, or architectural insight must be committed to the file system in an undeniable, structured, unopinionated format (`.jsonl`).**

---

## 2. The MCP Context Crisis on Constrained Models

When agent harnesses initialize a full MCP catalog:
- In this repository, Servex and the Dev Server provide **73 tools** across multiple namespaces.
- The JSON Schemas describing those tools consume **~75,000 tokens**.
- For a local model with a 32,768 (or 36,864) token window (such as `qwen3-8b` or `qwen2.5-coder`), injecting all 73 tools causes the model to fail instantly on turn 1 (`HTTP 400 Bad Request: Context limit exceeded`).

### The Solution: Strip Down to ONE Tool
Instead of exposing 73 domain-specific mutation tools, expose **only one tool: `log`**.

- **Tool Definition Schema Size:** **~120 tokens** (99.8% reduction compared to full MCP).
- **Remaining Headroom:** Leaves over **36,700 tokens** completely free for prompts, documents, internal thinking (`<think>`), and output generation.

---

## 3. The Unopinionated Log Contract

Earlier log gates in the system (e.g. `DIR_LOG` in `Sessions.js`) enforced hyper-rigid 3-shape schemas (`session`, `task`, `decision`) and rejected any other JSON key with `HTTP 400`.

A true universal log tool must be **unopinionated**:
- The model can log **arbitrary JSON data**: a parameter tweak, an observed benchmark, an audit finding, a new class name, or an architecture decision.
- It requires only a high-level category (`kind`) and a freeform JSON payload (`data`).

### Tool Declaration
```json
{
  "name": "log",
  "description": "Record a structured finding, note, parameter update, metric, or state to the persistent file system.",
  "input_schema": {
    "type": "object",
    "properties": {
      "kind": {
        "type": "string",
        "enum": ["param", "insight", "note", "step", "metric", "state"],
        "description": "The category of log entry."
      },
      "data": {
        "type": "object",
        "description": "Arbitrary structured JSON data or key-value updates to persist."
      },
      "target": {
        "type": "string",
        "description": "Optional destination log path or page identifier (defaults to active log)."
      }
    },
    "required": ["kind", "data"]
  }
}
```

---

## 4. Automated Harness-Side Metadata Stamping

The model must **never** be trusted or required to compute timestamps, elapsed time, or author IDs. The logging harness or server proxy intercepts the tool execution and enriches the entry automatically:

| Field | Source | Description |
| :--- | :--- | :--- |
| `ts` | System Clock | High-precision ISO-8601 timestamp (`2026-10-05T23:25:00.123Z`) or epoch ms. |
| `delta_ms` | Calculated | Elapsed milliseconds since the previous write to this stream, measuring step latency. |
| `by` | Authenticated Caller | Stamped from session context (`local/qwen3-8b`, `session-xyz`, `user`), preventing hallucinated attribution. |
| `seq` | Monotonic Counter | Incremental integer ensuring strictly ordered event replay. |
| `kind` | Model Argument | Event classifier (`metric`, `param`, `insight`, `step`, `state`). |
| `data` | Model Argument | Unopinionated, raw JSON payload provided by the model. |

### Example Written `.jsonl` Line
```json
{
  "seq": 42,
  "ts": "2026-10-05T23:25:39.102Z",
  "delta_ms": 7180,
  "by": "local/qwen3-8b",
  "kind": "metric",
  "data": {
    "baseline_vram_mb": 3784,
    "vram_with_qwen3_mb": 11713
  }
}
```

---

## 5. Structured Kinds & Downstream UI Binding

Because every line carries `kind` and `delta_ms`, UI layers (`Page`, `AIRail`, `Item`, `Card`) can dynamically render rich interactive widgets without tight backend coupling:

- **`kind: "param"`:** Renders interactive value diffs, sliders, or config toggles.
- **`kind: "insight"`:** Renders highlighted callout cards or collapsible explanation accordions.
- **`kind: "metric"`:** Binds to latency charts, VRAM gauges, or benchmark cards.
- **`kind: "step"`:** Advances progress bars and milestone checklists.
- **`kind: "state"`:** Prompts the human with interactive state-transition buttons or clarification questions.

---

## 6. Live Hardware Verification (RTX 4070 Super)

Tested live on 2026-10-05 against `Qwen3-8B-Q4_K_M` running via `llama-server`:
- Prompt: Provided RTX 4070 VRAM baseline (3,784 MB) and loaded usage (11,713 MB) and requested logging via the `log` tool.
- **Internal Thinking:** Model reasoned natively (`<think>`):
  > *"Okay, the user wants to log the GPU VRAM usage metric... There's a log function that takes 'kind' and 'data'. The kind should be 'metric' as they're reporting a measurement. The baseline is 3784 MB and with Qwen3 it's 11713 MB... I should structure the data as key-value pairs."*
- **Output:** Emitted clean `tool_use` with `kind: "metric"` and structured JSON payload.
- **Execution Time:** ~7.1 seconds at **\$0.00 cost**, with zero context bloat.
