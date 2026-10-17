# The one edit that makes the hand-off file a task folder (outside this task's fence)

**What the proof found.** A spoken "file a task" in the sheet reaches the page's feed in about 7 seconds, but no task folder is made in the module's `tasks/` home. The smart assistant follows `Servex/agents/session-smart.md` rule 4b, which tells it to write an `ai/log.jsonl` line with `dir_log` (`task`, event `opened`). That rule is from before the task homes (`core/Task/readme.md` "Homes and references"). The line is an index entry; the task itself is never made.

**The edit** (`Servex/agents/session-smart.md`, rule 4b; read at every spawn, so no Servex restart). Replace

> then, in the same turn, write the task line into that page's folder with `dir_log({ dir: "<the page's folder, e.g. public/framework/ext/drawer>", line: { task: { dir: "<that same folder>", event: "opened", title: "<a short title>" } } })`.

with

> then, in the same turn, make the task in that page's module home with `item({ path: "<the page path>tasks/", delta: { tasks: { add: { title: "<a short title>", description: "<the owner's words, polished>", module: "<e.g. ext/drawer>", source: "<this session's file>" } } } })`. The tool answers with `homes[0].path`, the new task's page. Then write the feed line: `dir_log({ dir: "<the page's folder>", line: { task: { dir: "<the new task's folder, e.g. public/framework/ext/drawer/tasks/<slug>>", event: "opened", title: "<the same title>" } } })`. The item tool does not write to `ai/log.jsonl`, and the sheet's feed streams that file, so the second call is what makes the task show there; its `dir` makes the feed row link to the task.

**Checked by hand.** The same `item` call, made by this helper at `/framework/ext/drawer/tasks/`, made `tasks/readme-links-the-architecture-doc/` in one call and wrote nothing into `ai/log.jsonl` (the second call is needed). After the edit, run `node public/framework/ux/Dictate/test/handoff.mjs http://monorepo.localhost <shots dir>`; the `task_folder` number should fill in.

**Not in the edit, on purpose.** Whether `ask_manager` should also run (it did in the proof run). The page pair's own answer had not reached `ai/chat.jsonl` within the 37 seconds the proof watched, and the proof does not wait for it.
