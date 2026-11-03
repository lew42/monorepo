# Task migration: dry run, 2026-10-17 04:15 UTC

Root: `C:\Code\lew42\monorepo\public`. Script: [Server/TaskMigrate.mjs](/Server/TaskMigrate.mjs). Plan: [plan.md](plan.md).

**211 old tasks would get a module home** (0 already have one); 1445 stay in their session folder, each for the reason below. Nothing is deleted; each moved old file gains one line.

## Before and after

| | before | after |
|---|---|---|
| old tasks (ai/sessions task.jsonl) | 1656 | 1656 |
| old task lines | 42582 | 42793 (+1 `home` line per move) |
| module task folders (`<module>/tasks/<slug>/`) | 5 | 216 |
| homes in /tasks/ index | 5 | 74 |

## What happens to each old task

| action | tasks |
|---|---|
| stay: unclear: no signal | 573 |
| stay: unclear: one signal | 463 |
| stay: unclear: catch-all only | 304 |
| move | 211 |
| stay: active in the last 7 days | 61 |
| stay: unclear: signals disagree | 42 |
| stay: has subtask lines | 2 |

## Moves by module

| module | tasks | how the module was found |
|---|---|---|
| [ux/Dictate](/framework/ux/Dictate/) | 21 | brief 11, prefix 6, files+reqpath 3, files only, one module 1 |
| [styles](/framework/styles/) | 16 | files only, one module 11, files+reqpath 4, prefix 1 |
| [servex](/framework/servex/) | 16 | prefix 16 |
| [ai2](/framework/ai2/) | 13 | files+reqpath 11, files only, one module 2 |
| [core/Page](/framework/core/Page/) | 12 | prefix 5, files only, one module 4, files+reqpath 3 |
| [ai/v/3](/framework/ai/v/3/) | 12 | files+reqpath 11, files only, one module 1 |
| [ext/Panel](/framework/ext/Panel/) | 10 | files+reqpath 10 |
| [ext/AITask](/framework/ext/AITask/) | 8 | files+reqpath 6, files only, one module 2 |
| [dev/DevBar](/framework/dev/DevBar/) | 6 | files+reqpath 5, files only, one module 1 |
| [core/Page/generator](/framework/core/Page/generator/) | 6 | files+reqpath 4, files only, one module 2 |
| [ext/demo](/framework/ext/demo/) | 3 | files+reqpath 2, files only, one module 1 |
| [ext/catalog](/framework/ext/catalog/) | 3 | files+reqpath 3 |
| [core/Page/overview](/framework/core/Page/overview/) | 3 | files only, one module 3 |
| [servex/lifecycle](/framework/servex/lifecycle/) | 3 | prefix 2, files+reqpath 1 |
| [ext/drawer](/framework/ext/drawer/) | 3 | files+reqpath 1, files only, one module 1, prefix 1 |
| [ai/cards](/framework/ai/cards/) | 3 | prefix 3 |
| [ai/review](/framework/ai/review/) | 3 | prefix 2, files+reqpath 1 |
| [ext/panel2](/framework/ext/panel2/) | 3 | files+reqpath 2, prefix 1 |
| [ext/Refine](/framework/ext/Refine/) | 3 | prefix 2, files+reqpath 1 |
| [styles/layouts/space](/framework/styles/layouts/space/) | 2 | files only, one module 1, files+reqpath 1 |
| [dev/Socket](/framework/dev/Socket/) | 2 | files+reqpath 2 |
| [ext/layout](/framework/ext/layout/) | 2 | files+reqpath 1, files only, one module 1 |
| [ext/Draggable](/framework/ext/Draggable/) | 2 | files+reqpath 1, prefix 1 |
| [core/Sidebar](/framework/core/Sidebar/) | 2 | files only, one module 1, files+reqpath 1 |
| [ux/Dictate/playground](/framework/ux/Dictate/playground/) | 2 | files+reqpath 2 |
| [styles/layouts](/framework/styles/layouts/) | 2 | prefix 2 |
| [audio](/framework/audio/) | 2 | prefix 2 |
| [ext/Mention](/framework/ext/Mention/) | 2 | prefix 2 |
| [core/Item](/framework/core/Item/) | 2 | prefix 2 |
| [ext/editor](/framework/ext/editor/) | 1 | files only, one module 1 |
| [ext/tabs](/framework/ext/tabs/) | 1 | files+reqpath 1 |
| [ext/Doc](/framework/ext/Doc/) | 1 | files only, one module 1 |
| [ext/depth](/framework/ext/depth/) | 1 | files+reqpath 1 |
| [styles/layouts/home](/framework/styles/layouts/home/) | 1 | files+reqpath 1 |
| [ui/tree](/framework/ui/tree/) | 1 | files+reqpath 1 |
| [ux/Auth](/framework/ux/Auth/) | 1 | files+reqpath 1 |
| [ux/Course](/framework/ux/Course/) | 1 | files+reqpath 1 |
| [ux/Filter](/framework/ux/Filter/) | 1 | files+reqpath 1 |
| [ux/Wizard](/framework/ux/Wizard/) | 1 | files+reqpath 1 |
| [core/View](/framework/core/View/) | 1 | files+reqpath 1 |
| [styles/stacks](/framework/styles/stacks/) | 1 | files+reqpath 1 |
| [styles/layouts/cols](/framework/styles/layouts/cols/) | 1 | files+reqpath 1 |
| [core/new](/framework/core/new/) | 1 | files+reqpath 1 |
| [ext/Research](/framework/ext/Research/) | 1 | files only, one module 1 |
| [ext/Saver](/framework/ext/Saver/) | 1 | files+reqpath 1 |
| [ext/Omnibox](/framework/ext/Omnibox/) | 1 | files+reqpath 1 |
| [core/Layout](/framework/core/Layout/) | 1 | files+reqpath 1 |
| [core/Search](/framework/core/Search/) | 1 | files+reqpath 1 |
| [core/Section](/framework/core/Section/) | 1 | files+reqpath 1 |
| [ext/DesignTool/diff](/framework/ext/DesignTool/diff/) | 1 | files+reqpath 1 |
| [ui/controls](/framework/ui/controls/) | 1 | files+reqpath 1 |
| [ext/Ask](/framework/ext/Ask/) | 1 | files+reqpath 1 |
| [ext/toc](/framework/ext/toc/) | 1 | files+reqpath 1 |
| [ai/local](/framework/ai/local/) | 1 | files+reqpath 1 |
| [ext/Collab](/framework/ext/Collab/) | 1 | prefix 1 |
| [ux/Content/Disclosure](/framework/ux/Content/Disclosure/) | 1 | prefix 1 |
| [ext/Chat](/framework/ext/Chat/) | 1 | files only, one module 1 |
| [dev/mobile](/framework/dev/mobile/) | 1 | prefix 1 |
| [ux/Content/Decision](/framework/ux/Content/Decision/) | 1 | files only, one module 1 |
| [ext/grip](/framework/ext/grip/) | 1 | prefix 1 |
| [ux/Inbox](/framework/ux/Inbox/) | 1 | prefix 1 |
| [ai/health](/framework/ai/health/) | 1 | files+reqpath 1 |
| [ai/quick-fix](/framework/ai/quick-fix/) | 1 | files+reqpath 1 |
| [audio/Voice](/framework/audio/Voice/) | 1 | prefix 1 |
| [ux/Content/Object](/framework/ux/Content/Object/) | 1 | files+reqpath 1 |
| [core/Page/ext/Inbox](/framework/core/Page/ext/Inbox/) | 1 | prefix 1 |
| [ai/dashboard](/framework/ai/dashboard/) | 1 | files+reqpath 1 |
| [ext/DataGrid](/framework/ext/DataGrid/) | 1 | files+reqpath 1 |
| [core/Page/weight](/framework/core/Page/weight/) | 1 | files+reqpath 1 |
| [core/Router](/framework/core/Router/) | 1 | prefix 1 |
| [core/List](/framework/core/List/) | 1 | files+reqpath 1 |
| [core/Task](/framework/core/Task/) | 1 | prefix 1 |
| [ux/Hotkeys](/framework/ux/Hotkeys/) | 1 | prefix 1 |

## Moves by state in the new home

| state | tasks |
|---|---|
| complete (landed) | 180 |
| stopped: migrated, never landed (was running) | 31 |

## New module lists (69)

`/framework/ai/cards/tasks/` · `/framework/ai/dashboard/tasks/` · `/framework/ai/health/tasks/` · `/framework/ai/local/tasks/` · `/framework/ai/quick-fix/tasks/` · `/framework/ai/review/tasks/` · `/framework/ai/v/3/tasks/` · `/framework/ai2/tasks/` · `/framework/audio/tasks/` · `/framework/core/Item/tasks/` · `/framework/core/Layout/tasks/` · `/framework/core/List/tasks/` · `/framework/core/Page/ext/Inbox/tasks/` · `/framework/core/Page/generator/tasks/` · `/framework/core/Page/overview/tasks/` · `/framework/core/Page/tasks/` · `/framework/core/Page/weight/tasks/` · `/framework/core/Router/tasks/` · `/framework/core/Search/tasks/` · `/framework/core/Section/tasks/` · `/framework/core/Sidebar/tasks/` · `/framework/core/View/tasks/` · `/framework/core/new/tasks/` · `/framework/dev/DevBar/tasks/` · `/framework/dev/Socket/tasks/` · `/framework/dev/mobile/tasks/` · `/framework/ext/AITask/tasks/` · `/framework/ext/Ask/tasks/` · `/framework/ext/Chat/tasks/` · `/framework/ext/Collab/tasks/` · `/framework/ext/DataGrid/tasks/` · `/framework/ext/DesignTool/diff/tasks/` · `/framework/ext/Doc/tasks/` · `/framework/ext/Draggable/tasks/` · `/framework/ext/Mention/tasks/` · `/framework/ext/Omnibox/tasks/` · `/framework/ext/Panel/tasks/` · `/framework/ext/Research/tasks/` · `/framework/ext/Saver/tasks/` · `/framework/ext/catalog/tasks/` · `/framework/ext/demo/tasks/` · `/framework/ext/depth/tasks/` · `/framework/ext/drawer/tasks/` · `/framework/ext/editor/tasks/` · `/framework/ext/grip/tasks/` · `/framework/ext/layout/tasks/` · `/framework/ext/panel2/tasks/` · `/framework/ext/tabs/tasks/` · `/framework/ext/toc/tasks/` · `/framework/servex/lifecycle/tasks/` · `/framework/styles/layouts/cols/tasks/` · `/framework/styles/layouts/home/tasks/` · `/framework/styles/layouts/space/tasks/` · `/framework/styles/layouts/tasks/` · `/framework/styles/stacks/tasks/` · `/framework/styles/tasks/` · `/framework/ui/controls/tasks/` · `/framework/ui/tree/tasks/` · `/framework/ux/Auth/tasks/` · `/framework/ux/Content/Decision/tasks/` · `/framework/ux/Content/Disclosure/tasks/` · `/framework/ux/Content/Object/tasks/` · `/framework/ux/Course/tasks/` · `/framework/ux/Dictate/playground/tasks/` · `/framework/ux/Dictate/tasks/` · `/framework/ux/Filter/tasks/` · `/framework/ux/Hotkeys/tasks/` · `/framework/ux/Inbox/tasks/` · `/framework/ux/Wizard/tasks/`

## Refused: slug clashes


## Sample moves (first 25)

| old folder | new home | title | signals |
|---|---|---|---|
| [14/framework-clock](/framework/ai/sessions/2026/08/14/framework-clock/) | [ext/Panel/tasks/framework-clock](/framework/ext/Panel/tasks/framework-clock/) | framework-clock | files=ext/Panel, reqpath=ext/Panel |
| [15/devbar-fouc](/framework/ai/sessions/2026/08/15/devbar-fouc/) | [dev/DevBar/tasks/devbar-fouc](/framework/dev/DevBar/tasks/devbar-fouc/) | devbar-fouc | files=dev/DevBar, reqpath=dev/DevBar |
| [15/editor-controls](/framework/ai/sessions/2026/08/15/editor-controls/) | [ext/editor/tasks/editor-controls](/framework/ext/editor/tasks/editor-controls/) | editor-controls | files=ext/editor |
| [15/fix-split-screen-layout](/framework/ai/sessions/2026/08/15/fix-split-screen-layout/) | [ext/demo/tasks/fix-split-screen-layout](/framework/ext/demo/tasks/fix-split-screen-layout/) | Fix split screen layout | files=ext/demo, reqpath=ext/demo |
| [15/layout-hunt](/framework/ai/sessions/2026/08/15/layout-hunt/) | [dev/DevBar/tasks/layout-hunt](/framework/dev/DevBar/tasks/layout-hunt/) | layout-hunt — requirements | files=dev/DevBar, reqpath=dev/DevBar |
| [15/link-layout-space](/framework/ai/sessions/2026/08/15/link-layout-space/) | [styles/layouts/space/tasks/link-layout-space](/framework/styles/layouts/space/tasks/link-layout-space/) | link-layout-space | files=styles/layouts/space |
| [15/mcp-site-tools](/framework/ai/sessions/2026/08/15/mcp-site-tools/) | [dev/Socket/tasks/mcp-site-tools](/framework/dev/Socket/tasks/mcp-site-tools/) | mcp-site-tools | files=dev/Socket, reqpath=dev/Socket |
| [15/panel-ui-overhaul](/framework/ai/sessions/2026/08/15/panel-ui-overhaul/) | [ext/Panel/tasks/panel-ui-overhaul](/framework/ext/Panel/tasks/panel-ui-overhaul/) | panel-ui-overhaul | files=ext/Panel, reqpath=ext/Panel |
| [15/tabs-catch-fix](/framework/ai/sessions/2026/08/15/tabs-catch-fix/) | [ext/tabs/tasks/tabs-catch-fix](/framework/ext/tabs/tasks/tabs-catch-fix/) | tabs-catch-fix | files=ext/tabs, reqpath=ext/tabs |
| [15/wire-reference](/framework/ai/sessions/2026/08/15/wire-reference/) | [dev/Socket/tasks/wire-reference](/framework/dev/Socket/tasks/wire-reference/) | wire-reference | files=dev/Socket, reqpath=dev/Socket |
| [16/ai-dashboard-dated-list](/framework/ai/sessions/2026/08/16/ai-dashboard-dated-list/) | [ext/AITask/tasks/ai-dashboard-dated-list](/framework/ext/AITask/tasks/ai-dashboard-dated-list/) | Redesign the ai board as a dated list | files=ext/AITask, reqpath=ext/AITask |
| [16/devbar-blockreload](/framework/ai/sessions/2026/08/16/devbar-blockreload/) | [dev/DevBar/tasks/devbar-blockreload](/framework/dev/DevBar/tasks/devbar-blockreload/) | devbar — $BLOCKRELOAD checkbox + ✕ hard right | files=dev/DevBar, reqpath=dev/DevBar |
| [16/devbar-grip-offscreen](/framework/ai/sessions/2026/08/16/devbar-grip-offscreen/) | [dev/DevBar/tasks/devbar-grip-offscreen](/framework/dev/DevBar/tasks/devbar-grip-offscreen/) | devbar-grip-offscreen | files=dev/DevBar, reqpath=dev/DevBar |
| [16/devbar-grip-scrollbar](/framework/ai/sessions/2026/08/16/devbar-grip-scrollbar/) | [dev/DevBar/tasks/devbar-grip-scrollbar](/framework/dev/DevBar/tasks/devbar-grip-scrollbar/) | devbar-grip-scrollbar | files=dev/DevBar |
| [16/improve-space-page](/framework/ai/sessions/2026/08/16/improve-space-page/) | [styles/layouts/space/tasks/improve-space-page](/framework/styles/layouts/space/tasks/improve-space-page/) | Improve `/framework/styles/layouts/space/` | files=styles/layouts/space, reqpath=styles/layouts/space |
| [17/ai-rail](/framework/ai/sessions/2026/08/17/ai-rail/) | [ext/AITask/tasks/ai-rail](/framework/ext/AITask/tasks/ai-rail/) | The `/framework/ai/` rail takes too much, and stacks wrong | files=ext/AITask, reqpath=ext/AITask |
| [17/css-skill](/framework/ai/sessions/2026/08/17/css-skill/) | [styles/tasks/css-skill](/framework/styles/tasks/css-skill/) | css-skill | files=styles, reqpath=styles |
| [17/devbar-structure](/framework/ai/sessions/2026/08/17/devbar-structure/) | [dev/DevBar/tasks/devbar-structure](/framework/dev/DevBar/tasks/devbar-structure/) | DevBar `structure` section | files=dev/DevBar, reqpath=dev/DevBar |
| [17/ext-doc-rename](/framework/ai/sessions/2026/08/17/ext-doc-rename/) | [ext/Doc/tasks/ext-doc-rename](/framework/ext/Doc/tasks/ext-doc-rename/) | ext-doc-rename | files=ext/Doc |
| [17/panel-simplify](/framework/ai/sessions/2026/08/17/panel-simplify/) | [ext/Panel/tasks/panel-simplify](/framework/ext/Panel/tasks/panel-simplify/) | panel-simplify | files=ext/Panel, reqpath=ext/Panel |
| [17/port-fly-depth-resume](/framework/ai/sessions/2026/08/17/port-fly-depth-resume/) | [ext/depth/tasks/port-fly-depth-resume](/framework/ext/depth/tasks/port-fly-depth-resume/) | Port fly, build a 3D scroll widget, ship /resume/ | files=ext/depth, reqpath=ext/depth |
| [17/tab-bar-mobile](/framework/ai/sessions/2026/08/17/tab-bar-mobile/) | [ext/catalog/tasks/tab-bar-mobile](/framework/ext/catalog/tasks/tab-bar-mobile/) | Tab bar mobile fix | files=ext/catalog, reqpath=ext/catalog |
| [17/task-status](/framework/ai/sessions/2026/08/17/task-status/) | [ext/AITask/tasks/task-status](/framework/ext/AITask/tasks/task-status/) | Make a task page say where it is right now | files=ext/AITask, reqpath=ext/AITask |
| [18/figma-home](/framework/ai/sessions/2026/08/18/figma-home/) | [styles/layouts/home/tasks/figma-home](/framework/styles/layouts/home/tasks/figma-home/) | Minion A — the owner's homepage, desktop AND mobile, one responsive im | files=styles/layouts/home, reqpath=styles/layouts/home |
| [18/panel-document](/framework/ai/sessions/2026/08/18/panel-document/) | [ext/Panel/tasks/panel-document](/framework/ext/Panel/tasks/panel-document/) | panel-document — a workspace that is a scrolling document of sections, | files=ext/Panel, reqpath=ext/Panel |

## Unclear, sample (stay; a later run or a person decides)

| old folder | reason | signals |
|---|---|---|
| [12/layouts](/framework/ai/sessions/2026/08/12/layouts/) | unclear: one signal | reqpath=core/Page |
| [12/stage](/framework/ai/sessions/2026/08/12/stage/) | unclear: one signal | reqpath=ext/demo |
| [14/ai-dashboard](/framework/ai/sessions/2026/08/14/ai-dashboard/) | unclear: one signal | files=ext/AITask |
| [14/ai-page](/framework/ai/sessions/2026/08/14/ai-page/) | unclear: one signal | files=ext/Timeline |
| [14/board-smoke](/framework/ai/sessions/2026/08/14/board-smoke/) | unclear: one signal | reqpath=ext/AITask |
| [14/board-start](/framework/ai/sessions/2026/08/14/board-start/) | unclear: signals disagree | files=ext/AITask, reqpath=ext/Ask |
| [14/browser-cli-bridge](/framework/ai/sessions/2026/08/14/browser-cli-bridge/) | unclear: signals disagree | files=ext/Ask, reqpath=dev/Socket |
| [14/dev-toolbar](/framework/ai/sessions/2026/08/14/dev-toolbar/) | unclear: one signal | files=dev/DevBar |
| [14/efforts](/framework/ai/sessions/2026/08/14/efforts/) | unclear: one signal | files=ext/AITask, reqpath=ai |
| [14/jsonl](/framework/ai/sessions/2026/08/14/jsonl/) | unclear: one signal | files=ext/JSONL, reqpath=ai |
| [14/layout-space](/framework/ai/sessions/2026/08/14/layout-space/) | unclear: one signal | files=styles/layouts/space |
| [14/vision-sonnet](/framework/ai/sessions/2026/08/14/vision-sonnet/) | unclear: one signal | reqpath=styles/layouts |
| [15/board-active-first](/framework/ai/sessions/2026/08/15/board-active-first/) | unclear: one signal | files=ext/AITask |
| [15/devbar-ai](/framework/ai/sessions/2026/08/15/devbar-ai/) | unclear: one signal | files=dev/DevBar, reqpath=ai |
| [15/doc-system](/framework/ai/sessions/2026/08/15/doc-system/) | unclear: one signal | reqpath=audit |
| [15/generated-panels](/framework/ai/sessions/2026/08/15/generated-panels/) | unclear: one signal | files=ext/Panel |
| [15/ledger-hooks](/framework/ai/sessions/2026/08/15/ledger-hooks/) | unclear: one signal | files=ext/AITask, reqpath=ai |
| [15/live-streaming](/framework/ai/sessions/2026/08/15/live-streaming/) | unclear: one signal | files=ext/JSONL |
| [15/mastermind-skill](/framework/ai/sessions/2026/08/15/mastermind-skill/) | unclear: one signal | files=styles/layouts/400 |
| [15/saver-panel-error-paths](/framework/ai/sessions/2026/08/15/saver-panel-error-paths/) | unclear: one signal | files=ext/Saver |

## Rehearsal on a full copy (before this report)

The same script ran `--apply` on a copy of every file it reads or writes in the real tree (6,772 files: every old `task.jsonl` and `requirements.md`, every `readme.md`, `files.jsonl` and `tasks/` folder):

- ✅ **211 tasks written, round-trip check: 211 checked, 0 problems.** Every old folder points to its home, every home names its old folder, each old file is its original bytes plus one line, and the replayed title, state, completion time, outcome, commits and session match.
- ✅ **A second `--apply` wrote nothing** (0 tasks; every count unchanged).
- ✅ Replaying the `/tasks/` index over the copy: 74 module lists, 216 tasks (180 complete, 31 stopped as "migrated: never landed", 5 that were already there).
- ⚠️ 2 new lists (`dev/mobile/tasks/`, `core/Page/ext/Inbox/tasks/`) sit under folders their parent's `files.jsonl` does not list, so `TaskHomes.mjs`'s walk misses them; they are still in the `/tasks/` index, which is what the pages read.
- Tests: `node --test Server/TaskMigrate.test.mjs`, 9 of 9 pass (dry run writes nothing, apply, original times, rerun is a no-op, a cut-short run is repaired, both clash refusals, a rewritten old file is caught).

**The real run** (waits for voice-app): `node Server/hold.mjs on "task-migrate"`, `node Server/TaskMigrate.mjs --apply` in the main tree, which ends with the check, then `hold off` and one commit. Undo is `git revert` of that commit.
