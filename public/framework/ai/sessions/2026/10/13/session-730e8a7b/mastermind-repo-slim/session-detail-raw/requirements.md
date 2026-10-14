# The session page: click through to the raw log, and the refined asks beside it

Budget: $10. Load the `sub-mastermind` and `page` skills first. The owner's words: `../requirements-5.md` ask 7 ("get the AI session system working better so that I can dig through the data and see what was requested and when… hopefully we still have some raw log so I can click through and read the raw logs") and `../requirements-6.md` ask 2 ("see the refined prompts and then click through to see the raw prompts in a logical way that gives me confidence we've processed everything… the session detail page needs a revamp"). What exists: `ai/AISession/AISessionDetail.js` (tabs: Conversation, Cost, Models and tokens, Related; the Coverage tab from refine-pipeline, `AISessionCoverage.js`), `AISessionConversation.js` (renders the raw SDK file served at `/ai-logs/<id>`), `SessionIndex` rows carry `raw.task` and `raw.transcript` (session-index, today), the refined cards from the refine queue (`ext/Refine/queue/`). Your log is this dir's `task.jsonl`. CLAUDE.md: show don't tell; route everything; one of everything.

## Deliverable

1. **Prove what the detail page shows today** for one session of 10-13 (headless at 1200): is there a visible "raw log" link to the task.jsonl and to the transcript (`/ai-logs/<id>`), does the Coverage tab list the asks with a click-through to the raw prompt line, does the Conversation tab render the raw file. Screenshots and a three-line verdict in your log before any change.
2. **Fix the misses only**: a "Raw" link (task.jsonl + transcript) in the detail header from `SessionIndex`'s `raw` fields; each refined ask row in the Coverage tab links to its raw prompt line (`/ai-logs/<id>#<line>` or the transcript anchor the Conversation tab already uses); nothing new where a component exists.
3. **Four widths**, smoke clean, `merge.mjs`; before/after shots on the card; `ai/sessions/doc/ui/detail-layout.md` gets the two lines (where Raw lives, how an ask links to its line).
4. Card report; landing line checked with `tail -1`.

Fence: `ai/AISession/AISessionDetail.js`, `AISessionCoverage.js`, `AISessionConversation.js` (links only), `ai/sessions/doc/ui/detail-layout.md`, this task dir. Not `SessionIndex`, not `ext/Refine`. Sonnet.
