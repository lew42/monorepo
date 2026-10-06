# Agent Interrupts, Queue Preemption & The Stop-and-Switch Pattern

Why naive FIFO message queues break agent collaboration, and how to implement clean interrupt-and-supersede mechanics across harnesses.

---

## 1. The FIFO Queue Trap in Agent Systems

In interactive pair programming and voice dictation, humans think and speak much faster than multi-step tool-executing agents can generate and run commands.

When an agent enters a heavy execution loop (running 4–8 sequential tool calls: grepping files, running tests, inspecting diffs, checking status):
1. User messages arriving during execution are placed into an incoming FIFO message queue.
2. If the user notices an issue, changes their mind, or dictates:
   > *"Ignore that last question, let's look at X instead."*
3. In a naive FIFO queue, that "ignore" message is placed at index 3 in the queue.
4. The agent spends 3 to 10 minutes completing obsolete tool steps and writing detailed answers to questions the human has already dismissed.

**Result:** The human is trapped watching an agent spend expensive compute answering questions that no longer matter, while urgent instructions remain blocked.

---

## 2. How Interrupts Work in the Agent SDK & Servex

The Claude Agent SDK and Servex provide first-class interrupt capabilities:

### `query.interrupt()` (Agent SDK)
In `Servex/agents/Agents.js`:
```javascript
async interrupt(){
    try { 
        await this.query.interrupt(); 
    } catch (e){ 
        this.emit({ type: "error", where: "interrupt", text: String(e.message || e) }); 
    }
}
```
- Halts active autoregressive output generation immediately.
- Does not crash the process; it gracefully stops after the current in-flight atomic tool call finishes or aborts.
- Yields control back to the harness loop so new user input can be delivered on the very next turn.

### The `interrupt_agent` Tool (`Servex/agents/tools.js`)
Exposed as an MCP tool so supervisors, user interfaces, or peer agents can halt a runaway minion:
```javascript
tool("interrupt_agent",
    "Interrupt an agent that is currently running: aborts its active generation and flushes its queue...",
    { id: { type: "string", description: "Agent ID to interrupt" } },
    async ({ id }) => card(await agents.interrupt(id)))
```

---

## 3. The Three Principles of Queue Preemption

To prevent queue lag and eliminate wasted compute, agent harnesses must implement three rules:

### 1. Out-of-Band Stop / Interrupt Signal
The UI or client harness must provide an immediate interrupt button (or hotkey `Escape` / voice command *"Stop"*).
- The interrupt signal must **not** wait in the message queue.
- It fires out-of-band via `AbortController` or `query.interrupt()` to instantly kill the current generation loop.

### 2. Queue Folding & Superseding
When multiple user messages are queued while an agent is busy:
- **Never blindly process them as independent serial turns.**
- If message $N$ contains negation, correction, or redirection (*"ignore that"*, *"scratch that"*, *"actually do X instead"*), the harness should **collapse the queue**:
  - The previous pending requests are marked superseded.
  - The agent begins its next turn conditioned immediately on the newest intent, referencing the earlier prompts by ID if needed rather than running them sequentially.

### 3. Fast Triage Layer
As documented in [Pass-by-Reference Messaging](pass-by-reference.md), the user-facing interface should speak to a zero-tool Fast Assistant (1–2 second latency). The Fast Assistant can acknowledge receipt and trigger an `interrupt_agent` on the heavy background worker in real time.

---

## 4. Summary of Guidelines

| Condition | Naive FIFO Queue | Interruptible Queue |
| :--- | :--- | :--- |
| **User sends redirection** | Waits 5–10 min behind earlier tool steps | Immediately aborts active turn via `interrupt()` |
| **Compute / Token spend** | Burns tokens answering discarded requests | Immediately stops; zero tokens wasted on obsolete turns |
| **Mental alignment** | Agent is 3 steps behind the user's focus | Agent remains tightly synchronized with current user intent |

---

## 5. Concurrency: The Prompt-Response Trap vs. Two-Tier Multitasking

LLMs operate under a synchronous autoregressive loop: `prompt → response → prompt → response`.
When a single agent tries to act as both a **conversational listener** and a **multi-task worker**:
- The human asks to do 20 things.
- The agent launches into 20 deep tool executions (file reads, shell commands, AST edits).
- **The Conversational Lockout:** While the tool loop runs, the model cannot speak to the human. If the human asks a quick question, it sits queued for 5 minutes.

### The Dictate Solution: Decoupling Conversational Concurrency
This exact friction drove the design of the Servex Dictate architecture (`Servex/agents/Sessions.js`):
1. **The Fast Listener Tier (`tools: []`):**
   - Holds the conversational floor.
   - Speaks within 1–2 seconds.
   - Answers quick questions, verifies status, and acknowledges user voice turns hands-free.
2. **The Worker Tier (Minions / Background Agents):**
   - Spawned asynchronously via `spawn_agent` into isolated worktrees or processes.
   - Performs the heavy 20-step execution without holding the user's chat input hostage.
3. **Pass-by-Reference Hand-Off:**
   - The fast assistant does not re-generate the 5-paragraph user prompt in output tokens.
   - It stamps the prompt to disk with an immutable ID and passes `{ agent_id, msg_id }` by reference.
   - The worker loads the task cleanly, keeping conversational turn-around instantaneous.
