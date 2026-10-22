# Process system: tasks that run themselves to completion, designed and run by a system architect

Budget: $25 for this run (design, first slice, a first real use). Opus, high effort. Parent: `vscode-mastermind` (the owner's VS Code tab, acting as the voice): log with the `log` tool; report by landing lines, not chat. You are the **system architect**: you hold the whole AI system in context so the tab does not have to. Spawn builders (Sonnet) and Haiku scouts as you see fit; review their work yourself. Work in worktrees; the owner approves merges (bring each slice to ready-to-merge). This is the top priority: put it above everything queued.

## The owner's words

Long dictation, 2026-10-22, the last owner prompt before this brief in the tab prompt log (`ai/2026/10/20/session-e00f55c9/page.jsonl`; transcript `e00f55c9-bad4-4ee2-899e-d629ea1eede6`). Read it whole: it is the spec. Earlier direction already written down: [Task notes §5 Processes](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md), [readme-system.md](/framework/ai/doc/readme-system.md) (both direction sections), [messaging.md "No blocking tools"](/Servex/doc/messaging.md), [items hold items](/framework/core/Item/doc/owner-2026-10-21-items-hold-items.md), [priority.md](/framework/ai/priority.md).

## 1. Study first (the investigation phase, done the old way)

Read the framework readme, `ai/`, `Servex/`, `core/Task`, `core/Item`, `core/Page` readme chains and the maps written today ([agent-context](/framework/ai/doc/agent-context.md), [tools map](/Servex/doc/tools-map.md), [item map](/framework/core/Item/doc/map.md), [agent-context plan](../agent-context/plan.md)). Sanity check: note anything broken, stale or self-contradicting and fix the readme in place; anything you had to dig for was under-documented: document it where it belongs. Branch `task/readme-roles` (slim CLAUDE.md, role readmes) is being merged now; build on it.

## 2. Design (one short page, class sketch first)

The essence, to decide and write as a class architecture (`core/Task/doc/process.md`, linked from the Task readme):

- **Process extends Task**, beside Project. A process is a workflow template with named phases, series or parallel children, nestable. A small core set, defined by you, general rather than long: start with **build** (investigate → plan → improve → approve → execute → review → merge) and **investigate** (questions ranked, known structure as class sketches and named parts, sources; may use web search via Haiku scouts under 100k). A one-off fix needs no process.
- **Node runs it.** Starting a process prompts phase 1; node moves it on, spawns or reuses the session each step names (model, effort, readmes, fresh or reused), pulses agents so they stay on track, and never lets a step be forgotten. A fixed sequence is code, never a reminder.
- **Completion is automatic and the goal.** A task (session, project, process) is complete only when all its children are; creating a task with a process makes its completion tracked from that moment. Every session should end complete; the merge is one of its tasks.
- **A session is queryable**: an agent asks its session (through the `item` tool) for its tasks, progress, cost. Decide where the item tool writes raw deltas (node stamps time) and where the server instantiates the item (needed to compute state); write both ways down.
- **Robust data from tools**, not chat: every phase change, spawn, readme read and result is a tool-written line; each phase's token share is measured so planning can be tuned.
- **Async without dropped balls**: no blocking tools except fast ones; slow work answers at once and its result comes back queued, in an envelope; write the places messages get lost and how each is closed.
- **Process quality from data**: test processes on real tasks; an AI judges only the obvious failures; agreement between independent agents beats a self-reported confidence.

## 3. Build the first slice, then use it

Smallest working slice: `Process` with phases, node advancing one process end to end, completion rolling up to its session, visible on the session page (whatever shows today). Then run one real task through the **build** process (pick a small item from `priority.md`) and record what went wrong; fix the process, not the agents.

## Also

- **Documentation per prompt** (the owner): a new direction or question is written down where it belongs right away, as curated knowledge: refine the existing note, mark a repeat as reinforced, never a new duplicate; never a file nobody links. Thorough docs come after the design settles. Put this rule in the mastermind role readme.
- The prompt audit's open asks ([report](../../prompt-audit-week-2026-10-22.md)) can later become real session tasks once completion is automatic; plan that, do not do it yet.

## Done when

- [ ] Study notes and fixes committed; `process.md` with the class sketch; the first slice at ready-to-merge; one real task run through it, with what broke.
