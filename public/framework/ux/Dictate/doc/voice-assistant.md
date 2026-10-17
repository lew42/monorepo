# The voice assistant: one assistant places each sentence as you talk (plan, 2026-10-17)

**What it is.** One plain assistant, the **voice assistant**, listens to a voice session. Each time you finish a sentence, your words are already sitting in the chat bubble, exactly where they will stay. The voice assistant then decides one thing about that sentence: does it stay in the same paragraph (the default), start its own paragraph, or become its own card? It writes that decision as one line, and the screen applies it. It replaces the fast assistant, which the owner found "didn't do much".

Your words: [requirements-17.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-17.md) (asks 1 to 6), [requirements-16.md](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-16.md) (one rolling session). Task: [voice-assistant-plan](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/).

---

## The flow, one sentence at a time

1. **Whisper hears you.** Your words grow inside the chat bubble itself, not in a text box first (this already happens: `ext/Chat/Mic.js`, setting `into: "chat"`).
2. **You reach a period.** The sentence settles **in the same spot**: the draft piece turns into a settled piece of the bubble it is already in. Nothing moves (slice b, below).
3. **The browser sends the sentence to Servex**, which writes it to the session file as one `{"chat": …}` line (unchanged).
4. **Servex wakes the voice assistant** with the whole prompt so far plus the new sentence.
5. **The voice assistant answers with one placement**, written with the item tool into the session file:

```js
item({ path: "<session file>", delta: { place: { re: "<the sentence's at>", to: "paragraph", where: "inside", edit: "nothing" } } })
```

   - `to`: `same` (the default, and the answer whenever unsure) · `paragraph` · `card`
   - `where` (cards only): `inside` the previous card · `beside` it · `up` a level (a new topic)
   - `edit`: `nothing` (default) · `move` · `improve` (a cleaned `text`; the raw words are kept) · `both`
6. **The chat applies it** (`Widget.Thread.place()`): `same` does nothing, `paragraph` splits the bubble there, `card` makes that paragraph a card of its own. The latest `place` line for a sentence wins.

**Coverage, by code:** a sentence is never deleted, only moved or given a cleaned text beside its raw words. A node check reads the session file and confirms every owner sentence appears exactly once in the structure.

---

## The classes

```
Sessions            Servex/agents/Sessions.js       the orchestrator: writes each {chat} line, wakes the voice assistant
 └ voice assistant  roles.js row "voice-assistant"  the agent: one placement per sentence (.claude/skills/voice-assistant/)
item tool           Servex/agents/page_tools.js     writes the {place} line into the session file (works today)
chat()              ux/Dictate/chat.js              tails the session file; hands {chat}, {para}, {place} to the widget
Widget.Thread       ux/Dictate/Widget.js            draws the bubbles; live() = the draft piece in place; place() = apply a placement
```

**Reused, not rebuilt:** the session file and its live tail (`chat.js`, the one `GLOBAL` session per tab), the item tool (`item({path, delta})`, the grammar the task-system plan chose), `split_paragraph()` (today's `{para}` line from the fast assistant's `(new paragraph)` marker is the same thing as `to: "paragraph"`), and `ext/Chat`'s `speak()` merge. The rule-based decider `ext/Refine/Placement.js` (being built beside this task) becomes the fallback when the assistant has not answered: `same`.

---

## The data

- **Raw sentences:** one `{"chat"}` line each in the session file, `public<home>ai/v-<id>.jsonl`. Raw Whisper replies (every 1.5 s guess) go to the Servex `whisper` log ([raw-log.md](/framework/audio/Whisper/doc/raw-log.md)).
- **Placements:** `{"place"}` lines in the same file, appended by the item tool, stamped `by` and `ts`.
- **Ask 1, does each browser dictation have its own folder? No.** Each browser tab has ONE voice session (`sessionStorage["lew42-voice-session"]`). Its whole record is ONE file, `ai/v-<id>.jsonl`, inside the folder of the page (or card) where you said the first sentence; every other folder it visits gets a presence line in its own `ai/log.jsonl`. There are 36 such files in the repo today, for example `/framework/ux/Dictate/ai/`. Agent sessions are different: those get dated folders under `/framework/ai/sessions/`.

---

## Why it jumps today (ask 3)

In live mode the words you are saying grow in a **separate draft bubble** at the bottom. When the sentence is sent, `speak()` redraws the same words **inside the bubble above** (they merge as one paragraph), and the draft bubble does not vanish: it fades to a "sent" copy that stays up to 15 seconds, because the server's echo of your line only renames the piece and never removes the copy. So you see the words twice, then the copy drops out and everything below shifts. A second jump follows 1.5 to 3 s later, when the fast assistant's `(new paragraph)` moves the text into a new bubble. **The fix (small, slice b):** draw the draft as the last piece of the bubble it will join, and swap it for the settled piece in the same step, so the words never move.

---

## Alternatives rejected, one line each

- **Keep a fast and a smart assistant:** the owner dropped it; the fast one mostly said "listening".
- **Fold the smart assistant in now too:** it loads a 44k-token context and spawns masterminds, which would slow every placement; it stays until the voice assistant proves itself.
- **A rule-only placer, no model:** kept as the fallback, but it cannot tell a new topic from a continuation.
- **A new placement tool:** the item tool already writes the line, so a second tool would be a second version.
- **Placements in page.jsonl:** the sentences live in the session file; one file keeps one stream and one order.
- **Dot paths or file paths for the delta:** settled already by the item tool (nested object, dot keys expand to it).

---

## The slices

- ✅ **a.** The `voice-assistant` row in `roles.js` and its skill; the fast rows marked retired, not deleted.
- ⬜ **b.** A sentence settles in place in the bubble (no draft bubble, no faded copy).
- ⬜ **c.** `{place}` lines applied by the chat, default `same`; headless proof at 400 and 1200.
- ⬜ **Next brief (Servex, needs a restart):** `Sessions.js` wakes the voice assistant in the fast seat with the whole prompt plus the sentence ([brief](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/sessions-brief.md)).
- ⬜ **Then:** raw versus refined look, the context card that swallows raw lines into its summary, a click on the summary shows the raw words (ask 5).
