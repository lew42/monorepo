# Owner prompts become tasks on the session page

**What it does.** When you type a prompt in a VS Code tab, each piece of work in it shows up a few seconds later as a **proposed task** at the top of that session's page (`/framework/ai/sessions/<id>/`, Conversation tab), with **Approve** and **Reject** beside it. Questions and plain statements are not tasks: they stay on the prompt's refined card (the Coverage tab). The owner asked for it on 2026-10-22: "owner prompts become tasks on the session page in real time".

![Two proposed tasks on a session page at 1200 px](shots/session-tasks-1200.png) · [at 400 px](shots/session-tasks-400.png)

## How a prompt becomes a task

1. **The prompt is logged.** `.claude/hooks/prompt-relay.mjs` (the UserPromptSubmit hook) adds it as a `Prompt` item to the session's card page, `public/framework/ai/YYYY/MM/DD/session-<id8>/page.jsonl`, through Servex's `page_add` tool.
2. **Servex hears it.** `page_add` calls `hooks.prompted` (`Servex/agents/page_tools.js`) for a `Prompt` item. Servex hands it to `PromptTasks` (`Servex/agents/PromptTasks.js`), which works through prompts one at a time. It skips prompts under 30 characters, `/commands`, any prompt whose `page_add` caller is not `owner`, and any session whose record does not start with `{"session":{"kind":"vscode-tab","id":…}}`. So only your own VS Code tabs count; an SDK agent's prompt never does.
3. **One cheap call splits it.** `RefineQueue.one()` (`Server/RefineQueue.mjs`, brief v3, Haiku, about a cent) turns the prompt into asks, each a task, question or statement. The refined card is written beside the prompt, where the Coverage tab already reads it. PromptTasks passes `no_index`, so RefineQueue does not also file the asks itself (`AskIndex.after_refine`); step 4 is the only filing.
4. **Each task ask is filed as a proposal** in the session's own record, `public/framework/ai/sessions/YYYY/MM/DD/session-<id8>/session.jsonl` (same day and folder name as the card page), through the item tool with caller `prompt-tasks`:
   `{"tasks":{"add":{"title","state":"waiting","waiting_on":"owner","from":"owner","source":"prompt:<prompt id>","description","module_hint"}}}`.
   It drafts in the session. No module folder is made until it is approved and moved.
5. **The page shows it live.** `SessionTasks` (`core/Session/SessionTasks.js`) streams `session.jsonl`, replays it into a `Session`, and draws each task with `TaskView.row`. A waiting one gets **Approve**, **Reject** and **Make it a project**.
6. **Your press is one line.** `{"decide":{"task":"<id>","is":"approve"|"reject"|"project","by":"owner"}}` is appended through the dev socket. `Session.replay_line` applies it: Approve starts the task (waiting → running); Reject stops it; Make it a project replaces it with a `Project` (core/Task/Project.js) with the same id, data and place.
7. **Approved, it moves home.** Every 5 minutes the TaskLoop tick runs `PromptTasks.sweep()`. An approved task whose `module_hint` is a folder under `public/framework/` moves to `<module>/tasks/<slug>/`, by `move_nested_home()` in `Servex/agents/page_tools.js`. Its data and state go to that folder's `task.jsonl` line 1. The session gets a same-id `{"task":"<new path>"}` reference, which replaces the nested one. The module list references the task too, and `ai/sessions/task-moves.jsonl` records the move. A task with no module, or a module that is not a folder there, stays in the session.

## Watch out

- **The `decide` verb is new in `.claude/hooks/jsonl-schema.mjs`.** The dev server loads that file when it starts, so a server started before this merge refuses the press until it restarts.
- **Only VS Code tab prompts are covered.** A session needs a `session.jsonl`, which the SessionStart hook writes. Prompts typed to a Servex agent from the dashboard do not go through `prompt-relay.mjs`.
- **Switch it on or off** with `node Servex/agents/PromptTasks.js off` (or `on`, or `status`). This writes or removes `prompt-tasks.off` in the Servex home (`%LOCALAPPDATA%/lew42/servex/`). It is checked on every prompt, so no restart is needed. `SERVEX_NO_PROMPT_TASKS=1` turns it off for a whole Servex run.
- Test: `node Servex/agents/prompt-tasks.test.mjs` (21 checks).

## Not built yet

- **Approved tasks need an owner.** Nothing assigns an agent to an approved task yet; a mastermind picks them up from the module's task list.
- **Choosing the module.** The module is the splitter's guess (`module_hint`). There is no control yet to change it before approving.
