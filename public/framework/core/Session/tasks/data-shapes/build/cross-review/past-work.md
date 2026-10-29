<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Cross review  do the nine build branches fit together   read only  before integration 2 " (words: cros, review, nine, build, branch, fit, together, read, only, before, integration)

## Tasks (8, best first)
- 2026-10-25 [Build the session switcher in the dictate widget (also the mobile she…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-switcher/) — Round 2 landed: owner live-testing found the dropdown reflowed the header (huge in-flow list pushed the title/chips/v2-chip down, "vertically centered" on desktop). Rebuilt session_switcher() on ux/Popover.menu() (top-layer popover, built-in height cap + scro…
- 2026-10-16 [Salvage: unmerged branch audit, dup-bubbles already on dev](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) — Audit done; nothing needed merging. [audit.md](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/audit.md) Audit every branch: 422 checked, 239 fully merged, 183 ahead, 75 pure noise (listed, nothing deleted) Top 5 for a human look: page-extends-item, …
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-09-29 [readme_chain(dir): every directory-bound agent starts already knowing…](/framework/ai/sessions/2026/09/29/readme-chain/readme-chain/) — What landed — a fresh agent Servex spawns FOR a directory or a page now opens with the readme.md chain from the repo root down to it, in order, so it knows "where it is" before its first turn. readme_chain(dir) helper next to brief.js, root-down, trimmed to f… · paths 3/3 exist
- 2026-09-28 [Fresh-eyes review: a new agent checks every task before merge](/framework/ai/sessions/2026/09/28/b6fa1bc1-fad0-4bdd-9b20-8cd1cd20afb4/fresh-eyes-review/) — A fresh agent now reviews every task before it merges, sized by the diff — none / light (Sonnet) / full (Opus, with screenshots). Reviewed: 10 fixed, 2 declined — [review.md](/framework/ai/2026-09-28/fresh-eyes-review/review.md) Review built into the task sys…
- 2026-09-17 [imagine-rail](/framework/ai/sessions/2026/09/17/imagine-rail/) — Sorted the /imagine/ rail into four groups — tools, worlds, shapes, studies — zero urls moved, zero links broken. /imagine/page.js's own add() now stamps a .group on each child the instant it resolves; both the rail (column(), core's own method copied with tw…
- 2026-09-05 [spacing-components](/framework/ai/sessions/2026/09/05/spacing-components/) — The components read the ramps now, and the site-wide median gap at 3440 went 9.7px → 25.3px — growth 1.20× → 2.78×, on the same 84 pages with the same instrument that produced the 9.7px both rounds before it. 1280 moved 8.1px → 9.1px. Across all 84 pages at b… · paths 3/3 exist
- 2026-09-05 [ux-scenes](/framework/ai/sessions/2026/09/05/ux-scenes/) — Kept the lobby grid; the doors were the fix that mattered more than the numbers. The foyer's intro + staging() now wrap in .scene-lobby, a 3-column card (rail | stage | readout) that fires past 100em — an alternative from the approved docs three-region shape …

## Docs and readmes
- [past-work: look before you build](/framework/ai/skills/past-work/readme.md) — The owner (2026-10-12): "We don't want to set off and build something that's already been built, especially if it's stable and used everywh…
- [Content → layout: read this before you build a page](/framework/styles/layouts/catalog/doc/matching.md) — Pick the row that sounds like your content. Every layout is shown, ranked and counted on the [layout catalog](../page.js) (/framework/style…
- [What already existed — read before building](/framework/core/Page/weight/doc/prior.md) — Four things this task was told to check, one row each. | Found | What it is | How it differs from this task | |---|---|---| | [ai/audits/pa…
- [Framework (old) — the /framework/ home page as it stood bef…](/framework/old/readme.md) — Nothing was deleted when /framework/ was rebuilt into a wall of sections that reads straight from the sidebar's own tree — the old hero, li…
- [Review questions — every question a fresh reviewer asks, pe…](/framework/ai/review/readme.md) — The review skill asks nine systems of questions, in order: requirements, page structure, navigation, layout, sizing, wrapping, spacing and …
- [Finding past work before building (owner asks 1 to 3, 2026-…](/framework/ai/doc/owner-2026-10-17-finding-past-work.md) — What the owner asked, in plain words: work already done must be findable; the old prompts hold many asks that were never done; and before a…
- [Decisions — how --questions reads a questions.md file witho…](/framework/ai/review/doc/decisions.md) — ## A numbered line only counts as a question if it has a rule tag .claude/skills/review/SKILL.md's own "## Load first" section is a numbere…
- [Push-to-talk stream — Discord-style, local only](/framework/audio/v1/push-to-talk/readme.md) — PushToTalk opens a MicStream while its button (or Space) is held, and hands the raw MediaStream to whoever is listening through on_start(st…

## Sessions tagged with these words
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Dictate framework component](/framework/ai/sessions/2026/10/16/session-e99e8190/) — kind/owner model/sonnet work/read-only · $0.13

## Owner asks
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-10-13 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (?, queued)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,327 tokens of reading, under the 100k limit).

Question: Cross-review: do the nine build branches fit together? (read-only, before integration 2)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Cross-review: do the nine build branches fit together? (read-only, before integration 2)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
