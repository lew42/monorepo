# Addendum 3 findings (script-built)

## Does a Servex spawn read CLAUDE.md and the readme chain?
- `Servex/agents/Agents.js` line 947 passes `settingSources` only if the agent sets `setting_sources`. Unset: the SDK default applies, which I believe loads project settings (CLAUDE.md). Not tested by a run.
- `Servex/agents/Global.js` line 160 and `Servex/agents/Layers.js` line 635 set `setting_sources: []`, which turns CLAUDE.md loading OFF for those agents. Check which roles use them.
- Nothing in `Servex/agents` injects the readme chain; it relies on each agent following the CLAUDE.md instruction.

## Readmes over 100 lines (findings only, nothing edited): 24

| lines | readme |
|---|---|
| 590 | public/framework/core/new/1/readme.md |
| 388 | Servex/readme.md |
| 387 | public/framework/ai2/readme.md |
| 365 | public/framework/ux/Dictate/readme.md |
| 309 | Servex/ext/openrouter/readme.md |
| 289 | Servex/agents/readme.md |
| 282 | public/framework/core/Page/generator/readme.md |
| 273 | public/notes/auth/readme.md |
| 218 | public/framework/ai/v/3/readme.md |
| 209 | public/imagine/paging/readme.md |
| 177 | public/framework/ai/sessions/readme.md |
| 148 | public/imagine/codrops/readme.md |
| 125 | public/framework/ux/Dictate/playground/readme.md |
| 120 | public/imagine/paging/make/readme.md |
| 113 | public/framework/ext/DesignTool/diff/readme.md |
| 111 | public/framework/ext/files/readme.md |
| 109 | public/layouts/browse/readme.md |
| 109 | public/imagine/readme.md |
| 107 | public/framework/ui/readme.md |
| 106 | public/layouts/practice/readme.md |
| 105 | public/framework/core/Page/readme.md |
| 103 | public/layouts/labs/blogx/readme.md |
| 103 | public/imagine/blogx/readme.md |
| 103 | Servex/asks/readme.md |

## Queued
Focus pass on transcription (Whisper/Servex, Dictate, Chat) and prompt refinement with per-session short readmes by Haiku: not run. Refinement was already audited (11 rows at the top of `loose-ends.jsonl`).
