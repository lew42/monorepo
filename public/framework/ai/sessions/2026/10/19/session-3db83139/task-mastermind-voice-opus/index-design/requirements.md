# Sessions: what indexing, tags and nesting exist today (read-only design check)

Parent: task-mastermind-voice-opus, task dir public/framework/ai/sessions/2026/10/19/session-3db83139/task-mastermind-voice-opus/

## The owner's words (via the voice assistant, cleaned; an idea, NOT a decided spec)
> (a) Unsure the session system does any archiving or indexing; it should be automated. (b) Daily handoff at midnight: in-progress sessions that need continuing could move to the next day's folder so they get found and continued rather than forgotten; the alternative is staying in the start-date folder (a record of when it began). Leaning toward moving, but it could go either way. (c) Index what was done each day, especially what LANDED, per day and per month: every day the monthly log gets that day appended; a file named for the month (e.g. 2026-10.jsonl). (d) Those indexes answer "what was done?" without loading every session. With hundreds or thousands of sessions there must be structure: tags, and nested sessions/sub-sessions so whole projects can be identified and summarized as units. Check what tags and parent/child fields sessions already carry, and how well they are filled in.

## Deliverables (build nothing)
1. What indexes exist today, one line each with its path and writer: the day `index.json` files under public/framework/ai/sessions/YYYY/MM/DD/, `ai/log.jsonl` files (public/framework/ai/log.jsonl, public/framework/ai/sessions/ai/log.jsonl), sessions.json / session-tree.json, Server/doc/session-index.md, past-work-index.md, anything that writes a per-day or per-month summary. Say whether each is automated (who runs it, when) or manual.
2. Tags and nesting: which fields exist (tags, kind, parent, parent_task, after, home, module), and a COUNT of how well they are filled across the last 30 days of task.jsonl / session.jsonl line 1s. Use a node script you write in this task dir that reads the files and prints the counts (never estimate by reading files yourself).
3. A short design (half a page): the daily + monthly landed index (file names, who writes it, from what), and move-vs-stay at midnight with the tradeoff in two lines each and your recommendation. Prefer a pointer line in the next day's folder over moving files (never destructive), unless you find a reason not to.
4. Write it all to `index-design/design.md` in the task dir above (one screen plus the counts table), then stop.

## Budget
Read-only, under 60k tokens.
