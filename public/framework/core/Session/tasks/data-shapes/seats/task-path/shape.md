# Analysis (b), task-path: how a task is born, who finishes it, why 223 stayed open

Every number here was computed by replaying `ai/sessions/2026/10/20/session-e00f55c9/session.jsonl` with the real `Session` and `Task` classes (scripts in the scratchpad, not the repo). The replay reproduces the owner's figure exactly: **509 top-level tasks, 286 done, 223 undone (56%)**; 60 more are stopped and are not counted.

## 1. Where a task comes from (the origin table)

| Origin | Code that creates it | Shape it writes | Who is supposed to finish it |
|---|---|---|---|
| **VS Code tab, the prompt itself** | `.claude/hooks/prompt-relay.mjs:249` writes a `Prompt` item (`page_add`) to the tab's page. `Server/PromptsToSession.mjs` (backfill) and `Server/PromptRecords.mjs` then add the same prompt to `session.jsonl` as `{tasks:{add:{type:"Prompt", raw, paragraphs, parts…}}}` | One `Prompt` per dictation. State is computed from its `parts` | Nobody. It completes by itself when every part is settled |
| **VS Code tab, the asks split from it** | `Servex/agents/PromptTasks.js` (OFF now) → `PromptRecords.file()` → `run_item`, caller `prompt-tasks`. Older route: `Server/AskIndex.mjs:193 make_tasks`, caller `refine-queue` | `{tasks:{add:{type:"Task", title, expected, module, source:{session,line,part}}}}`, `from:"owner"`, state idle | The `module` named by the splitter (a module inbox); in practice nobody |
| **VS Code tab, a hand-made task** | The tab or a mastermind calls the item tool (`Servex/agents/page_tools.js run_item`) with `tasks.add` (caller `agent`) | A plain `Task`, usually a folder with its own `task.jsonl` | The agent that made it |
| **Voice agent, fast seat** | `Servex/agents/Sessions.js:482 assign_prompt` → `PromptLines.add_prompt` (`PromptLines.js:31`). Voice sessions only | `{tasks:{add:{type:"Prompt", id:"p-<ms>", raw, paragraphs}}}` in the voice session's own `session.jsonl` | Nobody. The fast seat only places sentences |
| **Voice agent, smart seat** | Same file: `PromptLines.add_task` / `add_question` (`:53`, `:56`), written through the item tool | A `Task` or `Question` nested under the Prompt (`from: <prompt id>`) | The smart seat (a Question closes when the owner reads the answer); a Task has no named finisher |
| **Dictation sheet** | `ux/Dictate/chat.js` makes none. It only draws `{tasks:{add}}` lines (`chat.js:215`, folded by `ext/Chat/v2/ChatV2Model.js:28`). The words it sends reach the same fast and smart seats | (none of its own) | (not applicable) |
| **Servex spawn** | `Servex/agents/Agents.js:226 → open_task` (`:1048`) writes the child's `task.jsonl`; `SessionRecord.link_parent` and `Server/ChildLinks.mjs` put an entry for it in the parent | A `ChildSession` entry (path, state) in the parent | The spawned agent. Chased by `Servex/TaskLoop.js` while it is `running` |
| **Splitter output no longer on** | `PromptTasks` (OFF, `MODULE_HOMES=false`). `Server/UndoneToTasks.mjs` (`--apply`) is the same idea, run by hand | Idle task in a module home | Module inbox |
| **Mass close-out passes** | `Server/CloseoutWalk.mjs`, `task-mastermind-session-closeout`, `…-note-tasks`, `minion-review-stops`, `mastermind-deputy` | Lines on existing tasks: `complete`, `stop`, `wait{decide_by}`, `set{fair}` | These are the finishers in practice (see below) |

## 2. What the 509 are made of (counts)

| Kind of top-level entry | All | Undone | Done | % undone |
|---|---|---|---|---|
| Prompt (backfilled by `PromptsToSession`) | 167 | **111** | 56 | 66% |
| Ask split from a prompt (caller `prompt-tasks` / `PromptRecords`) | 263 | **101** | 162 | 38% |
| "Write down" rule task from a prompt | 18 | 1 | 17 | 6% |
| Hand-made (no `source` tag) | 52 | 6 | 46 | 12% |
| Child session of a spawn | 9 | 4 | 5 | 44% |
| **Total** | **509** | **223** | **286** | **44%** |

**211 of the 223 undone (95%) were made by a program, not by a person or an agent.** Writer of the undone: `PromptsToSession` 111, `prompt-tasks` 100, `PromptRecords` 4, everything else 8.

## 3. Why they are undone (each cause, with its count)

| # | Cause | Count |
|---|---|---|
| 1 | The Prompt is counted as a task, and so is every ask split from it: the same dictation twice. 111 undone Prompts, each waiting on asks that are also in the 223 | 111 |
| 2 | Question, idea and rule parts of a Prompt have nothing that closes them, so the Prompt cannot complete. Open parts: question 227, idea 187, rule 154. If those did not block, **25 of the 111** Prompts would already be complete | 25 (up to) |
| 3 | A part points at a task that was stopped. A stopped task never counts as complete, so the part never settles. 38 such references; with stopped counted as settled, 4 more Prompts complete (34 with cause 2) | 38 refs |
| 4 | A part points at a `requirements.md` path that `Prompt.task_state` cannot resolve (it reads the last path segment). 34 refs; a path-aware lookup frees only 4 of 111 | 34 refs |
| 5 | Closed out as "deferred": waiting, `decide_by` 2026-11-01, home a module. No one is woken at that date | 48 |
| 6 | Waiting on the owner | 12 |
| 7 | "Running" with no agent: started by the close-out mastermind about 3.1 days ago, folders unchanged 64+ hours | 33 |
| 8 | Handed to one agent (`mastermind-dictation-2`) at once | 16 |
| 9 | Nobody ever touched it (no line from any agent): 111 Prompts, 8 asks, 3 hand-made, 3 child sessions, 1 rule | 126 |

Of the **286 done**, **209 were closed by a mass close-out pass** (`closeout-walk` 92, session close-out 60, `minion-review-stops` 37, note-tasks 16, deputy 4), 63 were never touched by anyone (the done Prompts, which complete by themselves), and only **14 were actually worked by an agent**.

## 4. What would make "a few core tasks per session, actually finished" true

See [notes.md](notes.md). In one line each:

1. **Do not re-prompt 223 tasks.** The count is a symptom of what the machine files, not of what the owner asked.
2. A Prompt is a message, not a task. Count only the asks, and count each once.
3. Questions, ideas and rules settle without a task (answered / documented / no-action).
4. A session has a short list of **core tasks, each with one named finisher**; everything else is a note on its Prompt.
5. Close-out reports (a one-page list) instead of mass-completing.
