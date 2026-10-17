# Owner check: voice-20261016 against the owner's 26 items

Read against the files and git log, not the outcome text. Source: `owner-words.md`. Items 27+ ("Found this session") describe the repo and are not requests. Sibling checks: `past-work/owner-check.md`, `refine-build/owner-check.md`, `inbox-labels/owner-check.md`.

| # | item | verdict | evidence |
|---|---|---|---|
| 1 | /live cards query real data, not hand-written prose | partly | Today card reads the day index (056eb9fa6, 99cca128d) and live-feed landed; other cards were not audited one by one, and the "today-asks" card is not shown removed. |
| 2 | Cards own an id'd `content` list, patched in place | missing | No commit or doc builds it; `live-cards` only did subpaths, full width and code scroll (add327dae, fde3542e8). |
| 3 | Tool collapse: Servex as an Item, one engine | missing | Only the plan exists (`public/framework/ai/doc/tool-collapse.md`, c230032ae); the `call` tool is still separate. |
| 4 | Socket push on the LAN instead of polling | done | 1586998e7 "socket: private-LAN peers get push traffic only", with `dev/Socket/doc/lan.md`. |
| 5 | /live dead band removed; back link behind a flag | done | cc9b46175 removes the band; 8c2628fd0 makes `static LiveCard.back = true` restore the link. |
| 6 | Past work keeps failing ("have we done this before?") | partly | Round 4 inventories indexes and tags 588 recent sessions (`past-work/round4-result.md`); the 30-day history is untagged and `PastWork` misses are not shown fixed. |
| 7 | Path tags anchored to the module touched | partly | `Server/SessionIndex.mjs` derives module tags with parent matching and `AISessionDigest` writes procedural tags (bd39fad93); no written hierarchy rule. |
| 8 | Name and home for ideas; concept pages like /page/streaming | partly | The research is homed at `core/Page/doc/query.md` (page/query); the streaming reference page grouping sockets, JSONL and the poll was not made. |
| 9 | CLAUDE.md rule: settle name and home first | done | CLAUDE.md law 8, line 17 (010bebd07). |
| 10 | Single source of truth, nothing stale | partly | `SessionIndex.mjs` confirmed as the in-memory query, but the stale snapshots (past-work-index.md, session-index.json, task-manifest.json) are still in the repo. |
| 11 | Session storage confusion, stale URLs | partly | Settled in query.md section 1 (task.jsonl at both levels); stale ai2/dashboard URLs marked to scrap, not fixed. |
| 12 | Voice agent logs the owner's raw words over MCP | partly | An `append_prompt_event` tool exists in the Servex registry, but `owner-words.md` is still kept by hand; no proof every voice prompt lands. |
| 13 | One pipeline for past and new prompts, tied to ext/refine | missing | `AISessionDigest` and `Transcripts.mjs` handle past sessions only; nothing connects them to refine or live prompts. |
| 14 | Cost: Haiku under 100k, pilot one task.jsonl | done | Pilot ran (117k tokens, $1.04); round 4 measured 1 of 573 stripped sessions over 100k (`past-work/round4-result.md`). |
| 15 | Voice one-hour cutoff | missing | A platform limit; nothing in the repo records or works around it. |
| 16 | Raw SDK transcripts condensed by Node, exact usage | done | `Server/Transcripts.mjs` (584ec6003) and `AISessionDigest.mjs`; stripped text is 2% of raw bytes; usage reconciled over 590 sessions. |
| 17 | Condensed data in the session folders, no full copy | done | `essence.jsonl` beside each task's `task.jsonl` (f8d71d9fd) and `digest.json` per session (bd39fad93). |
| 18 | Newest first, never all history up front | done | Last 3 days, then 7 for essence; 30-day history deliberately left (`overnight.md`). |
| 19 | Tagging by cheap minion chunks; sub-tags within a system | partly | Procedural plus bounded Haiku tags on 588 sessions (317c8a057); no sub-tag scheme (whisper to refining). |
| 20 | Repeated asks escalate; de-duplicate chat bubbles | partly | Repeated-asks list built (round 4 section 3), no automatic flag; bubbles: 1 say = 1 bubble proven (`refine-build/dictate-proof.md`, c82cae958), not reproduced on main. |
| 21 | Follow-through; master list of 40+ audits | partly | Refine and Dictate inboxes still hold dozens of notes (57 per `overnight.md`); `ai/audits/` has no master list; the Cleaner and sentence slice landed. |
| 22 | Inbox: status updates must not wait on the owner | done | d5bb443bb (only `needs-you` waits), rule in two skills, 40 cards relabelled (584644a85), 133 to 12. UI revamp not done, and not the focus. |
| 23 | Data structures first, so we can see what happened | partly | `digest.json`, `essence.jsonl` and tags per session for recent work; older sessions still have no stored topic or summary line. |
| 24 | Consolidate about 80 MCP tools | missing | No consolidation commit; `remote-tools` added more tools, not fewer. |
| 25 | Short card titles; show on /live, not chat | partly | The Task audits card and the Overnight card are short; no rule or check enforces it elsewhere. |
| 26 | Standing orders: mastermind, autonomous, follow up, under pace | done | Refine build, inbox labels and past-work round 4 all landed (`overnight.md`); week 13% used against 16.5% gone. |
