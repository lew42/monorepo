# Task migration: dry run, 2026-10-17 04:29 UTC

Root: `C:\Code\lew42\monorepo\public`. Script: [Server/TaskMigrate.mjs](/Server/TaskMigrate.mjs). Plan: [plan.md](plan.md).

**211 old tasks would get a module home** (0 already have one); 1452 stay in their session folder, each for the reason below. Nothing is deleted; each moved old file gains one line.

## Before and after

| | before | after |
|---|---|---|
| old tasks (ai/sessions task.jsonl) | 1663 | 1663 |
| old task lines | 42620 | 42831 (+1 `home` line per move) |
| module task folders (`<module>/tasks/<slug>/`) | 5 | 216 |
| homes in /tasks/ index | 5 | 74 |

## What happens to each old task

| action | tasks |
|---|---|
| stay: unclear: no signal | 576 |
| stay: unclear: one signal | 466 |
| stay: unclear: catch-all only | 304 |
| move | 211 |
| stay: active in the last 7 days | 61 |
| stay: unclear: signals disagree | 43 |
| stay: has subtask lines | 2 |

## Moves by module

| module | tasks | how the module was found |
|---|---|---|
| [ux/Dictate](/framework/ux/Dictate/) | 21 | brief 11, prefix 6, files+reqpath 3, files only, one module 1 |
| [styles](/framework/styles/) | 16 | files only, one module 11, files+reqpath 4, prefix 1 |
| [servex](/framework/servex/) | 16 | prefix 16 |
| [ai2](/framework/ai2/) | 13 | files+reqpath 11, files only, one module 2 |
| [core/Page](/framework/core/Page/) | 12 | prefix 5, files only, one module 4, files+reqpath 3 |
| [ai/v/3](/framework/ai/v/3/) | 12 | files+reqpath 11, files only, one module 1 |
| [ext/Panel](/framework/ext/Panel/) | 10 | files+reqpath 10 |
| [ext/AITask](/framework/ext/AITask/) | 8 | files+reqpath 6, files only, one module 2 |
| [dev/DevBar](/framework/dev/DevBar/) | 6 | files+reqpath 5, files only, one module 1 |
