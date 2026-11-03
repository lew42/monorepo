<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Chat drawer  the Docs split resets  and Chat v2 cards get room" (words: chat, drawer, doc, split, reset, card, get, room)

## Tasks (8, best first)
- 2026-09-30 [Chat widget: select, rename, ✓/? marks, clarification cards](/framework/ai/sessions/2026/09/29/audio/audio/next-chat-hitl/) — The chat widget now marks each sentence ✓ or ?, asks "did you mean A or B?", and renames a tapped card by dropdown. ![](chat-finish/shots/3b-drawer-ai-marks-1920.png) ✓/? after each sentence: [panel 400](chat-finish/shots/1-panel-marks-400.png), [drawer 1920]… · paths 3/3 exist
- 2026-10-05 [Voice cards: types, amend, icon chip, proposals, model-switch context](/framework/ai/sessions/2026/10/05/voice-chat-cards-and-model-context/) — Proposal written: voice cards and model-switch context ([report](/framework/ai/2026-10-05/voice-chat-cards-and-model-context/report.md)) card types: 5 picker types + the line kinds, report §2 amending a card: every part can be amended except a message, so the…
- 2026-10-02 [ext/panel2: header/main/footer chrome, drawer sides, split, dashboard…](/framework/ai/sessions/2026/10/02/panel2-sessions/panel2-sessions/part1-panel2/) — Panel2 shipped: header/main/footer, a grip split, a drawer side, a dashboard grid. new module, reuses only ext/grip header/main/footer; a side becomes a drawer under 34em header is a real toolbar (panel.header.append()), verified live Panel2.split(a, b, { axi… · paths 1/1 exist
- 2026-10-02 [The card pipeline: every major ask gets a readable card, by node](/framework/ai/sessions/2026/10/03/card-pipeline/card-pipeline/) — Every major ask now gets a real card, written by code — the owner's dashboard explains why each score is what it is. Ask -> card, by node: is_major()/ensure_card() on every 60s tick. 3 of today's 4 named asks got a real card just now; the 4th already had one.… · paths 2/5 exist, gone: framework/ai2/2026/10/02/page-extends-item-one-set-persistence-in/ framework/ai2/2026/10/02/ext-panel2-header-toolbar-main-with-side/ framework/ai2/2026/10/02/ai-system-docs-the-system-tab-now-explai/
- 2026-10-01 [The Dictate page becomes the workbench: chat() demo, keep option, int…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-workbench/) — The main Dictate demo is now a real, answered chat() mount — the same call every surface uses. item 1 — demo is a chat() mount, Widget options (level/source/debug) pass through: shot dictate-demo-1920.png item 2 — keep option added (true = global ✦ session, f… · paths 1/2 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-10-01 [Dictate page: the workbench chat, answered, with modes](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/) — The Dictate page's demo is the one chat every sidebar uses, now answered. [Open it](/framework/ux/Dictate/). ![](shots/followup-modes-1920.png) live guess no longer covers text; box full width, Send below: [shot](shots/followup-join-400.png) someone listens (… · paths 1/2 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-10-01 [Card replies can target one specific earlier line, threaded](/framework/ai/sessions/2026/10/01/card-threaded-replies/card-threaded-replies/) — A reply can now be tied to one specific earlier thing said on a card, nested under it instead of landing at the flat bottom of the chat. card_reply(card, text, from, re) — re names the id of the prompt or reply it answers; every message now gets an id. Servex… · paths 4/5 exist, gone: framework/ai2/doc/cards/

## Modules that exist now (files outside the module that import it)
- [core/doc](/framework/core/doc/) — used by 0 files, no readme
- [ext/Chat](/framework/ext/Chat/) — used by 13 files
- [ext/CSSDoc](/framework/ext/CSSDoc/) — used by 2 files
- [ext/Doc](/framework/ext/Doc/) — used by 21 files
- [ext/drawer](/framework/ext/drawer/) — used by 16 files
- [ui/card](/framework/ui/card/) — used by 23 files

## Docs and readmes
- [Drill in: open a chat card as its own small page](/framework/ext/Chat/doc/drill.md) — Tap a card in the chat, then its Open ⤢ button. The chat becomes a small shell: a ← Back button, the path above you, the card's title, and …
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [Chat architecture — one panel, one log, one composer, every…](/framework/ext/Chat/doc/architecture.md) — Chat is the widget for a conversation: a log of messages, a box to type or dictate into, and a drill-in sheet for a card's own conversation…
- [ChatPanel: design notes and removed commentary](/framework/ext/Chat/doc/ChatPanel-notes.md) — ## Panel naming and URL routing A stable name per panel on a page, in build order — the same on a reload, so a drilled-in url (#chat=panel-…
- [Selecting an element, and asking about it](/framework/ext/drawer/doc/select.md) — ![A paragraph selected on the page, and its properties in the drawer's Element tab](/framework/ext/drawer/doc/select.png) Turn on inspect m…
- [Card types and the task lifecycle — the owner's vocabulary,…](/framework/ext/Refine/doc/card-types.md) — Recorded so the intent survives chat (CLAUDE.md, law 5). The owner dictated this in the Claude mobile app on 2026-10-16 while flipping thro…
- [chat.js — one chat box, one conversation, every surface](/framework/ux/Dictate/doc/chat.md) — Before this file, every place that showed a chat box on the site — the mobile ✦ sheet, the desktop ☰ drawer's AI tab, a card's own sidebar,…
- [Widget — the one dictation widget, configured](/framework/ux/Dictate/doc/widget.md) — Widget.js is the ✦ sheet's own compact widget (a framed card: bubbles on top, a composer row — typed box, mic, Send — at the bottom) pulled…

## Sessions tagged with these words
- 2026/10/13 [Architecture documentation for ext/Chat](/framework/ai/sessions/2026/10/13/session-61d11498/) — kind/owner model/haiku mod/ext/chat task/mastermind-repo-slim docs/architecture · $0.26
- 2026/10/13 [Drawer architecture documentation](/framework/ai/sessions/2026/10/13/session-32afe0f6/) — kind/owner model/haiku mod/ext/drawer mod/ai/sessions task/mastermind-repo-slim docs/architecture · $0.30
- 2026/10/15 [Clarity live post](/framework/ai/sessions/2026/10/15/session-e9ea50e3/) — kind/agent model/sonnet work/read-only task/live-post page/live-cards · $0.14
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14
- 2026/10/15 [Live cards](/framework/ai/sessions/2026/10/15/session-b14b29a8/) — kind/owner model/sonnet mod/ext/markdown task/live-cards page/live-cards · $3.09
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-9e1dd563/) — kind/agent model/sonnet work/read-only task/usage-pace-line docs/usage · $0.14

## Owner asks
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)

## Commits
- 9560c6c24 ext/drawer: the dock opened after the page takes the chat; the page gets it back when the dock shuts
- e3be0f0b7 ext/drawer: the sheet, the dock and the routed AIPage share one chat and one feed
- 50c45e71b sheet step 5: the route <path>/ai/, class AIPage extends Page
- d0c6b6691 one-dictation: the fast assistant refines each owner utterance, live, with its cost
- 32690840a ux/Card: equal detail columns, quiet properties sidebar, padded breadcrumb
- 2ef2f5a3c drawer-chat round 2: the composer is one real panel, not a box in a box
- e7d08a933 one-dictation/minion-core: review fixes — revert core Router nav change for a smaller rail.js fix, close a st…
- 13754e1c9 docs: one-dictation docs pass (chat.js, Session markers, drawer)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Chat drawer: the Docs split resets, and Chat v2 cards get room

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Chat drawer: the Docs split resets, and Chat v2 cards get room"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
