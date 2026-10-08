# mastermind-servex-4: checkpoint, 2026-09-29 about 16:20

Start as **mastermind-servex-5**: load the `servex-mastermind` skill, read this, then the last 15 lines of `task.jsonl` here. Every launch line is in `ai/2026-09-25/servex-mastermind/dispatch.md` (rows 15–34, and the **ORDER NOW** row).

## First: the two safety fixes were never launched

| Row | Task | Why it's first |
|---|---|---|
| 28 | restart-outside-tree | `sustain.mjs --restart` run from an agent's shell sits inside Servex's process tree, so it kills every agent and leaves the old Servex running (09-28 13:44, 09-29 13:27) |
| 29 | node-modules-guard | Servex crash-looped from 13:53 to 15:02. I unlinked 5 old `node_modules` junctions into the main tree; the cause at 13:46 isn't proven yet |

At 16:10 we were at the cap (8 working, 4.9 GB free). Launch 28 and 29 as soon as prompt-refine or module-experts lands. If the VS Code tab hasn't launched them by then, spawn them yourself (no work in limbo).

**Until 28 lands, restart Servex only from outside its tree**, never by running `sustain --restart` in a shell:
```powershell
$si = New-CimInstance -ClassName Win32_ProcessStartup -ClientOnly -Property @{ShowWindow=[uint16]0}
Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{CommandLine='cmd.exe /c ""C:\Program Files\nodejs\node.exe" Servex\sustain.mjs --restart --force > "%LOCALAPPDATA%\lew42\servex\restart-outside.log" 2>&1"'; CurrentDirectory='C:\Code\lew42\monorepo'; ProcessStartupInformation=$si}
```
**Waiting on me for a restart:** page-system (after its create_page merge) and module-experts (after its merge, ETA about 16:25). Both promised to message the Servex mastermind rather than restart Servex themselves.

## Owed to agents
- **page-system** (top priority, Opus): new-page = BOTH (create_page does the steps, the skill keeps the judgement); agreed. It needs module-experts' merge (core/Page/readme.md, layout/) before its readme and layout work.
- **Relays:** task masterminds can't message each other (the fix is added to tooling-gaps, row 15). Relay between them until that lands.

## Done today (cards have the detail)
| What | Where |
|---|---|
| Why the paid tasks never landed | card why-yesterday-s-paid-tasks-never-landed |
| Heartbeat design review (5 changes), task-loop-2 landed | Servex/Heartbeat.js; opt-in since 09-29 13:00 |
| OpenRouter program: plan, brain, decide-tool, docs tab (landed) | card openrouter-brain-a-knowledge-base-that-o |
| The key Question plus the spike brief, both arms and a control table | card openrouter-key-for-the-harness-spike; row 20 fires when `%LOCALAPPDATA%\lew42\servex\openrouter.key` exists |
| System audit (3 Sonnet minions) | card system-audit-skills-tools-handover-loose |
| Skills: research §0, no limbo, keep viable versions, review on landing, experiments, readme = curated context, relay via refine.mjs, no Monitor polling, naming skill, the Servex mastermind may spawn audit minions | commit 3129b5aa, plus later uncommitted edits to servex-mastermind/SKILL.md (mine: commit them by exact path) |
| Folded into briefs | task-placement Part 2 (sessions known to their page, built on readme_chain); tooling-gaps (pool reclaim, task-mastermind messaging); readme-system (31); node-reliability (32); naming-skill (33); assistant-front (34, in design.md) |

## Ready to dispatch, in order
28 and 29 (safety) → 30 (resume needs-you, layout-explorer, prompt-refine and decide-tool, if still unlanded) → 31 readme-system → 32 node-reliability (its dispatch queue replaces the hand-read table) → 33 naming-skill → 34 assistant-front → 15 tooling-gaps → 16 task-placement. Never launched: 27 sidebar-structure-study (its brief is the card's owner words). Unlanded and never resumed: recursive-pairs ($29), waiting-on-you ($14), check-consensus.

## Lessons
- Check every dispatch row by its task dir, not by memory: 6 rows sat unlaunched for hours.
- A restart only counts when the pid changes: read `servex.pid.json` and sustain.log.
- list_agents is over 600k characters. Read `curl -s http://127.0.0.1:8090/agents` with a node filter instead.
- mastermind-servex-3 is still registered and idle. Stop it once you're up; it has no children.

## Added after writing: page-system ↔ item-ui (relayed 16:30)
- item-ui owns the one line `Page.track(this)` in core/Page/Page.class.js, and the new module core/Page/object.js (`page_object(page)`).
- page-system's layout minion adds the call in core/Page/page.js once object.js is on michael/dev. item-ui tells page-system when it is, and sends the import path of its default object view (for minion-page-ai in core/Page/ai/).
- item-ui confirmed: default view at /framework/ux/Content/Object/DefaultView.js (`view(thing)`: Thing.View, else DefaultView); page_object(page) in core/Page/object.js. It will say when both are on michael/dev; relay that to page-system.
- Heartbeat revives a landed task whose landed_at is a bare top-level line (minion-audit-tools, stopped). Fix is in node-reliability (row 32); a one-line Heartbeat.js tolerance is worth doing sooner.

## Owner corrections, about 4:20 PM (relayed by servex-mastermind-opus)
- Assistant in front of a session = a **chat room**: the assistant and the session both get every message, raw text included, and both reply. design.md is updated; launch line 34 builds that.
- **servex-docs-tab is frozen** (what landed stays; don't resume it). The OpenRouter brain's docs move under /framework/servex/openrouter/: launch line 35.

## 16:14 onward
- Restarted Servex from outside the tree for module-experts (ask_expert, list_experts, load_module, readme_modules are live). module-experts LANDED (71216b9b): the Page expert is built ($0.04 an ask), and the task cost $15.12 against a $10 budget. page-system owns core/Page/readme.md and layout/ now. Its create_page merge will need another outside-the-tree restart.

