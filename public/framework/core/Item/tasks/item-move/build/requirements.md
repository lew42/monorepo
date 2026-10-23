# Build: move_item, a task moves home with its id, history and a reference

**Read first:** the design, [../design.md](../design.md). It is the spec. This brief adds the file fence and the proof.

## Build

1. **`move_item({ from, id, to, by })`** in `Servex/agents/page_tools.js`, exported. Follow steps 1–6 of the design exactly:
   - Collect the history.
   - Check it in memory, with a snapshot `set` line if the replay differs from the live child.
   - Write the new file via `SessionRecord.start_file`. Append if a log is already there, and make `page.js` if it is missing (use the `PAGE_JS` constant already in the file).
   - Write ONE old-home line, `{"task": to, "as": id, "moved_from": "<from>#<id>", by, ts}`.
   - Write the ledger line to `ledgers.task_moves`.
   - Return `{from, to, file}` or `{why}`. Write nothing at all on any refusal.
2. **`as` on a reference.**
   - `Task.from_ref(ref, as)`: the id is `as ?? ref_id(ref)`.
   - `Task.replay_line` (`public/framework/core/Task/Task.js`, the `typeof line.task === "string"` branch) passes `line.as`.
   - `Session.replay_line` (`public/framework/core/Session/Session.js`) passes `line.as` too, and REPLACES a same-id child instead of inserting a second one, the way Task.js does.
   - In the browser, `open_ref` must keep that id after the file loads.
3. **`move_nested_home`** becomes `move_item` aimed at the module home (`task_home`), plus its existing module-list line and `record_new_folder`. Its callers (PromptTasks) must behave the same.
4. **The item tool key.** `{"<id>":{"move":{"to":"<url>"}}}` and `{"tasks":{"<id>":{"move":{"to":"<url>"}}}}` on a Task/Session file call `move_item`, with `by` set to the caller. They return `{ok:true, moved:{from,to}, state}` or `{ok:false, why}`. Intercept it in `run_item` before the generic write.
5. **`open_task`** (`Servex/agents/Agents.js`): when the spawn's `task` carries `{from, id}`, call `move_item({from, id, to: <the child session folder url>, by: <spawner>})`. Call it after the folder and its assign line exist. Read how `open_task` builds that folder; change nothing else in it.

## Prove it

Add to `Servex/agents/item_tool.test.mjs`, using fixtures under its existing scratch dir, never real sessions:
- **Through the tool:** a parent `session.jsonl` with `tasks.add` of `x`, then `{x:{start:{}}}` and a `{x:{note:…}}`-style field line. Move `x` with the tool key to `<fixture>/agent-a/`. Check that:
  - the new file holds `x`'s lines in order, with their original `ts`;
  - the parent's last line is the one reference with `as: "x"`;
  - replaying the parent shows ONE child with id `x`, state `running`;
  - the ledger fixture has one line.
- **Destination already has a log:** a folder with an assign line already in it gets the history appended after that line.
- **Refusals write nothing:** an unknown id; a child that is already a reference.
- **Session class:** `Session.replay` of the parent gives one child with id `x`, not two.

Run, and report the counts: `node Servex/agents/item_tool.test.mjs`, `node public/framework/core/Task/Task.test.mjs`, `node public/framework/core/Session/Session.test.mjs`, `node public/framework/core/Item/Item.test.mjs`.

## Fence

You may edit only:
- `Servex/agents/page_tools.js`
- `Servex/agents/Agents.js` (only the `open_task` hook)
- `public/framework/core/Task/Task.js`
- `public/framework/core/Session/Session.js`
- `Servex/agents/item_tool.test.mjs`
- `Server/SessionRecord.mjs`, if you truly must

Do not move real sessions. No new npm dependencies. Commit after each working step in your worktree. Report what was built, the test counts, and anything that differs from the design.
