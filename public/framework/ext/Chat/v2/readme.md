# Chat v2: ChatV3, plus the ✓/🧠 marks and replies beside their sentence

`class ChatV2 extends ChatV3` ([`../v3/`](../v3/readme.md), step 2 of [views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages.md)). Everything is ChatV3: it draws `session.messages` (a card per Prompt, in the chat list's own order, with the Replies that answer it found by `re.to`), the live draft, pause-based paragraphs, "show raw". V2 adds only three things:

- **The ✓/🧠 marks**, beside the title of the newest Prompt only. ✓ colours once the fast seat has the line; 🧠 colours once an answer actually exists (a Reply after the smart seat's receipt, or the Prompt's own title/text). They still read the Prompt TASK's `sent.fast`/`sent.smart` (`Sessions.mark_sent`), not a field on the message — step 3 of the plan moves them there. Until then, `ChatV2.js` keeps a small tracker (`prompt_of`, `sent_by_task`) over the V1 `{chat}`/`{sent}` broadcast lines ChatV3 skips, the one piece of the old `ChatV2Model` this step still needs.
- **A Reply beside the sentence it answers**, while a Prompt has no refined text yet (dictation mode): `ChatV2.js` overrides two small hooks ChatV3 exposes for this (`paragraph()`, `trailing_replies()`) to draw one row per sentence, with the Reply whose `re.to` names it drawn right beside, instead of in the trailing list below the whole card. Once a Prompt gets refined text, replies go back to the normal trailing list, same as plain ChatV3.
- **Its own CSS** (`ChatV2.css`): the marks and the beside-sentence layout only; everything else is `../v3/ChatV3.css`'s own rules (the demo page wraps the box in both `chat-v3 chat-v2` classes).

Try it: [/framework/ext/Chat/v2/](/framework/ext/Chat/v2/) draws [fixture/messages-session.jsonl](fixture/messages-session.jsonl) (V3's own fixture, plus a few `{chat}`/`{sent}` lines so the marks have data); `?src=<url of any session.jsonl>` draws that session, live.

## What moved to `old/` (2026-11-01, this step)

- **`ChatV2Model.js`**: the old fold of the TASK-shaped lines (`{tasks:{add:{type:"Prompt",…}}}`, with `raw`/`paragraphs`/`replies`/`anchor` inline on the task). V2 no longer reads it — it reads `session.messages` through ChatV3 instead. **V1's dictation widget (`ux/Dictate/chat.js`) still imports it** (it hasn't moved to messages yet, step 5) — don't delete it.
- **`fixture/session.jsonl` → `old/session.jsonl`**: the old task-shaped fixture, kept for the record.
- `resurface.test.mjs` keeps testing `old/ChatV2Model.js` directly (plain node, no browser): the "an answered Question surfaces at the chat's root" behaviour it proves has no equivalent in ChatV3 — ChatV3 never surfaces a task out of its Prompt's nest (`kids`, drawn by `TaskView.row`/`question()`), so this is a dropped feature for V2 from this step on, not a bug. The alternative (re-introducing root-level surfacing on top of messages) would need a new, bigger change to ChatV3's own render model; left for the owner to ask for if the behaviour is missed.

## What changed in ChatV3 itself (small, same output)

Two methods were extracted so V2 could override only what it needs, with ChatV3's own tests (`ChatV3.test.mjs`, `placement.test.mjs`) unchanged: `paragraph(group, p)` (one paragraph's sentences, joined — V2 overrides to draw sentence rows instead) and `trailing_replies(p)` (the replies drawn after the body — V2 overrides to drop any it already drew beside a sentence). `placement.js` gained `paragraph_groups()` (the same pause-grouping as `paragraphs()`, kept as sentence objects instead of joined text).

## Test

- `ChatV2.test.mjs` (headless Playwright, `node ChatV2.test.mjs [base-url] [shots-dir]`): card order/nesting match ChatV3's own; the marks show only on the newest Prompt (an older Prompt with the same sent/answered data shows none); a Reply drawn beside its sentence is not duplicated in the trailing list; a sentence with no reply has no beside box; live append of a Prompt and a Reply beside its sentence, no reload.
- `live-guess.test.mjs`: the live draft (owner item 6, "V2 shows no live Whisper text") — inherited unchanged from ChatV3's own `draft()`, fires the shared `chat-live` window event.
- `resurface.test.mjs`: the old model's own logic (`old/ChatV2Model.js`), for the record — see "What moved to old/" above.

## Where it shows

The session page's Chat tab under its **Chat v2** chip (`?tab=chat&chat_view=v2`), the ✦ sheet and the desktop drawer's AI tab under the same chip (`ext/drawer/ChatView.js`).

## Decisions

- **Word-range marking is gone.** The old `anchor.words`/`{from,to}` let a reply highlight specific words inside a sentence (`ChatV2.words()`, `.chat-v2-mark`). `Reply.re` on `session.messages` is `{to: <sentence id>}` only — a whole-sentence anchor, no word range. Not rebuilt this step: the new data simply doesn't carry it, and adding a word range to `Reply` is its own, separate change (ask for it if the highlight is missed).
- **Raw-toggle-open does not move replies beside the raw sentences.** ChatV3's "show raw" (shown when `Prompt.clean` has entries) draws the sentences' raw words as plain blockquotes, independent of `dictation()`; replies stay in the trailing list in that case, where old V2 would have moved an anchored one beside its raw sentence too. Smaller scope, logged here rather than built: most sessions read a Prompt's refined text, not its raw words, with "show raw" open.
