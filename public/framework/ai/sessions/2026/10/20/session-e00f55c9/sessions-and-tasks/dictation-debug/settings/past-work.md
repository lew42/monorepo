<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation  a settings panel in the widget  Part 7 6 " (words: dictation, setting, panel, widget, part)

## Tasks (8, best first)
- 2026-10-02 [ext/panel2: header/main/footer chrome, drawer sides, split, dashboard…](/framework/ai/sessions/2026/10/02/panel2-sessions/panel2-sessions/part1-panel2/) — Panel2 shipped: header/main/footer, a grip split, a drawer side, a dashboard grid. new module, reuses only ext/grip header/main/footer; a side becomes a drawer under 34em header is a real toolbar (panel.header.append()), verified live Panel2.split(a, b, { axi… · paths 1/1 exist
- 2026-10-02 [panel2-sessions Part 2: AI Dashboard + Sessions tabs](/framework/ai/sessions/2026/10/02/panel2-sessions/panel2-sessions/part2-sessions-dashboard/) — Dashboard + Sessions tabs shipped on top of ext/panel2. Sessions tab: live, tagged (Servex/VS Code/CLI), newest first; click → prompts in order verified on the named VS Code session (361c4d18) after fixing a turnOrigin bug Dashboard tab: one Panel2, full-widt… · paths 1/1 exist
- 2026-09-30 [audio: three tools, one demo, one dictation widget](/framework/ai/sessions/2026/09/30/108a1b36-ed02-4728-bf82-20d7d7053d85/audio-consolidate/) — audio/ is three tools with one live demo, and one dictation widget runs the sheet, drawer and card pages. [/framework/audio/](/framework/audio/) · [/framework/ux/Dictate/](/framework/ux/Dictate/) · merged 5c1b7d15 ![](minion-audio/demo-live-1920.png) MicStrea… · paths 3/3 exist
- 2026-10-25 [Dictation: words stay in place, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/flicker/) — Dictation: words stay in place. Ready to merge: branch worktree/dictation-flicker (6 commits). Cause and proof: [doc/flicker.md](/framework/ux/Dictate/doc/flicker.md). reproduce the flicker: a pause emptied the words, then waited for refine and the send queue…
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-09-29 [audio/ done: index shows state, Transcriber sizes up top, Dictate/Par…](/framework/ai/sessions/2026/09/29/audio/audio/a-parts/) — Last phase landed (commit 3f155bc7, worktree/qf-6, not merged). ux/Dictate/variants/parts/ — Dictate rebuilt on MicStream + rolling-window Transcriber.Whisper, everything else (revise:, on_text, the log, the caption) inherited. v1 untouched; linked from the v… · paths 3/3 exist
- 2026-09-29 [ChatPanel: one chat widget for the drawer and the sheet, plus the uni…](/framework/ai/sessions/2026/09/29/audio/audio/c-chat/) — Landed. One ChatPanel (log + composer + mic) now builds both the desktop drawer's AI tab and the mobile ✦ sheet — [readme](/framework/ext/Chat/readme.md) · [live: v1 vs v2, small vs capped-and-scrolling](/framework/ext/Chat/panel/) · [universal-chat-line demo… · paths 2/2 exist
- 2026-09-29 [Audio: a library of audio parts, Revise levels, one chat widget](/framework/ai/sessions/2026/09/29/audio/audio/) — [/framework/audio/](/framework/audio/) is live: six audio parts, three demos, a steadier Whisper. [ux/Revise](/framework/ux/Revise/) cleans dictation at three levels. Two reviews: 5 fixed, 2 declined ([review.md](/framework/ai/2026-09-29/audio/review.md)). Ab… · paths 5/5 exist

## Modules that exist now (files outside the module that import it)
- [ext/Panel](/framework/ext/Panel/) — used by 24 files
- [ext/panel2](/framework/ext/panel2/) — used by 2 files
- [ui/panel](/framework/ui/panel/) — used by 11 files

## Docs and readmes
- [Widget — the one dictation widget, configured](/framework/ux/Dictate/doc/widget.md) — Widget.js is the ✦ sheet's own compact widget (a framed card: bubbles on top, a composer row — typed box, mic, Send — at the bottom) pulled…
- [Chat panel vs Dictate — the owner's composition idea (2026-…](/framework/ext/Chat/doc/panel-composition-2026-10-08.md) — Recorded from dictation; an open design question, not a decision. Check the built state of ext/Chat and the Dictate class before acting. - …
- [Chat architecture — one panel, one log, one composer, every…](/framework/ext/Chat/doc/architecture.md) — Chat is the widget for a conversation: a log of messages, a box to type or dictate into, and a drill-in sheet for a card's own conversation…
- [ChatPanel: design notes and removed commentary](/framework/ext/Chat/doc/ChatPanel-notes.md) — ## Panel naming and URL routing A stable name per panel on a page, in build order — the same on a reload, so a drilled-in url (#chat=panel-…
- [ext/Panel](/framework/audit/doc/ext-Panel.md) — Blender-style split chrome, built once and reused honestly: one Item subclass (Panel), one recursive view, and the persistence, drag and co…
- [Dictation, per page](/framework/core/Page/ai/doc/dictation.md) — The microphone lives in the drawer — [ext/drawer](/framework/ext/drawer/) — the same component on every page, opened with the same ☰ button…
- [Panels — splitting the height](/framework/core/Page/doc/panels.md) — The ask (2026-08-27): *"multi-panel — split the viewport's height into 2 vertical areas — and figure out how to get different areas to comm…
- [part-link: a block that points at a child page, and promote](/framework/core/Page/doc/part-link.md) — A content item that needs its own url becomes a child page; the parent keeps a card that links to it. Live: [/framework/core/Page/jsonl/par…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-e39150d7/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)
- 2026-10-18 Dictation: one configurable widget everywhere; widget first on the page (?, tracked)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)

## Commits
- d3a7497af dictation-2: brief for the settings panel (Part 7.6)
- c25c5a394 push-to-talk: site-wide push-to-talk dictation + a hotkey manager
- 2ef2f5a3c drawer-chat round 2: the composer is one real panel, not a box in a box
- 3b1e344db drawer-chat: one AI tab, a clear session header, and a real composer panel
- c8afb1408 dictation-stream: dictation grows a chat bubble, replies stream, clean-up really runs, assistants answer on s…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Dictation: a settings panel in the widget (Part 7.6)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation: a settings panel in the widget (Part 7.6)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
