# Brief: sessions, not tasks

The owner's decision of 2026-10-19 and what was asked are written in full in [ai/doc/sessions-and-tasks.md](/framework/ai/doc/sessions-and-tasks.md): a spawned agent is a session (`session.jsonl`, nested, no second date), a task is something finishable inside a session, tasks get `completed` 0 to 1, `class Project extends Task` is a play class, and the work merges slice by slice without waiting for approval.
