# Git hooks

Git hooks that every worktree shares. `.git/hooks/` isn't versioned, so the scripts live here and a small installer writes the hook file.

- `install.mjs`: `node Server/git-hooks/install.mjs` writes the shared `.git/hooks/post-commit`. It refuses to overwrite a hook that isn't its own.
- `post-commit.mjs`: appends `{"commit":"<12-char hash>"}` to the `task.jsonl` named by `SERVEX_TASK`, which `Servex/agents/Agents.js` `door()` sets for each agent with a task. It writes each hash once and never fails a commit.
- `post-commit.test.mjs`: the test.
