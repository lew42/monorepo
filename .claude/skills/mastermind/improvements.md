# mastermind â€” improvements

Any agent may append. One line each: `YYYY-MM-DD Â· what should change Â· why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.
- 2026-09-04 · the owner: the mastermind should not execute skills or hands-on edits itself, only relay to a minion/session — its tool calls bury its answers in the sidebar chat ('scroll hunter'). Proposal for the Each-cycle section: the mastermind's own calls are ledger, usage, dispatch, harvest; everything else, however small, is a minion. Owner's call to promote (said as 'i'm thinking').
- 2026-09-04 · a third minion ran `find /` this week despite the rule in its brief AND in minion-rules.md (paging-scout, hunting the playwright path; three orphans reaped by the mastermind at 17:01). The rule does not hold; a PreToolUse hook that refuses any Bash command matching `find /` (or `find C:/`) would. Proposal for the owner (settings.json is theirs).
- 2026-09-05 · the mastermind's private server (:8091) was killed by minions twice in one day despite 'kill by the pid you started' in minion-rules.md — a rule read once and forgotten under 'kill every server you start'. What holds: the mastermind's server on a port outside the 808x/809x range minions are told to use (8070?), or a PreToolUse hook that refuses Stop-Process/taskkill on a pid the agent did not spawn.
