# Voice and chat surfaces: the long form (2026-10-13)

The page is [`/framework/ux/Dictate/surfaces/`](/framework/ux/Dictate/surfaces/): one screenshot, one name and one row per surface. This file holds what the page only points at. Asked for in the owner's dictation of 2026-10-13: "a place I can click through"; the raw words are in `ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-7.md`.

**Why this page lives here and not in `ux/voice/`:** `surfaces/` already existed (a 2026-09-30 page of the five chat mounts), every voice surface mounts `ux/Dictate/chat.js`, and one page beats a second one (CLAUDE.md law 6). The old five-mount shots stay in the folder; the page now uses fresh ones.

## The census (how it was found)

Importers of the one chat (`grep "Dictate/chat.js"`): `ext/drawer/tabs/ai.js`, `ext/drawer/rail.js` (the sheet), `ext/drawer/tabs/sessions.js` (only `ago`), `ux/Dictate/push-to-talk.js`, `ux/Dictate/page.js`, `ai/rail/rail.js` (Live card foot), `dev/DevBar/ask.js` (the v1 dev bar, off by default). Card threads: `ai/cards/CardChat.js` is mounted by `ai/cards/card.js`, `ai/rail/rail.js`, `core/Page/ext/Inbox/timeline/TimelineTalk.js` (a card's chat beside a timeline row) and the drawer's card mode. Session page: `ai/AISession/AISessionDetail.js` builds an `AISessionConversation`. Drawer tabs today are AI, Dictation, Settings (dev only) and Element (when something is selected); the old Sessions tab is now the "Switch session" menu in the AI tab's header.

Dev shell tabs, traced 2026-10-13 (voice-dedupe): `dev/DevShell/DevShell.js` reuses `dev/DevBar/tools.js`'s tab list. Its `ai` tab is `DevBar/ask.js`, which mounts the one `ux/Dictate/chat.js` (no new surface). Its `chat` tab is `DevBar/chat.js`: a per-page agent thread (`AgentTalk` from `ai2/live.js`, `/api/page-agents`, `/api/page-sessions`, `/api/page-session/*`), **a fourth chat surface**, dev only. Recommendation: fold it into the AI tab's "Switch session" menu once the page-agent routes serve the same session list; nothing changed there. `Servex/agents/Chain.js` and `doc/assistant-chain.md` (the hop map of one sentence) belong to a sibling task and were not in the tree when this was written; link them from here when they land.

Agents behind the voice session: `Servex/agents/Sessions.js` spawns a fast and a smart assistant per session (`session-fast.md`, `session-smart.md`). Under "auto" they run on Claude since 2026-10-12 (the voice-model policy comment in `Sessions.js`); before that the pair ran on `openai/gpt-6-luna`.

## The 30-second first reply

Measured headless with `ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-surfaces/first-reply.mjs` (open the drawer, send one typed sentence). Hops from the session file and Servex's agent logs:

| Run | Send | Process started | First reply written |
|---|---|---|---|
| Your own session, brand new pair (17:17) | 17:17:57.07 | 17:17:57 (same second) | fast 17:18:05 (+8.5 s), smart 17:18:09 (+12.2 s) |
| My run, pair stopped after 5 idle minutes, resumed (17:34) | 17:34:11.13 | 17:34:11 (+0.1 s) | smart 17:34:28 (+17.3 s); fast answered the same second |

Both times the registry shows the agent `working` within a second of the sentence, so a spawn (cold or resumed) is not the delay and no queue sat in front: the 5-working cap does not gate session pairs. The gap is the time to the model's first token. At 17:34:11 Servex listed 27 agents `working` on the same Claude account (three of them other session pairs). A cold 8 s at a quiet minute and 17 s under that load fits a 30 s at a busier one, but I did not catch a 30 s run myself: "fits", not "proved".

**Side effect to know about:** the probe's sentence resumed your own session `v-rs7u4o7` (the "last hour on this page" rule), so one line, "Timing test: please reply with one short line.", and its replies sit in that session's log. The log is append-only and was left as is.

**Next brief (not a one-line change):** run the same script with the session backend set to `openrouter` (luna) on a private Servex and compare time to first reply; if luna is several times faster, make the fast assistant luna-backed while the smart one stays on Claude. Nothing in Servex or `ux/Dictate` was changed here.

## What is duplicated

1. **Three conversation stores, one renderer.** The voice session writes `ai/<id>.jsonl` (Servex `Sessions.js`); a card thread posts `POST /card/append` into the card's `page.jsonl` (`ai/cards/Compose.js`); the session page replays the Claude Code transcript (`AISessionConversation.js`). All three draw with `ext/Chat`. **Decision (voice-dedupe, 2026-10-13):** the record is the SDK session file (`/ai-logs/<id>`, the 10-03 "no duplicate transcripts" decision). The voice store is an append-only mirror of the voice lines (kept: Servex's `Sessions.js` replays it for the live bubbles, and it carries the voice-only `at`/piece ids the SDK file lacks). A card thread's page file is not a transcript but the card's own state, so it stays as is. The session page already only reads the SDK file. Alternative rejected: deleting the mirror (never destructive; the bubble order fix depends on its times). No code changed here; each surface naming its store in its header is the follow-up.
2. **Three writers of the same Refine stages.** `AISessionConversation.refine()` and the Refine view both end in `/api/refine`; `Servex/agents/Echo.js` writes the stages itself through `VoicePage` (off by default, `SERVEX_ECHO`). **Done 2026-10-13:** Echo now calls `run_refine` (`Servex/ext/refine/run.js`), the function `/api/refine` runs for the buttons, in `light` mode (same five page stages, no PromptLog/clarity/notes calls).
3. **A "New session" button (was built three times; now one, 2026-10-13):** `new_session_button` in `ux/Dictate/chat.js`, now the only one (`rail.js`'s sheet copy and `ai.js`'s `new_session()` are gone; the AI board's was removed 2026-10-03). The sheet and the AI tab call it ([chat.md](chat.md#new-session-and-the-mic-indicator)).
4. **An older chat, `ext/Ask/chat.js`:** a headless one-turn Claude chat with its own composer, kept reachable by `askV1` in `dev/DevBar/ask.js`. A fourth way to talk to an agent, with no mic and no session. **Not retired (checked 2026-10-13):** `chat.js` exports `mount()`, still imported by `ext/Ask/page.js`, `dev/DevBar/ask.js`, `dev/DevBar/tools.js`, `ai/AITask/AITask.js` and ten `layouts/*/page.js` pages (the floating **?**), so the evidence for retiring it does not hold. Retire only after those `mount()` callers move; that is its own task.
5. **Two dictation widgets:** the Dictation tab embeds the playground widget while the chat uses `Widget` (already named in [voice-architecture.md](voice-architecture.md)).

Duplicates now: 3 open (stores named, Ask/chat.js kept, Dev shell chat tab); 2 closed (New session button, Echo/Refine call). [next.md](next.md).

**Update 2026-10-13:** the phone sheet and the sidebar are now one component: the sheet's `full` state mounts the drawer's own tab row ([next.md](next.md)).

Reviewed 2026-10-13 at four widths, with before and after shots: [review.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-site-pages/review.md).
