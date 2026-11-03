# Concurrency, Timing & Simultaneous Execution in Agent Systems

How serial prompt-response loops, multi-step tool execution pipelines, and timing mechanics govern AI agents across chat, voice dictation, and background workers.

---

## 1. The Core Dilemma: Chat Output vs. File System Truth

In autonomous agent systems (Antigravity, Claude Code, Servex), agents face a fork in how they communicate:
- **Option A: The Long-Winded Chat Trap:** Generating elaborate architectural essays and diagrams directly into the ephemeral chat stream. When the conversation window truncates or rolls over, that entire synthesis vanishes forever.
- **Option B: File System First (the preferred way):** Write comprehensive architectural analysis, discoveries, and timing mechanics directly to committed markdown documents in the repository (`doc/*.md`). In the chat, output only concise clickable pointers ([`filename.md`](file:///path/to/filename.md)).

---

## 2. Timing Mechanics: Why Agents Cannot Speak and Execute Simultaneously

Modern Large Language Models are autoregressive token predictors governed by a synchronous, discrete loop:

$$\text{User Turn} \longrightarrow \text{Model Reasoning / Planning} \longrightarrow \text{Tool Invocation} \longrightarrow \text{Tool Output Wait} \longrightarrow \text{Next Step / Response}$$

### The 12-Step Pipeline Blackout
When a model decides to execute a multi-step plan:
1. Step 1: `read_file`
2. Step 2: `grep_code`
3. Step 3: `edit_file`
4. ... Step 12: `run_test`
5. Step 13: Final answer to user

**The Failure Mode:** The model does not speak to the human between steps 1 and 12. 
- While those 12 tool calls execute over 3–5 minutes, the conversational socket is closed to new inputs.
- Any human message sent during this window is appended to an incoming FIFO message queue.
- If the human sends 3 messages, all 3 are queued. The agent remains blind to them until Step 13 finishes.

---

## 3. Simultaneous Execution & Batching Strategies

Can an agent run tools and converse simultaneously? **Not within a single agent context.**

### 1. Serial Multi-Turn (The Slow Path)
- Model invokes Tool A $\to$ waits $\to$ inspects result $\to$ invokes Tool B $\to$ waits.
- **Timing:** $N \times \text{round-trip latency}$. In a 10-step plan, this takes 2–4 minutes of total human lockout.

### 2. Parallel Tool Batching (The Fast Path)
- Modern harnesses support parallel tool calls within a single turn:
  ```json
  [
    {"type": "tool_use", "name": "read_file", "input": {"path": "a.js"}},
    {"type": "tool_use", "name": "read_file", "input": {"path": "b.js"}},
    {"type": "tool_use", "name": "run_command", "input": {"cmd": "git status"}}
  ]
  ```
- **Timing:** All 3 tools execute concurrently; results are returned in one payload.
- Reduces turn count from 3 down to 1, cutting conversational lockout by 66%.

### 3. Decoupled Two-Tier Concurrency (The Architecture of Dictate)
To achieve true simultaneous interaction, the system must separate the **Conversational Listener** from the **Worker Agent**:

```
[ User Input / Voice ]
         │
         ▼
┌─────────────────────────────────┐
│     TIER 1: FAST LISTENER       │ ◄─── Zero tools (`tools: []`)
│  • Sub-second response (1–2s)   │      Never enters multi-step tool loops
│  • Always available to converse │      Never locks out incoming chat
└────────────────┬────────────────┘
                 │
                 │ Pass-by-Reference Task Handoff
                 ▼
┌─────────────────────────────────┐
│     TIER 2: WORKER MINIONS      │ ◄─── Dedicated Git Worktree
│  • Executes heavy 12-step tasks │      Runs shell, tests, file edits
│  • Reports back upon completion │      Does not block conversational mic
└─────────────────────────────────┘
```

---

## 4. Summary: The Rules of Concurrency & Reporting

1. **Write to Disk, Link in Chat:** Never spend expensive output tokens generating multi-paragraph lectures in chat. Write the documentation directly to `doc/<topic>.md`, commit it, and post a minimal clickable link.
2. **Batch Parallel Tool Calls:** When multiple independent reads or commands are needed, fire them in a single tool turn rather than sequentially chaining them.
3. **Never Block the Conversational Floor:** Keep user-facing triage models stripped of heavy tools (`tools: []`). Delegate deep execution to asynchronous background minions.
