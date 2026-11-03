## LATEST, 2026-10-16 23:15: voice-app hands off to a VS Code sidebar session

**Who wrote this:** `voice-app`, the owner's Claude mobile-app voice session (about 15:00 to 23:15 on 2026-10-16, through the Servex MCP). **There is no local SDK session file for it**: the record is this session dir [`sessions/2026/10/16/voice-20261016/`](sessions/2026/10/16/voice-20261016/) (`task.jsonl`, 320 decision lines; `inbox.jsonl`; the per-task dirs), the owner notes listed below, and the git log (170 commits since 15:00). The owner's prompts were not logged verbatim; the dictations were captured as the notes.

**How to talk to anything in flight:** `send_to_agent {id, text, from: "<your id>", reply_to: "message <your id>"}` (from the owner's tab add `direct: true` or start the text with `@<id>`; a stopped agent needs `revive: true`; `priority: "now"` interrupts, so only for emergencies). `list_agents` shows state; a dormant agent wakes on the next message.

**In flight (talk to these first):**
- `mastermind-task-migrate` (Opus, $30, WORKING, dir `voice-20261016/task-migrate/`, card "Task migration" on /live/): migrates old-style tasks (session task.jsonl, requirements.md, TaskState state.jsonl) into `<module>/tasks/<slug>/` with session back-references; research → plan (self-approved) → build on a COPY → dry run. Brief: `core/Task/doc/owner-2026-10-16-migration.md`. **It stops before the real run and asks; the owner says go.**
- `mastermind-sheet` (Opus, $25, dormant, dir `voice-20261016/sheet/`, cards "Sheet audit" and "Sheet proposal"): audit.md and proposal.md written; step 1 landed (rail.js → `class Sheet extends View`, 41c9607e7). **Waiting on the owner's one decision:** is `<path>/ai/` routing approved, with the rule that a real `ai` child wins? Steps 2 to 10 in proposal.md are each approval-gated; nothing else is built without a yes. Brief: `ext/drawer/doc/owner-2026-10-16-sheet.md`.
- `mastermind-task-system` (Opus, dormant, dir `voice-20261016/task-system/`, card "Task system plan"): the 17-step build landed plus tonight's three fixes (TasksPage at any `tasks/` + `/tasks/` index 71aec5869; live Tasks card one line e509b7312; TaskView.row one glyph 3cf55715b). Check plan.md for anything still ⬜ (node-side fields step 3c, skills/readmes step 10 were last in line).
- `helper-compact-nudge` (Sonnet, dormant): idle-time compaction nudge replacing the auto /compact (roles.js last changed e0a0b1ead 20:38; review.md beside its task.jsonl). **Servex restart still pending** to apply it; restart when no mastermind is mid-step.
- `helper-cost-fix` (Sonnet, idle): landed a392e2049 (count each API message once at its largest usage, no 40-slot ring; recost CLI + heal), independently reviewed b6d9342cf, doc `ai/AISession/doc/cost-accounting.md` (2026-10-16 day total $278.25, counter = audit). Agent cost figures in `list_agents` are post-recost.
- `mastermind-page` (idle, snoozed to 2026-10-17 18:00). `mastermind-voice-opus` (dormant, the cloud voice session, $674, posts "relay" commits): a SECOND voice context exists; read its dir `sessions/2026/10/15/voice-opus/` before assuming voice-app was the only voice.

**Needs attention, not finished:**
1. The `<path>/ai/` decision (above), then the sheet steps one at a time.
2. The real migration run, after the dry-run report.
3. Servex restart (compaction nudge; the spawn-policy change 511d6611d is already live since 15:16).
4. The /live/ root was NOT cleared: the owner wants a blank slate with the old cards moved to `/live/archive/`, and the Now card (id `now`) kept current. Not done; the Now card is stale.
5. Law to enforce everywhere (CLAUDE.md, "code streams, AI does not"): live cards must be views of data, never agent-rewritten text. The Tasks card is the only data-driven one.
6. `node Server/TaskState.mjs --watch` is started by nothing, so `/framework/ai/tasks/` is stale.
7. Waiting on the owner: Gmail re-auth; whether to push michael/dev (2,881 commits ahead of origin, nothing pushed in weeks); the 108 real unmerged salvage branches (`voice-20261016/salvage/audit.md`, top 5 listed).
8. Follow.js is the node-event → agent-queue path (files only); browser events (navigation, clicks, which task was tapped) are not relayed yet. Queue by default; interrupt only for voice barge-in (`Servex/agents/doc/owner-2026-10-16-realtime-interrupt.md`).

**Landed tonight (voice-app's share):** Task system (Task extends Item, item tool, task homes, TaskPage, TasksPage, TaskView chip/row/card, today's dictations as real tasks); Whisper duplicate log 3cecf3724; salvage audit; Home link on the phone sheet 753083190; cost fix; Sheet rename; compaction nudge; laws in CLAUDE.md (8c5dc7928 / 09c5ebb29).

**The owner's words tonight, by module (read before touching):** `core/Task/doc/owner-2026-10-16-{task-system,composition,top-down,ui,node-side,migration}.md`; `Servex/doc/owner-2026-10-16-tools.md`; `Servex/agents/doc/owner-2026-10-16-{realtime-interrupt,compaction}.md`; `ext/drawer/doc/owner-2026-10-16-sheet.md`; `ext/Refine/doc/card-types.md` (night addendum: one assistant, one pass, by sentence; question blocks); `audio/Voice/doc/owner-2026-10-16-voice-conversation.md` (barge-in); `ai/doc/owner-2026-10-16-indexing.md`; `core/doc/decisions.md` d-render-method; `live/doc/notes.md`.
