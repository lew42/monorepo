# Inbox, Log and the one streaming system — owner thinking, 2026-10-08

Recorded from dictation. Owner of the study: `2026-10-08/ai-system-docs` (not session-class; that agent stays on Sessions). First stage = **find out what exists and how it works**, then how to integrate streaming; build only small safe parts.

## The inbox (intent)
A real-time **notification inbox like email**: surfaces urgent things and notifications; **unread items bold, un-bold when read**; basic read/unread. The owner remembers an **Inbox class** meant to manage it, so the same inbox UI can be dropped on any page. Not sure where it is or whether it still works: agents used to create things on the inbox and it "doesn't seem to" any more. Find: where inbox items are stored, how agents create them (an MCP/in-process tool? by hand?), who reads them, whether an Inbox class exists (`ux/Inbox`, `ext/Inbox`, `core/Page/ext/Inbox`), and why creation broke.

## The log
The log is basically an inbox with more verbosity. They might become one tab with filters. First: what is there, and is it a true real-time stream of everything (it should be).

## One streaming system everywhere
Use the **same** JSONL-tail-with-deltas streaming logic for every kind of data (cards, sessions, tasks, inbox, log, any screen): low latency, performant, robust, built into pages automatically, and also available to page sub-things (a session, a task). Inventory every place that streams or polls and what it uses; list the differences; recommend convergence on the existing mechanism (`ext/JSONL live()` + the dev-server socket).

## Programmatic writes
Agents must not write raw JSON. How do agents **and UIs** call a method on a page (a `page.log(...)` that stamps time and author)? The answer should be one programmatic path (node function; see `tooling-architecture-2026-10-08.md`), with the AI only passing the properties.

## Clean tree
Commit everything so there are save points; no loose uncommitted files; `.gitignore` machine state. (Done 2026-10-08 for the main tree; agents commit their own task dirs.)
