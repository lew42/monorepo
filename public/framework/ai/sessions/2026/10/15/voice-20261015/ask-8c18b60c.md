# Ask 8c18b60c — system map, sessions data, past-work, loose ends, dictation page

Voice question 8c18b60c, 2026-10-15, as relayed by the voice agent (word for word). The owner does NOT want AI judgment calls; he wants factual data structures and a clear picture.

> A. Spawn a system-architect minion (Opus, large context). Read CLAUDE.md, the top-down README chain starting at framework/ai, every skill, and the AI subsystems. Produce a factual map: what systems exist, who spawns what, what triggers what, which skills are actually invoked and how often, which are clearly working, which are stale or unverifiable. Flag documentation that can't be verified against the code so it can be pruned. No recommendations yet, just what is.
>
> B. Verify the sessions data system: is framework/ai/sessions unified on the filesystem; what does the session.jsonl append-log actually contain (fields); how are SDK sessions logging and creating tasks; is the node-driven task system he asked for many times real and actually used; was a sessions index built so the page doesn't load thousands of files.
>
> C. Past-work architecture: he wants per-directory logs rather than global keyword search; tag every session and task with topics and classes by reprocessing the raw prompts (we have all session IDs and exact prompts), so any module page or AI tab can show related sessions. Recall the earlier idea of a per-directory ai/ folder where agents log path-scoped data. Not building yet; map what exists versus what's missing.
>
> D. Loose ends: when a minion reports "partially done, need X from owner", where does that land and why does he never see it. Factual answer, not an audit.
>
> E. Note: web voice dictation page is broken; he wants to work on it as part of the prompt refinement and chat system.
>
> Spawn A as Opus, B and D as Haiku, C as Sonnet or hold. Confirm what you spawned.

## Where each item went

- A → [system-map/](system-map/) (Opus minion)
- B → [sessions-data/](sessions-data/) (Haiku minion)
- C → [past-work-map/](past-work-map/) (Sonnet minion)
- D → [loose-ends/](loose-ends/) (Haiku minion)
- E → `ux/Dictate` module inbox
