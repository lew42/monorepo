# Sessions vs docs — what goes where (the owner, 2026-10-19)

Two places, two jobs. Putting a thing in the wrong one is how work gets lost.

## The session folder — log level, may be purged

`public/framework/ai/sessions/YYYY/MM/DD/<name>/`. Discussion-level detail: the owner's asks in order, decisions and why, anecdotes ("fixed X, nobody cares"), and **every agent this session spawned, referenced by its task-dir path** (its own log is the detail; the parent only records that it was created and where). Short-term. Sessions may be purged by date, so nothing that must survive lives only here.

A **cloud voice agent** session (the owner in the Claude app, the agent on the Servex MCP) has no local Claude Code file, so its folder is the only record: one per day per caller, e.g. `2026/10/19/cloud-voice-agent/`. Code writes it (`Servex/ext/remote/doc/voice-logging.md`); the agent never logs prompts from memory.

## The module docs — persistent, official

`doc/*.md` beside the module, linked from its `readme.md`. The decision, the purpose of a path, how a thing works — what a future agent outside the session needs. Never a dictation transcript, never the nitty-gritty of one fix. When a decision came from a long discussion, the doc states the decision and **links the session** for the extended explanation.

## They link both ways, they don't copy

When a session adds to a doc, the session log gets one line: "updated `<readme or doc>`: <one-sentence summary>" with a link. The words live once, in the doc; the session says that it happened and where. (Owner, 2026-10-19: writing a fresh rule into the session as well can keep it fresh in context, but as a rule he dislikes duplicate logs; summary-plus-link is the default, a copy is a judgment call.)

## The rule

Before writing, ask: would an agent six months from now, working on this module, need this? Yes → module doc (plus a session link if the reasoning is long). No → session. Something decided in a session that belongs in a doc is copied into the doc before the session ends — a session is not a safe place to leave a decision.
