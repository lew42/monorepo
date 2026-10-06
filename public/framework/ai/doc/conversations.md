# Conversation & Session Log Map

Where current and historical conversations live across harnesses, websites, and sidebars.

## 1. Web Dictation Sessions (Fast & Smart Assistants)
- **Primary Location:** [`public/ai/v-<session-id>.jsonl`](/public/ai/)
  - Today's active session: [`public/ai/v-yxnts4l.jsonl`](/public/ai/v-yxnts4l.jsonl) (237 KB).
  - Contains every transcribed user dictation, fast assistant interim replies, smart assistant replies, and refined prompt JSON structures.
- **Transcripts on Servex Daemon:** `%LOCALAPPDATA%\lew42\servex\logs\agent-session-*.jsonl`
  - Granular raw tool execution and LLM responses for the session assistants.

## 2. VS Code Claude Sidebar Masterminds
Stored in `~/.claude/projects/c--Code-lew42-monorepo/<uuid>.jsonl`:
- **The Opus Mastermind:** `60d9def6-907a-4f71-adf9-110075b719eb.jsonl` (10 MB, modified 2026-10-05 14:21).
  - Coordinated the initial handoff and multi-agent directives before Claude usage reached 96%.
- **The Sonnet Mastermind:** `e3ade6ce-fbb5-4674-922c-566ef86fabb3.jsonl` (793 KB, modified 2026-10-05 17:22).
  - Executed emergency OpenRouter fallback policies and attempted to convert the Smart Assistant into a self-sustaining Mastermind.

## 3. OpenRouter Accounting Log
- **Location:** `%LOCALAPPDATA%\lew42\servex\logs\openrouter.jsonl`
- Records every non-Claude turn, model name, and exact USD cost.
