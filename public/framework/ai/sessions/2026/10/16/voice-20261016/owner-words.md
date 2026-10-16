# Owner's words, voice session 2026-10-16 (Claude app, voice + text)

This session ran in the Claude app (cloud), not Claude Code, so Servex never saw the owner's raw prompts. The mastermind's task.jsonl only holds what the voice agent relayed ("owner (voice)" chat lines). This file is the voice agent's record of what the owner actually asked, written from its own context (the app transcript is not reachable from Servex). Close paraphrase, owner's terms kept.

## Topics, in order

1. **/live cards are hand-written prose.** Rejected the "today-asks" card. Cards must query real data (session folders, task.jsonl), never restate it.
2. **Card edits clobber.** A card's body is one text blob. Wants recursion: every card owns a `content` list of id'd items, patched in place ("massage, not clobber"). Agreed top build candidate.
3. **Tool collapse.** Generic `call` tool is a second system; Item.set already is a universal call. If Servex were an Item, tool calls and page deltas share one engine.
4. **Socket vs poll.** Phone was polling. Root cause: Socket.js only enabled on localhost. Fixed in 1586998e7 (LAN push).
5. **/live layout.** Dead band above an opened card; remove the "← Live" back link behind a flag. Helper sent, not yet reported.
6. **Past work keeps failing.** Owner asked "have we done this before?" 5+ times this session: notifications/PWA, live-feed mechanics, page previews/library, Mention references, dictate/refine/chat cluster. Each already existed. `PastWork.mjs notifications` and `PWA` returned nothing.
7. **Aliases vs tags.** Per-module jargon lists don't help a cross-module search. Prefers **path tags**: anchor work to the concrete module it touched (core/Page, ext/refine), hierarchical, parent implied by directory, tag only when a thing lives away from what it references (sessions live in ai/sessions but touch the whole site).
8. **Naming and location are the root problem.** Ideas were never given names or a home, so they can't be found. Generic things (query) can anchor on Page for now: "page/query". Reference pages like /page/streaming should group everything about one concept (JSONL streaming, sockets, the poll).
9. **Wants CLAUDE.md rule:** settle a location and name for each module/task up front ("what does this pertain to, where does it live").
10. **Single source of truth, nothing stale.** Indexes built once go stale. Sessions themselves should be the source; an in-memory query loads them and filters in JS.
11. **Session storage confusion.** Thought it was sessions.jsonl; it is task.jsonl at both levels. Old ai2/dashboard locations and URL patterns were consolidated once, leaving stale URLs.
12. **Raw prompts.** Claude Code / VS Code sessions should keep the owner's prompts in the SDK transcript. App voice sessions (like this one) don't: need a way for the voice agent to log the owner's raw words over MCP.
13. **Same pipeline for past and new.** Retroactive audit of old sessions and real-time processing of new prompts should be one system (extract topics, tags, location), related to the prompt-refinement system (ext/refine, dictate, chat).
14. **Cost.** Haiku minions under 100k context are very cheap; over 100k cost jumps ~5x. Process session by session. Pilot: can one Haiku minion read one whole task.jsonl and make sense of it?
15. **Voice limits.** Hit a one-hour cutoff in voice mode; switched to dictation (text).

## Found this session (voice agent, from the repo)

- `Server/SessionIndex.mjs` already IS the in-memory query: loads every task.jsonl, fs.watch keeps it live, registered as the "tasks" QueryServer source in ext/Query, `query({kind, since, text, agent, module, landed, group})`, module tags auto-derived from files touched, parent matching ("ux" finds "ux/Dictate").
- Stale snapshots: past-work-index.md (Oct 14), sessions/session-index.json + session-tree.json + sessions.json (Oct 8), task-manifest.json (Oct 10).
- 1,627 task.jsonl files; largest ~400 KB; today's session file 152 lines (log 86, chat 55, agent 7, action 2, decision 1, assign 1). No full LLM replies, no tool calls.
- Zero task.jsonl files carry a summary or topics line.
- prompts.jsonl holds 4 whisper test lines from Sept 22; asks.jsonl (279 lines) tracks ask status, not raw words.
