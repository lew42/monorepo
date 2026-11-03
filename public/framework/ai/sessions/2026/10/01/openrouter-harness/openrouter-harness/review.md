verdict: fix
1. [fix] The spend guard must come before OpenRouter spawns (requirements 2.1): Agents.js:100–115 in diff.patch accepts them without a daily cap, and spike.mjs:571–574 merely reports a $0.25 cap after both turns. A costly or looping turn can consume the owner's credit before that check.
2. [fix] The dashboard cost is not reliably real (requirements 1.2 and 2.1): Agents.js:125–155 in diff.patch reads the shared key total immediately at turn end without waiting for billing or isolating concurrent agents. spike.jsonl:739 reports $0 for two successful DeepSeek turns; a final turn's late charge may never appear on its agent.
3. [fix] The cross-family comparison is missing (requirement 1.4): Server/review.mjs:666–669 in diff.patch adds only a comment; there is no recorded run on a recent task alongside a same-model review.
4. [fix] The phase-two evaluation is absent from this patch (requirements 2.2–2.5 and 2b): it contains no known-answer rule tests, effort-level cost table, model-by-task matrix, probe-result log, or brainstorm-and-rate naming run. The Read/Bash/Edit spike tests SDK compatibility, not whether agents follow this project's rules or build a working page.
5. [fix] A tier's provider is not actually the switch (requirement 1.2): tiers.js:190 in diff.patch exports `provider`, but the patch has no caller for it; Agents.js:35 chooses by model slash instead. Moving a tier's provider alone therefore does nothing; either pass it from role defaults or describe the slash rule as the sole switch.
6. [fix] The spike mislabels a failed resume as a pass (requirement 1.1): spike.mjs:719–729 prints `resume ok` from `!is_error` without checking the answer; spike.jsonl:743 has an empty Gemini Flash resume answer marked successful. Verify that the response names red and blue before counting it.
7. [note] An explicit `provider: "openrouter"` can be paired with a Claude model in Agents.js:35 of diff.patch, contrary to requirements.md:13 that Claude stay on the subscription. Refusing that combination is simpler than relying on every caller to remember the billing boundary.
8. [note] provider.js:321–330 in diff.patch exports `real_cost()` but Agents.js implements a separate key-difference calculation; use one cost path. The readme's claims at lines 426–431 also still describe the provider field as unread and real cost as attached to every reply, unlike the patch.

## Requirements
- 1.1 “Does the Claude Agent SDK work through OpenRouter today?” — yes for GPT and DeepSeek Read/Bash/Edit, streaming and resume (spike.jsonl:738–739); Gemini Pro fails and Gemini Flash's empty resume is not a pass (spike.jsonl:742–743).
- 1.2 “Wire the provider field per tier; dashboard shows real cost” — no — tiers.js:190 is unused and spike.jsonl:739 shows a successful session at $0.
- 1.3 “If it breaks, compare our own harness with Open Code” — yes — opencode.md:3–23 recommends the proxy first, Open Code second, a custom loop third.
- 1.4 “One cross-family reviewer on a real recent task, compared with same-model review” — no — Server/review.mjs:666–669 only documents the intended route.
- 2.1 “Spend guard first, ledger, daily cap, dashboard spend” — no — no guard, ledger or dashboard change appears in diff.patch; spike.mjs:699 only records `over_cap` after spending.
- 2.2 “About five known-answer rule-following tests on 3–5 models and effort levels” — no — provider.test.mjs:1–70 tests configuration, not agent rule-following.
- 2.3 “A cost table per model and effort level” — no — spike.jsonl:738–743 includes models but no effort levels and several unsettled zero-cost readings.
- 2.4 “A model + task matrix” — no — diff.patch has no task-kind scoring.
- 2.5 “One brainstorm-and-rate naming run, built on decide” — no — diff.patch has no naming run or decide integration.
- 2b “Probe tasks, checklist and three-way failure diagnosis in a results log” — no — diff.patch has only the fixed Read/Bash/Edit fixture, not a page probe or checklist.

## Words
- 1 — n/a
- 2 — n/a
- 3 — no — Servex/ext/openrouter/readme.md:18–19 in diff.patch has longer explanatory prose; this is a documentation review rather than a page, so the paragraph rule is a minor note.
- 4 — n/a
- 5 — yes — Servex/ext/openrouter/readme.md:413 names its topic.
- 6 — n/a
- 7 — no — readme.md:426–431 retains the old provider and cost terminology despite the changed code.
- 8 — n/a
- 9 — n/a
- 10 — yes — readme.md:423 leads with the key points before the commands.
- 11 — yes — readme.md:445–477 explains the two ways to use the provider in full sentences.
