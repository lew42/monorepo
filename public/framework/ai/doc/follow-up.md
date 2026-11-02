# Follow-up: what fell through the cracks

Counted by the one state ([one-state.md](one-state.md), `Server/AIIndex.mjs`): every task below is a row of `ai/index.json`. Computed 2026-11-02 06:08 UTC by `node Server/FollowUp.mjs --write` from the state's tasks touched in the last 10 days. Re-run it any time; the full table is [follow-up-full.md](follow-up-full.md), unused files are [unreferenced.md](unreferenced.md).

**0 landed with unmerged commits · 0 merged but never landed · 13 quiet over 2 h · 0 landed with no outcome · 498 open tasks untouched over 7 days · 0 open asks with no live owner · 795 healthy of 808.**

## quiet: 13

the state calls it in_flight or stale and its log is silent for over 2 h: resume it or close it.

- [views-fix](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/views-fix/): no agent, last log 3 h ago, step 0/0, agent unknown
- [session-e3fd9043](/framework/ai/sessions/2026/10/31/session-e3fd9043/): no agent, last log 3 h ago, step 0/0, agent unknown
- [session-cb53aa0e](/framework/ai/sessions/2026/10/24/session-cb53aa0e/): no agent, last log 3 h ago, step 0/0, agent unknown
- [cloud-voice-app-20261030](/framework/ai/sessions/2026/10/30/cloud-voice-app-20261030/): no agent, last log 3 h ago, step 0/0, agent unknown
- [v3-wall](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/v3-wall/): no agent, last log 6 h ago, step 0/0, agent unknown
- [join-and-follow](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/join-and-follow/): no agent, last log 6 h ago, step 0/0, agent unknown
- [sheet-reads](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/sheet-reads/): no agent, last log 6 h ago, step 0/0, agent unknown
- [recite-trace](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/recite-trace/): no agent, last log 6 h ago, step 0/0, agent unknown
- [tap-unlock](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/tap-unlock/): no agent, last log 7 h ago, step 0/0, agent unknown
- [remote-site-tunnel](/framework/ai/sessions/2026/10/20/session-e00f55c9/remote-site-tunnel/): no agent, last log 8 h ago, step 0/0, agent unknown
- [record-ai-probe-results-e-g-sdk-web-sear](/framework/servex/tasks/record-ai-probe-results-e-g-sdk-web-sear/): no agent, last log 8 d ago, step 0/0, agent unknown
- [sidebar-pins](/framework/core/Page/tasks/page-mastermind/sidebar-pins/): no agent, last log 8 d ago, step 0/0, agent unknown
- …1 more in [follow-up-full.md](follow-up-full.md)

## unworked: 498

Open tasks (idle, queued or waiting, none on the owner) whose last log line is over 7 days old. Nothing runs from the queue by itself, so these only get done if someone looks: do it, group it into a real task, or stop it with a reason (through the item tool). Newest first.

- [core-page-the-page-s-cards-are-misaligne](/framework/core/Page/tasks/core-page-the-page-s-cards-are-misaligne/): idle, last log 7 d ago
- [mention-voice-session-ids-become-icon-li](/framework/ext/Mention/tasks/mention-voice-session-ids-become-icon-li/): idle, last log 7 d ago
- [v-sq8y7db](/framework/ai/sessions/2026/10/25/v-sq8y7db/): idle, last log 7 d ago
- [v-hzpy68f](/framework/ai/sessions/2026/10/25/v-hzpy68f/): idle, last log 7 d ago
- [tasks](/framework/ai/sessions/tasks/): idle, last log 8 d ago
- [v-xhx7fmx](/framework/ai/sessions/2026/10/25/v-xhx7fmx/): idle, last log 8 d ago
- [v-zg6h7hl](/framework/ai/sessions/2026/10/24/v-zg6h7hl/): idle, last log 8 d ago
- [agent-rules-skills-usage-and-the-health](/framework/ai/tasks/agent-rules-skills-usage-and-the-health/): idle, last log 8 d ago
- [design-vision-loop-screenshot-read-chang](/framework/ai/tasks/design-vision-loop-screenshot-read-chang/): idle, last log 8 d ago
- [now-page-topic-sub-cards-from-refined-pr](/framework/ai/tasks/now-page-topic-sub-cards-from-refined-pr/): idle, last log 8 d ago
- …488 more in [follow-up-full.md](follow-up-full.md)

## Check

795 healthy + 13 flagged = 808; the state lists 808 tasks in the same 10 days: agree. The state's own self-check is ok. Source: ai/index.json (under a minute old). 410 local branches are not merged into `michael/dev` (many are salvage or abandoned worktrees).

## How each row is counted

- **quiet**: the state's bucket is `in_flight` or `stale` and the last log line is over 2 h old. A `landed` task is never quiet.
- **closed as abandoned**: a `stale` task silent over 24 h gets a `stop` line from `Server/StaleClose.mjs` (run just before this, daily) and leaves `quiet`; the manifest is `ai/stale-closes.jsonl`: [stale-close.md](/Server/doc/stale-close.md).
- **landed with unmerged commits**: bucket `landed`, its branch (read from the state's listed dir) has commits and its files are not on `michael/dev` (`LandingCheck`).
- **merged but never landed**: any bucket but `landed`, its branch is already on `michael/dev`.
- **landed with no outcome**: bucket `landed` and the state's `line` is empty.
- **unworked**: the state's bucket is `idle`, `queued` or `waiting` (not on the owner) and the last log line is over 7 days old. Counted over the whole state, not only the window, because a task nobody touches drops out of the window. The 133 stale queue tasks of 2026-10-24 (nothing picks tasks from the queue by itself) are what this exists to catch early; it also counts idle and waiting tasks outside the queue, so its number is larger.
- **open asks with no live owner**: `asks.jsonl` as before, joined on the state's `agents`.
- **an orphaned ask is re-filed, not reopened**: `node Server/OrphanAsks.mjs --plan` lists these same asks with the module home each belongs to; `--apply` makes (or matches) an idle task there and appends a `tracked` line to `asks.jsonl`, which drops it from this list (manifest `ai/asks/orphan-asks.jsonl`).
- First run 2026-10-18: of the 30 rows the old reader called quiet, 26 survive (all `stale`: no finish line, no working agent) and 4 drop out (bucket `stopped`, an explicit stop).
