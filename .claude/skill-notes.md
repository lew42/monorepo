# Skill notes

How skills behave, and how we mean to use them. (The owner, 2026-08-17.)

## What actually happens

- A skill's **description** is in every session's context. Its **SKILL.md** enters only when invoked — and enters *again* on every invocation. Re-invoking is how directions get refreshed as the window grows.
- Files beside SKILL.md (`css.md`) enter only if the AI chooses to read them.
- Skill calls are in the Claude Code transcript, not the ai task logs. A `PostToolUse` hook on `Skill` can log them — and can do more (log a new file, link it from the task).

## Two kinds of skill

1. **Reference** — load once, or when stale. A larger set of dos and don'ts, with `caveats.md`/`strategy.md` beside it read only when they apply. `code`, `css`, `layout`, `fork-claude-session`, `mastermind`.
2. **Trigger** — invoke *every time* the thing happens. Small: a minimal reminder set with its caveats. Hookable — every skill call is logged to the task by `ledger.mjs`. `new-task`, `new-page`, `new-css-class`, `documentation`, `finish-task`, `skill-improvement`.

Every skill has an `improvements.md` any agent may append to; skills remind each other they exist (that raises invocation). The lifecycle a task follows: `code` §"The lifecycle".

The description says which kind it is and when: *"load once before writing code"* vs *"run every time you create a page"* — and for trigger skills, says it religiously.

## The concern

We don't want a massive `code` skill re-injected on every edit — that is the context bloat skills exist to avoid. Keep reference skills load-once and short; put the every-time reminders in trigger skills.

## It is context management

Always loaded: `CLAUDE.md`, skill descriptions. Loaded once: reference skills. Re-injected each time: trigger skills. Read on demand: `readme.md`, `doc/*.md`.
