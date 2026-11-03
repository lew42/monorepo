# Consolidation map: chat, prompt refinement, roles

Seat (c), 2026-10-28. Read-only study; nothing was moved. Evidence and citations: [notes.md](notes.md). Verdict words: **keep** (stays as is), **fold into X** (its value moves into X, then it is retired), **legacy** (mark it, leave it, stop extending it).

## 1. Chat code (the owner's "spread over many places")

| Piece | Lines | What it does | Who loads it | Live? | Verdict |
|---|---|---|---|---|---|
| `ux/Dictate/chat.js` + `Widget.js` | 440 + 920 | **V1**, the default voice chat: draws `{chat}` `{place}` `{summary}` `{refined}` `{react}` lines as bubbles | the dictation sheet (`ux/Dictate/page.js`, `drawer/Sheet.js`, `tabs/ai.js`, `DevBar/ask.js`, `rail.js`, `AIDashboard`) | **Live, default** | **Fold into the one chat view** (build it first, then mark V1 legacy). Not before: it is the only view the fast seat feeds |
| `ext/Chat/Chat.js` | 963 | The function bag under V1: bubbles, sticky scroll, cursors, reactions, threads | `Widget.js`, `CardChat.js`, `ChatView.js`, `ext/Session/page.js`, `AISessionConversation.js` | Live | **Keep as the renderer helpers**; the scroll/cursor/markdown parts are reused by the one view |
| `ext/Chat/Composer.js`, `Mic.js` (800), `strip.js`, `chunks.js`, `cursors.js` | 159 / 800 / small | Text box, microphone, sentence cut, ✓/🧠 cursors | Widget, `ai/cards/Compose.js`, `RefineDemo`, `tabs/ai.js`, `Whisper` log | Live | **Keep** (the input half of chat; no rival) |
| `ext/Chat/ChatPanel.js`, `Drill.js`, `panel/`, `drill/` | 141 / 210 | An all-in-one panel and a drill-in modal | only `ai/local/page.js` and Chat's own demo pages | Demo only | **Mark legacy** (nothing in the voice path uses them) |
| `ext/Chat/v2/ChatV2.js` + `ChatV2Model.js` | 320 + 175 | **V2**: a hand fold of the `tasks` lines into Prompts with replies/questions nested; 53 checks | the v2 chip via `ChatView.js` and `AISessionDetail.js`; `PromptLines.test.mjs` | Live behind a chip | **Keep until the spine lands**, then **fold into the one view** (its behaviours and tests are the valuable part) |
| `ext/Chat/v3/ChatV3.js` | 167 | **V3** rough draft: replay `session.jsonl` into a real `Session`, draw `session.tasks` | the v3 chip | Behind a chip, draft | **Fold into the one view**: its shape (a view over the list) is what the owner asked for; the code is thin |
| `ext/drawer/ChatView.js` (+ `Sheet.js`, `tabs/ai.js`) | 70 | The v2/v3 chip and the box that mounts them | Sheet, the AI tab | Live | **Keep as the mount**; it shrinks to one chip when the views merge |
| `ai/AISession/AISessionConversation.js` | 94 | The session page's first "Chat" chip: draws the Claude **transcript** of an SDK agent, not `session.jsonl` | `AISessionDetail`, `AISessionCoverage` | Live | **Keep, but rename in docs**: it is a transcript viewer, a different source from a voice session chat |
| `ai/cards/CardChat.js`; `ai2/chat.js` | 18; 3 | A card's chat; `ai2/chat.js` is a re-export shim | `card.js`, `Faces.js`, `rail.js`, `live.js`; the shim only by `ux/Dictate/surfaces` | Live; shim dead weight | CardChat **keep**; the shim **delete later** (scripted) |
| `dev/DevBar/chat.js` | 157 | Dev bar chat tab: talk to the agent that owns the page | `DevBar/tools.js`, `page.js` | Live (dev only) | **Keep**, off the voice path |
| `ext/Ask/chat.js` | 165 | "Ask a question of this page" chat | `DevBar/ask.js`, `AITask.js` | Live | **Keep** (different job) |
| `Servex/agents/Sessions.js` (voice parts), `PromptLines.js`, `PromptTasks.js` | 1607 / 61 / 156 | The only **writer** of voice-session lines: wakes the seats, writes task-shape lines | Servex | Live (PromptTasks **off**) | **Keep** Sessions/PromptLines; PromptTasks see §2 |
| `Servex/agents/Layers.js` (card-assistant / card-manager) | 1209 | The old per-card assistant pair and the lobby `amend_bubble` | `Servex.js:324` | Spawned 2 times in 14d | **Mark legacy** |
| `Servex/Stream.js` | 76 | The dashboard's server-sent-events wire; **not chat** | the Servex dashboard | Live | Not part of chat; leave |
| `Servex/ext/local/chat.js` + `ai/local/page.js` | one-shot | A chat page against a local model | `Servex.js` | Experiment | **Mark legacy** |

**Net:** four chat families sit on three line shapes. Bring them to ONE view over ONE stored list (the "spine", decided 2026-10-27), keeping Chat's input half and the cursor/scroll helpers.

## 2. Prompt refinement (the system map's 14 rows)

| # | System | Runs today? | Verdict |
|---|---|---|---|
| 1 | Voice fast seat `{place}` | **Yes**, every sentence | **Fold into the smart agent** (see §3) |
| 2 | `Sessions.refine()` (`{refined}` line) | Yes, sparse (called at `Sessions.js:1021`, gated by `worth_refining`) | **Fold into the smart agent's "refine the Prompt"** |
| 3 | `clean()`/`structure()` engine (`ext/Refine/engine.js`) | Indirect | **Keep as the one engine** |
| 4 | `LiveRefine` + Mic ticks (`/api/refine/live`) | Wired, no fresh output | **Legacy**; keep the outline idea |
| 5 | `Placement.js` (rules) | No caller turns it on | **Legacy** (the one rule-based placer is worth reading before deleting: it could replace the fast seat) |
| 6 | Echo + `refine_step` | Off (`SERVEX_ECHO`) | **Legacy** |
| 7 | `PromptTasks` + PromptRecords `live` | **Off** (`prompt-tasks.off`, 10-25) | **Fold the parts step into the smart agent**; drop the hook |
| 8 | PromptRecords `review`, breakdown, Trace, ToSession | By hand | Keep `review`; the rest legacy |
| 9-11 | RefineQueue, PromptAudit, day batches | By hand, last 10-13 to 10-23 | **Legacy** |
| 12 | `/api/refine`, `/api/tidy` | Endpoints exist | **Fold into one `clean` caller** |
| 13 | Assistant chain (`SERVEX_CHAIN`) | Off | **Legacy** |
| 14 | `amend_bubble` refined cards | Last 2026-09-24 | **Legacy** |

Two systems earn their keep: the fast `{place}` pass and the smart refine-the-whole-Prompt. Everything else is a duplicate, off, or by-hand history.

## 3. Roles (spawn counts from the registry, 3859 rows)

| Role | Spawned: all / 7d / 14d | What it does today | Verdict |
|---|---|---|---|
| `session-smart` (tier voice_smart, Sonnet, medium) | 85 / 8 / 43 | The voice session's smart seat: owns the Prompt, replies, makes tasks | **Keep as THE one voice agent** |
| `voice-assistant` (Haiku, fast) | 21 / 10 / 21 | The fast seat: one `{place}` line per sentence; the cost leader (about $1,500 a month) | **Fold into session-smart** (batch it) |
| `session-fast` | 67 / 0 / 25 | Old fast seat, still spawned when `session-assistant.txt` says so | **Legacy** (alias of voice-assistant) |
| voice **mastermind** (cloud voice: `ask_mastermind` spawns `mastermind` named `voice-<short>`) | within `mastermind` | Does the repo work the voice agent asks for | **Keep** (it is a mastermind, not an assistant) |
| VS Code tab as voice (`register_session`) | n/a | A human-run Claude tab acting as the voice | **Keep** (not a role) |
| `helper` | 141 / 1 / 81 | Default step runner in `ProcessRunner.js:97`, `Assistant.js:295`, `policy.js:151`; **no row in `roles.js`** | **Keep, but give it a row** or give its callers `minion` |
| `mastermind`, `task-mastermind`, `directory-mastermind` | 191 / 355 / 9 | Same job at different scales | **Fold** the last two into `mastermind` with a path (already aliased) |
| `minion`, `reviewer`, `clarity` | 1198 / 700 / 852 | Workers and checks | **Keep** |
| `assistant`, `master-assistant`, `card-assistant`, `page-assistant`, `card-manager` | 2 / 2 / 31 / n / 13 | Lobby and per-card assistants | **Legacy** |
| `checker`, `voter`, `log-assistant`, `echo` | 28 / 21 / n / 125, all 0 in 14d | Dormant | **Retire** |

**One-line cost of "one smart agent":** the smart seat takes over placing, which is the only thing a per-sentence Haiku wake does today; to avoid doubling the re-read cost it must place in batches (every pause or N sentences), and V1 (which reads `{place}`) must move to the stored chat list first. Detail in [notes.md](notes.md).

## 4. requirements.md files that hold design knowledge (e00f55c9; nothing moved)

139 `requirements*.md` files sit under the session folder. Candidates whose essence belongs in a module, not a session folder (first-lines read, not every line):

| File (under `sessions-and-tasks/`) | Belongs in |
|---|---|
| `session-is-a-task`, `session-record`, `session-identity` | `core/Session/` and `core/Task/` readme/`doc/` |
| `store-index-query` | `core/Item/doc/` (store, index, query architecture) |
| `prompt-breakdown`, `prompt-audit-system` | `core/Task/doc/prompt.md` |
| `dictation-debug/chat-v2/{writers,renderer,in-place}`, `chat-live`, `chat-sent`, `one-chat-view` | `ext/Chat/v2/doc/` and `ext/Chat/doc/` |
| `dictation-map`, `dictation-debug` | `ux/Dictate/doc/` |
| `process-system` (+ its children) | `core/Task/process/` |
| `agent-base`, `deputy/roles` | `ai/doc/` and `Servex/agents/roles/` |
| `sessions-list-slim/*`, `sessions-views` | `ai/AISession/` readme |
