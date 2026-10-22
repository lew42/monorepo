# Audits: every system that checks what was asked against what was done

The owner asks for things in long prompts; many asks were never filed or never finished. Over September and October several systems were built to catch them. This page lists each one: what it is, where its output is, and whether it still runs. **Use the [prompt audit](prompt-audit.md) for new work;** the rest are kept for their history and their data.

## Runs today

| System | What it does | Output | Runs |
|---|---|---|---|
| **Prompt audit** (`Server/PromptAudit.mjs`) | Haiku sorts each owner prompt into tasks, questions, statements and updates; a Sonnet reviewer judges each one against what the session did. | `<session folder>/prompt-audit.jsonl`, `prompt-review.jsonl` | By hand, per session ([doc](prompt-audit.md)) |
| **Past work** (`Server/PastWork.mjs`) | Searches past tasks, docs, modules and commits for a topic, before anything is built. | `<task>/past-work.md`; the index [past-work-index.md](../past-work-index.md) | Automatic: Servex writes it at every spawn (`Agents.js`) |
| **Follow-up** (`Server/FollowUp.mjs`, after `StaleClose.mjs`) | Lists landed and stale tasks that fell through the cracks. | [follow-up.md](follow-up.md), [follow-up-full.md](follow-up-full.md), one owner note a day | Automatic: daily, Servex `TaskLoop` |
| **Undone asks** (`Server/UndoneAsks.mjs`, `UndoneVerify.mjs`) | Asks from the refine index with no finished task; Haiku verifies a sample. | `ai/asks/undone.json`, [undone-asks-2026-10-17.md](undone-asks-2026-10-17.md) | Automatic: daily, Servex `TaskLoop` |

## Built, run by hand or not at all now

| System | What it does | Output | State |
|---|---|---|---|
| **Refine queue** (`Server/RefineQueue.mjs`, `ext/Refine/RefinedCard.js`) | One Haiku call per past owner prompt → a refined card on the session's Coverage tab. Its prompt filter and brief v3 are what the prompt audit reuses. | session `page.jsonl` cards, `ext/Refine/queue/asks.jsonl`, `runs.jsonl` | By hand. Its filter lets machine prompts through (see [prompt-audit.md](prompt-audit.md), "Which prompts") |
| **AskIndex** (`Server/AskIndex.mjs`) | After a refine, files each ask as a record, a module topic, and a module inbox line. | `asks.jsonl` per session, module inboxes ([ext/Refine/doc/asks.md](/framework/ext/Refine/doc/asks.md)) | Called by the refine queue only |
| **UndoneToTasks / OrphanAsks** (`Server/UndoneToTasks.mjs`, `OrphanAsks.mjs`) | Turns verified-undone asks (and asks whose owner agent is gone) into idle tasks in their module homes. | `<module>/tasks/<slug>/` | By hand. Files tasks automatically, which the owner now does not want for audit results |
| **Asks ledger** (`ai/asks.jsonl`) | One line per routed owner ask: owner agent, card, status. | [asks.jsonl](../asks.jsonl) | Last line 2026-10-18; no longer written by routine |
| **Asks by module** | The owner's asks, merged per system, checked against code by Sonnet. | [asks.md](asks.md), [asks-by-module.md](asks-by-module.md), [asks-outcomes.md](asks-outcomes.md), `/framework/core/Page/doc/asks.md` | One-off, 2026-10-12 |
| **Refine (dictation)** (`Server/refine.mjs`) | One long dictation → a brief with a coverage table, so a relay drops nothing. | `coverage.md` beside a brief | By hand, for dictations over ~300 words |

## One-off audits (reports, not systems)

- **Loose ends, 2026-09-24:** every "awaits the owner" item decided ([report](/framework/ai/2026-09-24/loose-ends/report.md)).
- **Loose ends, 2026-09-29:** 138 tasks, unlanded system work ([report](/framework/ai/2026-09-29/servex-mastermind/audit/loose-ends/report.md)).
- **Task audit, 2026-10-08:** 1,303 tasks categorised, 244 loose ends with a fix each ([task](/framework/ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/)).
- **Past-work audits, 2026-10-15** ([voice-opus/past-work-audits](/framework/ai/sessions/2026/10/15/voice-opus/past-work-audits/)) and **loose ends, 2026-10-15** ([voice-20261015/loose-ends](/framework/ai/sessions/2026/10/15/voice-20261015/loose-ends/)).
- **Prompt audit pilot, 2026-10-21:** Haiku v3 vs Opus on 8 prompts, 99 of 99 items ([report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/prompt-audit/report.md)).
- **Task closeouts:** each landed task's `outcome` line, collected into [past-work-index.md](../past-work-index.md) by `PastWork.mjs --index`.

## Why so many

Each one solved half the problem: finding asks (refine), or filing them (AskIndex, UndoneToTasks), or noticing stale tasks (follow-up). None judged an ask against the evidence one session at a time, and those that filed tasks did it automatically, which made finished sessions look unfinished. The prompt audit does the judging and files nothing.
