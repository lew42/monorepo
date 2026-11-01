# Answers: the fast and smart seats, echo mode, and Chat V3 (2026-11-01)

Each answer comes from the code as it is today and from the 28 real voice sessions since 2026-10-17, counted by [scripts/dictation-counts.mjs](scripts/dictation-counts.mjs) (output: [scripts/counts-2026-10-17-to-11-01.json](scripts/counts-2026-10-17-to-11-01.json)). The full path, step by step, is in [map.md](map.md).

---

## 1. Do we still have both assistants?

**Yes. Every voice session still starts two agents**, so the request to roll them into one was never built.

- **The fast seat** is the `voice-assistant` role, on Haiku 5.5 at low effort. All 28 sessions spawned one.
- **The smart seat** is `session-smart`, on Sonnet 5.5 at medium effort. 25 of the 28 spawned one.
- **Why both:** `Sessions.say()` wakes both seats for every sentence (`Servex/agents/Sessions.js:1031-1033`: `wake(s, "fast")`, then `wake(s, "smart")` on the next tick).
- **Why it was never changed:** the 2026-10-27 lean, "pause the fast seat as a placer, keep the switch" ([design-decisions-2026-10-27.md §8](/framework/ai/design-decisions-2026-10-27.md)), was never applied. `Sessions.js` last changed on 2026-10-25.
- **The only switch** is `%LOCALAPPDATA%\lew42\servex\session-assistant.txt`. It chooses which role sits in the fast seat (`voice` or the old `fast`). It has no "off". The file does not exist, so the seat defaults to `voice`.

## 2. Is the fast one doing anything?

**It works hard, but almost nobody sees what it does.**

| What it writes | Count | Who reads it |
|---|---|---|
| `{place}` lines (where a sentence goes, plus a cleaned copy) | 2,790 | Chat V1 only (`ux/Dictate/Widget.js:577`) |
| ... with `to: "same"` (no new paragraph or card) | 2,756 (99%) | — |
| ... with cleaned text it labels `improve` | 1,144 | V1 swaps the text into the bubble |
| ... with cleaned text it labels `clean` | 669 | **nobody**: `Widget.place()` applies only `improve`/`both` (`Widget.js:581`), and the skill never names `clean` |
| ... with `edit: "nothing"` | 977 | — |
| Question tasks for a "?" sentence | 201 | V1, V2 and V3 |
| Chat replies | 0 | — |

- **In 6 of the 28 sessions it wrote nothing at all**, though it was spawned: v-4lwslx3, v-7bnqmeh, v-lhvz99u, v-zg6h7hl, v-xhx7fmx, v-dwlaoin.
- **It costs the most.** Every wake re-sends "the prompt so far", every earlier sentence, as a new message (`voice_say`, `Sessions.js:463`). In session v-sq8y7db the fast seat made 1,130 model calls and read 122.7 M input tokens, 33.6 M of them as cache writes. The smart seat read about the same total but wrote only 1.0 M to the cache ([scripts/seat-growth.mjs](scripts/seat-growth.mjs)). Servex's registry puts the role at $844 across 21 sessions ($639 for v-sq8y7db alone), against $80 for 85 smart seats. That dollar figure is still unreconciled with the $263 an earlier script gave ([ai/roles-proposal.md](/framework/ai/roles-proposal.md)). The token counts are the solid fact.

## 3. Echo mode: do both get the full Whisper text?

**Yes. Both seats get the same raw Whisper sentences. Neither gets text the other cleaned.**

- **The only cleaning before the seats** is a regular expression in the browser, `unfill()` (`ext/Chat/Mic.js:87`). It cuts "ah uh um er erm hmm mm". There is no capitalization, no punctuation fixing and no model call.
- **The model cleaners are off in the live chat.** `ux/Revise` and `RefineSystem.post_live` run only when `Widget.revision` is set, and it defaults to `false` (`Widget.js:124`).
- **What the fast seat gets:** every earlier raw owner line, plus the new raw line(s), plus the Prompt id (`voice_say`).
- **What the smart seat gets:** the new raw owner lines in batches, as `[on <page> at <time>] <text>`, plus why it woke (`feed_smart`, `Sessions.js:271-285`).
- **Proof from the logs:** `sent to fast` = `sent to smart` = 766 batches over the same lines. 479 owner lines still start with a lowercase letter, which is how Whisper writes them.
- **Does the smart seat see the fast seat's cleaned text?** No. Its batch is built from the raw `{chat}` lines. Only "tail mode" would show it the `{place}` lines, and tail mode is off in every session (0 of 100 in `sessions.json`).
- **Where `raw` and `text` differ (943 lines):** this is not cleaning. `raw` is the whole Whisper segment and `text` is one sentence cut from it (`Mic.js:610-615`).

**So the picture you described** (the fast seat cleans, the smart seat gets the clean text) **is not how it works.** It is echo mode: both seats hear the same raw words. The fast seat's cleaned copy goes only to V1's bubbles.

## 4. Chat V3: where is it, and does it work?

**It is merged and it works, but it is a rough draft.**

- **Where it lives:** `public/framework/ext/Chat/v3/ChatV3.js` (169 lines, `class ChatV3 extends JSONL`). It was merged to `michael/dev` on 2026-10-26 and last changed on 2026-10-31.
- **How to open it:** the **v3** chip beside **v2** in the ✦ sheet and the drawer's AI tab (`ext/drawer/ChatView.js`), the session page's Chat tab (`?tab=chat&chat_view=v3`), or [/framework/ext/Chat/v3/](/framework/ext/Chat/v3/) with `?src=<session.jsonl>`.
- **Proof it works:** today it drew the real 5,625-line session v-9dvbbrn as 303 Prompt cards, with titles, cleaned bullets, "show raw" and a nested task (screenshot: `shots/v3-real-log-1400.png`, kept locally because `shots/` is git-ignored).

**What V3 does well:**
- It reads only proper task lines and replays them into a real `core/Session`.
- A Prompt that is still moving shows gray raw words.
- The words you are still speaking show as a faint draft, by listening to V1's `chat-live` event (`Widget.js:828`).

**What V3 is missing:**
- **The smart seat's chat replies.** V3 never reads `{chat}`, and 882 of the 938 smart replies in the two big sessions are `{chat}` lines.
- Streamed replies (`{kind:"stream"}` on the SSE wire).
- Markdown in replies.
- The ✓/🧠 sent marks.
- Reactions.
- **A live draft of its own.** V3 shows the draft only while V1's `Widget` is mounted next to it.

## 5. V1, V2, V3: what each reads

| | V1 (default) | V2 (v2 chip) | V3 (v3 chip) |
|---|---|---|---|
| Files | `ux/Dictate/chat.js`, `Widget.js`, `ext/Chat/Chat.js` | `ext/Chat/v2/ChatV2.js`, `ChatV2Model.js` | `ext/Chat/v3/ChatV3.js` |
| Reads | the pseudo lines `{chat}`, `{place}`, `{summary}`, `{refined}`, `{para}`, `{react}`, `{sent}`, plus Tasks and Questions | the `tasks` list, folded by hand | the `tasks` list, replayed into `core/Session` |
| Live raw words | ✅ gray guess tail, in place | ⬜ | ✅ faint draft (borrowed from V1) + gray raw for 8 s |
| Refined prompt | ⬜ (cleaned sentences only) | ✅ Prompt title and text at the root | ✅ Prompt title and text |
| Smart replies | ✅ all of them | only Prompt replies (6%) | only Prompt replies (6%) |

**Your sense that V1 is best is backed by the data.** V1 is the only view that shows the live words and every reply. V2 and V3 read the right structure, but most replies are not written into it.
