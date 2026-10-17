# Owner notes, 2026-10-16: tool design (dictated, captured by voice-app)

Not a plan, not approved.

## Minimize tool defs

Not page-this and task-that. One **item tool** that takes a path and acts on any `Item`: pages, tasks, sessions, whatever extends Item gets managed by it for free. Precedent: the Page AI API (2026-10-12), one tool for pages, cards and subpages. Status of an item tool: not started as far as today's search shows.

## One toolset, two pathways

Whatever the Servex MCP offers should also be in the local SDK agents' native toolbox. Both call the same Servex method; the only difference is the MCP goes over the network and the local path does not. Same tool names, not a `node_` prefix.

Fact today: local agents get the Servex MCP over HTTP (`Agents.js` ~1076, `mcpServers.servex.type: "http"`), i.e. the network path, all ~80 tools. `doc/sdk.md` already says the two routes share one tool list and the in-process route is not live. The owner thinks 80 tools on a local agent is a mistake; a tool-reduction proposal was made earlier (not found by today's search; the other voice session holds that context).

MCP itself is not loved: its socket transport does not work well for Claude sessions, and wrapping our native WebSockets in another protocol may not be worth it. Keep it for remote; local goes direct.

## Tools over skills

Move toward tools and away from skills, for tracking: how often each is called, with what parameters, whether the procedure was followed. Skills would need hooks to get the same data. Skills are judgment-call bundles of information; the owner does not want to define everything as a skill.

## A tool that teaches its own use

The question: a tool definition is the "when to use" summary; a skill adds the "how" to context. Can a tool do both? Yes, two ways, both available today:

1. **The tool result is the instructions.** An MCP handler returns a string; nothing stops the first call (or a `how` call) returning the procedure. This is exactly what the `Skill` tool and `load_module` do already.
2. **A hook injects context on tool use.** The SDK's `PreToolUse` / `PostToolUse` hooks can return `hookSpecificOutput.additionalContext`, which lands in the model's context alongside the call. Servex already runs a `PreToolUse` hook (`Agents.js` ~972, the deny list), so the wiring exists; it just only says no today.

Call it something other than "skill tool" to avoid the confusion.

## Prompt refinement produces tasks

Every prompt handled with care: all the things asked for become tasks (see `core/Task/doc/owner-2026-10-16-task-system.md`). The refine pipeline (whisper → sentences → cheap cleaner) is documented in `ext/Refine`; the tasks step after it is not designed.

## Tool instructions (the name for it)

A tool's description is loaded into the context of every agent that has the tool, every turn (name, description, input schema), so the description is the standing "when to use" summary, and it costs tokens whether used or not. Configuration: allowedTools / disallowedTools and the mcpServers list on the SDK call.

**Tool instructions** are the node-based prompt response to using a tool: the moment an agent calls it, the system answers "you have used the X tool; here is how it works, here is what you can do." The instructions may hand over additional tools, or define the real API of a universal tool: which properties, which methods, how to actually use the thing. So a universal tool (the item tool) stays small in the context, and the instructions hone it on first use instead of every method and property sitting in every agent's context all the time.

Precedent: deferred tools in the Claude harness, where only a name is in context and a search call loads the full definition on demand.

## The item tool, decided (same day, later)

Item tool over task tool. One tool: a path and a method. Any class extending Item has its public methods callable through it, so a new class never needs a new tool; the class definition is the documentation. Pass this to whoever builds the task system and the Page AI API.
