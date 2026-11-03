# Owner check: night's 26 items vs the repo

Read against files and git log, not the outcome text. The refine-build task itself covers only items 20 and 21 in part; the rest are judged repo-wide, across the sibling tasks of the same night. Source: `owner-words.md`.

| # | item | verdict | evidence |
|---|---|---|---|
| 1 | /live cards query real data, not prose | partly | `live-feed` and `live-today` landed (feed of preview cards, Today from the day index); not audited card by card. |
| 2 | Cards own an id'd `content` list, patched in place | missing | No task or doc in the voice root builds it; `past-work/owner-check.md` also says missing. |
| 3 | Tool collapse: Servex as an Item | missing | Only the plan exists (`public/framework/ai/doc/architecture.md`); the tool list still holds ~80 tools. |
| 4 | Socket push on LAN instead of polling | done | Commit 1586998e7 "socket: private-LAN peers get push traffic only". |
| 5 | /live dead band and back link behind a flag | done | Commits cc9b46175 (band removed) and 8c2628fd0 (`static LiveCard.back = true` restores it). |
| 6 | Past work keeps failing | partly | Round 4 (`past-work/round4-result.md`) inventories indexes and tags 588 sessions; the 30-day history is untagged. |
| 7 | Path tags anchored to the module touched | partly | Module tags are derived in `Server/SessionIndex.mjs`; `AISessionDigest` writes procedural tags (bd39fad93); no hierarchy-implied tag rule documented. |
| 8 | Name and home for ideas; concept reference pages | partly | `core/Page/doc/query.md` is homed at page/query; the streaming reference page was not touched. |
| 9 | CLAUDE.md rule: name and home first | done | CLAUDE.md law 8, line 17. |
| 10 | Single source of truth, sessions are the source | partly | `SessionIndex.mjs` confirmed as the live in-memory query; the stale snapshots are still in the repo. |
| 11 | Session storage confusion and stale URLs | partly | Settled in query.md section 1; stale ai2/dashboard URLs marked for scrapping, not fixed. |
| 12 | Voice agent logs raw owner words over MCP | partly | An `append_prompt_event` tool exists (`Servex/agents/assistant.md`), but it serves the assistant agent; no evidence the voice app logs raw words with it. |
| 13 | Same pipeline for past and new prompts, tied to refine | missing | `AISessionDigest` handles past sessions only; nothing connects it to ext/refine or live prompts. |
| 14 | Cost: Haiku pilot on one task.jsonl | done | Pilot ran ($1.04, 117k tokens); strip-first measured: 1 of 573 sessions over 100k (round4-result.md). |
| 15 | Voice one-hour cutoff | missing | An observation; no file records it or a workaround. |
| 16 | Raw SDK transcripts condensed by Node, no AI | done | `Transcripts.mjs` (584ec6003) and `AISessionDigest`; stripped text is 2% of raw bytes. |
| 17 | Condensed data in the session folders | done | `essence.jsonl` sits in each task folder (f8d71d9fd, "last 7 days"); the full transcript is not copied. |
| 18 | Newest first, last days before longer spans | done | Run on the last 3 days then 7; the 30-day history is deliberately left (overnight.md). |
| 19 | Tagging via cheap minion, sub-tags within a system | partly | Procedural plus bounded Haiku tags on 588 sessions (317c8a057); no sub-tags such as whisper -> refining. |
| 20 | Repeated asks escalate; de-duplicate chat bubbles | partly | Repeated-asks list found ~40 duplicate-bubble asks in round 4; no automatic escalation built. Bubbles: not reproduced on main (`dictate-proof.md`, 1 say = 1 bubble), fixed 10-09 (b87834ba2). |
| 21 | Follow-through, master list of 40+ audits | partly | Refine/Dictate inboxes still hold 51 + 24 lines (9 resolved by appended notes); `ai/audits/` has no master list. Cleaner and sentence slice (c82cae958) did land. |
| 22 | Inbox: stop status updates waiting on the owner | done | d5bb443bb: only `needs-you` owner_notes wait; 133 -> 12 (7d9e342d6); rule in two skills. The Inbox UI revamp is not done, and the owner said it was not the focus. |
| 23 | Data structures first, find out what happened | partly | `digest.json`, `essence.jsonl` and tags added per session; sessions still lack a stored topic line for older work. |
| 24 | Consolidate ~80 MCP tools | missing | No consolidation commit; the tool list is unchanged. |
| 25 | Short card titles | partly | The Task audits card has a short title; no rule or check enforces it elsewhere. |
| 26 | Standing orders: mastermind, follow up, stay under pace | done | Three tasks routed and landed (`overnight.md`); week 13% used against 16.5% gone. |
