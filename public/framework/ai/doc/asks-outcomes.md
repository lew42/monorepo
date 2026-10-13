# Your asks, tallied: what landed and what didn't

**Confidence scale, everywhere on this page: 0.5 = not sure (the default), 0 = no idea, 1 = certain.** It is computed from yes/no flags, never typed by a model ([how](#how-it-was-computed)).

859 asks found in 1990 of your prompts since 2026-09-15, grouped into 309 features: **101 done, 118 partly, 90 not done.** 79 of the "partly" had a landing, but you asked again after it landed. Verdicts were spot-checked 7/10 right, so read a "not done" as "no evidence found", not as proof.

## Asked most, not finished

| asks | feature | status | last asked | evidence | why |
|---|---|---|---|---|---|
| 47 | session system | partly | 2026-10-13 | [part2-sessions-dashboard](/framework/ai/sessions/2026/10/02/panel2-sessions/panel2-sessions/part2-sessions-dashboard/) | Sessions tab, detail pages with tabs, cost tracking, and socket infrastructure landed; 'server-side socket que |
| 33 | task system | partly | 2026-10-13 | [object](/framework/ai/sessions/2026/09/28/e269b131-e2d2-4712-a88d-b243d631bd04/organization/object/) | Task class and organization infrastructure landed; specific asks for 'agentic system to audit past sessions' a |
| 21 | dashboard | partly (asked again) | 2026-10-09 | [ai2-groups](/framework/ai/sessions/2026/09/24/ai2-cost-fill/ai2-groups/) | asked again on 2026-10-09, after this landed on 2026-09-24. AI 2 dashboard redesigned into groups, hierarchica |
| 19 | class architecture | partly (asked again) | 2026-10-13 | [minion-part1](/framework/ai/sessions/2026/10/02/bc9e77bd-9e53-4c08-99c7-0346f2f0f5d1/inspect/minion-part1/) | asked again on 2026-10-13, after this landed on 2026-10-01. Inheritance relationships documented, List/UIList  |
| 18 | system architecture | partly (asked again) | 2026-10-13 | [instructions-overhaul](/framework/ai/sessions/2026/08/17/instructions-overhaul/) | asked again on 2026-10-13, after this landed on 2026-08-17. Browsable system documentation built, naming conve |
| 15 | page jsonl format | partly (asked again) | 2026-10-09 | [json-pages](/framework/ai/sessions/2026/08/30/json-pages/) | asked again on 2026-10-09, after this landed on 2026-08-30. JSON pages landed as append-only delta logs, snaps |
| 13 | cost tracking | partly (asked again) | 2026-10-09 | [ai2-cost-fill](/framework/ai/sessions/2026/09/24/ai2-cost-fill/ai2-cost-fill/) | asked again on 2026-10-09, after this landed on 2026-09-24. Costs shown per group/task/agent with models, AI2  |
| 13 | code quality | partly (asked again) | 2026-10-12 | [css-audit](/framework/ai/sessions/2026/09/25/css-audit/css-audit/) | asked again on 2026-10-12, after this landed on 2026-09-25. CSS audit completed with 8,599 of 35,769 lines ide |
| 13 | prompt refinement | partly | 2026-10-13 | [skill-roles](/framework/ai/sessions/2026/09-19/skill-roles/) | Prompt logging and refinement system built with Prompt class; earlier asks delivered; specific ask to 'track o |
| 12 | servex system | partly (asked again) | 2026-10-03 | `44afdc83b` | asked again on 2026-10-03, after this landed on 2026-09-29. Commit 44afdc83b: Servex dashboard Docs tab; landi |
| 12 | token efficiency | partly | 2026-10-08 | `cad53125b` | Task-audit pilot landed 2026-10-02; commit cad53125b docs token efficiency. Missing: batch API implementation, |
| 11 | response format | not done | 2026-10-12 | none | no landing line names it; 11 asks span 2026-10-01 to 2026-10-03 with no evidence of structured card adoption o |
| 11 | openrouter | partly (asked again) | 2026-10-09 | `4ec8909d2` | asked again on 2026-10-09, after this landed on 2026-10-01. Harness-research landed 2026-09-28; commit 4ec8909 |
| 9 | design | partly | 2026-10-13 | [color-study](/framework/ai/sessions/2026/09/01/color-study/) | Color-study and layout-study landed 2026-09-01; Figma designs landed 2026-10-13. Missing: unified icon system  |
| 9 | token accounting | partly (asked again) | 2026-10-08 | `ea4a7e6dd` | asked again on 2026-10-08, after this landed on 2026-10-07. Commit ea4a7e6dd: fix find_transcript() case-sensi |

## Never landed (no evidence found)

| asks | feature | status | last asked | evidence | why |
|---|---|---|---|---|---|
| 11 | response format | not done | 2026-10-12 | none | no landing line names it; 11 asks span 2026-10-01 to 2026-10-03 with no evidence of structured card adoption o |
| 4 | performance | not done | 2026-10-08 | none | no landing line names it |
| 4 | 3d vision | not done | 2026-10-02 | none | landing lines show layout-analysis and screenshot vision tools, zero evidence of 3D linearization or drone-sca |
| 4 | transcription refinement | not done | 2026-09-29 | none | no landing line names it |
| 4 | transcription pipeline | not done | 2026-10-08 | none | audit shows transcription routed but no landing line documents Whisper-to-log pipeline or refinement scoring |
| 3 | cervex pump | not done | 2026-10-03 | none | no landing line names it; no commits address pump control or motherboard configuration |
| 3 | usage monitoring | not done | 2026-10-09 | none | commit 75d923259 covers VRAM telemetry, not token usage; asks specifically require monitoring token usage acro |
| 3 | weight system | not done | 2026-10-01 | none | no landing line names it; only proposal commit a8c76d07a exists; audit shows Templates weight queued but not d |
| 2 | ai system | not done | 2026-10-12 | none | no landing line names it |
| 2 | dictate indicator | not done | 2026-10-01 | none | no landing line names it |

## Contradictions (your words pull two ways)

- **session system** (5 flagged, 2026-10-09 to 2026-10-13): Figure out archival process. Cloudflare cloud storage? Auto compaction? Compress logs?
- **class architecture** (4 flagged, 2026-10-01 to 2026-10-03): Show class architecture: list, item, page, task, card; is card class needed?
- **cost tracking** (3 flagged, 2026-10-03 to 2026-10-09): Spending reported as both $1.67 and $10.45 today; which is correct?
- **prompt refinement** (3 flagged, 2026-10-03 to 2026-10-03): Reconfigure prompt refinement/chat as skill, per-session hook, preserve raw prompts in structure
- **mobile dictation** (2 flagged, 2026-10-05 to 2026-10-05): Dictation still not working, connecting forever then microphone abort error
- **page architecture** (2 flagged, 2026-10-12 to 2026-10-12): render content nesting and content as function vs list - too complex, simplify?
- **task system** (1 flagged, 2026-10-03): Audit tasks for completion, cost, value, dependencies
- **card system** (1 flagged, 2026-10-03): Use prompt refinement skill to review today's prompts (raw/clean/refined); tag by system
- **dashboard** (1 flagged, 2026-10-02): AI dashboard with overview tab and dashboard tab
- **system architecture** (1 flagged, 2026-10-03): 'at' and 'set' confusing; should use get() with dot-separated paths

41 asks carry the conflict flag; all of them are in [the data file](asks-outcomes.jsonl).

## Every feature, by how often you asked

| asks | feature | status | last asked | evidence | why |
|---|---|---|---|---|---|
| 47 | session system | partly | 2026-10-13 | [part2-sessions-dashboard](/framework/ai/sessions/2026/10/02/panel2-sessions/panel2-sessions/part2-sessions-dashboard/) | Sessions tab, detail pages with tabs, cost tracking, and socket infrastructure landed; 'server-side socket que |
| 33 | task system | partly | 2026-10-13 | [object](/framework/ai/sessions/2026/09/28/e269b131-e2d2-4712-a88d-b243d631bd04/organization/object/) | Task class and organization infrastructure landed; specific asks for 'agentic system to audit past sessions' a |
| 22 | card system | done | 2026-10-04 | `419ec46d7` | Card padding documented, custom content enabled, status cards and sizing system shipped (commits 419ec46d7, 5a |
| 21 | dashboard | partly (asked again) | 2026-10-09 | [ai2-groups](/framework/ai/sessions/2026/09/24/ai2-cost-fill/ai2-groups/) | asked again on 2026-10-09, after this landed on 2026-09-24. AI 2 dashboard redesigned into groups, hierarchica |
| 19 | class architecture | partly (asked again) | 2026-10-13 | [minion-part1](/framework/ai/sessions/2026/10/02/bc9e77bd-9e53-4c08-99c7-0346f2f0f5d1/inspect/minion-part1/) | asked again on 2026-10-13, after this landed on 2026-10-01. Inheritance relationships documented, List/UIList  |
| 18 | system architecture | partly (asked again) | 2026-10-13 | [instructions-overhaul](/framework/ai/sessions/2026/08/17/instructions-overhaul/) | asked again on 2026-10-13, after this landed on 2026-08-17. Browsable system documentation built, naming conve |
| 15 | page jsonl format | partly (asked again) | 2026-10-09 | [json-pages](/framework/ai/sessions/2026/08/30/json-pages/) | asked again on 2026-10-09, after this landed on 2026-08-30. JSON pages landed as append-only delta logs, snaps |
| 13 | cost tracking | partly (asked again) | 2026-10-09 | [ai2-cost-fill](/framework/ai/sessions/2026/09/24/ai2-cost-fill/ai2-cost-fill/) | asked again on 2026-10-09, after this landed on 2026-09-24. Costs shown per group/task/agent with models, AI2  |
| 13 | code quality | partly (asked again) | 2026-10-12 | [css-audit](/framework/ai/sessions/2026/09/25/css-audit/css-audit/) | asked again on 2026-10-12, after this landed on 2026-09-25. CSS audit completed with 8,599 of 35,769 lines ide |
| 13 | prompt refinement | partly | 2026-10-13 | [skill-roles](/framework/ai/sessions/2026/09-19/skill-roles/) | Prompt logging and refinement system built with Prompt class; earlier asks delivered; specific ask to 'track o |
| 12 | servex system | partly (asked again) | 2026-10-03 | `44afdc83b` | asked again on 2026-10-03, after this landed on 2026-09-29. Commit 44afdc83b: Servex dashboard Docs tab; landi |
| 12 | token efficiency | partly | 2026-10-08 | `cad53125b` | Task-audit pilot landed 2026-10-02; commit cad53125b docs token efficiency. Missing: batch API implementation, |
| 11 | response format | not done | 2026-10-12 | none | no landing line names it; 11 asks span 2026-10-01 to 2026-10-03 with no evidence of structured card adoption o |
| 11 | openrouter | partly (asked again) | 2026-10-09 | `4ec8909d2` | asked again on 2026-10-09, after this landed on 2026-10-01. Harness-research landed 2026-09-28; commit 4ec8909 |
| 11 | page system design | done | 2026-10-03 | `1e6c8d903` | Commit 1e6c8d903: core/Page architecture Session built; landing lines show vision-direction, timeline, accept- |
| 9 | design | partly | 2026-10-13 | [color-study](/framework/ai/sessions/2026/09/01/color-study/) | Color-study and layout-study landed 2026-09-01; Figma designs landed 2026-10-13. Missing: unified icon system  |
| 9 | token accounting | partly (asked again) | 2026-10-08 | `ea4a7e6dd` | asked again on 2026-10-08, after this landed on 2026-10-07. Commit ea4a7e6dd: fix find_transcript() case-sensi |
| 8 | agent system | done | 2026-10-03 | `4d897a85d` | Commit 4d897a85d: skills updated with role mappings; landing line 2026-09-22 tiers-design shows agent ladder d |
| 8 | dictate layout | done | 2026-10-05 | `b87834ba2` | Commit b87834ba2: ChatPanel mobile sheet titled DrawerRailSheetChat; landing line 2026-09-29 ChatPanel unifies |
| 7 | assistant system | partly (asked again) | 2026-10-13 | `1e697bdf5` | asked again on 2026-10-13, after this landed on 2026-10-05. Commit 1e697bdf5: voice-assistants split screen de |
| 7 | audio system | partly (asked again) | 2026-10-05 | [audio-consolidate](/framework/ai/sessions/2026/09/30/108a1b36-ed02-4728-bf82-20d7d7053d85/audio-consolidate/) | asked again on 2026-10-05, after this landed on 2026-09-30. audio/ framework with three tools (MicStream, Reco |
| 7 | local model | partly (asked again) | 2026-10-05 | [models-page](/framework/ai/sessions/2026/10/04/models-page/models-page/) | asked again on 2026-10-05, after this landed on 2026-10-04. Models tab with 17-row sortable table showing prov |
| 7 | whisper implementation | partly | 2026-10-05 | `045c5c097` | Whisper status streams (SSE /api/whisper/stream) and timing documented; implementation landed but explanations |
| 6 | dictation consolidate | partly (asked again) | 2026-10-09 | [one-dictation](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/) | asked again on 2026-10-09, after this landed on 2026-09-30. one chat consolidated on all surfaces (sheet, AI t |
| 6 | mobile dictation | partly | 2026-10-13 | `2e237e3f8` | VoiceStrip compact dictation panel and mobile socket components delivered; 2026-10-13 commit shows phone-width |
| 6 | model comparison | done | 2026-10-04 | [models-page](/framework/ai/sessions/2026/10/04/models-page/models-page/) | Models tab with database-style grid comparing provider, context, $/M in/out/cached, test scores (docs/reasonin |
| 6 | testing framework | done | 2026-10-04 | `b4d470464` | 27-task known-answer suite created for benchmarking model capabilities on framework tasks with test scores int |
| 6 | page layout | partly | 2026-10-09 | `5342982a8` | Refine full-width workspace with toolbar/footer padding, consistent padding applied across tabs/cards, 3440px  |
| 6 | token conservation | partly | 2026-10-13 | `a039620bf` | Token optimization practices documented in Claude.md (batch tool calls, no replay); cheaper models prioritized |
| 5 | app architecture | partly | 2026-10-09 | [storage-design](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/storage-design/) | Page storage class architecture (Store + Backends + Journals) designed; findings.json redesigned; comprehensiv |
| 5 | now card | done | 2026-10-03 | [build](/framework/ai/sessions/2026/10/03/sessions-tab-polish/sessions-tab-polish/build/) | Now card built with tabbed layout (Overview/Tasks), latest content auto-updates, multiple landing lines descri |
| 5 | directory structure | partly (asked again) | 2026-10-10 | `b665e6697` | asked again on 2026-10-10, after this landed on 2026-10-09. Directory: off by default (owner); files.jsonl per |
| 5 | resource monitoring | partly | 2026-10-03 | [ai-dashboard](/framework/ai/sessions/2026/08/14/ai-dashboard/) | AI dashboard and usage pace monitoring landed; Servex mastermind task logging delivered; but process monitor w |
| 5 | sidebar navigation | partly (asked again) | 2026-10-03 | [workspace-c-playground](/framework/ai/sessions/2026/08/19/workspace-c-playground/) | asked again on 2026-10-03, after this landed on 2026-08-19. Panel UI overhauled (2026-08-15), Workspace with l |
| 5 | page routing | partly (asked again) | 2026-10-09 | `baa35983f` | asked again on 2026-10-09, after this landed on 2026-09-30. Path-based routing system landed; /path references |
| 5 | live transcription | partly | 2026-10-05 | [minion-card](/framework/ai/sessions/2026/10/03/26075318-fb11-4162-97af-dbc4f1802545/prompt-refine/minion-card/) | Prompt refinement (Condensed/Structured/Clean/Raw) shipped live; voice transcription commits present; but atom |
| 5 | storage system | partly (asked again) | 2026-10-09 | [ai2-nested](/framework/ai/sessions/2026/09/23/session-1f93064d/ai2-nested/) | asked again on 2026-10-09, after this landed on 2026-09-23. JSONL storage system landed; per-card storage impl |
| 5 | sidebar ui | partly (asked again) | 2026-10-12 | [pg-sidebar](/framework/ai/sessions/2026/08/21/pg-sidebar/) | asked again on 2026-10-12, after this landed on 2026-08-21. Sidebar UI shipped across multiple contexts: Panel |
| 4 | content card | partly (asked again) | 2026-10-02 | [page-docs-wall](/framework/ai/sessions/2026/08/19/page-docs-wall/) | asked again on 2026-10-02, after this landed on 2026-08-19. Page Overview wall with browse system landed; stru |
| 4 | chat | partly (asked again) | 2026-09-30 | [layout-unify](/framework/ai/sessions/2026/09/25/layout-unify/layout-unify/) | asked again on 2026-09-30, after this landed on 2026-09-24. Chat layout unified into right-hand column for all |
| 4 | dictate system | done | 2026-10-05 | `c92aa1c12` | Multiple landing lines show dictate playground, whisper-server integration, transcription working; git commits |
| 4 | architecture docs | partly (asked again) | 2026-10-13 | `bcd47cf12` | asked again on 2026-10-13, after this landed on 2026-10-09. Landing lines show Refine demo with architecture.m |
| 4 | figma mcp | done | 2026-10-13 | `1accdf158` | Git commits confirm desktop MCP connected and verified; landing line shows MCP desktop vs remote research comp |
| 4 | figma design | done | 2026-10-12 | `fd61f8734` | Landing line shows 10 of 19 Figma designs resolved; multiple landing entries document design-to-code conversio |
| 4 | inbox management | done | 2026-10-13 | `4bc63ad21` | Git commits show Inbox.rank with importance+recency, owner_note tool, PageInbox system; landing line reference |
| 4 | list ordering | partly | 2026-10-01 | [page-on-item](/page-extends-item/page-on-item/) | Landing shows PageLog extends Item and LiveList storage implemented; page.pages and reordering partially deliv |
| 4 | gemini | done | 2026-10-03 | `a2bb2fa72` | Task audit pilot landed with 4-judge consensus; git commits document token accounting analysis and token-effic |
| 4 | statu reporting | partly (asked again) | 2026-10-09 | [ai-board-fix](/ai-board-fix/) | asked again on 2026-10-09, after this landed on 2026-08-17. Landing shows task page report system with outcome |
| 4 | page architecture | done | 2026-10-12 | `d79f84bc4` | Git commits show page-templates architecture plan and core/Page documentation; landing lines describe page.chi |
| 4 | page content | done | 2026-10-12 | `19ae15c75` | Git commits show owner_note tool, Page inbox extension, and content-list CRUD implementation; landing shows In |
| 4 | performance | not done | 2026-10-08 | none | no landing line names it |
| 4 | real time update | partly (asked again) | 2026-10-13 | `15a5aa5cd` | asked again on 2026-10-13, after this landed on 2026-10-08. commits show real-time day-partitioned index, tail |
| 4 | sdk | partly | 2026-10-13 | `d8063d695` | spawn_agent({role}) and Servex multi-agent implementation evidenced; thinking-mode documentation ask missing f |
| 4 | tab ui | done | 2026-10-03 | `df3b7bdbe` | landing lines show routed pages for tabs, ask-tab-binding documents dynamic routing; Page architecture commit  |
| 4 | 3d vision | not done | 2026-10-02 | none | landing lines show layout-analysis and screenshot vision tools, zero evidence of 3D linearization or drone-sca |
| 4 | transcription refinement | not done | 2026-09-29 | none | no landing line names it |
| 4 | transcription pipeline | not done | 2026-10-08 | none | audit shows transcription routed but no landing line documents Whisper-to-log pipeline or refinement scoring |
| 3 | live card | done | 2026-10-03 | `c016e9e1a` | landing lines document live card tracking agents and usage; card-word shows .card styles; dashboard-next shows |
| 3 | dictation ui | done | 2026-10-02 | `9c7989129` | tabbed-card shows Overview/Tasks UI; dictation-playground shows live pipeline; one-dictation documents surface |
| 3 | auto send | done | 2026-10-01 | `a474261a5` | one-widget landing line documents autosend after pause; send-delay reduces pause from 2500→1500ms; clean-trans |
| 3 | documentation audit | partly (asked again) | 2026-10-09 | [doc-system](/framework/ai/sessions/2026/08/15/doc-system/) | asked again on 2026-10-09, after this landed on 2026-08-15. ext/doc system landed with module audits; 48 lesso |
| 3 | page class docs | partly (asked again) | 2026-10-12 | [page-docs-mastermind](/framework/ai/sessions/2026/08/19/page-docs-mastermind/) | asked again on 2026-10-12, after this landed on 2026-08-19. Page docs rebuilt with browse() wall, four bands,  |
| 3 | git cleanup | done | 2026-10-13 | `60c29dbbf` | worktree-cleanup landed; 33.3 GB → 6.0 GB; clean tree commits and gitignore entries |
| 3 | cervex pump | not done | 2026-10-03 | none | no landing line names it; no commits address pump control or motherboard configuration |
| 3 | item persistence | done | 2026-10-01 | `e44930ad9` | Page extends Item; Item.Store persistence with append/tail; list verbs as page.jsonl lines |
| 3 | list class design | done | 2026-10-04 | `e7f5a714` | PageLog folded away; Page extends Item directly; List extends Item settled with audit verdict |
| 3 | list persistence | done | 2026-10-03 | `e44930ad9` | page.jsonl handles array operations via list verbs (add/remove/move/order) with stable ID references |
| 3 | mastermind mode | done | 2026-10-09 | `d971557c0` | mastermind knows its model and spends by spawning; Haiku reads, Sonnet builds; pace rules established |
| 3 | mastermind system design | done | 2026-09-24 | [card-to-task](/framework/ai/sessions/2026/09/22/session-df2f3e2e/card-to-task/) | Dispatcher spawns task masterminds; inter-agent messaging via SendMessage; roles.json defines skills per agent |
| 3 | memory management | partly | 2026-10-01 | [agent-host](/framework/ai/sessions/2026/09/22/session-e69d8104/agent-host/) | agent-host landed (sessions held in memory, spawn/send/stop verbs); missing: automated shutdown strategy and m |
| 3 | responsive layout | partly (asked again) | 2026-09-25 | [imagine-design](/framework/ai/sessions/2026/09/04/imagine-design/) | asked again on 2026-09-25, after this landed on 2026-09-04. landing line shows layout system with responsive c |
| 3 | usage monitoring | not done | 2026-10-09 | none | commit 75d923259 covers VRAM telemetry, not token usage; asks specifically require monitoring token usage acro |
| 3 | screenshot monitoring | partly (asked again) | 2026-10-12 | [monitor](/framework/ai/sessions/2026/09/30/proposal-flow/monitor/) | asked again on 2026-10-12, after this landed on 2026-09-30. landing line shows monitor built with screenshot f |
| 3 | tab navigation | partly (asked again) | 2026-10-02 | [navigation-study](/framework/ai/sessions/2026/09/01/navigation-study/) | asked again on 2026-10-02, after this landed on 2026-09-01. navigation study landed with 9 mechanisms catalogu |
| 3 | page weight system | partly (asked again) | 2026-10-02 | [law-hierarchy](/framework/ai/sessions/2026/08/15/law-hierarchy/) | asked again on 2026-10-02, after this landed on 2026-08-15. landing line shows CLAUDE.md rule system with weig |
| 3 | page item | done | 2026-10-03 | [page-no-log](/framework/ai/sessions/2026/10/03/list-events/page-no-log/) | landing line shows PageLog folded away and Page extends Item directly; commit e7f5a7149 confirms Page extends  |
| 3 | research system | partly (asked again) | 2026-09-29 | [research-mastermind](/framework/ai/sessions/2026/08/18/research-mastermind/) | asked again on 2026-09-29, after this landed on 2026-08-19. ext/Research shipped with 7-minion multi-agent res |
| 3 | weight system | not done | 2026-10-01 | none | no landing line names it; only proposal commit a8c76d07a exists; audit shows Templates weight queued but not d |
| 3 | drawer ui | partly (asked again) | 2026-10-02 | [m2](/framework/ai/sessions/2026/09/28/884d4241-bddb-4047-976a-43b49c72e973/page-drawer/m2/) | asked again on 2026-10-02, after this landed on 2026-09-28. landing line shows Element tab and selected-elemen |
| 3 | data grid | done | 2026-10-12 | [data-grid](/framework/ai/2026-10-12/data-grid/) | landing line shows DataGrid built as one grid component; Sessions grid implemented with table or rail view; co |
| 3 | responsive ui | done | 2026-10-09 | [v3-timeline](/framework/ai/sessions/2026/09/19/v3-timeline/) | V3 timeline landed with responsive time layout at 1920/400px; layouts redesigned to stack across mobile to ult |
| 3 | dashboard redesign | partly | 2026-10-03 | [v3-timeline](/framework/ai/sessions/2026/09/19/v3-timeline/) | V3 timeline redesigned with left column and responsive layout landed; dashboard left rail + detail view confir |
| 3 | layout system | done | 2026-10-13 | `42ef66769` | Blog shells at /imagine/blogx/ shipped; two-column layouts page in Figma briefs (d892f8b6d); eight blog shells |
| 3 | panel system | partly (asked again) | 2026-10-02 | [generated-panels](/framework/ai/sessions/2026/08/15/generated-panels/) | asked again on 2026-10-02, after this landed on 2026-08-15. Generated layouts as draggable persisted Panel tre |
| 3 | transcription ui | partly (asked again) | 2026-09-30 | `1dfb13c33` | asked again on 2026-09-30, after this landed on 2026-09-29. Clean transcription mode shipped in AI 2 composer; |
| 3 | transcription chunking | done | 2026-09-25 | [audio](/framework/ai/sessions/2026/09/29/audio/audio/) | Revise at three levels consolidates transcriptions; audio library with MicStream and Transcriber parts landed; |
| 2 | ai system | not done | 2026-10-12 | none | no landing line names it |
| 2 | dictate session | done | 2026-10-01 | `6c4d92f6a` | Dictate page becomes workbench with chat() demo; one shared new_session_button(mount) in chat.js; global sessi |
| 2 | dictate audio | done | 2026-10-01 | [dictate-stop-sound](/framework/ai/sessions/2026/10/01/dictate-stop-sound/dictate-stop-sound/) | Stop chime fixed to play once after AudioContext resumes; beep() no longer fires twice on whisper errors; audi |
| 2 | dictate indicator | not done | 2026-10-01 | none | no landing line names it |
| 2 | handoff docs | not done | 2026-09-24 | none | no landing line names it |
| 2 | documentation rule | partly (asked again) | 2026-10-08 | `6a6fdf6f9` | asked again on 2026-10-08, after this landed on 2026-10-06. CLAUDE.md rule established; commit 6a6fdf6f9 adds  |
| 2 | naming convention | not done | 2026-10-03 | none | no landing line names it |
| 2 | figma component | done | 2026-10-13 | `0167e2644` | Figma slots vs components documentation created and linked from use-figma doc |
| 2 | figma collaborate | done | 2026-10-13 | `6c16099c5` | Figma presence APIs research completed; commit documents presence APIs limitation and desktop MCP selection re |
| 2 | file explorer | done | 2026-09-29 | `0001a763a` | File explorer redesigned with ext/filesystem classes; /fs v2 explorer implemented |
| 2 | file system | done | 2026-10-02 | [task-folders](/framework/ai/2026-10-12/task-folders/) | File system APIs consolidated into one class (TaskDirs.mjs) for file operations |
| 2 | framework page | done | 2026-10-02 | [data-grid](/framework/ai/2026-10-12/data-grid/) | Framework page reorganized with Sessions grid on DataGrid, style system with dark cards, and class documentati |
| 2 | ram upgrade | not done | 2026-10-05 | none | no landing line names it; evidence is about AI model pricing, not RAM hardware |
| 2 | inbox system | done | 2026-10-12 | `7fad40dc9` | Inbox with read/unread states, archive, auto-resolve shipped; inbox rail CSS improved with transparent scrollb |
| 2 | inbox per page | partly (asked again) | 2026-10-13 | `c4c85f11c` | asked again on 2026-10-13, after this landed on 2026-10-12. Refined prompts leave notes on module page via Inb |
| 2 | inbox structure | partly | 2026-10-13 | `410077363` | Inbox restructured (Oct 2), but JSON-L and durable objects evaluation from 2026-10-13 asks not evidenced |
| 2 | ai logging | done | 2026-09-30 | `b2bb90b2d` | Prompt logging and user-request display via refined prompt cards; systems overview documents logging |
| 2 | cloud strategy | not done | 2026-10-03 | none | no landing line names it |
| 2 | item architecture | partly (asked again) | 2026-10-04 | `e44930ad9` | asked again on 2026-10-04, after this landed on 2026-10-02. Page extends Item with Store/LiveList; architectur |
| 2 | layout approval | done | 2026-10-02 | `aefe7c04b` | Approve/Improve buttons and verdict system live on any page via /layouts/verdicts.jsonl |
| 2 | layout browser | done | 2026-09-29 | `2b8f1091b` | Every layout walkable as 3-region tree (/layouts/explorer/); browser/approve wall unified |
| 2 | logging system | not done | 2026-10-05 | none | no landing line names page.jsonl, per-object logs, batched writes, or tail infrastructure |
| 2 | masonry layout | done | 2026-10-03 | `76730b802` | Masonry and Packed grid implementations handle variable heights; shipped on multiple layouts |
| 2 | mastermind autonomy | not done | 2026-10-08 | none | no landing line names decision-making autonomy or skill updates |
| 2 | mastermind coordinator | partly | 2026-10-05 | `1e0743384` | Commit shows mastermind coordinates a module, but predates the 10-05 asks and doesn't show voice-session spawn |
| 2 | mastermind lifecycle | done | 2026-10-03 | [study](/framework/ai/sessions/2026/09/29/3c88ad4d-b2e6-4899-b5c4-fbca0e2674e2/lifecycle/study/) | Landing line documents lifecycle study with counts, architecture design, and page at /framework/servex/lifecyc |
| 2 | mastermind role | partly (asked again) | 2026-09-24 | [tiers-design](/framework/ai/sessions/2026/09/22/tiers-design/tiers-design/) | asked again on 2026-09-24, after this landed on 2026-09-22. Landing line defines six kinds of agent in one lad |
| 2 | mastermind skill | partly (asked again) | 2026-10-08 | [spawn-role](/framework/ai/sessions/2026/09/22/spawn-role/spawn-role/) | asked again on 2026-10-08, after this landed on 2026-09-22. Landing line shows spawn_agent loads skill with ro |
| 2 | memory audit | not done | 2026-10-03 | none | Only audit.mjs infrastructure added; no landing line shows root-cause analysis or comprehensive RAM audit resu |
| 2 | message routing | not done | 2026-09-24 | none | No landing lines or git commits name message routing from sidebar to mastermind |
| 2 | mobile ai sheet | partly (asked again) | 2026-10-13 | [c-chat](/framework/ai/sessions/2026/09/29/audio/audio/c-chat/) | asked again on 2026-10-13, after this landed on 2026-09-29. Landing line confirms ChatPanel component works in |
| 2 | sentence detection | not done | 2026-10-05 | none | No landing lines or commits name Haiku sentence-boundary detection or real-time Whisper stream integration |
| 2 | server lifecycle | done | 2026-10-03 | `a2174a634` | Commit revives dev server on agent wake; landing lines show reaper cleanup, process-monitor dormancy, and work |
| 2 | model selection | not done | 2026-10-04 | none | No landing lines or commits name automatic usage checking, model selection, or Open Router research |
| 2 | model verification | partly (asked again) | 2026-10-08 | `742bf842e` | asked again on 2026-10-08, after this landed on 2026-10-04. Landing lines show Servex runs llama-server with m |
| 2 | navigation system | partly (asked again) | 2026-10-13 | `1a51c07bf` | asked again on 2026-10-13, after this landed on 2026-10-12. NavigationSystem class implemented; commits show n |
| 2 | notification system | partly (asked again) | 2026-10-13 | `b496abc1b` | asked again on 2026-10-13, after this landed on 2026-10-08. Landing line shows NotificationManager, sw.js, dem |
| 2 | page caching | partly | 2026-10-05 | `e0ed00f4d` | Server-side query optimization landed (sessions heap 33→17MB, socket 984→630KB) but no evidence of mobile file |
| 2 | page tool | partly (asked again) | 2026-10-09 | `af9a6690b` | asked again on 2026-10-09, after this landed on 2026-09-25. Landing lines show page tools list/read/create/pla |
| 2 | ai page | done | 2026-09-30 | `dd6299d46` | Landing lines show AI page restructuring with tabs, inbox setup default, docs tab added; audit verdict shows l |
| 2 | video planning | not done | 2026-10-13 | none | no landing line names it |
| 2 | prompt analysi | partly (asked again) | 2026-10-13 | `3c2602233` | asked again on 2026-10-13, after this landed on 2026-10-08. Task audit from 2026-10-08 landed; multiple landin |
| 2 | markdown routing | partly | 2026-09-24 | `44afdc83b` | Commit shows /docs/<path> routing added but no landing line proves it works without breaking static serving as |
| 2 | token visualization | partly | 2026-10-03 | `334a25f6b` | Token tracking and usage audit landed (VRAM telemetry, token-reduction brief) but no evidence of time-series v |
| 2 | tree navigation | done | 2026-09-22 | [design-code](/framework/ai/sessions/2026/09/30/design-code/design-code/) | Browsable readme trees built for /framework/design/ and /framework/code/ with navigation tree structure implem |
| 2 | resize handling | partly (asked again) | 2026-09-28 | [pg-resize](/framework/ai/sessions/2026/08/21/pg-resize/) | asked again on 2026-09-28, after this landed on 2026-08-21. Slim resize handles landed with CSS algorithms doc |
| 2 | input ui | partly | 2026-10-02 | [ux-mastermind](/framework/ai/sessions/2026/08/21/ux-mastermind/) | Input area height and whitespace reduced via ui-compact; character-triggered autocomplete for references not e |
| 2 | ui element | done | 2026-09-29 | [section-variants](/framework/ai/sessions/2026/09/29/section-variants/section-variants/) | Section CSS wrapper with class names on hover built; summary/accordion elements documented and implemented |
| 2 | chat interface | partly (asked again) | 2026-10-12 | [c-chat](/framework/ai/sessions/2026/09/29/audio/audio/c-chat/) | asked again on 2026-10-12, after this landed on 2026-09-29. ChatPanel component implemented consistently acros |
| 2 | emoji system | done | 2026-09-30 | [chat-reactions](/framework/ai/sessions/2026/09/30/chat-reactions/) | SMS-style emoji reactions implemented with long-press/right-click, saved in session log, assistants react with |
| 2 | ui audit | partly (asked again) | 2026-10-12 | [site-audit](/framework/ai/sessions/2026/08/30/site-audit/) | asked again on 2026-10-12, after this landed on 2026-08-30. 741 pages audited at 400/1920/3440 widths with scr |
| 2 | scrolling ui | partly (asked again) | 2026-10-03 | [column-pages](/framework/ai/sessions/2026/08/26/column-pages/) | asked again on 2026-10-03, after this landed on 2026-08-26. Columnar paging shipped with page.columns() for fu |
| 2 | refinement ui | partly | 2026-10-09 | [one-dictation](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/) | Shared dictation widget on all surfaces landed; multi-column responsive layout and Whisper OOP class not clear |
| 2 | thank you fix | partly (asked again) | 2026-09-25 | [dictate-silence](/framework/ai/sessions/2026/09/22/dd3a11e7-7d24-4ef5-ae83-dea94fa63f0a/dictate-silence/) | asked again on 2026-09-25, after this landed on 2026-09-22. Whisper silence issue diagnosed (VAD needed); Serv |
| 2 | text to speech | done | 2026-10-01 | [voice-tts](/framework/ai/sessions/2026/10/01/voice-tts/voice-tts/) | Landing line shows Voice class built as text-to-speech with Voice.js and Voice.Controls in audio/ sibling stru |
| 2 | voice chat | done | 2026-10-01 | `14e4afd80` | Multiple landing lines show voice chat with card replies, threaded replies, and voice sessions with fast/smart |
| 2 | transcription system | partly (asked again) | 2026-10-13 | [asks-transcription](/framework/ai/sessions/2026/10/12/session-d2954950/asks-transcription/) | asked again on 2026-10-13, after this landed on 2026-10-12. Landing line 2026-10-12 shows transcription asks m |
| 2 | voice pair | partly (asked again) | 2026-10-03 | [voice-sessions](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/) | asked again on 2026-10-03, after this landed on 2026-09-30. Landing line documents fast + smart pair per sessi |
| 2 | proposal system | partly | 2026-09-30 | `a8c76d07a` | Commit references proposal system with budgets and merge approval, but landing evidence shows only surface pro |
| 1 | core audit | partly (asked again) | 2026-10-12 | `1e6c8d903` | asked again on 2026-10-12, after this landed on 2026-10-09. Multiple landing lines (08-15 through 10-09) show  |
| 1 | auth | not done | 2026-10-05 | none | no landing line names it |
| 1 | randomuuid bug | not done | 2026-09-29 | none | no landing line names it |
| 1 | visual content | not done | 2026-09-25 | none | no landing line names it |
| 1 | activity iceberg | not done | 2026-10-13 | none | no landing line names it |
| 1 | merge finder | not done | 2026-09-30 | none | no landing line names it |
| 1 | dev bar | done | 2026-09-19 | `9d0ab6afa` | landing lines show dev bar UI with chat tab; DevBar shell/tools/css delivered with live chat feature |
| 1 | harness responsive | not done | 2026-09-28 | none | no landing line names it |
| 1 | dev shell | done | 2026-09-30 | `efa704f1e` | landing line 'Shell: four optional regions; dark dev shell on Ctrl+\' with shots of 400/1920/3440 delivered |
| 1 | element inspector | not done | 2026-10-03 | none | no landing line names it |
| 1 | dev server | partly (asked again) | 2026-10-04 | [mcp-site-tools](/framework/ai/sessions/2026/08/15/mcp-site-tools/) | asked again on 2026-10-04, after this landed on 2026-08-15. landing line shows POST /mcp with loopback, Socket |
| 1 | dictate structure | partly | 2026-09-22 | [dictation-playground](/framework/ai/sessions/2026/09/28/ccdca679-303e-4584-9809-8c4f79e29f42/dictation-playground/) | playground with tabs (Raw/Corrections/Live) and walkthrough landed; specific structure of 'test controls at to |
| 1 | dictation extension | partly | 2026-09-22 | [Dictate](/framework/ux/Dictate/) | recording workspace with list (movable sentence cards) and preview (Raw/Corrections/Live views) landed; 'separ |
| 1 | dictate card | done | 2026-09-24 | [overview-fix](/framework/ai/sessions/2026/09/25/overview-fix/overview-fix/) | landing line 'The Dictate card's Overview now shows 11 of 13 requests delivered' confirms dedicated card for d |
| 1 | dictation playground | done | 2026-09-28 | `417655d9` | landing line 'The dictation playground is live' with raw whisper, strike/add correction diffs, and live render |
| 1 | dictate microphone | not done | 2026-09-29 | none | landing line describes testing that dictation works, not implementation of permission prompts or error feedbac |
| 1 | dictate navigation | partly | 2026-09-29 | [Dictate](/framework/ux/Dictate/) | page exists with multiple working features (playground, surfaces, modes), but no explicit navigation structure |
| 1 | dictate performance | not done | 2026-09-29 | none | no landing line, git commit, or audit addresses slow 3s table loading |
| 1 | dictate correction | partly (asked again) | 2026-09-29 | [playground](/framework/ai/sessions/2026/09/28/ccdca679-303e-4584-9809-8c4f79e29f42/dictation-playground/playground/) | asked again on 2026-09-29, after this landed on 2026-09-28. dictation playground with Corrections tab shows ra |
| 1 | transcription clean | partly (asked again) | 2026-09-30 | `1dfb13c33` | asked again on 2026-09-30, after this landed on 2026-09-29. git commit '2026-09-29 Merge worktree/qf-6: clean  |
| 1 | dictation scope | not done | 2026-09-30 | none | no landing line, git commit, or audit addresses whether assistance should be global or directory-scoped |
| 1 | dictate scrolling | partly | 2026-10-01 | [dictate-fixes-2](/framework/ai/sessions/2026/10/05/dictate-fixes-2/dictate-fixes-2/) | box scrolling implemented (capped 2-3 lines), but smart autoscroll pinning to bottom until user scrolls up is  |
| 1 | dictate mode | done | 2026-10-01 | `efa7b4a54` | git commit '2026-10-01 Dictate merge 10: chat modes as presets (Dictate / Chat)' and 'Dictate To-do: one alway |
| 1 | directory tree | partly (asked again) | 2026-09-24 | [generator-export](/framework/ai/sessions/2026/08/31/generator-export/) | asked again on 2026-09-24, after this landed on 2026-08-31. landing shows generator exports real page.js direc |
| 1 | core page readme | done | 2026-09-29 | `7e3c10b23` | git commits 2026-10-13/2026-10-12 show core/Page doc structure with how-a-page-renders, binding.md, Template,  |
| 1 | dynamic routing | done | 2026-09-29 | `44afdc83b` | 2026-09-29 Servex dashboard: add a Docs tab routing; /docs/<path> routing implemented |
| 1 | docs clarity | done | 2026-09-29 | `03c4627f7` | 2026-10-09 documentation skill landed; multiple landing lines show docs rewritten to standard principles |
| 1 | docs reorganization | not done | 2026-09-30 | none | No landing line or commit names Servex-to-AI directory reorganization |
| 1 | decision docs | done | 2026-10-01 | `4dba60bff` | 2026-10-04 Dictate decisions; multiple landing lines and commits show decision documentation system with explo |
| 1 | scroll docs | partly | 2026-10-02 | `2e5129ea7` | Landing shows scroll tags in vocabulary, but commit from 2026-10-06 only retires scroll council item, not docu |
| 1 | confusion summary | not done | 2026-10-03 | none | No landing line or commit provides categorized confusion summary |
| 1 | ai subdirectory | not done | 2026-10-09 | none | No landing line or commit about AI subdirectory system purpose and integration |
| 1 | emoji guideline | not done | 2026-10-12 | none | No landing line or commit defines emoji guidelines |
| 1 | claude md response | done | 2026-10-12 | `7c30fc790` | 2026-10-12 CLAUDE.md: condense reply rules; commits and landing lines show response style rules documented |
| 1 | table content | partly (asked again) | 2026-10-13 | `9f6bf7ec0` | asked again on 2026-10-13, after this landed on 2026-10-03. 2026-10-03 core/Page content-list; multiple landin |
| 1 | node runtime docs | not done | 2026-09-23 | none | no landing line or commit names documentation on providing node runtime access to agents |
| 1 | page system docs | partly (asked again) | 2026-09-28 | [doc-system](/framework/ai/sessions/2026/08/15/doc-system/) | asked again on 2026-09-28, after this landed on 2026-08-15. landing line "ext/doc, and every framework module  |
| 1 | readme chain | done | 2026-09-29 | [readme-chain](/framework/ai/sessions/2026/09/29/readme-chain/readme-chain/) | landing line "readme_chain(dir): every directory-bound agent starts already knowing where it is" delivers the  |
| 1 | navigation docs | partly (asked again) | 2026-09-29 | [core-columns](/framework/ai/sessions/2026/09/24/core-columns/core-columns/) | asked again on 2026-09-29, after this landed on 2026-09-24. multiple landing lines (paging-audit-1b/2b, core-c |
| 1 | page ai docs | not done | 2026-09-29 | none | no landing line or commit names page-scoped AI systems architecture documentation |
| 1 | jsonl docs | partly (asked again) | 2026-09-29 | `5cd0f4fd5` | asked again on 2026-09-29, after this landed on 2026-09-24. commit "page.jsonl: demo log block wraps; docs for |
| 1 | reference system | not done | 2026-09-30 | none | no landing line or commit names keyword linking system using control characters |
| 1 | readme system | not done | 2026-09-30 | none | no landing line or commit names README reading protocol documentation in AI docs |
| 1 | readme compact | not done | 2026-10-09 | none | no landing line or commit names adoption of iceberg principle for documentation maintenance |
| 1 | pause event | not done | 2026-09-30 | none | commit shows plan only ("one-dictation-system plan:"), not implementation delivered |
| 1 | figma browser | done | 2026-10-12 | `c8bd9c436` | Landing line: 'UI library: three-column browser for ui and figma, specimen, padding contract' (2026-10-12) |
| 1 | figma flowchart | not done | 2026-10-13 | none | no landing line names it |
| 1 | figma structure | partly (asked again) | 2026-10-13 | `194b7d038` | asked again on 2026-10-13, after this landed on 2026-10-12. Landing line: 'Four new layouts from the July-2026 |
| 1 | figma demo | not done | 2026-10-13 | none | no landing line names it; only brief/planning commits exist |
| 1 | file output | done | 2026-10-13 | `c5a9864ba` | Landing line: 'SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on every row' (2026-10-13) co |
| 1 | framework design | done | 2026-09-30 | `2ef802860` | Landing line references /framework/design/ built as system documenting layout, color, navigation, content (202 |
| 1 | framework code | done | 2026-09-30 | `2ef802860` | Landing line references /framework/code/ built as system documenting HTML/CSS/JavaScript do's/don'ts (2026-09- |
| 1 | framework ui | done | 2026-09-30 | `c8bd9c436` | Multiple landing lines: DataGrid (2026-10-12), Style system with four grounds and one card, Sessions grid all  |
| 1 | framework docs | not done | 2026-10-01 | none | landing lines show general framework docs and doc system work but not SDK agent spawning/configuration documen |
| 1 | fan noise | not done | 2026-09-30 | none | no landing line names it |
| 1 | inbox rendering | not done | 2026-09-28 | none | no landing line names it; git commit mentions page-rendering brief but no actual implementation evidence |
| 1 | inbox chat | done | 2026-09-30 | `0e46ded05` | landing lines document merged chat/card systems; commit 0e46ded05 shows TimelineTalk merged into inbox timelin |
| 1 | inbox audit | done | 2026-09-30 | [task-audit](/framework/ai/sessions/2026/10/03/task-audit/task-audit/) | landing line shows task-audit pilot completed: 4 judges graded 5 tasks, consensus caught failures, system veri |
| 1 | inbox routing | not done | 2026-09-30 | none | no landing line names it |
| 1 | dictate bugs | not done | 2026-10-01 | none | no landing line names it |
| 1 | dictate oop architecture | done | 2026-10-05 | `2e237e3f8` | landing lines show VoiceStrip class architecture implemented (phases 1+2) and Whisper persistence fixed; multi |
| 1 | android chrome | not done | 2026-09-29 | none | evidence shows PWA setup and chrome terminology; ask was about opening links in Chrome Android browser—no impl |
| 1 | async mcp | not done | 2026-09-24 | none | no landing line names it |
| 1 | cloudflare tunnel | not done | 2026-10-01 | none | no landing line names it |
| 1 | directory mastermind | done | 2026-09-29 | `b5eada2ba` | landing lines document readme_chain(dir) built, directory-bound agents spawn with readme context; commits show |
| 1 | durable object | partly (asked again) | 2026-10-13 | [decision-data](/framework/ai/sessions/2026/09/04/decision-data/) | asked again on 2026-10-13, after this landed on 2026-09-04. Decision record settled: one Durable Object per UR |
| 1 | item id system | done | 2026-10-03 | `e8698c0d2` | Property.of(item, name) commit shows live Item binding; Item ID system clarified and in use |
| 1 | layout consolidation | not done | 2026-09-29 | none | no landing line names it |
| 1 | layout selection | partly (asked again) | 2026-09-29 | [designtool-ui-build](/framework/ai/sessions/2026/08/17/designtool-ui-build/) | asked again on 2026-09-29, after this landed on 2026-08-17. Framework shipped: layout tab is single readout, s |
| 1 | layout template | done | 2026-10-12 | `e7c73528b` | /framework/library/ browsable library with templates, sections, layouts collections landed |
| 1 | list sidebar design | done | 2026-10-12 | `d892f8b6d` | Figma briefs: two-column layouts page and Lists (TOC/sidebars/trees) page with variations |
| 1 | log validation | not done | 2026-09-30 | none | no landing line directly addresses validation layer for JSON-L logging |
| 1 | master assistant | done | 2026-09-19 | [skill-roles](/framework/ai/sessions/2026/09/19/skill-roles/) | Master assistant built with 43-line skill to supervise, opine, and audit fast assistant work |
| 1 | mastermind browser ui | partly (asked again) | 2026-09-24 | [ai-log-asks](/framework/ai/sessions/2026/09/17/ai-log-asks/) | asked again on 2026-09-24, after this landed on 2026-09-17. AI log with ask cards and v2 board enable browser  |
| 1 | mastermind loop optimization | partly | 2026-09-23 | [mastermind-skill](/framework/ai/sessions/2026/08/15/mastermind-skill/) | Skill built with wakeup cycle, but no evidence of idle-detection to prevent unnecessary polling when no activi |
| 1 | mastermind setup | not done | 2026-10-08 | none | no landing line names it |
| 1 | mastermind testing | not done | 2026-09-24 | none | no landing line names it |
| 1 | message condensation | not done | 2026-09-25 | none | no landing line names it |
| 1 | message cost tracking | partly (asked again) | 2026-10-04 | `bf5528ea2` | asked again on 2026-10-04, after this landed on 2026-10-03. commit bf5528ea2 lands message-cost with cost trac |
| 1 | message source | not done | 2026-10-03 | none | no landing line mentions detecting message source (PC vs mobile) from metadata |
| 1 | mobile ai button | partly | 2026-09-29 | `41d312562` | commit changes button text to ⋯ More, but repositioning to right and size reduction not documented |
| 1 | mobile ai response | not done | 2026-09-29 | none | Mobile sweep from August identified issues but no fix for transcription-only mobile dictate landing |
| 1 | mobile ip access | done | 2026-10-04 | `129c69a08` | commit 129c69a08 creates /framework/dev/mobile page documenting phone access via IP and port |
| 1 | mobile localhost | not done | 2026-09-29 | none | no landing line names enabling WiFi access via IP and port |
| 1 | mobile navigation | done | 2026-09-29 | `534858cf1` | commit 534858cf1 restores sidebar ☰ on mobile; landing line confirms feature complete |
| 1 | mobile rail | partly (asked again) | 2026-09-30 | `4d211868d` | asked again on 2026-09-30, after this landed on 2026-09-29. Mobile rail with 44px thumb targets landed; ChatPa |
| 1 | mobile session ui | not done | 2026-09-30 | none | no landing line names it |
| 1 | mobile ui kit | partly | 2026-10-12 | `24dfe75f4` | UI Kit components and mobile screens documented in Figma (24dfe75f4); browsable navigation unclear |
| 1 | port binding | not done | 2026-09-23 | none | no landing line documents port-binding issue or Servex auto-detection |
| 1 | process audit | not done | 2026-10-03 | none | skill-usage-audit landed; 'all active processes' audit not addressed |
| 1 | pump speed | not done | 2026-10-03 | none | reload speed ETag optimization landed; 'pump speed control' not addressed |
| 1 | quote styling | not done | 2026-10-03 | none | no landing line names it |
| 1 | real time logging | partly | 2026-10-03 | `15a5aa5cd` | Real-time sessions index/tailer (15a5aa5cd) delivered; 'page updates' logging tool not specified |
| 1 | remote control | not done | 2026-09-18 | none | no landing line names it |
| 1 | repo backup | done | 2026-10-13 | `39459acce` | Git commit 39459acce explicitly states backup to E: done |
| 1 | repo pruning | not done | 2026-10-13 | none | no landing line names it |
| 1 | response schema | not done | 2026-10-03 | none | no landing line names it |
| 1 | selective fixe | not done | 2026-10-09 | none | no landing line names it |
| 1 | send delay | done | 2026-09-30 | [send-delay](/framework/ai/sessions/2026/09/30/send-delay/send-delay/) | Mic send delay reduced from 2500ms to 1500ms with matching paragraph_pause adjustment |
| 1 | stop refinement | not done | 2026-10-09 | none | no landing line names it |
| 1 | streaming chat | not done | 2026-09-30 | none | no landing line names it |
| 1 | work audit | done | 2026-09-28 | [organization](/framework/ai/sessions/2026/09/28/e269b131-e2d2-4712-a88d-b243d631bd04/organization/) | 176 of 184 tasks audited and organized, mastermind audit completed across multiple sessions |
| 1 | mastermind auto review | partly (asked again) | 2026-09-29 | [mastermind-platform](/framework/ai/sessions/2026/09/04/mastermind-platform/) | asked again on 2026-09-29, after this landed on 2026-09-05. Mastermind review system implemented with clarity  |
| 1 | model update | done | 2026-09-25 | `b4d470464` | models-asks commit shows model updates with 27-task suite and models.md documentation added |
| 1 | qa system | partly (asked again) | 2026-09-25 | [screenshot-tool](/framework/ai/sessions/2026/08/17/screenshot-tool/) | asked again on 2026-09-25, after this landed on 2026-08-17. ScreenshotTool landed in ext/DesignTool/vision/ wi |
| 1 | usage audit | done | 2026-10-02 | [skill-prune](/framework/ai/sessions/2026/10/12/session-e36e227a/skill-prune/) | Skill prune audit landed with usage audit safe half, state documentation, and skill archiving |
| 1 | evaluation scoring | partly | 2026-10-03 | `de14646d2` | Core turns/scoring landed in review-turns commit, but Reviews view and collab-rounds deferred |
| 1 | catalog page | done | 2026-10-13 | `c016e9e1a` | Catalog page with demo preview cards, class cards, and instance-tree verdict delivered |
| 1 | paging summary | partly (asked again) | 2026-09-24 | [graduate-plan](/framework/ai/sessions/2026/09/06/graduate-plan/) | asked again on 2026-09-24, after this landed on 2026-09-06. Spacing audit and graduate-plan with six-word page |
| 1 | refine page | done | 2026-10-09 | [refine-haiku-live](/framework/ai/2026-10-12/refine-haiku-live/) | Refine runs on Haiku with live outline growth, unified chat input, under 100k tokens per call |
| 1 | youtube strategy | not done | 2026-10-13 | none | no landing line names it |
| 1 | queue statu | partly | 2026-10-03 | `143032ee3` | Asks ledger with queue statuses and reasons landed; token consumption and RAM constraints not addressed |
| 1 | socket routing | done | 2026-09-24 | `bf22ffdaf` | Socket routing with path-based channel determination and sessions query API with remote mode default landed |
| 1 | web search | partly (asked again) | 2026-10-01 | [research-ai](/framework/ai/sessions/2026/09/04/research-ai/) | asked again on 2026-10-01, after this landed on 2026-09-04. fal.ai research MVP landed, OpenRouter web search  |
| 1 | past work lookup | done | 2026-10-12 | `c5a9864ba` | Past work lookup skill and SessionIndex in-memory task index landed for searching previous work |
| 1 | weight visualization | not done | 2026-10-01 | none | no landing line names it |
| 1 | template versioning | not done | 2026-09-29 | none | no landing line names it |
| 1 | template class system | partly (asked again) | 2026-10-12 | [ux-mastermind](/framework/ai/sessions/2026/08/21/ux-mastermind/) | asked again on 2026-10-12, after this landed on 2026-08-21. ux/ tier with template classes landed; ui/ + ux/ v |
| 1 | template ranking | not done | 2026-10-12 | none | no landing line names it |
| 1 | test filtering | not done | 2026-09-22 | none | no landing line names it |
| 1 | test library | done | 2026-10-01 | `66dc58699` | 2026-10-01 commit: OpenRouter test library with five AITest pages, runs table, Phase 16 differentiation |
| 1 | ai testing | partly (asked again) | 2026-10-01 | [browser-driving](/framework/ai/sessions/2026/08/18/browser-driving/) | asked again on 2026-10-01, after this landed on 2026-08-18. AITest pages built with Playwright infrastructure; |
| 1 | livelist testing | done | 2026-10-02 | [list-events](/framework/ai/sessions/2026/10/03/list-events/list-events/) | List merged with LiveList; node test passes 39/39; smoke-tested live, headless, on five pages with events buil |
| 1 | playwright cleanup | done | 2026-10-03 | `3111ea48a` | 2026-10-03 commit: Lifecycle.js cleanup reaps orphaned chrome.exe by path; playwright process management added |
| 1 | oop tool | partly (asked again) | 2026-10-08 | [mastermind-shots](/framework/ai/sessions/2026/08/17/mastermind-shots/) | asked again on 2026-10-08, after this landed on 2026-08-17. ScreenshotTool exists and measured itself; wire.md |
| 1 | card transcription | done | 2026-09-22 | `045c5c097` | Commit adds POST /api/voice/card route, enabling per-card transcription |
| 1 | spatial layout | not done | 2026-09-18 | none | no landing line names it |
| 1 | live view | not done | 2026-09-20 | none | no landing line addresses hour-based sticky box removal or live/pause toggle |
| 1 | card ui | not done | 2026-09-20 | none | no landing line names it |
| 1 | text padding | partly (asked again) | 2026-09-22 | [padding-study](/framework/ai/sessions/2026/09/01/padding-study/) | asked again on 2026-09-22, after this landed on 2026-09-01. Padding study landed with 0%/0.5%/2%/5%/12%/30% la |
| 1 | terminal popup | done | 2026-09-28 | [hidden-windows](/framework/ai/sessions/2026/09/28/b42621ed-33f7-41f0-b19b-12c679306b9a/hidden-windows/) | Repository-wide guard implemented via Servex/hidden-launch.vbs, proven at 0 visible windows |
| 1 | fact suggestion | partly (asked again) | 2026-09-28 | [law-hierarchy](/framework/ai/sessions/2026/08/15/law-hierarchy/) | asked again on 2026-09-28, after this landed on 2026-08-15. CLAUDE.md now carries rule system: LAWS > RULES >  |
| 1 | decision tab | partly (asked again) | 2026-09-30 | [decisions-system](/framework/ai/sessions/2026/09/17/decisions-system/) | asked again on 2026-09-30, after this landed on 2026-09-17. Decision system built as claim tree with approve/i |
| 1 | clarity ui | not done | 2026-09-30 | none | no landing line shows confidence indicators or statement understanding measures; evidence shows UI readability |
| 1 | importance scoring | done | 2026-09-30 | `b17ea0945` | Commit adds importance() scoring to Needs you + Inbox |
| 1 | ui polish | partly | 2026-10-02 | `8824068fd` | sessions-tab-polish landed (empty bands, stat cards, dates, padding fixed) but the specific orange pill/resize |
| 1 | preview level | partly (asked again) | 2026-10-03 | `6123a53c4` | asked again on 2026-10-03, after this landed on 2026-10-02. Sessions tab establishes Panel2 preview levels; la |
| 1 | data map | partly | 2026-10-03 | `d1082f4d0` | Page-layout map created and inbox data structures (InboxSources map, Timeline data class) landed; Map vs objec |
| 1 | feedback signal | not done | 2026-10-05 | none | no landing line names it |
| 1 | view pattern | partly (asked again) | 2026-10-09 | `83b115b59` | asked again on 2026-10-09, after this landed on 2026-10-08. Commit states 'Patterns readme: attach the View af |
| 1 | direct answer | partly | 2026-10-09 | [card-replies](/framework/ai/sessions/2026/09/19/card-replies/) | Card replies with buttons and spend-gate mechanism landed to answer questions without agent intervention; cove |
| 1 | visual diff | done | 2026-10-12 | `47d297cbc` | Commit 'ext/Figma: Shots diffs the code against the frame'; landing doc describes site-diff tool that shoots 4 |
| 1 | ui kit docs | not done | 2026-10-13 | none | no landing line names it |
| 1 | recording workspace | done | 2026-09-22 | [record](/framework/ai/sessions/2026/09/22/session-36e558ed/record/) | Workspace live at /framework/ai/2026-09-22/record/ with record/playback/transcript workflow; auto-numbered tak |
| 1 | audio debugging | not done | 2026-09-22 | none | no landing line names it |
| 1 | voice detection | not done | 2026-10-01 | none | no landing line names it |
| 1 | voice refinement | done | 2026-10-03 | `c2e476af8` | git commit shows voice-assistants kinds named and refinement level ideas documented |
| 1 | push to talk | done | 2026-10-03 | `c25c5a394` | git commit shows site-wide push-to-talk dictation with hotkey manager and mic indicator |
| 1 | model switching | not done | 2026-10-12 | none | no landing line names it |
| 1 | ui mockup | not done | 2026-10-13 | none | no landing line names it |
| 1 | send behavior | not done | 2026-09-22 | none | no landing line names it |
| 1 | ask widget | done | 2026-09-17 | [next-chat-hitl](/framework/ai/sessions/2026/09/29/audio/audio/next-chat-hitl/) | landing line shows chat widget with marks, clarification cards, and selection |
| 1 | file widget | partly | 2026-09-25 | `0c8cc8358` | git commit documents HITL widgets but development incomplete; mastermind spawn not evidenced |
| 1 | feedback council | done | 2026-09-25 | [feedback-council](/framework/ai/sessions/2026/09/25/feedback-council/) | landing line shows feedback council spawned and running with 44 asks checked |
| 1 | quick fix tree | done | 2026-09-25 | [quickfix-worktrees](/framework/ai/sessions/2026/09/25/quickfix-worktrees/) | landing line shows warm worktree pool and smoke test before merge implemented |
| 1 | decision voting | not done | 2026-09-28 | none | no landing line names it |
| 1 | decision linking | done | 2026-09-28 | `13effda63` | commit documents decision file naming; landing line shows oo-census census ranking functions for class convers |
| 1 | decision auto accept | done | 2026-09-30 | `554e93ff7` | commit logs accepted decisions with reasons; landing lines show accept queue and workflow cards with real clic |
| 1 | focu pause | not done | 2026-09-30 | none | no landing line names it |
| 1 | blocker clarity | not done | 2026-09-30 | none | no landing line names it |
| 1 | dormant task | done | 2026-09-30 | `8eac438ea` | commit shows dormant agents reaped from ceiling and parent children; landing line shows board sorted active ab |
| 1 | code review process | partly (asked again) | 2026-10-03 | `23637d016` | asked again on 2026-10-03, after this landed on 2026-09-30. multiple landing lines document code review fixes  |
| 1 | async work | done | 2026-10-12 | `c61c3c0a4` | landing lines show autonomous style-system and refine-style tasks; commits and follow-ups show completed work  |
| 1 | planning stage | not done | 2026-10-12 | none | no landing line names it |

## How it was computed

- **Script:** [`Server/AskTally.mjs`](/Server/AskTally.mjs), steps `extract → asks → tally → group → verdicts → write → page`. Data: [asks-outcomes.jsonl](asks-outcomes.jsonl): one `feature` line per feature, one `ask` line per ask (raw → ask → kind → outcome → flags → the two confidences), and the `merge` lines.
- **Prompts:** what you typed in VS Code tabs, read from the raw transcripts on this machine (agent sessions keep only `[from: owner]` relays; pastes over 30k characters are skipped). Prompt text stays in the scratch dir; only the one-line asks are committed.
- **Asks:** Haiku 4.5 read the prompts in 20 chunks of about 35k tokens, newest first. For each ask it answered four flags, and the script turns them into `ask_clear = 0.5 + 0.25·names_thing − 0.2·hedged − 0.25·conflicts` and `outcome_clear = 0.5 + 0.25·names_result − 0.15·hedged − 0.25·conflicts − 0.1·(no named thing)`. Average: ask 0.59, outcome 0.63. Kinds: 472 commands, 205 questions, 182 directives.
- **Features:** Haiku mapped tags to a feature and an area, then grouped the asks inside each area. Some groups are still broad ("session system", "task system"), and their verdict can only be "partly".
- **Verdicts:** the script gathered evidence for each feature (task landing lines, git subjects since 09-10, [follow-up-full.md](follow-up-full.md), the asks ledger and the [10-08 audit](/framework/ai/sessions/2026/10/08/prompt-audit/prompt-audit/)), and Haiku judged it. Then a computed rule: a "done" whose landing is older than your last ask becomes "partly (asked again)". 57 features overlap the 10-08 audit, whose ledger statuses were part of the evidence, so nothing it covered was judged blind.
- **Spot-check:** 5/10 right from Haiku alone, 7/10 after the asked-again rule. 'done' errs toward an early landing (fixed by the asked-again rule); 'not done' errs toward a keyword miss, so treat a not-done as 'no evidence found', not as proof. Detail: [spotcheck.json](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/prompt-outcomes/spotcheck.json).
- **Cost:** 7.17 of Haiku for this run, plus $3.77 for a first extraction kept as a baseline.
- **Re-run:** each step caches in the scratch dir, so a re-run only pays for what changed.
