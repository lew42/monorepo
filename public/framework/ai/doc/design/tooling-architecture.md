# Tooling architecture — the owner's thinking, 2026-10-08

Recorded from dictation; open design for the system-architecture mastermind (`2026-10-08/ai-system-docs`) and the task-system mastermind (`2026-10-08/task-system-design`). No build yet.

## Principles
- **Keep context minimal.** No hundred default tools: every tool definition (name, arguments) loads into the session's context. **Skills load on demand; tools cannot** (a tool is either defined for the session through the SDK or it is not), so the unit of control is the **session template**: a bundle of tools, MCPs, skills, system prompt and model for a purpose (close to a role). Everything that influences a session (tools, SDKs, MCPs, prompts, skills) should be **visible and adjustable**, to find the best setup.
- **Procedural bookkeeping.** Agents should not hand-write JSONL. Their calls pass through node functions that stamp time, author and token cost, so accounting never depends on an AI remembering.

## The idea: one generic, object-oriented tool
- A single tool where an agent names an **object path and a method** plus arguments, and a node function applies it, a delta in the style of the `page.jsonl` deltas, authored by the agent and stamped by the tool.
- It works on the **App**: preloaded things are properties of the app; lazily loaded things come through an `app.get(...)`-style call; changes are applied with a set-style call. Any object in the app tree could expose methods that become callable this way, automatically, instead of one hand-made tool per action.
- **Server as remote control:** the server cannot render without a DOM, but it can apply deltas to objects anywhere in the app tree and push the change to every connected client over the socket, so a server-side app instance is a remote control for the client apps. Whether the call targets the server or the client may or may not matter; the architecture is not urgent but must be written down.
- **Knowing what is callable:** a **skill** loads on demand and lists the methods available on the objects in question, so the agent knows how to address them without those tools sitting in context all the time.
- A WebSocket-style tool is another possible path; document every pathway agents have (in-process SDK tools, networked MCP, sockets, shell) and which to prefer. In-process node-function tools beat a networked MCP hop where no network is needed (`Servex/agents/tools.js`).

## To produce
A documented inventory of all tools and pathways (what is MCP, what is in-process, what is a skill), the session-template idea, and a recommendation for the generic path-and-method tool with its trade-offs.
