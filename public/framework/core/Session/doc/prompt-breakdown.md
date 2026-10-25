# Prompt breakdown: one outcome task per prompt

What a prompt becomes, in one screen. Filing is `PromptRecords.file()` in `Server/PromptRecords.mjs` (the step after the parts); the live switch and the sweep are in [prompt-tasks.md](prompt-tasks.md).

## The principles

- **One prompt, one outcome task.** A prompt with two or more asks files ONE parent task (titled from the prompt's subject, `from: "owner"`, `idle`) and each ask is a subtask of it. A prompt with one ask files that ask as a plain root task, no wrapper.
- **Same work attaches.** Before a parent is made, one Haiku call (`attach_to`, no tools) sees the prompt and the session's open root tasks. If the prompt is clearly more of one of them, the asks become subtasks of that task and no new parent is made. No match, or a failed call, means a new parent.
- **Asks are never merged or lost.** Each ask stays its own subtask (past `file_cap` an ask stays an open part on the prompt's record). The owner's qualifiers ("a little", "only on the phone") stay in the ask's words.
- **A task is an outcome, not a principle.** A rule ("always", "never") files as `Write down: …`, a doc note, and sits under the same parent when the prompt has one. A question is answered, not filed.
- **Completion rolls up.** A parent cannot complete while a subtask is open, and its progress is the share of complete subtasks. `PromptRecords.task_state()` resolves a part's ref to a subtask the same way it resolves a root, so `Prompt.progress` counts a prompt's asks as before.
- **Applies to new prompts only.** Nothing already filed is regrouped.

## The measure

`node Server/prompt-group-dry.mjs` (writes nothing) counts, from a session's record, the prompt-sourced root tasks and what the rule leaves (one per prompt). Session e00f55c9, on 2026-10-25:

| prompts | root tasks before | root tasks after | prompts grouped (2+ asks) | single-ask prompts |
|---|---|---|---|---|
| 81 | 279 | 81 | 52 | 29 |

The 279 counts only tasks whose source names a prompt; the first measure (341 from 87 prompts) counted older-format sources too.

## What the tab sees

Not yet shown. `.claude/hooks/prompt-relay.mjs` runs when the prompt is submitted; the breakdown is filed afterwards by Servex, so the hook has nothing to print. A tab reads it with `node Server/PromptRecords.mjs <session> --tasks`, which lists a prompt's root tasks (the parent, not yet its subtasks). Showing "breakdown: N tasks under <parent>" needs the filing to finish first (a follow-up message from Servex to the tab, well over 30 lines), so it is a gap, not built.
