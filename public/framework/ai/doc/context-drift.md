# Context drift: why a long-running agent forgets its role, and what keeps it

**Context drift** is what happens to a long session. The instructions it started with (its role readme, its rules) sit hundreds of thousands of tokens back, and the model gives them less and less weight. **Compaction** makes it worse: anything that was only in the conversation is summarized away. A long-running mastermind can end up working without the rules of its own role.

This page lists what Servex does about it and the factors that make it hard. Its companion, [compaction.md](compaction.md), covers when an agent is compacted and what that costs.

## What Servex does (the owner, 2026-10-23; code: `Servex/agents/Agents.js`, `Servex/agents/roles.js`)

1. **The role text lives in the system prompt.** A plain spawn now passes `systemPrompt: {type: "preset", preset: "claude_code", append: <role text>}`. The role text is the role readme plus the skills the role carries (`roles.js` `role_system()`). The first message only says where it is. The system prompt survives compaction, and the CLI re-renders it from the same options after each one. CLAUDE.md still loads the way it did before (`setting_sources` unchanged). Code: `Agent.role_prompt()`.
2. **A short role reminder** is added after each compaction, and each time the context grows another 100k tokens (`SERVEX_REMIND_TOKENS`). It holds the readme's path, its top rules (the bold lead of each top paragraph) and its section headings, about 1,000 characters (`roles.js` `role_reminder()`). It is never the whole readme. It rides on the next prompt or main-thread tool call as SDK hook context (`UserPromptSubmit` / `PostToolUse` `additionalContext`), so it also reaches a long turn that no new message interrupts. Code: `Agent.sdk_hooks()`, `Agent.remind_hook()`.
3. **Off switches:** `SERVEX_ROLE_IN_SYSTEM=0` (role text back in the first message) and `SERVEX_ROLE_REMINDER=0`.

[Live proof](../sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/compact-before-sleep/role-system-proof.txt), Haiku: a codeword in the preset's `append` was still answered after a resume and after a `/compact` (25,885 → 1,334 tokens), and a hook reminder word arrived on the next prompt. Test: `node Servex/agents/role-system.test.mjs`.

## What makes it hard: the complicating factors

- **Before 2026-10-23 there was no system prompt.** A spawn that passed none got an empty custom prompt from the SDK (`"systemPrompt":[""]` in every Servex transcript). Servex agents ran without Claude Code's own prompt too. Moving to the preset changes every spawned agent at once: Claude Code's guidance on tools, git and safety, plus a few thousand cached tokens per agent.
- **The first message is not safe.** A role readme, a brief or a readme chain injected into the first message is summarized by `/compact`. The readme chain (`first_prompt(dir)`) and the brief still ride there. After a compaction the reminder points back to the role readme; the brief is the task folder's `requirements.md`, which the agent can re-read.
- **The system prompt is recorded once per session** (the SDK's `snapshot`, on by default). A session started before this change keeps its empty prompt until its next compaction. A role readme edited mid-session reaches the agent only at its next compaction, while the reminder is computed fresh from the file each time.
- **Weight fades even without compaction.** At 300k tokens, a system prompt is still there but far away. That is why the reminder also comes on token growth, not only after a compaction.
- **A reminder costs tokens, and too many would be noise.** So it is about 1,000 characters, at most once per 100k tokens, and once after each compaction.
- **Subagents and forks.** A subagent's own tool calls never carry the reminder (the hook skips any input with an `agent_id`). A fork answers one question and gets none.
- **Roles with their own prompt** (`spec.system`: the voice pair, the directory mastermind, others that pass a brief) keep theirs untouched; this applies only to plain role spawns.
- **VS Code tabs are not Servex agents.** After a compaction, their `SessionStart` hook (`.claude/hooks/session-page.mjs`) re-adds only the line naming the tab's own page. It does not re-add a role; a tab reads its role readme by hand (CLAUDE.md, "Read first").
- **What files keep.** Nothing in context outlives the session anyway; decisions belong in files ([context-loss.md](context-loss.md)).

## Sources

- The owner's worry, 2026-10-22: [Servex/agents/doc/owner-2026-10-16-compaction.md](/Servex/agents/doc/owner-2026-10-16-compaction.md), "What compaction keeps"
- What each role is given at start: [agent-context.md](agent-context.md)
