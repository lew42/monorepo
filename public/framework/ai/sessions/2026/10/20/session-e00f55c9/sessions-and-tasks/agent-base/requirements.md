# The base every agent reads, fresh sessions over long ones, docs checked before merge

For `ai-system-mastermind`. The owner's words are in the prompt log (2026-10-24, "So explain to me how our task queue works…"). Propose first, then do: anything that changes CLAUDE.md is shown to the owner as a proposal, and not edited.

1. **Start fresh over keeping a session long.** When a new task is unrelated to the last one (often even when it is related), start a fresh agent rather than reuse a long one and fight compaction. Reuse only a short, low-context session.
   - This works because agents write down what matters: the state of things goes in the logs (task records), and how things work goes in the docs.
   - Put the rule in the mastermind role readme and in `ai/doc/context.md`.
2. **One vendor-neutral base for every agent.**
   - The framework readme is the index of the framework.
   - The **ai readme is the base every agent starts from**, like CLAUDE.md but not Claude-specific, perhaps as `framework/ai/agents.md` (the common `agents.md` convention).
   - Propose:
     - what moves there;
     - how it reaches every kind of agent as a system prompt, not a message. Servex SDK agents already get their role readme in the system prompt. A VS Code tab only auto-loads CLAUDE.md, so CLAUDE.md could become a thin pointer;
     - what CLAUDE.md keeps.
   - Answer plainly: what is a system prompt here, what is a message, and which one survives compaction.
3. **Docs are checked in review, before merge.** After a change is tested and final, the reviewer re-reads the touched module's readme and docs: index anything new, fix anything stale. Check whether `Server/review.mjs` and the finish-task skill already enforce this, and close the gap in that one place.
4. **Explain the task queue in one plain paragraph** at the top of `ai/queue/readme.md`. Cover the ranked list on `/framework/ai/queue/`, each mastermind's own task list, and Servex's spawn queue (5 working at most). Say what picks up what, and when.
