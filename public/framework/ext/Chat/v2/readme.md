# Chat v2: ChatV3, plus the ✓/🧠 marks and replies beside their sentence

`class ChatV2 extends ChatV3` ([`../v3/`](../v3/readme.md), step 2 of [views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages.md)). Everything is ChatV3: it draws `session.messages` (a card per Prompt, in the chat list's own order, with the Replies that answer it found by `re.to`), the live draft, pause-based paragraphs, tap-for-raw. V2 adds only three things:

- **The ✓/🧠 marks**, beside the title of the newest Prompt only. ✓ colours once the fast seat has the line; 🧠 colours once an answer actually exists (a Reply after the smart seat's receipt, or the Prompt's own title/text). Step 3 of the plan: they now read `p.sent` (`{fast?: {at}, smart?: {at}}`) straight off the Prompt message — `Sessions.mark_sent` writes it there (`ChatWriter.sent_line`), so the V1 `{chat}`/`{sent}` broadcast-line tracker is gone. Because `sent` now lives on the message, setting it fires the Prompt's own `delta` event, which ChatV3's existing dirty-tracking already redraws (no separate "redraw the named Prompt" step is needed any more; proof `ux/Dictate/test/chat-sent.mjs`). A session recorded before step 3 has no `sent` on its messages, so its newest Prompt shows no marks; only sessions written after the switch do.
- **A Reply beside the sentence it answers**, while a Prompt has no refined text yet (dictation mode): `ChatV2.js` overrides two small hooks ChatV3 exposes for this (`paragraph()`, `trailing_replies()`) to draw one row per sentence, with the Reply whose `re.to` names it drawn right beside, instead of in the trailing list below the whole card. Once a Prompt gets refined text, replies go back to the normal trailing list, same as plain ChatV3. Tap-for-raw (ChatV3's own feature, active when `Prompt.clean` has entries) stays ChatV3's: V2 adds nothing to it this step — a raw-opened, already-refined Prompt still lists its replies in the trailing list, not beside the raw lines (see Decisions).
- **Its own CSS** (`ChatV2.css`): the marks and the beside-sentence layout only; everything else is `../v3/ChatV3.css`'s own rules. `ChatV2.read()` adds the `chat-v3` class to `$box` itself, so every caller (this demo, the session page's Chat tab, the drawer/✦ sheet) gets ChatV3's column width and phone padding for free, with no change needed at the call site.

Try it: [/framework/ext/Chat/v2/](/framework/ext/Chat/v2/) draws [fixture/messages-session.jsonl](fixture/messages-session.jsonl) (V3's own fixture, plus a few `sent` lines on two of its Prompt messages so the marks have data); `?src=<url of any session.jsonl>` draws that session, live. Shot with both the marks and the live draft visible: [shots/chat-v2-marks-and-live-draft.png](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/v2-subclass/shots/chat-v2-marks-and-live-draft.png).

## Layout (2026-11-02)

Same shared rules as V3 ([`../bubbles.css`](../bubbles.css)). A Prompt with refined text is one hugging pill. In dictation mode (no refined text yet) each sentence row is its own small pill (`.chat-v2-sentence-text.chat-v3-you`) inside a plain `.chat-v3-yours` group, and the Reply anchored to a sentence (`.chat-v2-beside`) sits plain beneath it on the left. The old side-by-side grid is gone.

## Files

`ChatV2.js` (the class, above) · `ChatV2.css` (its own rules) · `report.js` (unchanged by this step: the page's own errors/clicks/context, posted down the real dictation path `POST /api/session/say` — see "Who writes the data") · `ChatV2.test.mjs`, `live-guess.test.mjs`, `resurface.test.mjs` (Test, below).

## What moved to `old/` (2026-11-01, this step)

- **`ChatV2Model.js`**: the old fold of the TASK-shaped lines (`{tasks:{add:{type:"Prompt",…}}}`, with `raw`/`paragraphs`/`replies`/`anchor` inline on the task). V2 no longer reads it — it reads `session.messages` through ChatV3 instead. **V1's dictation widget (`ux/Dictate/chat.js`) still imports it** (it hasn't moved to messages yet, step 5) — don't delete it.
- **`fixture/session.jsonl` → `old/session.jsonl`**: the old task-shaped fixture, kept for the record.
- `resurface.test.mjs` keeps testing `old/ChatV2Model.js` directly (plain node, no browser): the "an answered Question surfaces at the chat's root" behaviour it proves has no equivalent in ChatV3 — ChatV3 never surfaces a task out of its Prompt's nest (`kids`, drawn by `TaskView.row`/`question()`), so this is a dropped feature for V2 from this step on, not a bug. The alternative (re-introducing root-level surfacing on top of messages) would need a new, bigger change to ChatV3's own render model; left for the owner to ask for if the behaviour is missed.

## What changed in ChatV3 itself (small, same output)

Four small overridable hooks so V2 could add what it needs without copying ChatV3's render loop, with ChatV3's own tests (`ChatV3.test.mjs`, `placement.test.mjs`) unchanged:
- `paragraph(group, p)` — one paragraph's sentences, joined into a string (`div.c("chat-v3-para", …)`). V2 overrides it to draw one row per sentence instead (`.chat-v2-sentence`), with the Reply beside it.
- `trailing_replies(p)` — the Replies drawn after the body (defaults to `replies_of(p)`, unchanged). V2 overrides it to drop any Reply it already drew beside a sentence.
- `clamped_text(p, words, fill)` — the "show all (N words)" clamp wrapper, extracted so both `dictation()` (ChatV3) and V2's sentence rows share one clamp rule.
- `placement.js` gained `paragraph_groups(sentence_items, gap_ms)`: the same pause-grouping `paragraphs()` uses, kept as sentence objects instead of joined text — `paragraphs()` is now `paragraph_groups(...).map(group => group.map(...).join(" "))`, same output.

## Who writes the data

Same writer as V3 (`core/Session/Chat` replays `session.jsonl`): Servex's `Sessions.js` `say()` opens a Prompt on the first line of a thought (`assign_prompt`) and grows it through `PromptLines.js`; the smart seat writes titles, text, replies and tasks through the `item` tool directly, under the "Chat v2" section of `Servex/agents/session-smart.md` (shared with V1/V3 today — see "To fix"). `report.js` is a second, smaller writer: a page's own errors (`window.onerror`/`unhandledrejection`) and opt-in clicks/context post down the same real dictation path, `POST /api/session/say`, tagged `kind: error|click|context` so they never get read as spoken lines. `init(session)` wires it once a voice session id is known; `ux/Dictate/chat.js` calls it on every session change.

## Where it shows

The session page's Chat tab under its **Chat v2** chip (`?tab=chat&chat_view=v2`), the ✦ sheet and the desktop drawer's AI tab under the same chip (`ext/drawer/ChatView.js`).

## Test

- `ChatV2.test.mjs` (headless Playwright, `node ChatV2.test.mjs [base-url] [shots-dir]`): card order/nesting match ChatV3's own; the marks show only on the newest Prompt (an older Prompt with the same sent/answered data shows none); a Reply drawn beside its sentence is not duplicated in the trailing list; a sentence with no reply has no beside box; live append of a Prompt and a Reply beside its sentence, no reload; and live, straight off `sent` (views step 3): ✓ appears once `sent.fast` lands, 🧠 appears once `sent.smart` lands (not done yet), then 🧠 turns done once a Reply after `sent.smart.at` lands. Checked against the first and the live-appended Prompt, not every Reply in the fixture (a worthwhile follow-up: loop every Reply and assert its `re.to` sentence holds it).
- `live-guess.test.mjs`: the live draft (owner item 6, "V2 shows no live Whisper text") — inherited unchanged from ChatV3's own `draft()`, fires the shared `chat-live` window event.
- `resurface.test.mjs`: the old model's own logic (`old/ChatV2Model.js`), for the record — see "What moved to old/" above.

## Decisions

- **Word-range marking is gone.** The old `anchor.words`/`{from,to}` let a reply highlight specific words inside a sentence (`ChatV2.words()`, `.chat-v2-mark`). `Reply.re` on `session.messages` is `{to: <sentence id>}` only — a whole-sentence anchor, no word range. Not rebuilt this step: the new data simply doesn't carry it, and adding a word range to `Reply` is its own, separate change (ask for it if the highlight is missed).
- **Raw-toggle-open does not move replies beside the raw sentences.** ChatV3's tap-for-raw draws the sentences' raw words as plain blockquotes, independent of `dictation()`/`trailing_replies()`; replies stay in the trailing list in that case, where old V2 would have moved an anchored one beside its raw sentence too. Smaller scope, logged here rather than built: most sessions read a Prompt's refined text, not its raw words, with the raw words open.

## To fix

`Servex/agents/session-smart.md` carries a Chat v2 section (Prompt/Question/reply/working-sign rules) shared with every chat version. Version-specific rules should not live in a role file loaded for every chat version; move them into the proper READMEs and the item tool's own instructions once the prompt-refinement work settles (carried over from before this step, still open).
