# Owner prompts become tasks on the session page

**What it does.** When you type a prompt in a VS Code tab, each piece of work in it shows up a few seconds later as an **open task** (idle, waiting on nobody) on that session's page (`/framework/ai/sessions/<id>/`, Conversation tab). Questions and plain statements are not tasks: they stay on the prompt's refined card (the Coverage tab). The owner asked for it on 2026-10-22: "owner prompts become tasks on the session page in real time".

![Two proposed tasks on a session page at 1200 px](shots/session-tasks-1200.png) · [at 400 px](shots/session-tasks-400.png)

## How a prompt becomes a task

1. **The prompt is logged.** `.claude/hooks/prompt-relay.mjs` (the UserPromptSubmit hook) adds it as a `Prompt` item to the session's card page, `public/framework/ai/YYYY/MM/DD/session-<id8>/page.jsonl`, through Servex's `page_add` tool.
2. **Servex hears it.** `page_add` calls `hooks.prompted` (`Servex/agents/page_tools.js`) for a `Prompt` item. Servex hands it to `PromptTasks` (`Servex/agents/PromptTasks.js`), which works through prompts one at a time. It skips prompts under 30 characters, `/commands`, any prompt whose `page_add` caller is not `owner`, and any session whose record does not start with `{"session":{"kind":"vscode-tab","id":…}}`. It also skips a turn you did not type: the tab's transcript stamps each user turn with `turnOrigin`, and only `"human"` is refined (a scheduled CronCreate check-in is `"scheduled"`; no line found = refined as before). So only what you type in your own VS Code tabs counts; an SDK agent's prompt never does.
3. **The prompt's record starts, and one cheap call splits it** (since 2026-10-23; before, `RefineQueue.one()` brief v3 filed one flat task per sentence, directions included). The `live` process of `Server/PromptRecords.mjs` writes the raw text and numbered sentences into the session's `prompts.jsonl`, then one Haiku call (`PARTS_BRIEF`) splits the prompt into parts: 1 to 3 main asks with their details nested, rules, questions, ideas, conversation ([prompt records](/framework/ext/Refine/doc/prompt-records.md)).
4. **Each top-level ask is filed as an open task** (rules and questions stay on the record; nested details go in the description) in the session's own record, `public/framework/ai/sessions/YYYY/MM/DD/session-<id8>/session.jsonl` (same day and folder name as the card page), through the item tool with caller `prompt-tasks`:
   `{"tasks":{"add":{"title","state":"idle","from":"owner","source":{"session","line","prompt","part"},"description","module_hint"}}}`. Routed a prompt's tasks yourself? `node Server/PromptRecords.mjs <session> --handled <prompt id> --to <task path>` completes its open ones as "routed to …" and marks the prompt handled.
   It lives in the session. No module folder is made until someone starts it and it moves home.
5. **The page shows it live.** `SessionTasks` (`core/Session/SessionTasks.js`) streams `session.jsonl`, replays it into a `Session`, and draws each task with `TaskView.row`.
6. **Older proposals (waiting on you) keep their buttons.** Tasks filed before 2026-10-24 are still `waiting`; your press is one line. `{"decide":{"task":"<id>","is":"approve"|"reject"|"project","by":"owner"}}` is appended through the dev socket. `Session.replay_line` applies it: Approve accepts the task (waiting → idle, with an approve verdict); Reject stops it; Make it a project replaces it with a `Project` (core/Task/Project.js) with the same id, data and place.
7. **Started, it moves home.** Every 5 minutes the TaskLoop tick runs `PromptTasks.sweep()`. An accepted task (started, running, paused or complete: `PromptTasks.accepted`; an idle task is not yet) whose module is a folder under `public/framework/` moves to `<module>/tasks/<slug>/`, by `move_nested_home()` in `Servex/agents/page_tools.js`. Its data and state go to that folder's `task.jsonl` line 1. The session gets a same-id `{"task":"<new path>"}` reference, which replaces the nested one. The module list references the task too, and `ai/sessions/task-moves.jsonl` records the move. Its module is `module_hint`, else the module that holds its `file_hint` (`PromptTasks.module_of`: the deepest folder with a readme). **The default home is the session itself:** a task with neither, or a module that is not a folder there, stays a task in its own session's record, where the session page lists it and the session's completion counts it (crack 2 in [cracks.md](/framework/core/Task/doc/cracks.md)).

## One writer: the splitter files the tasks, the tab starts them

`PromptTasks` is the only thing that turns an owner prompt into tasks (decided 2026-10-24: the tab and the splitter had each filed the same ask, so every ask appeared twice). **A tab never adds its own task for something you asked it.** To work on an ask, the tab:

1. Finds the splitter's task for its latest prompt: `node Server/PromptRecords.mjs <session id> --tasks` (JSON: `id`, `title`, `state`, `line`, `prompt`). `--tasks <prompt id or line>` names another prompt. If the list is empty, wait a few seconds (the split takes one Haiku call) and ask again.
2. Starts the one it takes, with the item tool on the session record: `{"tasks":{"<id>":{"start":{},"path":"<brief or task dir>","agent":"<agent id>"}}}`. A task another agent now owns carries that agent and path; the ask is **not complete** until the work is.
3. Finishes it the same way (`complete` with evidence). The tab files a task of its own only for work **it** invents, never for something you asked.

## Watch out

- **Servex must restart to pick this up** (`PromptRecords.mjs` is loaded into the running Servex): until then new tasks are still filed waiting on the owner.
- **Only VS Code tab prompts are covered.** A session needs a `session.jsonl`, which the SessionStart hook writes. Prompts typed to a Servex agent from the dashboard do not go through `prompt-relay.mjs`.
- **Switch it on or off** with `node Servex/agents/PromptTasks.js off` (or `on`, or `status`). This writes or removes `prompt-tasks.off` in the Servex home (`%LOCALAPPDATA%/lew42/servex/`). It is checked on every prompt, so no restart is needed. `SERVEX_NO_PROMPT_TASKS=1` turns it off for a whole Servex run.
- Test: `node Servex/agents/prompt-tasks.test.mjs` (23 checks).

## Not built yet

- **Open tasks need an owner.** Nothing assigns an agent to a new idle task automatically; the tab that took the prompt starts it, else the TaskLoop or a mastermind picks it up.
- **Choosing the module.** The module is the splitter's guess (`module_hint`). There is no control yet to change it before it starts.
