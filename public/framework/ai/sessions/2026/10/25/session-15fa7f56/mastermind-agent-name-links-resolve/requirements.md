# Agent-name links in chat go to a page that does not exist

The owner (via voice session v-sq8y7db), verbatim: "Clicking an agent name link in the chat goes to /framework/ai/sessions/<name>/, which does not exist. Make agent-name links resolve to the agent's real page (task_dir url or dated-store path)." Seen on `/framework/ai/sessions/mastermind-tasks-completion/`.

`ext/Mention/Mention.js` `agent_entry()` built `/framework/ai/sessions/${name}/` for any `@mastermind-*`, `minion-*`, `manager-*`, `task-mastermind-*` name. The real page is the agent's task folder in the dated store, e.g. `/framework/ai/sessions/2026/10/25/session-e06424f1/mastermind-tasks-completion/`.

## Deliverables
1. Links resolve to the agent's real page for ALL agent names, through a name to task folder lookup the browser can read. Reuse the one that exists (`ai/index.json`); no second index.
2. The session detail page for an id with no `session.jsonl` hangs forever on "Reading this session's record". Show a plain not-found message instead.
3. Open one real agent page at its dated url, confirm it loads with content, and report if the page itself is broken beyond the url.

## Result
See `session.jsonl` (landing line) and `review.md`.
