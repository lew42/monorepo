# Dictation to brief, with nothing lost: requirements

The owner's words are in `owner-words.md`; read them in full. Their worry: long, informal dictation (fillers, rambling) may lower the model's quality, and the summaries made from it (by the VS Code tab too) may drop details or change their meaning, so what reaches a mastermind isn't what was asked.

## Asks (tick each against the owner's sentence)

1. **The raw Whisper text is always kept,** word for word, and can be viewed. It already exists in the dictation playground's Raw tab; check that, and check that `.claude/prompts/*.jsonl` keeps typed prompts.
2. **A refinement ladder, each step saved and diffable against the one before:**
   raw → **clean** (near-verbatim: fillers removed, typos and punctuation fixed, meaning unchanged) → **structured** (the owner's ideas as an outline in the owner's own words and names) → **brief** (numbered asks for a mastermind).
3. **Auditability, the core of the task:** a COVERAGE table from brief to source. Every sentence of the clean text maps to an ask, or is marked "context only" or "dropped, because…". Every ask cites the source sentence(s) it came from. An ask that adds words the owner didn't say, or turns a suggestion into a rule, gets flagged. The owner can open "what did I actually say?" beside any ask.
4. **Multi-model refinement:** 2–3 models (cheap first) each draft the structured version. They pick the best names, wording and structure through collab.mjs rounds with votes and caveats (Server/collab.mjs, landed). The scoreboard says which model refines best.
5. **A tool, not a habit:** `node Server/refine.mjs <raw.txt | prompt id>` writes `clean.md`, `structured.md`, `brief.md` and `coverage.md` beside the task. Every future brief is made with it: the VS Code tab, masterminds and the fast assistant alike. Put it in the new-task and sub-mastermind skills.
6. **Prove it on real prompts:** run it on 3 of the owner's long dictations from 09-28 (in `.claude/prompts/2026-09-28.jsonl`, e.g. the "organization mastermind" one and the "consensus" one) and compare against the briefs the VS Code tab actually wrote (`ai/2026-09-28/organization/requirements.md` and the agent-work card's messages). What did the tab drop, or change? Report it honestly, as a table.
7. **Show it on a card:** raw | clean | structured | brief, with the coverage table, and the dropped items highlighted.

## Rules
Reuse Server/ask-each.mjs (one question at a time) and collab.mjs, and don't write a third engine. Use a pool worktree and the smoke test. Budget about $10, with at most 3 minions. Post progress on card 2026/09/29/from-dictation-to-a-brief-with-nothing-l.
