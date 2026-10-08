# Post-analysis — where the money went, and what could have been optimized

Generated 2026-10-08T03:50:26.884Z. Source: `spend-tree.json` (regenerate it first: `node Server/spend-tree.mjs`), cross-checked against every `task.jsonl`.

Total Claude $, all agents ever registered: **$9730.54**

## By day (top 10)
- 2026-09-30: $2802.26
- 2026-09-29: $1927.39
- 2026-10-03: $1217.66
- 2026-10-01: $1178.26
- 2026-09-28: $736.11
- 2026-10-02: $571.14
- 2026-09-24: $545.14
- 2026-09-25: $459.57
- 2026-10-04: $273.87
- unknown: $16.61

## By model
- claude-opus-5-5: $4569.23
- claude-sonnet-5: $4142.13
- claude-fable-5-1: $436.61
- opus: $210.52
- unknown: $206.43
- sonnet: $145.8
- google/gemini-3.8-flash: $20.46
- claude-haiku-4-5-20251001: $15.62
- nvidia/nemotron-3-ultra-550b-a55b:free: $3.2
- claude-opus-4-7: $2.37
- fable: $1.84
- deepseek/deepseek-v4.1-flash: $0.58
- openai/gpt-6-luna: $0.54
- deepseek/deepseek-v4-pro: $0.3
- openai/gpt-oss-120b: $0

## By role
- task-mastermind: $4429
- minion: $2969
- mastermind: $1406.04
- reviewer: $424.5
- clarity: $359.99
- card-manager: $45.25
- session-smart: $25.45
- assistant: $17.57
- unknown: $16.61
- card-assistant: $16.27
- echo: $15.75
- master-assistant: $10.16
- agent: $6.13
- helper: $5.96
- checker: $2.75
- voter: $1.58
- directory-mastermind: $0.95
- expert-ask: $0.91
- expert: $0.83
- session-fast: $0.69
- fixer: $0.24

## Opus/Fable spent on minion-tier work: $499.07 across 82 minions
Policy is Sonnet-by-default for minions; every one of these is a minion that ran on Opus/Fable instead, no stated reason recorded on the agent itself:
- minion-chat-reactions (claude-opus-5-5): $51.01
- minion-dictation-stream (claude-opus-5-5): $46.29
- minion-rail (claude-opus-5-5): $22.16
- minion-nested-view (claude-opus-5-5): $17.06
- minion-layout-unify (claude-opus-5-5): $16.8
- minion-layout-docs (claude-opus-5-5): $16.8
- minion-drawer-tabs (claude-opus-5-5): $16.15
- minion-now-chat-side (claude-opus-5-5): $14.84
- minion-sheet-as-page (claude-opus-5-5): $14.73
- minion-layout-system (claude-opus-5-5): $12.46

## "Long window" candidates: $2265.92 across 62 agents
Over 70% of their own $ was cache-read (re-reading old context) AND over $15 real money behind it — the session-freshness finding's own signature, now applied as a filter:
- mastermind-servex (mastermind): 74.6932% cache-read, $175.48
- mastermind-servex-8 (mastermind): 70.4467% cache-read, $86.22
- task-mastermind-panel2-sessions (task-mastermind): 74.5651% cache-read, $70.93
- task-mastermind-assistant-layers (task-mastermind): 74.2296% cache-read, $66.36
- task-mastermind-ai2-dashboard (task-mastermind): 77.1971% cache-read, $57.89
- task-mastermind-mobile-nav (task-mastermind): 79.3261% cache-read, $57.67
- task-mastermind-file-system (task-mastermind): 78.1186% cache-read, $54.37
- task-mastermind-source-library (task-mastermind): 85.4556% cache-read, $53.83
- task-mastermind-voice-sessions (task-mastermind): 70.1882% cache-read, $52.55
- task-mastermind-voice-sessions-2 (task-mastermind): 70.1882% cache-read, $52.55

## Stopped-in-flight waste: $1675.37 subtree $ across 14 roots whose task never landed
A task-mastermind/mastermind that spent real money (own $ > $5) whose own task.jsonl never got a `landed_at` line — checked against the real file, not guessed (a task genuinely still open today will show here too; read the task dir before assuming it was abandoned):
- task-mastermind-openrouter: own $500.85, subtree $619.34 — public/framework/ai/2026-09-30/openrouter-harness
- task-mastermind-one-dictation: own $385.66, subtree $609.03 — public/framework/ai/2026-10-02/drawer-close
- mastermind-servex-10: own $113.62, subtree $200.18 — public/framework/ai/2026-10-02/servex-mastermind
- task-mastermind-waiting-on-you: own $21.48, subtree $47.98 — public/framework/ai/2026-09-28/waiting-on-you
- task-mastermind-asks-ledger: own $22.8, subtree $43.29 — public/framework/ai/2026-09-30/asks-ledger
- task-mastermind-push-to-talk: own $16.18, subtree $38.21 — public/framework/ai/2026-10-03/push-to-talk
- task-mastermind-page-tools: own $27.86, subtree $28.66 — public/framework/ai/2026-10-02/page-tools
- task-mastermind-framework-home-grids: own $25.24, subtree $25.7 — public/framework/ai/2026-10-03/framework-home-grids
- minion-clean-dictate-mode: own $13.56, subtree $13.56 — public/framework/ai/2026-10-01/clean-dictate-mode
- minion-chat-autoscroll: own $11.89, subtree $11.89 — public/framework/ai/2026-10-01/chat-autoscroll
