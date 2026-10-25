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
   - `where` (cards only): `inside` the previous card · `beside` it · `up` a level (a new topic). Today `inside` is indented and `up` draws like `beside`; nesting comes next.
   - `edit`: `nothing` (default) · `move` · `improve` (a cleaned `text`; the raw words are kept) · `both`. Today `move` is recorded but not drawn; it comes with nesting.
6. **The chat applies it** (`Widget.Thread.place()`): `same` does nothing, `paragraph` splits the bubble there, `card` makes that paragraph a card of its own. The latest `place` line for a sentence wins.

**Coverage, by code:** a sentence is never deleted, only moved or given a cleaned text beside its raw words. Today the check is in the browser proof (`test/in-place.mjs`): every owner sentence appears exactly once in the thread. Next, a node check reads a real session file and does the same, so it can run on every session.

---

## The classes

```
Sessions            Servex/agents/Sessions.js       the orchestrator: writes each {chat} line, wakes the voice assistant
 └ voice assistant  roles.js row "voice-assistant"  the agent: one placement per sentence (.claude/skills/voice-assistant/)
item tool           Servex/agents/page_tools.js     writes the {place} and {summary} lines into the session file: `place` and `summary` are in SESSION_KEYS, and a `{summary:{card,…}}` is written as a line, not run as the summary query (proof: item_tool.test.mjs)
chat()              ux/Dictate/chat.js              tails the session file; hands {chat}, {para}, {place}, {summary} to the widget
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

In live mode the words you are saying grow in a **separate draft bubble** at the bottom. When the sentence is sent, `speak()` redraws the same words **inside the bubble above** (they merge as one paragraph), and the draft bubble does not vanish: it fades to a "sent" copy that stays up to 15 seconds, because the server's echo of your line only renames the piece and never removes the copy. So you see the words twice, then the copy drops out and everything below shifts. A second jump follows 1.5 to 3 s later, when the fast assistant's `(new paragraph)` moves the text into a new bubble. **The fix (slice b, done):** the draft is drawn as the last piece of the bubble it will join, and swapped for the settled piece in the same step, so the words never move. The second jump goes away when the voice assistant places sentences only when sure (`same` by default).

---

## Nothing jumps

The chat thread is anchored on the **top of the newest bubble**, not on the bottom edge. Words growing inside a bubble never scroll the box, so the lines above them stay where you are reading them. The box turns a page only twice: when a new bubble starts with less than 75% of a box left under it (`Widget.HEADROOM`), and when one bubble grows taller than the box (its tail then lands mid-box, half a box at a time). If you scrolled up, nothing moves at all. The code is `Widget.Thread.anchor()` in `Widget.js` (it sets `data-turns` on the thread for the proof); the proof is `test/anchor.mjs` (fake mic, five sentences at 400): before, 27 to 38 older-line moves in the split size; after, 0 while words stream in, 5 page turns, and 0 when the reader had scrolled up. The strip has no thread to move. **Cost (2026-10-25, ask `perf`):** `anchor()` only asks for a frame; one animation frame reads layout once, however many lines were drawn or captions redrawn in it (`place_anchor()` is the old body). A replay of history refreshes the lines once after the batch (`refresh_after_batch()`), not once per line. The sheet draws only the newest `Widget.HISTORY` (50) chat lines of a long session; the rest wait behind **show earlier (N)** (`hold_history()`, `load_earlier()`: the older chunk is drawn above while the reader stays where they were; `test/earlier.mjs`). `Session.watch()` tails the file by byte range ([ext/Session/doc/watch.md](/framework/ext/Session/doc/watch.md)), and the mic's meter is written once per frame (`Dictate.paint_level()`). Measured at 4x CPU, 390 px, 207 bubbles: first bubble 8.0 to 8.8 s before, about 0.4 s after; tasks over 50 ms while talking 14 before, 0 after ([perf report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/perf/report.md)). A placement, refinement or paragraph line in the shown part that points at a sentence still behind the button is held by that sentence (`hold_orphan()`) and applied right after it is drawn; `test/earlier.mjs` proves it on a 70-sentence fixture (`test/earlier-fixture.jsonl`). **Rejected:** pinning the newest line to the bottom (`overflow-anchor` plus scroll-to-bottom), because every added line shifts every older bubble up; and pinning the newest line at the very top at every turn, because it hides the reply you were reading the moment you speak.

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
- ✅ **b.** A sentence settles in place in the bubble: the draft is the last piece of the bubble it joins, and the settled piece takes its exact spot (measured: same top, same bubble count, no faded copy). Every chat surface now writes your words into the bubble (`Widget.MODES.dictate`), unless the mic's gear says "into: box". This is the widest change: the proof covers a bare Widget, not yet the ✦ sheet or the rail (those use `ext/Chat`'s own `live()`, which is unchanged).
- ✅ **c.** `{place}` lines applied by the chat (`Widget.Thread.place()`, routed by `chat.js`), default `same`.
- **Proof:** `node ux/Dictate/test/in-place.mjs <site>` (fake mic, no agents), all checks pass at 400 and 1200.
- ✅ **d. Servex wakes it (live after a Servex restart):** `Servex/agents/Sessions.js` wakes the voice assistant in the fast seat with the whole prompt plus the sentence ([brief](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/sessions-brief.md)). **It is the default.** Servex reads the switch once at boot, first match wins:
  1. the file `%LOCALAPPDATA%\lew42\servex\session-assistant.txt`, holding the word `fast` or `voice` (this one survives a restart, because the restart pins only `SERVEX_HOME` and `SERVEX_API_PORT`);
  2. the env var `SERVEX_SESSION_ASSISTANT` (`fast` or `voice`), for a hand-started or private Servex;
  3. `voice`.

  To go back to the fast assistant, write `fast` into that file and restart Servex.
- ✅ **e. Raw looks raw, a summary swallows** (ask 5): below.

---

## Raw and refined

**What you see.** Words straight from Whisper that nobody has placed or refined yet are muted and monospace (class `ux-dictate-raw`). When a `{place}` or `{refined}` line points at a sentence, it loses that look. When a card holds two or more sentences and the voice assistant writes `{"summary": {"card": <the card's first sentence at>, "text": "..."}}`, the card shows the summary text and folds its own lines under it, with a "N raw lines" toggle; one click shows the raw words in place.

**How it is built** (`Widget.Thread`, `chat.js` routes the `summary` line like any other): `refresh()` re-applies the raw class and the folds after every draw, because redrawing a bubble rebuilds its nodes. The fold is a CSS rule (`.ux-dictate-swallowed:not(.open) > [data-re]` is hidden), a view over the same lines: nothing is deleted, rewritten or copied. A card with fewer than two lines (raw or placed, all its lines count) is left alone. A `{refined}` line settles only the sentence it names (`re`), so other sentences in that bubble keep the raw look until placed. The summary is held per card id, so a later `place`, `refined` or retag never loses it.

**Proof:** `node ux/Dictate/test/swallow.mjs <site>`: the fake mic's sentence is drawn raw; five raw lines, one placed card; a `summary` line folds the card in a few milliseconds (it goes through `Thread.draw()`, the call the chat tail makes, with no timer); the toggle shows the raw words; all at 400 and 1200. The proof uses a bare Widget with no Servex, so nothing is posted.

**Rejected:** drawing the summary as a second rendered copy of the text. It would need its own state and could drift from the lines; the fold keeps the one-source rule (the session file's lines are the only data).

**Not done yet:** the voice assistant does not write `summary` lines on its own yet (the skill now allows it), and a raw line arriving after the summary is hidden with the others until the next summary.
