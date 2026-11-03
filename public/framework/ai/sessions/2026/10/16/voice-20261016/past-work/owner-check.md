# Owner check: past-work discovery vs the owner's 15 topics

Read against the files, not the outcome text. Source: `owner-words.md`; deliverable: `public/framework/core/Page/doc/query.md`.

| # | item | verdict | evidence |
|---|---|---|---|
| 1 | /live cards must query real data, not hand-written prose | partly | Other tasks did it (`live-today` Today card renders from the day index, `live-feed`); past-work itself only touched this in the inventory. |
| 2 | Cards own a `content` list of id'd items, patched in place | missing | Not in query.md; no task in this voice root closes it. |
| 3 | Tool collapse: Servex as an Item, one engine for calls and deltas | missing | query.md section 6 mentions `call` only in passing. |
| 4 | Socket push on the LAN instead of polling | done | Commit 1586998e7 "socket: private-LAN peers get push traffic only". |
| 5 | /live layout: dead band, hide the back link behind a flag | partly | `past-work/layout-check/` exists; query.md does not cover it, and I did not verify the fix landed. |
| 6 | Past work keeps failing ("have we done this before?") | partly | Section 3 inventories every index and section 7 gives verdicts, but `PastWork notifications`/`PWA` returning nothing is not fixed: no topics are tagged, and the tags found only `ai`. |
| 7 | Path tags (hierarchical, anchored to the module touched) over aliases | partly | Pilot (section 5) shows file tags miss work; tags from words are proposed (decision 2). Nothing is built. |
| 8 | Name and home for every idea; reference pages group a concept | partly | The doc is homed at "page/query" as the owner said. The streaming reference page (/page/streaming) was not touched. |
| 9 | CLAUDE.md rule: settle name and home first | done | CLAUDE.md law 8, commit 010bebd07, line 17. |
| 10 | One source of truth; sessions are the source, in-memory query | partly | Finds `SessionIndex.mjs` is that query, and gives merge/retire verdicts (section 7). The stale snapshots are still there; decision 4 is open. |
| 11 | Session storage confusion (task.jsonl at both levels, stale URLs) | partly | Section 1 settles task vs session on 1,628 files and shows `parent_task` is stale in 103. Stale URLs/ai2/dashboard are marked "scrap later", not fixed. |
| 12 | Voice agent logs the owner's raw words over MCP | missing | Proposal only (section 6). `RemoteMCP.js` has no `raw` argument (grep finds none). |
| 13 | One pipeline for past and new prompts, tied to ext/refine | missing | Not built; waits on decision 1. Section 7 says to fold AskTally and Refine together. |
| 14 | Cost: Haiku pilot on one whole task.jsonl | done | Section 5: ran the pilot, 117,514 tokens, $1.04; the quality was good and the cost was not. Strip-first plan is sketched, not built. |
| 15 | Voice one-hour cutoff, switched to dictation | missing | An observation, not a build item. No file records it. |

Notes: the second block in the owner's words ("Found this session") is a description of the repo, not a request. The doc confirms its figures: SessionIndex is the in-memory query (section 3); the stale snapshots are listed; 1,628 task.jsonl files (the owner said 1,627, the doc counts 1,628 including one quick-fix); summaries and topics lines are almost absent (7 and 2, not zero).
