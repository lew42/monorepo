# Prompt audit: Haiku v3 on every prompt?

**Verdict: yes, with one caveat.** Brief v3 on Haiku kept every main task, question and decision the Opus benchmark found (99 of 99 items), at about half of v2's cost. The weak spot is the *type* (a task sometimes comes back as a question), not lost content.

## The 8 prompts (session `e00f55c9`, `<uuid>:<line>`)
Long: `:383` (9.9k chars), `:488` (13.3k), `:2208` (9.9k), `:3580` (7.7k). Short: `:297`, `:2256`, `:3285`, `:3919`.

## Coverage against the Opus benchmark (v3 brief on Opus = 99 items)
Computed by script (an Opus item is covered when a Haiku item shares 2+ content words, or 1 word plus a cited sentence; lenient on wording, as asked).

| Run | Items | Covered | Cost, 8 prompts | Per prompt |
|---|---|---|---|---|
| Opus, v3 (benchmark) | 99 | n/a | $0.19 | $0.024 |
| Haiku, v2 (today) | 217 | 98 / 99 (99%) | $1.02 | $0.128 |
| Haiku, v3 | 168 | 99 / 99 (100%) | $0.49 | $0.061 |

- **What Haiku drops:** one item in v2 (`:3919`, the "no Figma sections" task, merged into a side remark). Nothing in v3.
- **What Haiku invents:** v3 items matching no Opus item are few (6 of 168): narration kept as a statement ("it is frustrating when nobody knows"), and one question restating a statement. Harmless noise.
- **Granularity:** Haiku splits finer (47 items vs Opus's 19 on `:383`), so a person scans more lines; the asks are all there.
- **Type errors (the real gap):** `:3285` "look into where the Whisper module is" came back a question, not a task; `:297` returned two tasks where Opus had one task and one question. Not measured by script; read from the type counts.
- **Cost:** the real cost is $0.06 to $0.13 a prompt; the `--dry` estimate (~$0.006 each) leaves out the 2k-token system prompt and the SDK's fixed overhead. Not fixed here (review only).
- Spent: about $3.4 on model calls (the first full run was lost to a bad output path and rerun).

## Asked, never filed
Code matched each Opus task to the session's task folders by shared words (`RefinedCard.match`). It over-matches, so this is a floor. 18 of 33 tasks found no filed task. Each was added as a task of the session (`sessions-and-tasks/`), so the session is open until they are done. Two were already done and added complete with evidence:

- Done: spawn an Opus system architect (`:488`, s102-118) → [system-architect](system-architect/), commit `bb7d77c33`. Context-loss note (`:488`, s122-123) → [owner doc](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md).
- Open, with sentences: upgrade the task class hierarchy (`:383` s71-81) · no planning mode (s82-85) · record decisions with options (s86-89) · index every system in the readme (s92-100, `:488` s129-131) · `complete()` vs `completion` note (`:488` s26-32) · watch usage, cheap minions (`:488` s106-112) · overview of usage and plans (s134-135) · link Whisper page and logs (`:2208` s14-15) · simple Dictate chat UI (s34-35) · voice session manager (s44-47) · single assistant docs (s49) · explain class architectures (`:2256` s10-11) · where the Whisper module lives (`:3285` s2) · task detail view (`:3580` s46-48) · Figma skill: no sections (`:3919`).

## Why asks get lost
Not the pass: Haiku finds them. They are lost because nothing turns a refined ask into a filed task: cards sit on the Coverage tab, and agents that do the work close their own task, not the owner's sentence. The fix is a step after refine that files each "not filed" task (`match` is null) and ticks it on landing.

## Run it
`RefinedCard.BRIEF.v3`; `node Server/RefineQueue.mjs --brief v3 --days 7 --dry` (details in `ext/Refine/doc/refine-queue.md`).
