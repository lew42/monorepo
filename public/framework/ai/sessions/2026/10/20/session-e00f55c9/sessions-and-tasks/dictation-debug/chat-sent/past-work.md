<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Chat  show when your words reach the assistant" (words: chat, show, when, your, word, reach, assistant)

## Tasks (8, best first)
- 2026-10-13 [Voice and chat surfaces: one permanent page showing every surface](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-surfaces/) — Page /framework/ux/Dictate/surfaces/ shows 9 surfaces (screenshot, where, renderer file, who answers, log), one flow diagram and the session model. 5 duplicates found (3 conversation stores, 3 Refine-stage writers, New session button built 3 times, ext/Ask/ch… · paths 1/1 exist
- 2026-10-03 [Prompt hook: only your words get refined](/framework/ai/sessions/2026/10/04/prompt-relay-skip-agents/prompt-relay-skip-agents/) — A subagent's report is no longer logged as your prompt. The hook skipped nothing before, so four hand-backs in this tab were saved as your Prompts and refined at about $0.35 each, and your real prompt waited behind them. skip hand-backs and background notices… · paths 1/1 exist
- 2026-10-01 [Chat: fixed assistant replies drawing twice](/framework/ai/sessions/2026/10/01/chat-duplicate-messages/chat-duplicate-messages/) — Fixed: every assistant reply drew twice in the chat. [ux/Dictate/chat.js](http://monorepo.localhost/framework/ux/Dictate/) listens for new lines two ways at once (an SSE push and a file poll) and only the owner's own echoed message was ever deduped against th… · paths 2/3 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-09-29 [Drawer chip: selected-element context never reached the card-assistant](/framework/ai/sessions/2026/09/29/7eedf4fd-044f-49b9-ae35-8ed667240d78/chip-context-fix/) — Fixed and merged to michael/dev: the drawer's "this code block ✕" chip now reaches the assistant. find where the chip's data is dropped — one function, post_card() in [ext/drawer/tabs/ai.js](/framework/ext/drawer/), called card_prompt(re, entry.text, entry.vi… · paths 2/3 exist, gone: framework/ai2/2026/09/29/layout-explorer-3-columns-and-a-study-of/
- 2026-10-20 [ask_mastermind: late answers reach updates; wait:false ticket](/framework/ai/sessions/2026/10/20/voice-20261020/async-ask/) — ask_mastermind no longer loses an answer. When the one-minute wait ends (timeout or cancelled call) RemoteMCP.ask() keeps watching the reply file for 30 minutes and puts the answer in the voice-app inbox (from: voice-mastermind, reply_to = question id) plus i…
- 2026-10-17 [Voice: one assistant places each sentence as you talk](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/) — Your words stay where you said them; each sentence can be placed by one line. Plan: [voice-assistant.md](/framework/ux/Dictate/doc/voice-assistant.md). Review: reviewed: pass, 7 notes answered ([review.md](review.md)). plan first, with ask 1 answered: the pla…
- 2026-10-13 [Chat bubbles in time order, and the Refine page hears the chat](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/bubble-order/) — Chat bubbles now land in time order, and the Refine page shows what the ✦ chat heard. order fix: [ext/Chat](/framework/ext/Chat/) place(), merged e7533ddfc. Scripted four sentences with replies in between: before [FAIL](/framework/ai/sessions/2026/10/13/sessi… · paths 2/2 exist
- 2026-10-12 [Servex relay: owner messages reach a mastermind through the assistant](/framework/ai/sessions/2026/10/12/session-ac44c638/relay-2/) — Owner and tab messages to a mastermind now go through the root assistant; @name or direct: true still goes straight. Read the bypass log by script: it held 0 lines because Policy.kind() missed mastermind-* ids (fixed) Route through the assistant, direct kept …

## Modules that exist now (files outside the module that import it)
- [ext/Chat](/framework/ext/Chat/) — used by 13 files
- [ui/words](/framework/ui/words/) — used by 33 files

## Docs and readmes
- [When the smart assistant is woken (the wake policy)](/framework/ux/Dictate/doc/wake-policy.md) — What it is. A voice session has two assistants. The fast one places each sentence as you speak (cheap, per sentence). The smart one is an O…
- [The flicker — why your words vanished and came back, and th…](/framework/ux/Dictate/doc/flicker.md) — The rule (the owner, 2026-10-24): while dictation is on, your words appear in place in the chat bubble, as if already sent. Nothing you are…
- [Talk — press the mic, talk, see your words](/framework/ai/talk/readme.md) — One page, two things on it: a big microphone button, and under it one card that fills with what you say as you say it. Open it at [/framewo…
- [The voice assistant: one assistant places each sentence as …](/framework/ux/Dictate/doc/voice-assistant.md) — What it is. One plain assistant, the voice assistant, listens to a voice session. Each time you finish a sentence, your words are already s…
- [Dictate — a mic button that always shows what is happening](/framework/ux/Dictate/readme.md) — ## How messages travel You speak and Whisper turns the sound into text, one sentence at a time. The page then sends each sentence to Servex…
- [CLAUDE.md archive — original wording](/framework/ai/doc/claude-md-archive.md) — On 2026-10-12 the root CLAUDE.md was consolidated. Where a rule was reworded or shortened, the sentences it no longer contains verbatim are…
- [Notes from your asks](/framework/ai/doc/notes-from-asks.md) — Rules, preferences and ideas you said about this module that are not work, one line each, with a link to your words. Written by node Server…
- [Notes from your asks](/framework/ai/usage/doc/notes-from-asks.md) — Rules, preferences and ideas you said about this module that are not work, one line each, with a link to your words. Written by node Server…

## Sessions tagged with these words
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/15 [Past-work discovery landing check](/framework/ai/sessions/2026/10/15/session-7620fac2/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.24
- 2026/10/13 [Bubble-order fix and Refine mic source](/framework/ai/sessions/2026/10/13/session-8066bc31/) — kind/owner model/sonnet mod/ext/chat mod/ai/sessions task/mastermind-repo-slim page/ai-sessions · $2.31
- 2026/10/13 [Architecture documentation for ext/Chat](/framework/ai/sessions/2026/10/13/session-61d11498/) — kind/owner model/haiku mod/ext/chat task/mastermind-repo-slim docs/architecture · $0.26

## Owner asks
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-10-13 Dictation: sheet shows the chat and mic; release the mic when hidden (?, landed)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, landed)
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)

## Commits
- d19f42815 sheet step 7: the live space, class AIFeed extends View
- 50c45e71b sheet step 5: the route <path>/ai/, class AIPage extends Page
- 2ab331348 Dictate round 2: mic-abort reload race, no mid-pause beeps, capped box, one status line
- 32690840a ux/Card: equal detail columns, quiet properties sidebar, padded breadcrumb
- b56663d8d one-dictation/minion-core: fix the nav-before-push ordering bug behind the duplicated-lines/wrong-page bug, r…
- c0e88f94c AI 2: dollar cost on every preview and card; honest per-task cost split by time; detail pages fill the column

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Chat: show when your words reach the assistant

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Chat: show when your words reach the assistant"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
