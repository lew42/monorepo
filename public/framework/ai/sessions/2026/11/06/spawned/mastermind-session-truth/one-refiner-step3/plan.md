# Plan: session.coverage()
- Session.coverage() walks Prompt tasks + counted hook Prompts + undeduped chat messages; cited = parts[].cites plus descendant tasks' cites. Null when no sentences.
- summary() carries it; SessionStats draws one line, uncited list one click down.
- Splitter: browser sentences.js (Session.js cannot import server-only Ask.mjs); reads ~8% above the study's Ask.split.

## Real-data check (days 03-09 Nov; only 4 sessions have prompts)
| session | sentences (coverage) | study (coverage.mjs) | cited |
|---|---|---|---|
| v-z0jonhy | 317 | 317 | 0 |
| v-yq08i4n | 156 | 156 | 0 |
| session-5132a480 | 131 | 121 | 0 (splitter: browser sentences.js vs Ask.split) |
| cloud-voice-session-recall | 14 | 0 | 0 (counts chat messages with no Prompt task; the study counts stored sentences only) |

## Shots
Not taken: the page line reads summary.coverage, which the item tool serves only after a Servex restart (not allowed in this task).
