# inbox-labels: owner-words check, item by item

The inbox-labels task itself covers item 22 only. Other items are judged on what the repo shows from sibling tasks (live-*, past-work, refine-build); I read task folders, requirements and the round 4 result, not every line of code.

| # | item | verdict | evidence |
|---|---|---|---|
| 1 | /live cards must query real data, not hand-written prose | partly | `live-today/` task asked for a live Today card; its last log line is only "session resumed", no landing seen |
| 2 | Cards own a `content` list of id'd items, patched in place | partly | `live-cards/` covers subpaths and full-width cards, not the content-list recursion; that task was stopped on purpose |
| 3 | Tool collapse: Item.set as the one call engine | missing | no landed work; `call` is still a separate tool in the registry |
| 4 | Socket push on LAN, not polling | done | commit 1586998e7 "socket: private-LAN peers get push traffic only" |
| 5 | /live dead band above an open card; hide the back link behind a flag | partly | `live-today/layout-check` exists and the dead band is noted closed in commit 42c0369a2; the flagged back link is not confirmed |
| 6 | Past-work lookup keeps failing (notifications, PWA found nothing) | partly | `past-work/` round 3 and 4 built a digest and a repeated-asks list; PastWork.mjs misses are not shown fixed |
| 7 | Path tags (module-anchored, hierarchical) instead of aliases | partly | `Server/SessionIndex.mjs` derives module tags from files touched with parent matching; no tag line is written into sessions |
| 8 | Name and home ideas; reference pages like page/streaming | missing | no concept pages grouping streaming, sockets and the poll were found |
| 9 | CLAUDE.md rule: settle name and home up front | done | CLAUDE.md law 8 "Name it and home it first" (2026-10-16) |
| 10 | Sessions as the one source; in-memory query, no stale indexes | partly | SessionIndex is the in-memory query; the stale snapshots (past-work-index.md, session-index.json and others) still sit in the repo |
| 11 | Session storage confusion and stale URLs | missing | nothing found that fixes or documents the old ai2/dashboard URL patterns |
| 12 | Voice agent logs the owner's raw words over MCP | partly | `append_prompt_event` tool exists; `owner-words.md` is kept by hand; whether every voice prompt lands is not shown |
| 13 | One pipeline for past and new prompts, tied to refine | partly | `AISessionDigest` and `Transcripts.mjs` handle past sessions; no real-time path or link to ext/refine yet |
| 14 | Cost: Haiku under 100k, pilot a whole task.jsonl | done | `past-work/pilot` and `pilot2`; round 4 chunked Haiku reads at about 114k total for $0.16 |
| 15 | Voice one-hour cutoff | missing | a platform limit; nothing in the repo addresses it |
| 16 | Condense raw SDK transcripts with Node, no AI, exact usage | done | `Server/Transcripts.mjs` (584ec6003), `AISessionDigest.mjs`; 573 sessions measured, usage reconciled |
| 17 | Put condensed data in the session folders, no duplicate transcript | done | `essence.jsonl` now sits in each task folder (f8d71d9fd) |
| 18 | Newest first, last days, never all history | done | essence.jsonl covers the last 7 days only (f8d71d9fd); round 4 used 3 days, repeated asks over 30 days |
| 19 | Tagging with cheap minion chunks and sub-tags | partly | Haiku chunk topic extraction ran in round 4; no sub-tag scheme or written tags |
| 20 | Repeated asks escalate to top priority | partly | `past-work/round4-result.md` section 3 lists asks by count (18 topics); no automatic flag, and several open ones are still unactioned |
| 21 | Follow-through: inbox notes unread, 40+ audit folders with no master list | partly | `refine-build/` works the Refine and Dictate inboxes; no master list of audit folders found |
| 22 | Inbox: status updates mislabelled as waiting on owner | done | `WaitingOnYou.js` counts only `needs-you`; two skills, tool text fixed (d5bb443bb); 40 cards relabelled by appended lines (584644a85); 133 -> 12 |
| 23 | Basic data structures to see what happened (summary or topics per session) | partly | `essence.jsonl` per task folder adds a condensed record; still no summary or topics line per task |
| 24 | Consolidate about 80 MCP tools | missing | the tool list is still about 80 or more; remote-tools only added six |
| 25 | Short card titles; show on /live, not chat | partly | applied in newer cards and the live-feed brief; no enforced rule found |
| 26 | Standing orders: mastermind, autonomous, follow up, stay under pace | done | overnight tasks routed (42c0369a2) and landed; the Round 4 cost reconcile shows pace was tracked |
