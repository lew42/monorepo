# What is logged, and can we trust it?

Expected cost: about $2. Haiku. Follow [findings-method.md](../findings-method.md); write only `findings.md` and your log.

The owner's words: figure out "what is being logged currently, accurately", with evidence that each node function is "actually being used and actually working". "Anytime we do a commit... we should know exactly which commit goes with each session." They want better insight into what agents decide, without bloating `session.jsonl` further.

## Answer with a script

1. **Every log.** Start from `%LOCALAPPDATA%/lew42/servex/logs/`, `Servex/doc/`, `.claude/hooks/readme.md`, `public/framework/ai/readme.md`. A table: log, writer (`path:line`), reader (`path:line`, or "nobody"), lines, size, newest line's time, and a verdict: **working** (written in the last 48 hours and read by code), **written but unread**, or **dead**. Open the newest line of each and confirm it holds what the writer claims.
2. **Commits.** Is there a record linking a commit to a session or task? Session has a `commits` field and a `commit` method (`core/Task/Task.js`, `core/Session/Session.js`), and `Server/merge.mjs` names the task in merge commits. For the last 20 commits that aren't log sweeps, what fraction can be traced to a session by that record alone? For the last 20 sessions that committed, does the record list their commits?
3. **Decisions.** `Server/Decide.mjs` and the `decide` skill are meant to be the only way to write a decision. How many decision lines exist in the past 30 days, and from how many sessions? What share of mastermind sessions wrote any?
4. **Session file growth.** The biggest `session.jsonl` files, and what share of their bytes is each kind of line. Which kinds are worth keeping, and which could live elsewhere?

## End with

Undeniable gaps only, ranked by how much insight they'd add for the least code: for each, the one place a node function could write it, so no agent has to remember. Say what you'd stop logging too. Change nothing.
