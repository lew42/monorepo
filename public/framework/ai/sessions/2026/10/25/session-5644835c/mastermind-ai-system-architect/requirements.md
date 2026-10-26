# Tasks stay in the session that files them

The owner, 2026-10-26 (relayed by `session-smart-v-9dvbbrn`): stop creating tasks in module folders; a session creates its tasks in its own directory; a module home only if the owner explicitly asks. Find why tasks were created elsewhere and fix every doc and tool that steered them there.

Deliverables
1. The item tool nests a new task in the filing session; `home: "<module>"` is the only way to a module folder (`task_home`, `Servex/agents/page_tools.js`). The `PromptTasks` sweep that moved tasks into modules is off (`MODULE_HOMES = false`).
2. Docs and agent text say so: `session-smart.md` rule 4b, `Servex/doc/item-tool.md`, `ai/doc/tasks.md`, `ai/doc/sessions-and-tasks.md`, `core/Task/readme.md`, `ai/tasks/readme.md`.
3. A scripted way back: `move_to_session` and `node Server/TaskToSession.mjs <session url> <task folder url>… [--go]`.
4. The index finds session-owned tasks: `index.json` carries `open_nested` and the Home "Waiting on you" list includes nested tasks waiting on the owner (`Server/AIIndex.mjs`, `nested`).
5. Move the four module tasks filed by `v-9dvbbrn` back into its folder (after the merge, in the main tree).

Out of scope: the /framework/ai/ Dashboard/Inbox tab (dropped by the owner), the session Overview fixes (separate task).
