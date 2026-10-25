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

## The owner's decisions and new asks (2026-10-24, the next prompt)

5. **Decided: `framework/ai/agents.md`** holds the general instructions every agent reads (mastermind or worker). It's short.
   - CLAUDE.md stays Claude-specific, and only gains a one-line pointer to agents.md. The owner approved that one line; no other surgery.
   - CLAUDE.md today points to the framework readme, the role readme and handover.md.
   - The ai readme stays the index of the AI system (Servex, roles, masterminds). A plain agent doesn't need to read it.
   - The framework readme stays "start here" for the framework.
6. **The stale queue is a "massive fail".** task-mastermind-queue-triage is cleaning out the 133. Your part is to make sure it can't happen again:
   - nothing old sits unworked and unseen;
   - stale tasks are found by code, on a schedule or at read time, and surfaced.
7. **Manage resources, using the session system as the real queue.**
   - An active session is a process in RAM. The PC has 32 GB.
   - Tasks have a priority, and a session is a task, so sessions have one too.
   - When a new piece of work needs a slot, a low-priority background session (a long audit, say) is wound down: paused at a safe point, or stopped with a note, for the higher one.
   - Recommend the agent cap from measurement. It's 5 today, and the owner asks to try 8–10 and watch RAM, CPU and heat.
   - Explain why Servex reported "working 6/5" tonight: what slipped past the cap?
   - The mastermind makes these calls; write the rule into the mastermind role readme.
8. **Fresh sessions stay safe because the files are the truth.** A new session started in a task's folder should have everything it needs. Make that a check in review: could a fresh agent continue from the folder alone?

9. **(the owner, 2026-10-24) When unsure, try it small.** A plan with nothing built makes the owner nervous, because the asks quietly never get built. And a pile of questions for the owner isn't the answer either. So for anything uncertain, build the smallest working version, see how it does, and keep or drop it. Plan-only is for big or architectural work (the plan-or-do rule). Add this to task-buckets.md, beside "approval defaults to do".

10. **(note only, the owner, 2026-10-24) Roles per folder.** Any folder can be an AI system with its readme, plus optional role files that only that role loads (e.g. a `mastermind.md`, or `framework/ai/system.md` for the AI system mastermind: its own role, abilities and operating procedure). Not now; write it as an idea in role-process-skill-session.md.

11. **(the owner, 2026-10-24) "AI system mastermind" is a role, not one long-lived agent.**
    - Opus, with its own system prompt (what it reads, that it's a mastermind that works on its own and spawns agents).
    - The master mastermind spawns a fresh one per project and reuses it only while its context is small. One at a time is normal.
    - Rewrite the role's docs and the singleton setup to match. Say what changes in Servex's singleton code.
12. **Context alerts go to the parent.** When a child crosses 50% and 75% of its context window, its parent mastermind gets a message (one subscription system: a line in the child's log that the parent follows). Then the parent decides: keep going, compact, or start fresh.
    - Compact sooner rather than later.
    - **After any compaction, re-inject the role:** "you are X, here are your principles". The role readme is already the system prompt for SDK agents, so check the reminder fires after every compaction.
    - Say what exists (`nudge`, compact-before-sleep, the reminder every 100k) and fill only the gap.
