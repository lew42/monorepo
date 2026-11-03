# Item writes answer fast (session-is-a-task, item 12, first small merge)

The owner, 2026-10-24: item() writes on session-e00f55c9's record froze Servex at 100% CPU for minutes; "a write returns {ok,id,line} without session_state", as a small merge on its own. Measurements and the cause: [slow-write.md](../../session-is-a-task/slow-write.md).

Done when: a write through the item tool answers the line it wrote (not the session picture) in under a second on this session's record; the full picture is a read; the item tool's tests pass.
