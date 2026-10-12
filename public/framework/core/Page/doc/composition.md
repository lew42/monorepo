# A thing has a page; it is not one (2026-10-08)

Rule: when something (a task, a session, an agent) needs a page, **give it one by reference** — `thing.page` and `page.thing` — rather than extending `Page`. `Page` is already a large `Item` with many methods; a subclass collides with its names and inherits behaviour it doesn't want.

- The thing keeps its own facts in its own file (`task.jsonl`, `session.jsonl`); the page keeps presentation facts in `page.jsonl`. A fact lives in exactly one of them; the other refers by id.
- Lists load a small derived index, not the logs. Detail: `ai/sessions/2026/10/08/task-system-design/task-system-design/design.md` and `ai/sessions/doc/data/data-architecture.md`.

## Gap: page CRUD and move

Creating, reading, updating and deleting a page, and **moving** one (keeping a backlink so what pointed at it still finds it), are not yet solid or easy. Today `page_add/set/log/read` edit content, but there is no `move`. Needed for tasks that live in sessions, modules or pages and can be re-homed. Proposed: a move appends `{"move":{from,to}}` and never deletes.
