# Autonomy, Pacing & The Dynamic Mastermind

How agents work autonomously without stopping, without hallucinating metrics, and without wasting tokens on idle heartbeats.

---

## 1. Why the 5-Minute Heartbeat Failed

A static 5-minute heartbeat (`*/5 * * * *`) that wakes up inside the interactive conversation:
1. **Queues user messages:** When the agent wakes up to run a background loop, incoming user prompts get queued behind long tool chains, making the system feel unresponsive.
2. **Context bloat & token burns:** Waking up every 5 minutes to check "is anything new?" re-sends the entire 100k+ session context on every turn. 139 turns × 100k context = 14M+ processed tokens just to say "nothing changed."
3. **Session drift:** The active conversation becomes cluttered with terminal logs and diffs, starving the actual user of direct context.

---

## 2. The Dynamic Heartbeat: State-Driven Wakeups

We do not monitor continuously; we wake up **only when an event is expected or when an agent gets stuck**:

| State | Expected Duration | Next Wakeup |
| :--- | :--- | :--- |
| **In-Flight Task** | 2–5 minutes | 5–10 minutes (bounded single-shot timer, not a recurring cron) |
| **Idle / Nothing Queued** | None | **Never wake up autonomously.** Stay dormant until user messages. |
| **Rate Limit / Window Exhaustion** | 3 hours (e.g., reset at 21:55 UTC) | Single one-shot timer set exactly to `resetTime + 1 minute`. |

When a task completes early, its completion event wakes the mastermind reactively (`TimerCondition`). The timer is cancelled automatically.

---

## 3. The Unstuck Protocol: Executive Decision Making

Agents (minions and subagents) often stall by:
1. Stopping halfway through a task to ask rhetorical or trivial questions.
2. Getting stuck in infinite read loops (reading files without producing changes).
3. Hitting minor test discrepancies and waiting for user input instead of completing what they can.

### The Rules:
- **System Instructions ("Never Stop"):** "Never stop mid-flight to ask clarification on minor choices; make the best engineering choice, proceed, document the decision, and finish the deliverable."
- **Nudge Mechanism:** If an agent remains in `working` or `idle` with unanswered questions, the mastermind intervenes with an executive prompt:
  > *"Do not wait on user input for non-blocking choices. Apply the cleanest default, complete the remaining steps, run verification, and report the outcome."*
- **Spend-Gate on Results:** If an agent executes >40 read tool calls without producing a commit, step completion, or file write, the system interrupts the agent before it drains the budget.

---

## 4. The Node-Based Plan & Step System

Rather than rigid scripts or unguided free-form tool calling:
1. **Minion Proposes Plan:** The worker agent proposes a concise, step-by-step plan (3–6 discrete steps) with verifiable acceptance criteria.
2. **Mastermind Refinement:** The mastermind reviews and massages the plan (1 prompt turn).
3. **Execution & Check-In:**
   - The agreed plan is saved as a structured task file (`task.jsonl` or `requirements.md`).
   - A deterministic Node.js process (outside LLM context) monitors the steps.
   - If a step does not log a state change within expected time, Node injects a targeted check-in prompt: *"Step 2 timed out. Provide status or log blockage."*
4. **Adaptive Plan Revision:** If a tool call reveals an unexpected constraint, the worker updates the step status to `blocked: <why>` and proposes an amended step, rather than abandoning the task.

---

## 5. Truthful Token & Cost Accounting (Zero Hallucination)

We never guess, estimate, or hallucinate token usage. We only use real data:
1. **Provider API Usage Headers:**
   - Anthropic SDK returns `usage.input_tokens`, `usage.output_tokens`, `usage.cache_read_input_tokens`, `usage.cache_creation_input_tokens`.
   - OpenRouter returns `usage.cost` directly from the `/generation` settlement endpoint.
2. **Local Language Server Ground Truth:**
   - `Server/antigravity-usage.mjs` queries the local Language Server gRPC-Web status.
   - Exposes exact `remainingFraction` and ISO `resetTime` for every model.
3. **No Fabricated Stats:**
   - If token counts are missing from a mock or unmetered call, it is flagged as `unpriced_calls` in the ledger, never filled with estimated guesses.
