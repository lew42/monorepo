<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Merge remote site and voice read aloud" (words: merge, remote, site, voice, read, aloud)

## Tasks (8, best first)
- 2026-10-24 [Day page: Approve a session, and Ready to merge](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/day-approve/) — The [day page](/framework/ai/2026-10-24/) now has an Approve button on each session and, on today's page, the Ready to merge list (51a321c39, 6978be3ea). approve a whole session with one press: session-e00f55c9 shows Approve on today's page ([shot](shots/2026…
- 2026-10-20 [merge-remote-voice](/framework/ai/sessions/2026/10/20/session-e00f55c9/merge-remote-voice/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/merge-remote-voice/requirements.md
- 2026-10-16 [Salvage: unmerged branch audit, dup-bubbles already on dev](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) — Audit done; nothing needed merging. [audit.md](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/audit.md) Audit every branch: 422 checked, 239 fully merged, 183 ahead, 75 pure noise (listed, nothing deleted) Top 5 for a human look: page-extends-item, …
- 2026-10-15 [Servex: file and shell tools for the voice app](/framework/ai/sessions/2026/10/16/voice-20261016/remote-tools/) — The voice app can read, write and edit files and run shell commands once Servex restarts. Six tools (read_file, write_file, edit_file, list_dir, glob, shell) sit in the one Servex tool registry, rooted at the monorepo or a named worktree; .jsonl writes are re…
- 2026-10-08 [Mobile setup page + mic/Whisper diagnosis: the gap is HTTPS on the LA…](/framework/ai/sessions/2026/10/08/mobile-voice-access/mobile-voice-access/) — What landed: a new page [/framework/dev/mobile/](/framework/dev/mobile/) — one screen, works/doesn't-work table first, then how to open the site on a phone and fix the mic. [findings.md](/framework/ai/2026-10-08/mobile-voice-access/findings.md) answers all 4 … · paths 2/2 exist
- 2026-10-20 [remote-site-tunnel](/framework/ai/sessions/2026/10/20/session-e00f55c9/remote-site-tunnel/) — (no outcome logged)
- 2026-10-20 [Sessions: record-only (cloud voice) sessions get a snapshot](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/cloud-sessions-listed/) — Cloud voice sessions now get a day-index snapshot, so the grid and dashboard can list them. snapshot for a record-only folder: AISessionIndex.record_snap() + load_records() + a watch on session.jsonl; test AISessionIndex.test.mjs passes grid kind chip cloud v… · paths 1/1 exist
- 2026-10-20 [voice-recite](/framework/ai/sessions/2026/10/20/session-e00f55c9/voice-recite/) — Read the AI's replies aloud: a local voice, a Recite playhead, barge-in (requirements.md) · paths 0/1 exist, gone: framework/audio/Recite/

## Docs and readmes
- [ai/merge — the "ready to merge" list and its Merge button](/framework/ai/merge/readme.md) — Page: [/framework/ai/merge/](/framework/ai/merge/). One card per branch an agent has marked ready; the owner's one decision per project is …
- [chrome](/framework/core/new/1/site/chrome/readme.md) — Part of the site demo. - Notes: [doc/chrome-notes.md](doc/chrome-notes.md) — history and lessons moved out of the code comments. ## Also he…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — > Superseded 2026-10-26 (the owner): a task now stays in the session that files it; a module folder only with an explicit home. Read [the r…
- [DevShell — Ctrl + \ opens a dark shell around the whole sit…](/framework/dev/DevShell/readme.md) — ## Use js /app.js import devshell from "./framework/dev/DevShell/DevShell.js"; render(){ …; devbar(this); devshell(this); }, // both mount;…
- [Mention — #Page and @owner become a small icon + the word, …](/framework/ext/Mention/readme.md) — #Page is a reference to a real thing on the site — a page, a module, a doc. @owner is a person or an agent role. Write either one in any ma…
- [Start — three files, no build step, a working site.](/framework/start/readme.md) — ## Index [example](./example/) — the smallest working site: index.html, app.js and a page.js, plus an About child (no readme yet) Code: sta…
- [Layers — the four cascade layers (base, theme, site, util),…](/framework/styles/layers/readme.md) — ## Index - [base](./base/) — the reset: ten rules that fix what the browser gets wrong (no readme yet) - [site](./site/) — the site's own s…
- [Voice — text to speech](/framework/audio/Voice/readme.md) — window.speechSynthesis is the whole engine — the browser's own built-in text-to-speech, the output half of the mic pair (Transcriber turns …

## Sessions tagged with these words
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79
- 2026/10/15 [Voice mastermind 2026-10-15](/framework/ai/sessions/2026/10/15/session-ec7470e9/) — kind/owner model/opus work/read-only task/voice-20261015 servex/voice · $4.27
- 2026/10/15 [Voice session 2026-10-15](/framework/ai/sessions/2026/10/15/session-dc8f60e1/) — kind/owner model/opus mod/ai/sessions task/voice-20261015 servex/remote-tools · $16.67
- 2026/10/15 [Remote full registry](/framework/ai/sessions/2026/10/15/session-d75b6d76/) — kind/agent model/sonnet work/read-only task/remote-full-registry servex/remote-tools · $0.14
- 2026/10/15 [Clarity voice session](/framework/ai/sessions/2026/10/15/session-cbce90d6/) — kind/agent model/sonnet work/read-only task/voice-20261015. framework/ai · $0.23
- 2026/10/15 [Voice MCP directives](/framework/ai/sessions/2026/10/15/session-92760713/) — kind/owner model/sonnet mod/servex task/voice-mcp-directives servex/remote-tools · $0.35

## Owner asks
- 2026-10-15 Servex remote MCP: voice-agent directives in the MCP server instructions + ask_mastermind… (?, queued)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, landed)
- 2026-10-12 38 voice/transcription asks tagged, plus realtime dictation tasks (mastermind-voice-to-session-page, routed)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,594 tokens of reading, under the 100k limit).

Question: Merge remote site and voice read-aloud

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Merge remote site and voice read-aloud"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
