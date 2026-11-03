# The VS Code tab (servex-mastermind-opus): where things stand, 2026-09-29 ~8:30 PM

Session `361c4d18-e878-4c04-9537-444e847e13d5`. I route the owner's words to masterminds, launch what they dispatch, and fix small things. Every task logs itself (its own `ai/<date>/<slug>/task.jsonl`, plus its card). This file is my own map.

## Programs in flight

| program | owner (agent) | card |
|---|---|---|
| Page system (layout hub, navigation, jsonl, dynamic, ai, weight, switcher, fixed-height sweep) | task-mastermind-page-system-3 (queued; from checkpoint-2) | 2026/09/29/the-page-system-layout-navigation-new-pa |
| Each page.jsonl lists its own files | task-mastermind-page-files-log | same card |
| Audio library, Whisper class, seams and local agreement, revision levels, one chat widget, rename-by-voice | task-mastermind-audio (~260k; recycle soon) | 2026/09/29/audio-a-library-of-audio-parts-transcrip |
| Voice sessions (fast and smart per session, resume within 1h, titles, nav events, follow(path)) | task-mastermind-voice-sessions, task-mastermind-follow | same card |
| File system (File/Directory, /fs everywhere, a Files menu item, the mobile switcher) | task-mastermind-file-system | 2026/09/29/file-system-file-and-directory-objects-f |
| Item UI and object views | task-mastermind-item-ui | 2026/09/29/item-ui-and-object-views-icon-items-tree |
| Lifecycle reaper, nested tasks | task-mastermind-lifecycle, task-mastermind-nested-tasks | 2026/09/29/lifecycle-nothing-left-running-nested-ta |
| Resize grip, both axes and touch | task-mastermind-grip-everywhere (queued) | 2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom |
| System: the dispatch rows, the audit, naming, readme system, project-awareness | mastermind-servex-7 (launches rows itself; dispatch.md in ai/sessions/2026/09/24/1c09793f-74b6-4218-82e5-53e5cd88b659/servex-mastermind/) | many |

## Waiting on the owner
- The OpenRouter key: `%LOCALAPPDATA%\lew42\servex\openrouter.key` (card 2026/09/29/openrouter-key-for-the-harness-spike). A watcher launches the spike when it appears.

## Standing facts
- The phone uses the stray dev server at http://10.0.0.135:8137. Keep it until LAN access has a proper home.
- Memory is the bottleneck: keep about 5 working agents. Masterminds recycle from a checkpoint at about 200–250k.
- The owner's words are saved verbatim as `owner-words*.md` beside each brief (helper: scratchpad save-words.mjs, reading .claude/prompts/*.jsonl).
