# Owner notes, 2026-10-16: real-time interrupt into a running agent (dictated, captured by voice-app)

Not a plan, not approved. The owner's words condensed.

## The confusion to clear up

Tools, tasks, skills, MCPs and sessions are blurring together. One overview of how the pieces fit is wanted. The facts as of today:

- a **session** is one `claude.exe` plus its transcript; `Agents.Agent` wraps it and feeds it from `Agent.Queue` (`Agents.js`, bottom), an async iterable `query()` never sees end
- a **tool** is a function the model may call. Two sources: MCP servers (Servex MCP = node functions on the wire) and the SDK's built-ins. All tools are pull: the model decides to call. There are no push tools.
- the only push INTO a session is a user message on its queue (`Agent.send`). Heartbeat, TaskLoop and the inbox all go through that door.
- a **skill** is a markdown procedure the model reads. Node can bake it into the spawn prompt (`Agents.js` ~192, skill-load preamble); mid-session it is loaded by the model, or by a queued message that says to.
- a **task** is a folder with `task.jsonl`; `TaskLoop` chases open ones. `core/Task` (a real state machine) is not used by any of it.

## Real-time interrupt for a voice session

Anything from the browser (UI events, console errors, the page I am looking at while we talk) should be able to queue a system-ish message into the agent I am talking to. Design it so:

- the right agent is interrupted, not every agent
- no context pollution from unnecessary interrupts
- useful messages are queued, not dropped

## Does the queue dump or trickle?

If four updates arrive while the agent is mid-turn, it should get all four, not one per turn. Verified today: `Agent.Queue.next()` hands over ONE item per call (`items.shift()`), so our side trickles. What the SDK does with several queued user messages during one turn (one turn each, or merged into one) is not verified; a five-minute test would settle it.

## Node-prompted procedures

Tasks should follow specific procedures reliably, prompted by node, so the process is managed and finished programmatically rather than by the model remembering. The mechanism exists (a queued message at the right moment, as the heartbeat does); what is missing is triggers (e.g. a commit that touches code → "run the documentation skill") and a task outcome/state to check against.
