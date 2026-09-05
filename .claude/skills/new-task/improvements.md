# new-task — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.
2026-09-04 · the PostToolUse edit hook attributed a table-equal minion's requirements.md edit to the local-dev-harness minion's task.jsonl — with several minions in one session the hook picks the wrong task; evidence in ai/2026-09-04/local-dev-harness/task.jsonl. Worth saying in section 3: check your own log's action lines at landing and strike a sibling's.
2026-09-04 · the shared-scratchpad overwrite bit the MASTERMIND too: a reviewer minion replaced the mastermind's platform-probe.mjs at 18:13 (different port, different url) and the next harvest probe failed with a connection refused that looked like a dead server. The rule 'name scripts after your task' is in section 1 but agents skip it; the fix that holds is a per-agent SUBDIRECTORY of the scratchpad (scratchpad/<slug>/), stated as the default in the skill.
