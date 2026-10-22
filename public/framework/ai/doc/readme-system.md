# What every agent reads, the roles, and a readme audit (proposal, 2026-10-22)

The owner's ask: rules get lost because nobody is sure which files each agent reads. Measured below; the moves are proposals until the owner says go (CLAUDE.md is "ask first").

## What is read today, and when

| File | Lines | Words | Read by |
|---|---|---|---|
| `CLAUDE.md` | 124 | 3,764 | every Claude Code agent, automatically (the SDK loads it), except the lean assistants (`setting_sources: []`) |
| [framework readme](../../readme.md) | 71 | 826 | the module index; only by masterminds that follow CLAUDE.md's "read it", and by the readme chain |
| [ai readme](../readme.md) | 87 | 1,488 | the readme chain, first 40 lines only (a records table) |

**The readme chain** (`Servex/agents/readme-chain.js`): a fresh Servex spawn gets the readme of every folder from the repo root down to its task dir, each cut to its first 40 lines or its `## More` heading, about 3,000 tokens in all. A VS Code tab gets none of it: only CLAUDE.md.

**Lines undercount:** a paragraph is one line, so a "124-line" CLAUDE.md is about 5,000 tokens. Words are the honest measure; aim for a readme under about 800 words.

## The roles (`Servex/agents/roles.js`), last 7 days

| Role | Model | Job | Sessions | Spend |
|---|---|---|---|---|
| mastermind | Opus | decides, splits work, spawns, reviews | 55 | $352 |
| helper | Sonnet | a mastermind's builder for one part | 79 | $199 |
| minion | Haiku/Sonnet | one narrow job: a scan, a fix | 96 | $53 |
| task-mastermind | Sonnet | runs one task and its minions | 13 | $44 |
| reviewer | Sonnet | reviews a change before merge | 68 | $43 |
| clarity | Sonnet | checks a landed task's words are clear | 161 | $28 |
| session-smart, voice-assistant, assistant | Sonnet/Haiku | voice: the smart and fast assistants | 99 | $13 |
| fixer | Sonnet | the quick-fix pool | 15 | $3 |
| VS Code tabs | Fable/Opus | the owner's own sessions | 2 | $810 |

Each role names a skill in `roles.js`. The owner prefers a readme to a skill: the role is one switch, and the agent reads the readme for its role.

## Proposal

1. **One role readme each**, `Servex/agents/roles/<role>.md` (the skill text moves there; the skill becomes a one-line pointer), under 400 words, linked from one index.
2. **The framework readme is mandatory reading.** Framework rules (code style, classes, pages, traps) move from CLAUDE.md into `public/framework/readme.md` or the doc it links; CLAUDE.md keeps the laws, safety and "read the framework readme, then your role's readme". Target: CLAUDE.md under 1,500 words.
3. **The top of every readme is its index.** The chain shows only the first 40 lines, so the index (every major part, one line, a link) goes first and tables of records go below `## More`.
4. **`ai/priority.md`** is read by every mastermind before it spawns (done 2026-10-22).

## A readme audit, on the prompt-audit pattern

- **Pass 1, Haiku, one call per readme** (with the names of its folder's files and child folders, never the code): what it names, what exists but is not named, stale lines, words over budget, the index-first shape. One line per readme in `ai/readme-audit.jsonl`, `{readme_audit: {v, path, sha, words, missing: [], stale: [], over_budget, shape}}`, append-only, the latest line per path wins.
- **Pass 2, Sonnet, one per top-level system** (Servex, Server, core, ext, ux, ai): reads the pass-1 lines and checks the code where a finding needs it; proposes fixes as `{readme_fix: {path, line, change, why}}`. Fixes are applied in a separate step, after review.
- **Cost:** about 400 readmes at about $0.02 each, about $8 for pass 1, plus about $3 for pass 2. A rerun skips a readme whose `sha` has not changed.
- **Code:** `Server/ReadmeAudit.mjs`, built on `PromptAudit`'s queue and Haiku call.
