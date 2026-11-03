# Tasks: is the task system working? Measure it, then say what must change (you are a mastermind, on Sonnet, medium effort; the reading goes to Haiku)

**The owner (2026-11-02, about 14:20, dictated; verbatim in the tab's prompt log):**
- "I don't think our task system is really working the way it should be. Use some cheap agents, Haiku, or Sonnet if Haiku doesn't figure it out."
- "We need to know when tasks are created, who they're created by, and whether we're doing it too much or too little."
- "We want to be creating tasks perfectly, then completing tasks perfectly. We want each session to be completed at 100%."
- "Where is the Process class? I don't think it works. It was supposed to extend Task."
- On the tasks folder: "framework/tasks is a path-based tasks system… should we move the AI task class back to core Task?… why make this specific to AI? It's just a task, driven by humans or AI. We just provide AI the tools to use the task."

The primary objective is now written down: [agent-rules.md, "The primary objective"](/framework/ai/doc/agent-rules.md).

## Do (measure with node scripts; Haiku reads only what a script can't decide; no repo edits beyond this task folder and the docs in item 5)
1. **A census, computed, not recalled (law 7).** Write a node script (in this task folder) that walks every task record under `public/framework/ai/sessions/` and every module `tasks/` folder. Per day, for the last 14 days, it prints:
   - how many tasks were created, and by whom (the tab, a mastermind, a minion, the voice seat, Servex);
   - how many landed, and how many are still open, stalled (no line for 24 h) or abandoned;
   - each session's completion %.

   Write the output to `census.json` and a one-screen `census.md`.
2. **Too many or too few?**
   - **Too few:** owner asks with no task. Compare against `ai/asks.jsonl` and `node Server/PromptAudit.mjs --days 7`.
   - **Too many:** duplicates, empty tasks, tasks opened and never touched.

   Haiku in small batches, 30–60k tokens each.
3. **The classes, where they stand:**
   - `core/Task/Task.js`, `core/Task/Process.js` (`class Process extends Task`; doc: `core/Task/doc/process.md`), the AI viewers in `ai/AITask/`, and `framework/tasks/readme.md` (a plain list today).
   - Is Process used anywhere live? Does it work? Run its tests.
   - Is anything AI-specific in the classes that shouldn't be?
4. **The session page:** do the session links the voice agent makes open a working page that shows the session's tasks and their state? Check 3 recent ones headless, with screenshots.
5. **Write `findings.md`:** the numbers, what's broken, and a short ranked fix list. The owner's leaning: one core Task that isn't tied to AI, any folder can have `tasks/`, AI drives it through tools. Each fix gets a child task (`item` tool, `tasks.add`). Then fix the plainly wrong lines in `core/Task/readme.md` and `framework/tasks/readme.md` yourself.

**Fences:** read-only outside this folder, except the two readmes in item 5; commit by path; no `python -`. **Budget:** about $8. Report to vscode-mastermind in 3 lines.
