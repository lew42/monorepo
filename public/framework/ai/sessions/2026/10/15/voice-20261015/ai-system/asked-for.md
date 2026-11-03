# "Didn't I ask for X?": the shortest path to a summary

Ask: [ask-ea3d4c58](../ask-ea3d4c58.md), B4. Built 2026-10-15.

## Try it

```
node Server/Asked.mjs page jsonl format
node Server/Asked.mjs in-memory query server
```

It prints one screen in three parts:

- **When it was asked:** the dictated asks that match, with first and last date and the raw words; plus any routed ask from `ai/asks.jsonl`.
- **What was done:** the feature verdict (`done`, `partly`, `not done`) with its proof, and the landed tasks with their outcome and link.
- **Decided against, and why:** the `decision` lines of those tasks (question, what was chosen, over what, why).

Example, for `in-memory query server`: asked 2026-10-12 ("server-side socket query API") and again 2026-10-14 ("session query system that holds data in memory"); done: [Sessions: rows come from a node query](/framework/ai/sessions/2026/10/12/session-87bec773/server-query/), landed 2026-10-12.

## How it works

[`Server/Asked.mjs`](/Server/Asked.mjs) (`class Asked`, about 80 lines) joins four things that already existed and does no AI reading:

| Part | Source | Made by |
|---|---|---|
| when asked | `ai/doc/asks-outcomes.jsonl` (917 asks with date, raw words, outcome; 316 features with status) | `Server/AskTally.mjs`, Haiku, prompts since 2026-09-15 |
| routed asks | `ai/asks.jsonl` | the mastermind when it routes an ask |
| what was done | `PastWork.search` over every `task.jsonl` (via `SessionIndex.reduce`) | the tasks themselves |
| decided against | `decision` lines in those `task.jsonl` | agents, as they decide |

A topic matches when at least half of its keywords appear (the same stemming `PastWork` uses).

## What is left

- **Asks before 2026-09-15 are not covered** (AskTally starts there), and an ask worded differently can be missed. If it says "nothing found", try fewer or other words.
- **The decision section is only as good as the logging:** many tasks log no `decision` line with a reason, so "decided against" can be empty for work that did have a rejected alternative.
- **It lists, it does not judge.** "Done" is AskTally's verdict, a keyword match plus a Haiku spot check; the [asks tally](/framework/ai/doc/asks-outcomes.md) says where it was overruled.
- **No page yet.** The next step is a search box on the Sessions or Asks page that calls the same class through the dev socket (a `QueryServer` source named `asked`), so the answer is one click for the owner instead of a command. The voice agent can run the command today.
