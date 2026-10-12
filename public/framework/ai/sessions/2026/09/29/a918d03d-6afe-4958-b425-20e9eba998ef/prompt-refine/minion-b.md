# Minion B — an honest audit of how the VS Code tab relayed three dictations

Load the `minion` skill first, then `research` and `content`. Your task mastermind is `task-mastermind-prompt-refine`.

## Why (the owner's words, verbatim, from `owner-words.md` beside this file)

*"right now you know I'm dictating these long walls of text and then you the mastermind are summarizing them and passing them off to you know another mastermind and I'm not sure how detailed you're making the requirements … if you're summarizing it greatly, maybe that's part of the disconnect here is that you summarize what I say in a few words, but I've said a lot of words and then all the things, all the details that I've asked for don't get passed on."*

Ask 6 of `requirements.md`. **Do not soften it.** If the tab dropped things, say which, plainly. If it did well, say that too, with the evidence. You are the judge, not the defence.

## The three dictations (source: `C:\Code\lew42\monorepo\.claude\prompts\2026-09-28.jsonl`, 0-based line numbers, text at `.prompt.text`)

| # | owner's dictation | what the tab relayed |
|---|---|---|
| A | line 151 (13:22) + line 170 (13:29), the "organization mastermind" | `public/framework/ai/2026-09-28/organization/requirements.md` (and `owner-words.md` beside it: check whether the raw words were passed verbatim too), line 171 |
| B | line 219 (13:51), the "consensus" one | the relay at line 220, and the messages on card `2026/09/28/agent-work-on-every-page-sanity-checks-c` (its `page.jsonl` under `public/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/`), plus any requirements.md it led to — find it |
| C | line 61 (12:04), the harness / research one | line 62 (the spawn prompt) and `public/framework/ai/2026-09-28/harness-research/requirements.md` |

Verify these line numbers yourself first; if one is wrong, find the right one and say so.

## Deliverables

1. **Your own reading first (no tool).** For each dictation, list every distinct thing the owner asked for or said matters, in their words, numbered (an "ask ledger"). Then for each item: is it in the tab's relay? `kept` / `kept, but changed` (quote both: what was said, what was written) / `made stricter` (a suggestion became a rule, or a word the owner didn't use) / `dropped`. Also note what the tab **added** that the owner never said. Note whether the raw words travelled with the brief (a verbatim `owner-words.md`), since that changes how bad a drop is.
2. **Then run the tool on the same three**, once minion A's `Server/refine.mjs` is in the worktree (your mastermind will message you; until then do step 1). Command: `node Server/refine.mjs 2026-09-28:<line> --out public/framework/ai/2026-09-29/prompt-refine/runs/<a|b|c>/` from the worktree root. Use `--collab` on exactly ONE of the three (dictation B) so we see what the multi-model vote adds; the other two run plain. Score the tool's brief against your ask ledger the same way you scored the tab.
3. **`public/framework/ai/2026-09-29/prompt-refine/audit.md`** — the report:
   - top: one table, one row per dictation: asks in the ledger | tab kept | tab changed | tab stricter | tab dropped | tool kept | tool dropped | raw words passed along?
   - then per dictation, the dropped and changed items as a table: owner's words | the tab's words | why it matters (one line).
   - then: what the tool's coverage.md caught that you also caught, and what it missed (the tool is being tested too).
   - then three plain sentences: the verdict on the tab, the verdict on the tool, the one change that would help most.
   Short paragraphs, tables first. Newcomer-readable.
4. Save your ask ledgers as `runs/<a|b|c>/ledger.md` so the card can show them.

## Where you work

Worktree `C:\Code\lew42\worktrees\prompt-refine`. **Fence:** `public/framework/ai/2026-09-29/prompt-refine/audit.md` and `public/framework/ai/2026-09-29/prompt-refine/runs/a/`, `runs/b/`, `runs/c/`. Read anything; write nothing else. Commit in the worktree; don't merge.

## Budget and model

You are Opus (you judge). Tool runs: about $1 each plain, about $2 with `--collab`. Total about **$5** including your own reading. Log to `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\prompt-refine\task.jsonl` with `node .claude/hooks/append.mjs` (`{"log":{"at":"NOW","msg":"minion-b: …"}}`). When done, end your turn with the top table and the commit hash.
