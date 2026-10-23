# Owner prompts become tasks on the session page

**What it does.** When you type a prompt in a VS Code tab, each piece of work in it shows up a few seconds later as a **proposed task** at the top of that session's page (`/framework/ai/sessions/<id>/`, Conversation tab), with **Approve** and **Not now** beside it. Questions and plain statements are not tasks: they stay on the prompt's refined card (the Coverage tab). The owner asked for it on 2026-10-22: "owner prompts become tasks on the session page in real time".

![Two proposed tasks on a session page at 1200 px](shots/session-tasks-1200.png) · [at 400 px](shots/session-tasks-400.png)

## How a prompt becomes a task

1. **The prompt is logged.** `.claude/hooks/prompt-relay.mjs` (the UserPromptSubmit hook) adds it as a `Prompt` item to the session's card page, `public/framework/ai/YYYY/MM/DD/session-<id8>/page.jsonl`, through Servex's `page_add` tool.
2. **Servex hears it.** `page_add` calls `hooks.prompted` (`Servex/agents/page_tools.js`) for a `Prompt` item. Servex hands it to `PromptTasks` (`Servex/agents/PromptTasks.js`), which works through prompts one at a time. Prompts under 30 characters and `/commands` are skipped.
3. **One cheap call splits it.** `RefineQueue.one()` (`Server/RefineQueue.mjs`, brief v3, Haiku, about a cent) turns the prompt into asks, each a task, question or statement. The refined card is written beside the prompt, where the Coverage tab already reads it.
4. **Each task ask is filed as a proposal** in the session's own record, `public/framework/ai/sessions/YYYY/MM/DD/session-<id8>/session.jsonl` (same day and folder name as the card page), through the item tool:
   `{"tasks":{"add":{"title","state":"waiting","waiting_on":"owner","from":"owner","source":"prompt:<prompt id>","description","module_hint"}}}`.
   It drafts in the session. No module folder is made until it is approved and moved.
5. **The page shows it live.** `SessionTasks` (`core/Session/SessionTasks.js`) streams `session.jsonl`, replays it into a `Session`, and draws each task with `TaskView.row`. A waiting one gets **Approve** and **Not now**.
6. **Your press is one line.** `{"decide":{"task":"<id>","is":"approve"|"reject","by":"owner"}}` is appended through the dev socket. `Session.replay_line` applies it: Approve starts the task (waiting → running); Not now stops it.

## Watch out

- **The `decide` verb is new in `.claude/hooks/jsonl-schema.mjs`.** The dev server loads that file when it starts, so a server started before this merge refuses the press until it restarts.
- **Only VS Code tab prompts are covered.** A session needs a `session.jsonl`, which the SessionStart hook writes. Prompts typed to a Servex agent from the dashboard do not go through `prompt-relay.mjs`.
- Off: `SERVEX_NO_PROMPT_TASKS=1`. Test: `node Servex/agents/prompt-tasks.test.mjs` (9 checks).

## Not built yet

- **Upgrade to a project** and **move to `<module>/tasks/<slug>/` on approval.** Today `module_hint` records the module the splitter guessed; the item tool's `move_home` does the move for a process. A plain approved task should get the same step.
- **Approved tasks need an owner.** Nothing assigns an agent to an approved task yet. A mastermind picks them up from the session page or from its list.
