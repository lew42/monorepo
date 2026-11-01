@AGENTS.md

<!-- The base rules for every agent live in AGENTS.md (imported above, so Claude Code loads it with this file and re-reads both from disk after every compaction). This file holds only what is specific to Claude Code. Do not edit it without asking the owner. -->

## Claude Code only

- **After a compaction,** re-read the readme chain for the folder you are working in. A hook prints it for you when it can; if it didn't, read it yourself.
- **Servex tools** (`mcp__servex__*`): call `updates` at the start of nearly every turn. It brings messages, the owner's notes, and "michael/dev moved" lines. Act on those at your next safe point.
- **Skills:** load one with the Skill tool when its moment comes (open a task: `new-task`; land it: `finish-task`). A Servex agent already has its role's skills in its system prompt; don't load them again.
- **Hooks guard you:** `.claude/hooks/git-guard.mjs` blocks stash, reset, pull, rebase and recursive deletes in the shared main tree. If a hook refuses, do it in your own worktree (`take_worktree`). Never work around a hook.
- **Usage pace:** a mastermind runs `node Server/usage-now.mjs` when it starts and before each spawn.
- **No Servex here?** In a cloud session (`CLAUDE_CODE_REMOTE=true`) or on another machine, Servex tools, voice and `*.localhost` are absent. Work on your own branch and push it; the owner's PC lands it.
