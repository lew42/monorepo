Budget: $6

# Task: honest completion, accepted state, and tab spawns get a parent

The model: `public/framework/core/Task/doc/resolution.md` (read sections 5 and 6 and the build list). Build the first two build-list items and one parent fix. Work in your worktree, commit each step, do not merge.

1. **`complete` needs evidence** (`core/Task/Task.js`). `complete` takes `{outcome, evidence, confidence, caveats}`. `evidence` is a non-empty list (file, commit, shot or test); `confidence` is `high | medium | low` (default `medium`); `caveats` a list (default empty). With no evidence, refuse with a clear message saying what to pass. Keep a plain-string `complete("text")` from old callers working for one release only if refusing it breaks Servex itself (grep the callers: `close_task`, page_tools item tool, TaskLoop, StaleClose); a node-written close (StaleClose, stop) is exempt, say how. When caveats are non-empty, append one line to the parent's log (the parent session or task found the way `Server/SessionRecord.mjs` `parent_log` finds it) naming the task and its caveats.
2. **`approve` → accepted** (`idle`), not running. `start` is the agent's own call. Fix any caller or test that expects running after approve.
3. **Tab spawns record a parent** (`Servex/agents/Agents.js`). A `spawn_agent` called from a VS Code tab records `parent=null`. Record the calling tab's session as the parent (the tab's session id reaches Servex via the MCP request; find how `register_session` / the caller id is known). Same for clarity and reviewer spawns node starts: their parent is the agent whose task triggered them.
4. Update `core/Task/readme.md` / the Task docs that show `complete`, and tick the two items in resolution.md's build list (✅).

Done means: the Task tests and `Server/stale-close.test.mjs` pass, plus a new test: complete without evidence is refused, with evidence it lands and a caveat reaches the parent log. Final reply: commits, pass counts, any caller you had to change.
